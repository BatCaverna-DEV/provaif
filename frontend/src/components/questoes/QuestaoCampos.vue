<template>
  <div>
    <!-- Tipo -->
    <fieldset class="mb-3">
      <legend class="form-label fs-6">Tipo</legend>
      <div class="d-flex gap-2" role="radiogroup">
        <label v-for="t in tipos" :key="t.valor" class="opcao-tipo flex-fill" :class="{ ativa: form.tipo === t.valor }">
          <input v-model="form.tipo" type="radio" :value="t.valor" :name="`${prefixo}-tipo`" class="visually-hidden" />
          <i :class="['bi', t.icone, 'fs-4']" aria-hidden="true" />
          <span>
            <span class="d-block fw-semibold">{{ t.texto }}</span>
            <span class="d-block small text-secondary">{{ t.descricao }}</span>
          </span>
        </label>
      </div>
    </fieldset>

    <BRow class="g-3">
      <BCol cols="12" md="7">
        <BFormGroup label="Assunto" :label-for="`${prefixo}-assunto`" :state="estado('assunto')" :invalid-feedback="erros.assunto">
          <BFormInput
            :id="`${prefixo}-assunto`"
            v-model="form.assunto"
            :state="estado('assunto')"
            :list="`${prefixo}-lista-assuntos`"
            maxlength="100"
            placeholder="Ex.: Funções afins"
            autocomplete="off"
          />
          <datalist :id="`${prefixo}-lista-assuntos`">
            <option v-for="a in assuntos" :key="a" :value="a" />
          </datalist>
        </BFormGroup>
      </BCol>
      <BCol cols="12" md="5">
        <fieldset>
          <legend class="form-label fs-6">Nível</legend>
          <div class="btn-group w-100" role="radiogroup">
            <template v-for="n in niveis" :key="n.valor">
              <input :id="`${prefixo}-nivel-${n.valor}`" v-model="form.nivel" type="radio" class="btn-check" :name="`${prefixo}-nivel`" :value="n.valor" />
              <label :for="`${prefixo}-nivel-${n.valor}`" :class="['btn', `btn-outline-${n.cor}`]">{{ n.texto }}</label>
            </template>
          </div>
        </fieldset>
      </BCol>
    </BRow>

    <BFormGroup
      label="Enunciado"
      :label-for="`${prefixo}-texto`"
      :state="estado('texto')"
      :invalid-feedback="erros.texto"
      :description="`${textoPuro(form.texto).length.toLocaleString('pt-BR')}/20.000 caracteres. Use Enter para um novo parágrafo e Shift+Enter para quebrar a linha.`"
      class="mt-3"
    >
      <EditorRico
        :id="`${prefixo}-texto`"
        v-model="form.texto"
        :estado="estado('texto')"
        rotulo="Enunciado"
        placeholder="Escreva o enunciado da questão... Você pode inserir listas, tabelas e imagens."
        :class="{ 'enunciado-curto': Number(linhasEnunciado) <= 4 }"
      />
    </BFormGroup>

    <AlternativasEditor v-if="form.tipo === TIPO.OBJETIVA" v-model="form.alternativas" :erros="erros" class="mt-3" />
    <p v-else class="small text-secondary mt-3 mb-0">
      <i class="bi bi-info-circle me-1" aria-hidden="true" />
      Questões discursivas saem na prova com linhas para a resposta.
    </p>

    <div class="bg-azul-claro rounded-3 p-3 mt-4">
      <BFormCheckbox v-model="publica" switch>
        <span class="fw-semibold">Compartilhar com outros professores</span>
      </BFormCheckbox>
      <div class="small text-secondary mt-1">
        Questões públicas podem ser usadas por outros professores em suas provas, mas só você pode editá-las ou excluí-las.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { BRow, BCol, BFormGroup, BFormInput, BFormCheckbox } from 'bootstrap-vue-next'
import EditorRico from '@/components/editor/EditorRico.vue'
import { textoPuro } from '@/utils/conteudo.js'
import AlternativasEditor from './AlternativasEditor.vue'
import { TIPO, ACESSO } from './formularioQuestao.js'
import { NIVEIS_QUESTAO } from '@/utils/formatacao.js'

/**
 * Campos de uma questão (tipo, assunto, nível, enunciado, alternativas e compartilhamento).
 * Usado na tela de questão e no modal de criar questão dentro de uma avaliação.
 * v-model: objeto de formularioQuestao.js
 * v-model:erros: erros por campo no formato da API; o erro de um campo some quando ele é corrigido
 */
const form = defineModel({ type: Object, required: true })
const erros = defineModel('erros', { type: Object, default: () => ({}) })

defineProps({
  assuntos: { type: Array, default: () => [] },
  // Prefixo dos ids dos campos (evita ids repetidos se houver dois formulários na página)
  prefixo: { type: String, default: 'q' },
  // 4 ou menos deixa a área do enunciado mais baixa (ex.: dentro de um modal)
  linhasEnunciado: { type: [Number, String], default: 6 },
})

const tipos = [
  { valor: TIPO.OBJETIVA, texto: 'Objetiva', descricao: 'Com alternativas', icone: 'bi-ui-radios' },
  { valor: TIPO.DISCURSIVA, texto: 'Discursiva', descricao: 'Resposta escrita', icone: 'bi-text-paragraph' },
]
const niveis = Object.entries(NIVEIS_QUESTAO).map(([valor, n]) => ({ valor: Number(valor), ...n }))

const publica = computed({
  get: () => form.value.acesso === ACESSO.PUBLICA,
  set: (v) => { form.value.acesso = v ? ACESSO.PUBLICA : ACESSO.PRIVADA },
})

function estado(campo) {
  return erros.value[campo] ? false : null
}

function limparErros(teste) {
  const restantes = Object.fromEntries(Object.entries(erros.value).filter(([chave]) => !teste(chave)))
  if (Object.keys(restantes).length !== Object.keys(erros.value).length) erros.value = restantes
}

// Ao corrigir um campo, some o erro dele
watch(() => form.value.assunto, () => limparErros((c) => c === 'assunto'))
watch(() => form.value.texto, () => limparErros((c) => c === 'texto'))
watch(() => form.value.alternativas, () => limparErros((c) => c.startsWith('alternativas')), { deep: true })
</script>

<style scoped>
.enunciado-curto :deep(.ProseMirror) {
  min-height: 6rem;
}

.opcao-tipo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 2px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius-lg);
  cursor: pointer;
  color: var(--bs-secondary-color);
}

.opcao-tipo:focus-within {
  outline: 2px solid var(--bs-primary);
  outline-offset: 2px;
}

.opcao-tipo.ativa {
  border-color: var(--bs-primary);
  color: var(--bs-primary);
  background-color: rgba(26, 86, 219, 0.05);
}
</style>
