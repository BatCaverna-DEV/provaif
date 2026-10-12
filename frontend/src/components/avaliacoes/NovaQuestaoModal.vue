<template>
  <BModal
    v-model="aberto"
    title="Criar questão para esta prova"
    size="xl"
    scrollable
    no-close-on-backdrop
    no-footer
    @show="iniciar"
  >
    <BAlert v-if="erroGeral" :model-value="true" variant="danger" class="small">{{ erroGeral }}</BAlert>

    <BForm novalidate @submit.prevent="salvar">
      <BRow class="g-4">
        <BCol cols="12" lg="7">
          <QuestaoCampos v-model="form" v-model:erros="erros" :assuntos="assuntos" prefixo="nq" linhas-enunciado="4" />
        </BCol>

        <BCol cols="12" lg="5">
          <div class="pontos-prova rounded-3 p-3 mb-3">
            <label for="nq-pontos" class="form-label fw-semibold mb-1">Pontos nesta prova</label>
            <BInputGroup append="pts" style="max-width: 10rem">
              <BFormInput id="nq-pontos" v-model="pontos" type="number" min="0" step="0.5" :state="erroPontos ? false : null" />
            </BInputGroup>
            <div v-if="erroPontos" class="small text-danger mt-1">{{ erroPontos }}</div>
            <div class="small text-secondary mt-1">A questão vai para o seu banco de questões e entra no fim da prova.</div>
          </div>

          <QuestaoPrevia :form="form" :numero="numero" :pontos="pontosNumero" />
        </BCol>
      </BRow>

      <div class="d-flex flex-column flex-sm-row justify-content-end gap-2 border-top pt-3 mt-4">
        <BButton variant="outline-secondary" :disabled="salvando" @click="aberto = false">Cancelar</BButton>
        <BButton type="submit" variant="primary" :disabled="salvando">
          <BSpinner v-if="salvando" small class="me-1" />
          <i v-else class="bi bi-plus-lg me-1" aria-hidden="true" />Criar e adicionar à prova
        </BButton>
      </div>
    </BForm>
  </BModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { BModal, BForm, BRow, BCol, BAlert, BButton, BSpinner, BInputGroup, BFormInput } from 'bootstrap-vue-next'
import QuestaoCampos from '@/components/questoes/QuestaoCampos.vue'
import QuestaoPrevia from '@/components/questoes/QuestaoPrevia.vue'
import { formularioDe, corpoDe, validarFormulario } from '@/components/questoes/formularioQuestao.js'
import { listarAssuntos } from '@/services/questaoService.js'

/**
 * Modal para criar uma questão nova e já colocá-la na prova.
 * v-model: aberto/fechado
 * numero: posição que a questão terá na prova (para a pré-visualização)
 * onCriar: função async (corpoDaQuestao, pontos) que cria a questão e a adiciona à avaliação.
 *          Se lançar um erro com `detalhes`, os erros aparecem nos campos.
 */
const aberto = defineModel({ type: Boolean, default: false })

const props = defineProps({
  numero: { type: Number, default: 1 },
  onCriar: { type: Function, required: true },
})

const form = ref(formularioDe())
const erros = ref({})
const erroGeral = ref('')
const pontos = ref(1)
const erroPontos = ref('')
const salvando = ref(false)
const assuntos = ref([])

const pontosNumero = computed(() => {
  const n = Number(pontos.value)
  return pontos.value !== '' && Number.isFinite(n) && n >= 0 ? n : null
})

// Formulário limpo a cada abertura (mantém os pontos da última questão criada)
function iniciar() {
  form.value = formularioDe()
  erros.value = {}
  erroGeral.value = ''
  erroPontos.value = ''
  listarAssuntos().then((lista) => { assuntos.value = lista }).catch(() => {})
}

watch(erros, (atual) => {
  if (!Object.keys(atual).length) erroGeral.value = ''
}, { deep: true })

watch(pontos, () => { erroPontos.value = '' })

async function salvar() {
  erroGeral.value = ''
  erros.value = validarFormulario(form.value)
  erroPontos.value = pontosNumero.value === null ? 'Informe 0 ou mais.' : ''
  if (Object.keys(erros.value).length || erroPontos.value) {
    erroGeral.value = 'Confira os campos destacados.'
    return
  }

  salvando.value = true
  try {
    await props.onCriar(corpoDe(form.value), pontosNumero.value)
    aberto.value = false
  } catch (e) {
    erros.value = e.detalhes || {}
    erroGeral.value = e.message
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.pontos-prova {
  background-color: var(--bs-light);
  border: 1px solid rgba(26, 86, 219, 0.15);
}
</style>
