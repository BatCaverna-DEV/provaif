<template>
  <div class="mx-auto" style="max-width: 64rem">
    <RouterLink :to="{ name: 'avaliacoes' }" class="small text-decoration-none">
      <i class="bi bi-arrow-left me-1" aria-hidden="true" />Avaliações
    </RouterLink>

    <!-- Carregando / erro ao carregar -->
    <div v-if="carregando" class="mt-3 d-grid gap-3">
      <BPlaceholder width="40%" size="lg" animation="glow" />
      <BPlaceholder v-for="i in 3" :key="i" animation="glow" size="lg" />
    </div>

    <BAlert v-else-if="erroCarregar" :model-value="true" variant="danger" class="mt-3">
      <div class="d-flex align-items-center gap-2">
        <span class="flex-grow-1">{{ erroCarregar }}</span>
        <BButton size="sm" variant="outline-danger" @click="carregar">Tentar de novo</BButton>
      </div>
    </BAlert>

    <template v-else-if="avaliacao">
      <!-- Título e ações -->
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mt-2 mb-4">
        <div class="min-w-0">
          <h1 class="h3 fw-bold mb-1 text-truncate">{{ avaliacao.descricao }}</h1>
          <div class="text-secondary small">
            Criada em {{ formatarData(avaliacao.dataCriacao) }} ·
            {{ avaliacao.questoes.length }} {{ avaliacao.questoes.length === 1 ? 'questão' : 'questões' }} ·
            <strong class="text-primary">{{ formatarPontos(avaliacao.totalPontos) }}</strong>
          </div>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <BButton :to="{ name: 'avaliacao-imprimir', params: { id: avaliacao.id } }" variant="primary">
            <i class="bi bi-printer me-1" aria-hidden="true" />Visualizar e imprimir
          </BButton>
          <BButton variant="outline-secondary" :disabled="ocupado" @click="duplicar">
            <i class="bi bi-copy me-1" aria-hidden="true" />Duplicar
          </BButton>
          <BButton variant="outline-danger" :disabled="ocupado" @click="excluir">
            <i class="bi bi-trash me-1" aria-hidden="true" />Excluir
          </BButton>
        </div>
      </div>

      <!-- Dados da avaliação -->
      <BCard class="border-0 shadow-sm mb-4" no-body>
        <div class="card-header bg-white border-0 pt-3 d-flex align-items-center justify-content-between gap-2">
          <h2 class="h6 fw-bold mb-0">Dados da avaliação</h2>
          <BButton v-if="!editandoDados" size="sm" variant="outline-primary" @click="editandoDados = true">
            <i class="bi bi-pencil me-1" aria-hidden="true" />Editar dados
          </BButton>
        </div>

        <!-- Resumo (leitura) -->
        <div v-if="!editandoDados" class="card-body pt-2">
          <dl class="row g-3 mb-0 resumo-dados">
            <div v-for="item in resumoDados" :key="item.rotulo" :class="item.classe">
              <dt>{{ item.rotulo }}</dt>
              <dd :class="{ 'text-secondary fst-italic': !item.valor }">{{ item.valor || 'não informado' }}</dd>
            </div>
            <div v-if="avaliacao.cabecalho?.instrucoes" class="col-12">
              <dt>Instruções</dt>
              <dd class="instrucoes">{{ avaliacao.cabecalho.instrucoes }}</dd>
            </div>
          </dl>
        </div>

        <!-- Edição -->
        <div v-else class="card-body pt-2">
          <BAlert v-if="erroForm" :model-value="true" variant="danger" class="small">{{ erroForm }}</BAlert>
          <BForm novalidate @submit.prevent="salvarDados">
            <AvaliacaoForm v-model="form" :erros="errosForm" />
            <div class="d-flex flex-wrap align-items-center justify-content-end gap-2 mt-4">
              <span v-if="alterado" class="small text-secondary me-auto">
                <i class="bi bi-circle-fill text-warning me-1" style="font-size: 0.5rem" aria-hidden="true" />Alterações não salvas
              </span>
              <BButton variant="outline-secondary" :disabled="salvandoForm" @click="cancelarEdicaoDados">Cancelar</BButton>
              <BButton type="submit" variant="primary" :disabled="salvandoForm || !alterado">
                <BSpinner v-if="salvandoForm" small class="me-1" />Salvar dados
              </BButton>
            </div>
          </BForm>
        </div>
      </BCard>

      <!-- Questões da prova -->
      <BCard class="border-0 shadow-sm" no-body>
        <div class="card-header bg-white border-0 pt-3 d-flex align-items-center justify-content-between gap-2">
          <h2 class="h6 fw-bold mb-0">Questões da prova</h2>
          <div class="d-flex flex-wrap justify-content-end gap-2">
            <BButton size="sm" variant="outline-primary" @click="novaQuestaoAberta = true">
              <i class="bi bi-pencil-square me-1" aria-hidden="true" />Criar questão
            </BButton>
            <BButton size="sm" variant="primary" @click="seletorAberto = true">
              <i class="bi bi-collection me-1" aria-hidden="true" />Adicionar do banco
            </BButton>
          </div>
        </div>

        <div v-if="!avaliacao.questoes.length" class="text-center text-secondary px-4 py-5">
          <i class="bi bi-list-ol fs-1 d-block mb-2 opacity-50" aria-hidden="true" />
          <p class="mb-3">Esta prova ainda não tem questões.</p>
          <div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
            <BButton variant="primary" @click="seletorAberto = true">
              <i class="bi bi-collection me-1" aria-hidden="true" />Escolher do banco de questões
            </BButton>
            <BButton variant="outline-primary" @click="novaQuestaoAberta = true">
              <i class="bi bi-pencil-square me-1" aria-hidden="true" />Criar uma questão nova
            </BButton>
          </div>
        </div>

        <ol v-else class="list-group list-group-flush list-unstyled mb-0">
          <li v-for="(q, i) in avaliacao.questoes" :key="q.id" class="list-group-item py-3">
            <div class="d-flex gap-3">
              <span class="numero-questao flex-shrink-0">{{ i + 1 }}</span>
              <QuestaoResumo :questao="q" class="flex-grow-1" />
            </div>

            <div class="d-flex flex-wrap align-items-center gap-2 mt-2 ms-5">
              <BInputGroup size="sm" append="pts" class="campo-pontos">
                <BFormInput
                  v-model="pontos[q.id]"
                  type="number"
                  min="0"
                  step="0.5"
                  :aria-label="`Pontos da questão ${i + 1}`"
                  :state="erroPontos[q.id] ? false : null"
                  @change="salvarPontos(q)"
                  @keydown.enter.prevent="salvarPontos(q)"
                />
              </BInputGroup>
              <span v-if="erroPontos[q.id]" class="small text-danger">{{ erroPontos[q.id] }}</span>

              <div class="btn-group btn-group-sm ms-auto" role="group" :aria-label="`Ações da questão ${i + 1}`">
                <BButton variant="outline-secondary" :disabled="ocupado || i === 0" title="Subir" @click="mover(i, -1)">
                  <i class="bi bi-arrow-up" aria-hidden="true" /><span class="visually-hidden">Subir</span>
                </BButton>
                <BButton variant="outline-secondary" :disabled="ocupado || i === avaliacao.questoes.length - 1" title="Descer" @click="mover(i, 1)">
                  <i class="bi bi-arrow-down" aria-hidden="true" /><span class="visually-hidden">Descer</span>
                </BButton>
                <BButton variant="outline-danger" :disabled="ocupado" title="Remover da prova" @click="remover(q, i)">
                  <i class="bi bi-x-lg" aria-hidden="true" /><span class="visually-hidden">Remover da prova</span>
                </BButton>
              </div>
            </div>
          </li>
        </ol>

        <div v-if="avaliacao.questoes.length" class="card-footer bg-white d-flex justify-content-between fw-semibold">
          <span>Total da prova</span>
          <span class="text-primary">{{ formatarPontos(avaliacao.totalPontos) }}</span>
        </div>
      </BCard>

      <SeletorQuestoesModal
        v-model="seletorAberto"
        :ids-na-avaliacao="idsNaAvaliacao"
        :on-adicionar="adicionar"
        @criar-questao="abrirCriacaoPeloSeletor"
      />
      <NovaQuestaoModal v-model="novaQuestaoAberta" :numero="avaliacao.questoes.length + 1" :on-criar="criarEAdicionar" />
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { RouterLink, useRouter, onBeforeRouteLeave } from 'vue-router'
import {
  BCard, BForm, BButton, BSpinner, BAlert, BPlaceholder, BInputGroup, BFormInput,
  useToast, useModal,
} from 'bootstrap-vue-next'
import AvaliacaoForm from '@/components/avaliacoes/AvaliacaoForm.vue'
import QuestaoResumo from '@/components/questoes/QuestaoResumo.vue'
import SeletorQuestoesModal from '@/components/avaliacoes/SeletorQuestoesModal.vue'
import NovaQuestaoModal from '@/components/avaliacoes/NovaQuestaoModal.vue'
import { criarQuestao } from '@/services/questaoService.js'
import { formularioDe, corpoDe, validarFormulario } from '@/components/avaliacoes/formularioAvaliacao.js'
import * as servico from '@/services/avaliacaoService.js'
import { formatarData, formatarPontos } from '@/utils/formatacao.js'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const { create: criarToast } = useToast()
const { create: criarModal } = useModal()

