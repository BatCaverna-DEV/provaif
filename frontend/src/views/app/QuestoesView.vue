<template>
  <div class="mx-auto" style="max-width: 72rem">
    <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
      <div>
        <h1 class="h3 fw-bold mb-0">Banco de questões</h1>
        <p class="text-secondary mb-0">Suas questões e as compartilhadas por outros professores.</p>
      </div>
      <BButton :to="{ name: 'questao-nova' }" variant="primary">
        <i class="bi bi-plus-lg me-1" aria-hidden="true" />Nova questão
      </BButton>
    </div>

    <BCard class="border-0 shadow-sm" no-body>
      <!-- Filtros -->
      <div class="p-3 border-bottom">
        <BRow class="g-2">
          <BCol cols="12" lg="4">
            <BInputGroup>
              <template #prepend>
                <span class="input-group-text bg-white"><i class="bi bi-search" aria-hidden="true" /></span>
              </template>
              <BFormInput v-model="filtros.busca" type="search" placeholder="Assunto ou enunciado..." aria-label="Buscar questões" />
            </BInputGroup>
          </BCol>
          <BCol cols="6" lg="2">
            <BFormSelect v-model="filtros.tipo" :options="opcoesTipo" aria-label="Tipo" />
          </BCol>
          <BCol cols="6" lg="2">
            <BFormSelect v-model="filtros.nivel" :options="opcoesNivel" aria-label="Nível" />
          </BCol>
          <BCol cols="12" lg="4">
            <div class="btn-group w-100" role="radiogroup" aria-label="Origem das questões">
              <template v-for="o in opcoesOrigem" :key="o.valor">
                <input :id="`origem-${o.valor || 'todas'}`" v-model="filtros.origem" type="radio" class="btn-check" name="origem" :value="o.valor" />
                <label :for="`origem-${o.valor || 'todas'}`" class="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center">{{ o.texto }}</label>
              </template>
            </div>
          </BCol>
        </BRow>
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

      <!-- Vazio -->
      <div v-else-if="!questoes.length && !erro" class="text-center text-secondary px-4 py-5">
        <i class="bi bi-collection fs-1 d-block mb-2 opacity-50" aria-hidden="true" />
        <template v-if="temFiltro">Nenhuma questão encontrada com esses filtros.</template>
        <template v-else>
          <p class="mb-3">Seu banco de questões está vazio.</p>
          <BButton :to="{ name: 'questao-nova' }" variant="outline-primary">Cadastrar a primeira questão</BButton>
        </template>
      </div>

      <ul v-else class="list-group list-group-flush">
        <li v-for="q in questoes" :key="q.id" class="list-group-item py-3">
          <div class="d-flex flex-column flex-md-row gap-3">
            <QuestaoResumo :questao="q" class="flex-grow-1" />

            <div class="d-flex flex-md-column align-items-md-end justify-content-between gap-2 flex-shrink-0">
              <div class="d-flex flex-wrap gap-1 justify-content-md-end">
                <span v-if="q.propria" class="badge fw-normal" :class="q.acesso === 1 ? 'text-bg-primary' : 'text-bg-light border'">
                  <i :class="['bi', q.acesso === 1 ? 'bi-globe2' : 'bi-lock', 'me-1']" aria-hidden="true" />{{ q.acesso === 1 ? 'Pública' : 'Privada' }}
                </span>
                <span v-if="q.propria && q.usos" class="badge text-bg-light border fw-normal" :title="`Usada em ${q.usos} avaliação(ões)`">
                  <i class="bi bi-file-earmark-text me-1" aria-hidden="true" />{{ q.usos }} {{ q.usos === 1 ? 'prova' : 'provas' }}
                </span>
              </div>

              <div class="d-flex gap-2">
                <template v-if="q.propria">
                  <BButton size="sm" variant="outline-primary" :to="{ name: 'questao-editar', params: { id: q.id } }">
                    <i class="bi bi-pencil me-1" aria-hidden="true" />Editar
                  </BButton>
                  <BButton size="sm" variant="outline-secondary" :disabled="processando === q.id" title="Duplicar" @click="copiar(q)">
                    <i class="bi bi-copy" aria-hidden="true" /><span class="visually-hidden">Duplicar</span>
                  </BButton>
                  <BButton
                    size="sm"
                    variant="outline-danger"
                    :disabled="processando === q.id"
                    :title="q.usos ? 'Remova a questão das provas antes de excluir' : 'Excluir'"
                    @click="excluir(q)"
                  >
                    <i class="bi bi-trash" aria-hidden="true" /><span class="visually-hidden">Excluir</span>
                  </BButton>
                </template>
                <BButton v-else size="sm" variant="outline-primary" :disabled="processando === q.id" @click="copiar(q)">
                  <i class="bi bi-copy me-1" aria-hidden="true" />Copiar para minhas
                </BButton>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <div v-if="total > porPagina" class="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 p-3 border-top">
        <span class="small text-secondary">{{ inicio }}–{{ fim }} de {{ total }} questões</span>
        <BPagination v-model="pagina" :total-rows="total" :per-page="porPagina" size="sm" class="mb-0" aria-label="Páginas de questões" />
      </div>
      <div v-else-if="total" class="small text-secondary p-3 border-top">
        {{ total }} {{ total === 1 ? 'questão' : 'questões' }}
      </div>
    </BCard>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import {
  BCard, BRow, BCol, BButton, BInputGroup, BFormInput, BFormSelect, BAlert, BPlaceholder, BPagination,
  useToast, useModal,
} from 'bootstrap-vue-next'
import QuestaoResumo from '@/components/questoes/QuestaoResumo.vue'
import { listarQuestoesPaginado, removerQuestao, copiarQuestao } from '@/services/questaoService.js'
import { TIPOS_QUESTAO, NIVEIS_QUESTAO } from '@/utils/formatacao.js'

