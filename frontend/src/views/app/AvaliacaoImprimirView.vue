<template>
  <div class="tela-impressao">
    <!-- Barra de ferramentas (não sai na impressão) -->
    <div class="barra d-print-none bg-azul-escuro text-white sticky-top">
      <div class="container d-flex flex-wrap align-items-center gap-2 py-2">
        <BButton :to="{ name: 'avaliacao', params: { id } }" variant="link" class="text-white text-decoration-none px-0 me-auto">
          <i class="bi bi-arrow-left me-1" aria-hidden="true" />Voltar à edição
        </BButton>
        <BFormCheckbox v-model="gabarito" switch class="me-2">Mostrar gabarito</BFormCheckbox>
        <BButton variant="light" class="fw-semibold" :disabled="!avaliacao" @click="imprimir">
          <i class="bi bi-printer me-1" aria-hidden="true" />Imprimir / salvar PDF
        </BButton>
      </div>
    </div>

    <div v-if="carregando || erro" class="container py-4 d-print-none">
      <template v-if="carregando">
        <BPlaceholder v-for="i in 4" :key="i" animation="glow" size="lg" class="mb-3" />
      </template>
      <BAlert v-else :model-value="true" variant="danger">{{ erro }}</BAlert>
    </div>

    <!-- Folha da prova -->
    <article v-if="avaliacao" class="folha bg-white mx-auto my-4">
      <header class="cabecalho mb-3">
        <div v-if="cab.instituicao || cab.campos" class="text-center fw-bold">
          {{ [cab.instituicao, cab.campos].filter(Boolean).join(' · ') }}
        </div>
        <div v-if="cab.curso" class="text-center">{{ cab.curso }}</div>
        <h1 class="h5 fw-bold text-center my-2">{{ avaliacao.descricao }}</h1>

        <table class="table table-bordered table-sm mb-0 tabela-cabecalho">
          <tbody>
            <tr>
              <td colspan="3"><span class="rotulo">Aluno(a):</span></td>
              <td><span class="rotulo">Nota:</span></td>
            </tr>
            <tr>
              <td><span class="rotulo">Disciplina:</span> {{ cab.disciplina }}</td>
              <td><span class="rotulo">Professor(a):</span> {{ cab.professor }}</td>
              <td><span class="rotulo">Turma:</span> {{ cab.turma }}</td>
              <td><span class="rotulo">Data:</span> {{ formatarData(cab.data) }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="cab.instrucoes" class="instrucoes mt-2">
          <span class="rotulo">Instruções:</span> {{ cab.instrucoes }}
        </div>
        <div class="small text-end mt-1">Valor total: <strong>{{ formatarPontos(avaliacao.totalPontos) }}</strong></div>
      </header>

      <p v-if="!avaliacao.questoes.length" class="text-center text-secondary py-5 d-print-none">
        Esta avaliação ainda não tem questões.
      </p>

      <ol class="list-unstyled mb-0">
        <li v-for="(q, i) in avaliacao.questoes" :key="q.id" class="questao">
          <div class="d-flex gap-2">
            <strong>{{ i + 1 }}.</strong>
            <ConteudoRico :html="q.texto" class="flex-grow-1 min-w-0" />
            <span class="pontos flex-shrink-0">({{ formatarPontos(q.pontos) }})</span>
          </div>

          <!-- Objetiva: alternativas -->
          <ol v-if="q.alternativas?.length" class="list-unstyled alternativas mt-2 mb-0">
            <li v-for="(alt, j) in q.alternativas" :key="alt.id" class="d-flex gap-1" :class="{ correta: gabarito && alt.correta }">
              <span class="letra flex-shrink-0">{{ LETRAS[j] }})</span>
              <ConteudoRico :html="alt.texto" class="flex-grow-1 min-w-0" />
              <strong v-if="gabarito && alt.correta" class="flex-shrink-0">✓</strong>
            </li>
          </ol>

          <!-- Discursiva: linhas para a resposta -->
          <div v-else class="linhas mt-2" aria-hidden="true">
            <div v-for="n in 5" :key="n" class="linha" />
          </div>
        </li>
      </ol>
    </article>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { BButton, BFormCheckbox, BAlert, BPlaceholder } from 'bootstrap-vue-next'
import { obterAvaliacao } from '@/services/avaliacaoService.js'
import { formatarData, formatarPontos, LETRAS } from '@/utils/formatacao.js'
import ConteudoRico from '@/components/editor/ConteudoRico.vue'

const props = defineProps({
  id: { type: String, required: true },
})

const avaliacao = ref(null)
const carregando = ref(true)
const erro = ref('')
const gabarito = ref(false)

const cab = computed(() => avaliacao.value?.cabecalho || {})

watch(() => props.id, async () => {
  carregando.value = true
  erro.value = ''
  try {
    avaliacao.value = await obterAvaliacao(props.id)
    document.title = `${avaliacao.value.descricao} — ProvaIF`
  } catch (e) {
    erro.value = e.message
  } finally {
    carregando.value = false
  }
}, { immediate: true })

function imprimir() {
  window.print()
}
</script>

<style scoped>
.tela-impressao {
  min-height: 100vh;
  background-color: #e9eef6;
}

/* Folha A4 na tela */
.folha {
  width: 100%;
  max-width: 210mm;
  min-height: 297mm;
  padding: 15mm;
  box-shadow: 0 0.5rem 1.5rem rgba(11, 31, 68, 0.15);
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
}

.rotulo {
  font-weight: 700;
}

.tabela-cabecalho td {
  height: 2.2em;
  vertical-align: middle;
}

.instrucoes {
  white-space: pre-line;
  font-size: 10pt;
  border: 1px solid #dee2e6;
  padding: 0.4em 0.6em;
}

.questao {
  margin-top: 1.1em;
  break-inside: avoid;
}

.min-w-0 {
  min-width: 0;
}

.pontos {
  font-size: 9pt;
  color: #444;
  white-space: nowrap;
}

.alternativas {
  padding-left: 1.6em;
}

.alternativas li {
  margin-bottom: 0.2em;
}

.alternativas .correta {
  font-weight: 700;
  text-decoration: underline;
}

.linha {
  border-bottom: 1px solid #999;
  height: 1.8em;
}

@media (max-width: 575.98px) {
  .folha {
    padding: 6mm;
    min-height: 0;
  }
}

@media print {
  .tela-impressao {
    background: none;
  }

  .folha {
    max-width: none;
    min-height: 0;
    padding: 0;
    margin: 0 !important;
    box-shadow: none;
  }
}
</style>

<style>
@page {
  size: A4;
  margin: 15mm;
}
</style>