const avaliacao = ref(null)
const carregando = ref(true)
const erroCarregar = ref('')
const ocupado = ref(false)
const seletorAberto = ref(false)
const novaQuestaoAberta = ref(false)

// Formulário de dados + cabeçalho
const form = ref(formularioDe())
const formOriginal = ref('')
const errosForm = ref({})
const erroForm = ref('')
const salvandoForm = ref(false)
const alterado = computed(() => JSON.stringify(form.value) !== formOriginal.value)
const editandoDados = ref(false)

// Resumo exibido no card "Dados da avaliação" (modo leitura)
const resumoDados = computed(() => {
  const a = avaliacao.value
  const c = a?.cabecalho || {}
  const col = 'col-12 col-sm-6 col-lg-3'
  return [
    { rotulo: 'Descrição', valor: a?.descricao, classe: 'col-12 col-lg-6' },
    { rotulo: 'Criada em', valor: formatarData(a?.dataCriacao), classe: col },
    { rotulo: 'Data de aplicação', valor: formatarData(c.data), classe: col },
    { rotulo: 'Instituição', valor: c.instituicao, classe: col },
    { rotulo: 'Campus', valor: c.campos, classe: col },
    { rotulo: 'Curso', valor: c.curso, classe: col },
    { rotulo: 'Disciplina', valor: c.disciplina, classe: col },
    { rotulo: 'Professor(a)', valor: c.professor, classe: col },
    { rotulo: 'Turma', valor: c.turma, classe: col },
  ]
})