const { create: criarToast } = useToast()
const { create: criarModal } = useModal()

const porPagina = 20
const questoes = ref([])
const total = ref(0)
const pagina = ref(1)
const carregando = ref(true)
const erro = ref('')
const processando = ref(null)
const filtros = reactive({ busca: '', tipo: null, nivel: null, origem: '' })

const opcoesTipo = [{ value: null, text: 'Todos os tipos' }, ...Object.entries(TIPOS_QUESTAO).map(([v, t]) => ({ value: Number(v), text: t.texto }))]
const opcoesNivel = [{ value: null, text: 'Todos os níveis' }, ...Object.entries(NIVEIS_QUESTAO).map(([v, n]) => ({ value: Number(v), text: n.texto }))]
const opcoesOrigem = [
  { valor: '', texto: 'Todas' },
  { valor: 'minhas', texto: 'Minhas' },
  { valor: 'publicas', texto: 'De outros' },
]

const temFiltro = computed(() => !!(filtros.busca || filtros.tipo || filtros.nivel || filtros.origem))
const inicio = computed(() => (pagina.value - 1) * porPagina + 1)
const fim = computed(() => Math.min(pagina.value * porPagina, total.value))

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const resposta = await listarQuestoesPaginado({ ...filtros, busca: filtros.busca.trim() }, pagina.value, porPagina)
    questoes.value = resposta.itens
    total.value = resposta.total
    // Se a página ficou vazia (ex.: excluiu o último item), volta uma
    if (!resposta.itens.length && pagina.value > 1) pagina.value -= 1
  } catch (e) {
    erro.value = e.message
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)

// Filtros: volta para a página 1 (busca com uma pequena espera enquanto digita)
let espera
watch(filtros, () => {
  clearTimeout(espera)
  espera = setTimeout(() => {
    if (pagina.value === 1) carregar()
    else pagina.value = 1
  }, 300)
})

watch(pagina, () => {
  carregar()
  window.scrollTo({ top: 0, behavior: 'instant' })
})

function avisar(body, variant = 'success') {
  criarToast({ body, variant, pos: 'top-end', modelValue: 3500 })
}

async function copiar(questao) {
  processando.value = questao.id
  try {
    await copiarQuestao(questao.id)
    avisar(questao.propria ? 'Questão duplicada.' : 'Questão copiada para o seu banco (como privada).')
    await carregar()
  } catch (e) {
    avisar(e.message, 'danger')
  } finally {
    processando.value = null
  }
}

async function excluir(questao) {
  if (questao.usos) {
    avisar(`Esta questão está em ${questao.usos} ${questao.usos === 1 ? 'prova' : 'provas'}. Remova-a das provas antes de excluir.`, 'warning')
    return
  }
  const resposta = await criarModal({
    title: 'Excluir questão',
    body: `Excluir a questão "${questao.assunto}"? Esta ação não pode ser desfeita.`,
    okTitle: 'Excluir',
    okVariant: 'danger',
    cancelTitle: 'Cancelar',
  }).show()
  if (!resposta?.ok) return

  processando.value = questao.id
  try {
    await removerQuestao(questao.id)
    avisar('Questão excluída.')
    await carregar()
  } catch (e) {
    avisar(e.message, 'danger')
  } finally {
    processando.value = null
  }
}
</script>
