<template>
  <div class="mx-auto" style="max-width: 80rem">
    <RouterLink :to="{ name: 'questoes' }" class="small text-decoration-none">
      <i class="bi bi-arrow-left me-1" aria-hidden="true" />Banco de questões
    </RouterLink>
    <h1 class="h3 fw-bold mt-2 mb-4">{{ editando ? 'Editar questão' : 'Nova questão' }}</h1>

    <div v-if="carregando" class="d-grid gap-3">
      <BPlaceholder v-for="i in 4" :key="i" animation="glow" size="lg" />
    </div>

    <BAlert v-else-if="erroCarregar" :model-value="true" variant="danger">{{ erroCarregar }}</BAlert>

    <BRow v-else class="g-4">
      <!-- Formulário -->
      <BCol cols="12" lg="7">
        <BCard class="border-0 shadow-sm">
          <BAlert v-if="usos" :model-value="true" variant="warning" class="small">
            <i class="bi bi-info-circle me-1" aria-hidden="true" />
            Esta questão está em {{ usos }} {{ usos === 1 ? 'avaliação' : 'avaliações' }}. As alterações também aparecerão nelas.
          </BAlert>
          <BAlert v-if="erroGeral" :model-value="true" variant="danger" class="small">{{ erroGeral }}</BAlert>

          <BForm novalidate @submit.prevent="salvar(false)">
            <QuestaoCampos v-model="form" v-model:erros="erros" :assuntos="assuntos" prefixo="q" />

            <div class="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
              <BButton :to="{ name: 'questoes' }" variant="outline-secondary">Cancelar</BButton>
              <BButton v-if="!editando" variant="outline-primary" :disabled="salvando" @click="salvar(true)">
                Salvar e cadastrar outra
              </BButton>
              <BButton type="submit" variant="primary" :disabled="salvando">
                <BSpinner v-if="salvando" small class="me-1" />
                {{ editando ? 'Salvar alterações' : 'Salvar questão' }}
              </BButton>
            </div>
          </BForm>
        </BCard>
      </BCol>

      <!-- Pré-visualização -->
      <BCol cols="12" lg="5">
        <QuestaoPrevia :form="form" class="pre-visualizacao" />
      </BCol>
    </BRow>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { RouterLink, useRouter, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import {
  BRow, BCol, BCard, BForm, BButton, BSpinner, BAlert, BPlaceholder, useToast, useModal,
} from 'bootstrap-vue-next'
import QuestaoCampos from '@/components/questoes/QuestaoCampos.vue'
import QuestaoPrevia from '@/components/questoes/QuestaoPrevia.vue'
import { formularioDe, assinatura, corpoDe, validarFormulario } from '@/components/questoes/formularioQuestao.js'
import { obterQuestao, criarQuestao, atualizarQuestao, listarAssuntos } from '@/services/questaoService.js'

const props = defineProps({
  // Sem id: nova questão
  id: { type: String, default: null },
})

const router = useRouter()
const { create: criarToast } = useToast()
const { create: criarModal } = useModal()

const editando = computed(() => !!props.id)

const form = ref(formularioDe())
const original = ref(assinatura(form.value))
const usos = ref(0)
const assuntos = ref([])
const carregando = ref(false)
const erroCarregar = ref('')
const salvando = ref(false)
const erros = ref({})
const erroGeral = ref('')

const alterado = computed(() => assinatura(form.value) !== original.value)

// Quando todos os campos foram corrigidos, o aviso geral também some
watch(erros, (atual) => {
  if (!Object.keys(atual).length) erroGeral.value = ''
}, { deep: true })

async function carregar() {
  listarAssuntos().then((lista) => { assuntos.value = lista }).catch(() => {})
  erros.value = {}
  erroGeral.value = ''
  usos.value = 0
  if (!editando.value) {
    form.value = formularioDe()
    original.value = assinatura(form.value)
    return
  }

  carregando.value = true
  erroCarregar.value = ''
  try {
    const questao = await obterQuestao(props.id)
    if (!questao.propria) {
      erroCarregar.value = 'Esta questão é de outro professor e não pode ser editada. Copie-a para o seu banco para ter uma versão sua.'
      return
    }
    form.value = formularioDe(questao)
    original.value = assinatura(form.value)
    usos.value = questao.usos || 0
  } catch (e) {
    erroCarregar.value = e.message
  } finally {
    carregando.value = false
  }
}

// watch (e não onMounted): ao ir de uma questão para outra, o Vue reaproveita o componente
watch(() => props.id, carregar, { immediate: true })

async function salvar(cadastrarOutra) {
  erroGeral.value = ''
  erros.value = validarFormulario(form.value)
  if (Object.keys(erros.value).length) {
    erroGeral.value = 'Confira os campos destacados.'
    return
  }

  salvando.value = true
  try {
    const corpo = corpoDe(form.value)
    if (editando.value) await atualizarQuestao(props.id, corpo)
    else await criarQuestao(corpo)

    criarToast({ body: editando.value ? 'Questão atualizada.' : 'Questão cadastrada.', variant: 'success', pos: 'top-end', modelValue: 3000 })

    if (cadastrarOutra) {
      // Mantém tipo, nível, assunto e acesso para agilizar o cadastro em sequência
      const { tipo, nivel, assunto, acesso } = form.value
      form.value = { ...formularioDe(), tipo, nivel, assunto, acesso }
      original.value = assinatura(form.value)
      if (assunto && !assuntos.value.includes(assunto)) assuntos.value.push(assunto)
      document.getElementById('q-texto')?.focus()
    } else {
      original.value = assinatura(form.value) // não perguntar ao sair
      router.push({ name: 'questoes' })
    }
  } catch (e) {
    erros.value = e.detalhes || {}
    erroGeral.value = e.message
  } finally {
    salvando.value = false
  }
}

// Pergunta antes de sair com alterações (também ao trocar de uma questão para outra)
async function confirmarSaida() {
  if (!alterado.value || carregando.value || erroCarregar.value) return true
  const resposta = await criarModal({
    title: 'Alterações não salvas',
    body: 'A questão foi alterada e não foi salva. Sair mesmo assim?',
    okTitle: 'Sair sem salvar',
    okVariant: 'danger',
    cancelTitle: 'Continuar editando',
  }).show()
  return !!resposta?.ok
}

onBeforeRouteLeave(confirmarSaida)
onBeforeRouteUpdate(confirmarSaida)
</script>

<style scoped>
.pre-visualizacao {
  position: sticky;
  top: 5rem;
}
</style>