function cancelarEdicaoDados() {
  form.value = JSON.parse(formOriginal.value)
  errosForm.value = {}
  erroForm.value = ''
  editandoDados.value = false
}

// Pontos editáveis de cada questão (por id) e erros de validação
const pontos = reactive({})
const erroPontos = reactive({})

const idsNaAvaliacao = computed(() => new Set(avaliacao.value?.questoes.map((q) => q.id) || []))

function avisar(body, variant = 'success') {
  criarToast({ body, variant, pos: 'top-end', modelValue: 3000 })
}

// Atualiza a tela com a avaliação devolvida pela API
function aplicar(dados, { recarregarForm = false } = {}) {
  avaliacao.value = dados
  for (const chave of Object.keys(pontos)) delete pontos[chave]
  for (const q of dados.questoes) pontos[q.id] = Number(q.pontos)
  if (recarregarForm) {
    form.value = formularioDe(dados)
    formOriginal.value = JSON.stringify(form.value)
  }
}

async function carregar() {
  carregando.value = true
  erroCarregar.value = ''
  try {
    aplicar(await servico.obterAvaliacao(props.id), { recarregarForm: true })
    editandoDados.value = false
  } catch (e) {
    erroCarregar.value = e.message
  } finally {
    carregando.value = false
  }
}

watch(() => props.id, carregar, { immediate: true })

async function salvarDados() {
  erroForm.value = ''
  errosForm.value = validarFormulario(form.value)
  if (Object.keys(errosForm.value).length) return

  salvandoForm.value = true
  try {
    aplicar(await servico.atualizarAvaliacao(props.id, corpoDe(form.value)), { recarregarForm: true })
    editandoDados.value = false
    avisar('Dados da avaliação salvos.')
  } catch (e) {
    errosForm.value = e.detalhes || {}
    erroForm.value = e.message
  } finally {
    salvandoForm.value = false
  }
}

