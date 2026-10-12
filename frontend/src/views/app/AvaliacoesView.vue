<template>
  <div class="mx-auto" style="max-width: 72rem">
    <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
      <div>
        <h1 class="h3 fw-bold mb-0">Avaliações</h1>
        <p class="text-secondary mb-0">Crie, organize e imprima suas provas.</p>
      </div>
      <BButton :to="{ name: 'avaliacao-nova' }" variant="primary">
        <i class="bi bi-file-earmark-plus me-1" aria-hidden="true" />Nova avaliação
      </BButton>
    </div>

    <BCard class="border-0 shadow-sm" no-body>
      <div class="p-3 border-bottom">
        <BInputGroup>
          <template #prepend>
            <span class="input-group-text bg-white"><i class="bi bi-search" aria-hidden="true" /></span>
          </template>
          <BFormInput v-model="busca" type="search" placeholder="Buscar pela descrição..." aria-label="Buscar avaliações" />
        </BInputGroup>
      </div>

      <BAlert v-if="erro" :model-value="true" variant="danger" class="m-3">
        <div class="d-flex align-items-center gap-2">
          <span class="flex-grow-1">{{ erro }}</span>
          <BButton size="sm" variant="outline-danger" @click="carregar">Tentar de novo</BButton>
        </div>
      </BAlert>

      <div v-if="carregando" class="p-3 d-grid gap-3">
        <BPlaceholder v-for="i in 4" :key="i" animation="glow" size="lg" />
      </div>

      <!-- Lista vazia -->
      <div v-else-if="!avaliacoes.length && !erro" class="text-center text-secondary px-4 py-5">
        <i class="bi bi-file-earmark-text fs-1 d-block mb-2 opacity-50" aria-hidden="true" />
        <template v-if="busca">Nenhuma avaliação encontrada para "{{ busca }}".</template>
        <template v-else>
          <p class="mb-3">Você ainda não criou avaliações.</p>
          <BButton :to="{ name: 'avaliacao-nova' }" variant="outline-primary">Criar a primeira avaliação</BButton>
        </template>
      </div>

      <ul v-else class="list-group list-group-flush">
        <li v-for="a in avaliacoes" :key="a.id" class="list-group-item py-3">
          <div class="d-flex flex-column flex-md-row align-items-md-center gap-3">
            <RouterLink :to="{ name: 'avaliacao', params: { id: a.id } }" class="d-flex align-items-center gap-3 flex-grow-1 text-decoration-none text-body min-w-0">
              <span class="icone-recurso flex-shrink-0"><i class="bi bi-file-earmark-text" aria-hidden="true" /></span>
              <span class="min-w-0">
                <span class="d-block fw-semibold text-truncate">{{ a.descricao }}</span>
                <span class="d-block small text-secondary">
                  {{ formatarData(a.dataCriacao) }} ·
                  {{ a.totalQuestoes }} {{ Number(a.totalQuestoes) === 1 ? 'questão' : 'questões' }} ·
                  {{ formatarPontos(a.totalPontos) }}
                </span>
              </span>
            </RouterLink>

            <div class="d-flex gap-2 flex-shrink-0">
              <BButton size="sm" variant="outline-primary" :to="{ name: 'avaliacao', params: { id: a.id } }">
                <i class="bi bi-pencil me-1" aria-hidden="true" />Editar
              </BButton>
              <BButton size="sm" variant="outline-secondary" :to="{ name: 'avaliacao-imprimir', params: { id: a.id } }" title="Visualizar e imprimir">
                <i class="bi bi-printer" aria-hidden="true" /><span class="visually-hidden">Imprimir</span>
              </BButton>
              <BButton size="sm" variant="outline-secondary" :disabled="processando === a.id" title="Duplicar" @click="duplicar(a)">
                <i class="bi bi-copy" aria-hidden="true" /><span class="visually-hidden">Duplicar</span>
              </BButton>
              <BButton size="sm" variant="outline-danger" :disabled="processando === a.id" title="Excluir" @click="excluir(a)">
                <i class="bi bi-trash" aria-hidden="true" /><span class="visually-hidden">Excluir</span>
              </BButton>
            </div>
          </div>
        </li>
      </ul>
    </BCard>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  BCard, BButton, BInputGroup, BFormInput, BAlert, BPlaceholder, useToast, useModal,
} from 'bootstrap-vue-next'
import { listarAvaliacoes, removerAvaliacao, duplicarAvaliacao } from '@/services/avaliacaoService.js'
import { formatarData, formatarPontos } from '@/utils/formatacao.js'

const router = useRouter()
const { create: criarToast } = useToast()
const { create: criarModal } = useModal()

const avaliacoes = ref([])
const busca = ref('')
const carregando = ref(true)
const erro = ref('')
const processando = ref(null)

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    avaliacoes.value = await listarAvaliacoes(busca.value.trim())
  } catch (e) {
    erro.value = e.message
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)

// Busca enquanto digita, com uma pequena espera para não chamar a API a cada tecla
let espera
watch(busca, () => {
  clearTimeout(espera)
  espera = setTimeout(carregar, 300)
})

function avisar(body, variant = 'success') {
  criarToast({ body, variant, pos: 'top-end', modelValue: 3500 })
}

async function duplicar(avaliacao) {
  processando.value = avaliacao.id
  try {
    const copia = await duplicarAvaliacao(avaliacao.id)
    avisar('Avaliação duplicada.')
    router.push({ name: 'avaliacao', params: { id: copia.id } })
  } catch (e) {
    avisar(e.message, 'danger')
  } finally {
    processando.value = null
  }
}

async function excluir(avaliacao) {
  const resposta = await criarModal({
    title: 'Excluir avaliação',
    body: `Excluir "${avaliacao.descricao}"? O cabeçalho e a seleção de questões desta prova serão apagados. As questões continuam no banco de questões.`,
    okTitle: 'Excluir',
    okVariant: 'danger',
    cancelTitle: 'Cancelar',
  }).show()
  if (!resposta?.ok) return

  processando.value = avaliacao.id
  try {
    await removerAvaliacao(avaliacao.id)
    avaliacoes.value = avaliacoes.value.filter((a) => a.id !== avaliacao.id)
    avisar('Avaliação excluída.')
  } catch (e) {
    avisar(e.message, 'danger')
  } finally {
    processando.value = null
  }
}
</script>

<style scoped>
.min-w-0 {
  min-width: 0;
}
</style>
