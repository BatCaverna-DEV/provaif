<template>
  <fieldset>
    <legend class="form-label fs-6 mb-1">Alternativas</legend>
    <p class="small text-secondary mb-2">Marque a alternativa correta. De {{ MIN }} a {{ MAX }} alternativas.</p>

    <div v-if="erroGeral" class="small text-danger mb-2">
      <i class="bi bi-exclamation-circle me-1" aria-hidden="true" />{{ erroGeral }}
    </div>

    <ol class="list-unstyled d-grid gap-2 mb-2">
      <li v-for="(alt, i) in alternativas" :key="alt.chave">
        <div class="d-flex align-items-start gap-2">
          <label class="opcao-correta mt-1" :class="{ marcada: alt.correta }" :title="alt.correta ? 'Alternativa correta' : 'Marcar como correta'">
            <input
              type="radio"
              class="visually-hidden"
              :name="nomeGrupo"
              :checked="alt.correta"
              :aria-label="`Alternativa ${LETRAS[i]} é a correta`"
              @change="marcarCorreta(i)"
            />
            {{ LETRAS[i] }}
          </label>

          <div class="flex-grow-1">
            <EditorRico
              v-model="alt.texto"
              modo="compacto"
              :estado="erros[`alternativas.${i}`] ? false : null"
              :placeholder="`Alternativa ${LETRAS[i]}`"
              :rotulo="`Texto da alternativa ${LETRAS[i]}`"
            />
            <div v-if="erros[`alternativas.${i}`]" class="small text-danger mt-1">{{ erros[`alternativas.${i}`] }}</div>
          </div>

          <div class="btn-group btn-group-sm flex-shrink-0" role="group" :aria-label="`Ações da alternativa ${LETRAS[i]}`">
            <BButton variant="outline-secondary" :disabled="i === 0" title="Subir" @click="mover(i, -1)">
              <i class="bi bi-arrow-up" aria-hidden="true" /><span class="visually-hidden">Subir</span>
            </BButton>
            <BButton variant="outline-secondary" :disabled="i === alternativas.length - 1" title="Descer" @click="mover(i, 1)">
              <i class="bi bi-arrow-down" aria-hidden="true" /><span class="visually-hidden">Descer</span>
            </BButton>
            <BButton variant="outline-danger" :disabled="alternativas.length <= MIN" title="Remover" @click="remover(i)">
              <i class="bi bi-x-lg" aria-hidden="true" /><span class="visually-hidden">Remover</span>
            </BButton>
          </div>
        </div>
      </li>
    </ol>

    <BButton size="sm" variant="outline-primary" :disabled="alternativas.length >= MAX" @click="adicionar">
      <i class="bi bi-plus-lg me-1" aria-hidden="true" />Adicionar alternativa
    </BButton>
  </fieldset>
</template>

<script setup>
import { computed } from 'vue'
import { BButton } from 'bootstrap-vue-next'
import EditorRico from '@/components/editor/EditorRico.vue'
import { LETRAS } from '@/utils/formatacao.js'
import { novaAlternativa } from './formularioQuestao.js'

/**
 * Editor da lista de alternativas de uma questão objetiva.
 * v-model: array de { chave, texto, correta }
 * erros: erros por campo no formato da API ('alternativas', 'alternativas.0'...)
 */
const alternativas = defineModel({ type: Array, required: true })

const props = defineProps({
  erros: { type: Object, default: () => ({}) },
})

const MIN = 2
const MAX = 10
const nomeGrupo = `correta-${Math.random().toString(36).slice(2)}`

const erroGeral = computed(() => props.erros.alternativas)

function marcarCorreta(indice) {
  alternativas.value.forEach((alt, i) => { alt.correta = i === indice })
}

function adicionar() {
  alternativas.value.push(novaAlternativa())
}

function remover(indice) {
  alternativas.value.splice(indice, 1)
}

function mover(indice, direcao) {
  const lista = alternativas.value
  const destino = indice + direcao
  ;[lista[indice], lista[destino]] = [lista[destino], lista[indice]]
}
</script>

<style scoped>
.opcao-correta {
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bs-border-color);
  border-radius: 50%;
  font-weight: 700;
  cursor: pointer;
  user-select: none;
}

.opcao-correta:hover {
  border-color: var(--bs-success);
}

.opcao-correta:focus-within {
  outline: 2px solid var(--bs-primary);
  outline-offset: 2px;
}

.opcao-correta.marcada {
  color: #fff;
  background-color: var(--bs-success);
  border-color: var(--bs-success);
}
</style>
