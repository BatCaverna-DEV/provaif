<template>
  <div class="mx-auto" style="max-width: 72rem">
    <!-- Saudação -->
    <div class="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3 mb-4">
      <div>
        <p class="text-secondary small mb-1">{{ dataHoje }}</p>
        <h1 class="h3 fw-bold mb-0">{{ saudacao }}, {{ primeiroNome }}!</h1>
      </div>
      <div class="d-flex gap-2">
        <BButton variant="outline-primary" :to="{ name: 'questao-nova' }">
          <i class="bi bi-plus-lg me-1" aria-hidden="true" />Nova questão
        </BButton>
        <BButton variant="primary" :to="{ name: 'avaliacao-nova' }">
          <i class="bi bi-file-earmark-plus me-1" aria-hidden="true" />Nova avaliação
        </BButton>
      </div>
    </div>

    <BAlert v-if="erro" :model-value="true" variant="danger">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-exclamation-triangle-fill" aria-hidden="true" />
        <span class="flex-grow-1">{{ erro }}</span>
        <BButton size="sm" variant="outline-danger" @click="carregar">Tentar de novo</BButton>
      </div>
    </BAlert>

    <!-- Números -->
    <BRow class="g-3 mb-4">
      <BCol v-for="c in cartoes" :key="c.titulo" cols="12" sm="6" xl="4">
        <BCard class="h-100 border-0 shadow-sm">
          <div class="d-flex align-items-center gap-3">
            <span class="icone-recurso"><i :class="['bi', c.icone]" aria-hidden="true" /></span>
            <div>
              <div class="text-secondary small">{{ c.titulo }}</div>
              <BPlaceholder v-if="carregando" width="3rem" size="lg" animation="glow" />
              <div v-else class="h3 fw-bold mb-0">{{ c.valor }}</div>
            </div>
          </div>
        </BCard>
      </BCol>
      <BCol cols="12" xl="4">
        <BCard class="h-100 border-0 shadow-sm bg-gradiente-azul text-white">
          <div class="small text-white-50">Sua conta</div>
          <div class="fw-semibold text-truncate">{{ usuario?.email }}</div>
          <div class="small texto-azul-claro">@{{ usuario?.username }}</div>
        </BCard>
      </BCol>
    </BRow>

    <BRow class="g-4">
      <!-- Últimas avaliações -->
      <BCol cols="12" lg="7">
        <BCard class="h-100 border-0 shadow-sm" header-class="bg-white border-0 pt-3" no-body>
          <div class="card-header bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
            <h2 class="h6 fw-bold mb-0">Últimas avaliações</h2>
            <RouterLink v-if="resumo.totalAvaliacoes" :to="{ name: 'avaliacoes' }" class="small text-decoration-none">Ver todas</RouterLink>
          </div>

          <div v-if="carregando" class="p-3 d-grid gap-2">
            <BPlaceholder v-for="i in 3" :key="i" animation="glow" size="lg" />
          </div>

          <div v-else-if="resumo.ultimasAvaliacoes.length" class="list-group list-group-flush">
            <RouterLink
              v-for="a in resumo.ultimasAvaliacoes"
              :key="a.id"
              :to="{ name: 'avaliacao', params: { id: a.id } }"
              class="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3"
            >
              <i class="bi bi-file-earmark-text fs-4 text-primary" aria-hidden="true" />
              <div class="flex-grow-1 min-w-0">
                <div class="fw-semibold text-truncate">{{ a.descricao || 'Avaliação sem título' }}</div>
                <div class="small text-secondary">{{ formatarData(a.dataCriacao) }}</div>
              </div>
              <span class="badge text-bg-light text-primary">{{ formatarPontos(a.totalPontos) }}</span>
            </RouterLink>
          </div>

          <div v-else class="text-center text-secondary px-4 py-5">
            <i class="bi bi-inbox fs-1 d-block mb-2 opacity-50" aria-hidden="true" />
            <p class="mb-3">Você ainda não criou avaliações.</p>
            <BButton :to="{ name: 'avaliacao-nova' }" variant="outline-primary" size="sm">Criar avaliação</BButton>
          </div>
        </BCard>
      </BCol>

      <!-- Primeiros passos -->
      <BCol cols="12" lg="5">
        <BCard class="h-100 border-0 shadow-sm">
          <h2 class="h6 fw-bold mb-3">Primeiros passos</h2>
          <ol class="list-unstyled d-grid gap-3 mb-0">
            <li v-for="(p, i) in passos" :key="p.texto" class="d-flex gap-3">
              <span class="passo" :class="{ feito: p.feito }">
                <i v-if="p.feito" class="bi bi-check-lg" aria-hidden="true" />
                <template v-else>{{ i + 1 }}</template>
              </span>
              <div>
                <div class="fw-semibold" :class="{ 'text-decoration-line-through text-secondary': p.feito }">{{ p.texto }}</div>
                <div class="small text-secondary">{{ p.descricao }}</div>
              </div>
            </li>
          </ol>
        </BCard>
      </BCol>
    </BRow>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { BRow, BCol, BCard, BButton, BAlert, BPlaceholder } from 'bootstrap-vue-next'
import { auth } from '@/stores/auth.js'
import { obterResumo } from '@/services/painelService.js'
import { formatarData, formatarPontos } from '@/utils/formatacao.js'

const usuario = auth.usuario

const resumo = reactive({ totalQuestoes: 0, totalAvaliacoes: 0, ultimasAvaliacoes: [] })
const carregando = ref(true)
const erro = ref('')

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    Object.assign(resumo, await obterResumo())
  } catch (e) {
    erro.value = e.message
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)

const primeiroNome = computed(() => usuario.value?.nome?.split(' ')[0] || '')

const saudacao = computed(() => {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
})

const dataHoje = (() => {
  const texto = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
})()

const cartoes = computed(() => [
  { titulo: 'Questões cadastradas', icone: 'bi-collection', valor: resumo.totalQuestoes },
  { titulo: 'Avaliações criadas', icone: 'bi-file-earmark-text', valor: resumo.totalAvaliacoes },
])

const passos = computed(() => [
  { texto: 'Criar sua conta', descricao: 'Pronto! Você já faz parte do ProvaIF.', feito: true },
  { texto: 'Cadastrar questões', descricao: 'Monte seu banco com enunciados e alternativas.', feito: resumo.totalQuestoes > 0 },
  { texto: 'Montar uma avaliação', descricao: 'Escolha as questões e defina a pontuação.', feito: resumo.totalAvaliacoes > 0 },
])
</script>

<style scoped>
.min-w-0 {
  min-width: 0;
}

.passo {
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--bs-primary);
  background-color: rgba(26, 86, 219, 0.1);
}

.passo.feito {
  color: #fff;
  background-color: var(--bs-success);
}
</style>