// Executa uma alteração nas questões; a API devolve a avaliação atualizada
async function alterarQuestoes(acao, mensagem) {
  ocupado.value = true
  try {
    aplicar(await acao())
    if (mensagem) avisar(mensagem)
  } catch (e) {
    avisar(e.message, 'danger')
  } finally {
    ocupado.value = false
  }
}

async function adicionar(questao, valor) {
  // Erros sobem para o modal, que os exibe
  aplicar(await servico.adicionarQuestao(props.id, questao.id, valor))
  avisar('Questão adicionada à prova.')
}

// "Não encontrou? Criar nova questão" no seletor: troca um modal pelo outro
function abrirCriacaoPeloSeletor() {
  seletorAberto.value = false
  novaQuestaoAberta.value = true
}

// Cria a questão no banco e já a coloca no fim da prova
async function criarEAdicionar(corpo, valor) {
  // Erros de validação da criação sobem para o modal, que os mostra nos campos
  const questao = await criarQuestao(corpo)
  try {
    aplicar(await servico.adicionarQuestao(props.id, questao.id, valor))
    avisar('Questão criada e adicionada à prova.')
  } catch (e) {
    // A questão já existe no banco: não deixar o modal aberto (salvar de novo a duplicaria)
    avisar(`A questão foi salva no banco, mas não entrou na prova: ${e.message} Use "Adicionar do banco" para incluí-la.`, 'warning')
  }
}

async function salvarPontos(questao) {
  const valor = Number(pontos[questao.id])
  delete erroPontos[questao.id]
  if (pontos[questao.id] === '' || !Number.isFinite(valor) || valor < 0) {
    erroPontos[questao.id] = 'Informe 0 ou mais.'
    return
  }
  if (valor === Number(questao.pontos)) return
  await alterarQuestoes(() => servico.alterarPontosQuestao(props.id, questao.id, valor))
}

function mover(indice, direcao) {
  const ids = avaliacao.value.questoes.map((q) => q.id)
  const destino = indice + direcao
  ;[ids[indice], ids[destino]] = [ids[destino], ids[indice]]
  alterarQuestoes(() => servico.reordenarQuestoes(props.id, ids))
}

function remover(questao, indice) {
  alterarQuestoes(() => servico.removerQuestao(props.id, questao.id), `Questão ${indice + 1} removida da prova.`)
}

async function duplicar() {
  ocupado.value = true
  try {
    const copia = await servico.duplicarAvaliacao(props.id)
    avisar('Avaliação duplicada. Você está editando a cópia.')
    router.push({ name: 'avaliacao', params: { id: copia.id } })
  } catch (e) {
    avisar(e.message, 'danger')
  } finally {
    ocupado.value = false
  }
}

async function excluir() {
  const resposta = await criarModal({
    title: 'Excluir avaliação',
    body: `Excluir "${avaliacao.value.descricao}"? O cabeçalho e a seleção de questões desta prova serão apagados. As questões continuam no banco de questões.`,
    okTitle: 'Excluir',
    okVariant: 'danger',
    cancelTitle: 'Cancelar',
  }).show()
  if (!resposta?.ok) return

  ocupado.value = true
  try {
    await servico.removerAvaliacao(props.id)
    formOriginal.value = JSON.stringify(form.value) // não perguntar sobre alterações ao sair
    avisar('Avaliação excluída.')
    router.push({ name: 'avaliacoes' })
  } catch (e) {
    avisar(e.message, 'danger')
    ocupado.value = false
  }
}

// Avisa antes de sair da página com dados do formulário não salvos
onBeforeRouteLeave(async () => {
  if (!alterado.value || !avaliacao.value) return true
  const resposta = await criarModal({
    title: 'Alterações não salvas',
    body: 'Os dados ou o cabeçalho da avaliação foram alterados e não foram salvos. Sair mesmo assim?',
    okTitle: 'Sair sem salvar',
    okVariant: 'danger',
    cancelTitle: 'Continuar editando',
  }).show()
  return !!resposta?.ok
})
</script>

<style scoped>
.min-w-0 {
  min-width: 0;
}

.numero-questao {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  color: var(--bs-primary);
  background-color: rgba(26, 86, 219, 0.1);
}

.campo-pontos {
  width: 8rem;
}

.resumo-dados dt {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--bs-secondary-color);
  margin-bottom: 0.1rem;
}

.resumo-dados dd {
  margin-bottom: 0;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.resumo-dados .instrucoes {
  font-weight: 400;
  white-space: pre-line;
}
</style>
