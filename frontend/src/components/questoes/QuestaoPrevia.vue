<template>
  <div>
    <h2 class="h6 fw-bold text-secondary mb-2">
      <i class="bi bi-eye me-1" aria-hidden="true" />Como fica na prova
    </h2>
    <div class="folha-previa bg-white shadow-sm">
      <div class="d-flex gap-2">
        <strong>{{ numero }}.</strong>
        <div class="flex-grow-1 min-w-0">
          <ConteudoRico v-if="temConteudo(form.texto)" :html="form.texto" />
          <span v-else class="text-secondary">O enunciado aparece aqui.</span>
        </div>
        <span v-if="pontos !== null" class="pontos flex-shrink-0">({{ formatarPontos(pontos) }})</span>
      </div>
      <ol v-if="form.tipo === TIPO.OBJETIVA" class="list-unstyled ps-4 mt-2 mb-0">
        <li v-for="(a, i) in form.alternativas" :key="a.chave" class="d-flex gap-1 mb-1" :class="{ 'fw-bold text-success': a.correta }">
          <span class="flex-shrink-0">{{ LETRAS[i] }})</span>
          <ConteudoRico v-if="temConteudo(a.texto)" :html="a.texto" class="flex-grow-1 min-w-0" />
          <span v-else class="text-secondary">…</span>
          <span v-if="a.correta" class="small flex-shrink-0">✓</span>
        </li>
      </ol>
      <div v-else class="mt-2">
        <div v-for="n in 4" :key="n" class="linha-resposta" />
      </div>
    </div>
    <p class="small text-secondary mt-2 mb-0">A alternativa correta só aparece destacada no gabarito.</p>
  </div>
</template>

<script setup>
import { TIPO } from './formularioQuestao.js'
import { LETRAS, formatarPontos } from '@/utils/formatacao.js'
import { temConteudo } from '@/utils/conteudo.js'
import ConteudoRico from '@/components/editor/ConteudoRico.vue'

/** Pré-visualização de uma questão (objeto de formularioQuestao.js) como ela sai na prova. */
defineProps({
  form: { type: Object, required: true },
  numero: { type: Number, default: 1 },
  // Pontos da questão na prova (null = não mostrar)
  pontos: { type: Number, default: null },
})
</script>

<style scoped>
.folha-previa {
  padding: 1.25rem;
  border-radius: 0.5rem;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.95rem;
  color: #000;
}

.pontos {
  font-size: 0.8rem;
  color: #444;
  margin-right: 0.25em;
}

.min-w-0 {
  min-width: 0;
}

.linha-resposta {
  border-bottom: 1px solid #999;
  height: 1.8em;
}
</style>
