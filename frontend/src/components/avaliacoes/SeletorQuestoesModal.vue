<template>
  <BModal v-model="aberto" title="Adicionar do banco de questões" size="xl" scrollable no-footer @show="carregar">
    <!-- Filtros -->
    <BRow class="g-2 mb-3">
      <BCol cols="12" lg="5">
        <BFormInput v-model="filtros.busca" type="search" placeholder="Buscar por assunto ou enunciado..." aria-label="Buscar questões" />
      </BCol>
      <BCol cols="6" lg="2">
        <BFormSelect v-model="filtros.tipo" :options="opcoesTipo" aria-label="Tipo" />
      </BCol>
      <BCol cols="6" lg="2">
        <BFormSelect v-model="filtros.nivel" :options="opcoesNivel" aria-label="Nível" />
      </BCol>
      <BCol cols="12" lg="3" class="d-flex align-items-center">
        <BFormCheckbox v-model="filtros.minhas" switch>Só as minhas</BFormCheckbox>
      </BCol>
    </BRow>

    <div class="d-flex flex-wrap align-items-center gap-2 bg-azul-claro rounded-3 p-2 px-3 mb-3 small">
      <label for="pontos-padrao" class="mb-0">Pontos de cada questão adicionada:</label>
      <BFormInput id="pontos-padrao" v-model="pontosPadrao" type="number" min="0" step="0.5" size="sm" style="width: 6rem" />
      <span class="text-secondary d-none d-md-inline">(pode ser alterado depois)</span>
      <BButton size="sm" variant="link" class="ms-auto p-0" @click="emit('criar-questao')">
        <i class="bi bi-pencil-square me-1" aria-hidden="true" />Não encontrou? Criar nova questão
      </BButton>
    </div>

    <BAlert v-if="erro" :model-value="true" variant="danger">{{ erro }}</BAlert>

    <div v-if="carregando" class="d-grid gap-3">
      <BPlaceholder v-for="i in 3" :key="i" animation="glow" size="lg" />
    </div>

    <div v-else-if="!questoes.length" class="text-center text-secondary py-5">
      <i class="bi bi-collection fs-1 d-block mb-2 opacity-50" aria-hidden="true" />
      <template v-if="temFiltro">Nenhuma questão encontrada com esses filtros.</template>
      <template v-else>
        <p class="mb-3">Nenhuma questão disponível ainda.</p>
        <BButton variant="outline-primary" size="sm" @click="emit('criar-questao')">Criar uma questão para esta prova</BButton>
      </template>
    </div>

    <ul v-else class="list-group">
      <li v-for="q in questoes" :key="q.id" class="list-group-item d-flex gap-3 align-items-start py-3">
        <QuestaoResumo :questao="q" class="flex-grow-1" />
        <span v-if="idsNaAvaliacao.has(q.id)" class="badge text-bg-success flex-shrink-0 mt-1">
          <i class="bi bi-check-lg me-1" aria-hidden="true" />Na prova
        </span>
        <BButton v-else size="sm" variant="primary" class="flex-shrink-0" :disabled="adicionando === q.id" @click="adicionar(q)">
          <BSpinner v-if="adicionando === q.id" small />
          <template v-else><i class="bi bi-plus-lg me-1" aria-hidden="true" />Adicionar</template>
        </BButton>
      </li>
    </ul>
  </BModal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import {
  BModal, BRow, BCol, BFormInput, BFormSelect, BFormCheckbox, BButton, BSpinner, BAlert, BPlaceholder,
} from 'bootstrap-vue-next'
import QuestaoResumo from '@/components/questoes/QuestaoResumo.vue'
import { listarQuestoes } from '@/services/questaoService.js'
import { TIPOS_QUESTAO, NIVEIS_QUESTAO } from '@/utils/formatacao.js'

/**
 * Modal para escolher questões do banco.
 * v-model: aberto/fechado
 * idsNaAvaliacao: ids das questões que já estão na prova
 * onAdicionar: função async (questao, pontos) chamada ao clicar em "Adicionar"
 * evento criar-questao: o professor quer criar uma questão nova em vez de escolher do banco
 */
const aberto = defineModel({ type: Boolean, default: false })

const props = defineProps({
  idsNaAvaliacao: { type: Set, required: true },
  onAdicionar: { type: Function, required: true },
})

const emit = defineEmits(['criar-questao'])

const questoes = ref([])
const carregando = ref(false)
const erro = ref('')
const adicionando = ref(null)
const pontosPadrao = ref(1)
const filtros = reactive({ busca: '', tipo: null, nivel: null, minhas: false })

const opcoesTipo = [{ value: null, text: 'Todos os tipos' }, ...Object.entries(TIPOS_QUESTAO).map(([v, t]) => ({ value: Number(v), text: t.texto }))]
const opcoesNivel = [{ value: null, text: 'Todos os níveis' }, ...Object.entries(NIVEIS_QUESTAO).map(([v, n]) => ({ value: Number(v), text: n.texto }))]

const temFiltro = computed(() => !!(filtros.busca || filtros.tipo || filtros.nivel || filtros.minhas))

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    questoes.value = await listarQuestoes({ ...filtros, busca: filtros.busca.trim() })
  } catch (e) {
    erro.value = e.message
  } finally {
    carregando.value = false
  }
}

let espera
watch(filtros, () => {
  clearTimeout(espera)
  espera = setTimeout(carregar, 300)
})

async function adicionar(questao) {
  adicionando.value = questao.id
  erro.value = ''
  try {
    await props.onAdicionar(questao, Math.max(0, Number(pontosPadrao.value) || 0))
  } catch (e) {
    erro.value = e.message
  } finally {
    adicionando.value = null
  }
}
</script>
