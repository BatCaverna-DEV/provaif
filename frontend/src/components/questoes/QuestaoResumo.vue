<template>
  <div class="min-w-0">
    <div class="d-flex flex-wrap align-items-center gap-1 mb-1">
      <span v-if="questao.assunto" class="fw-semibold me-1">{{ questao.assunto }}</span>
      <span v-if="tipo" class="badge text-bg-light border fw-normal">
        <i :class="['bi', tipo.icone, 'me-1']" aria-hidden="true" />{{ tipo.texto }}
      </span>
      <span v-if="nivel" :class="['badge', 'fw-normal', `text-bg-${nivel.cor}`, 'bg-opacity-25', 'text-body']">{{ nivel.texto }}</span>
      <span v-if="!questao.propria" class="badge text-bg-info bg-opacity-25 text-body fw-normal" title="Questão pública de outro professor">
        <i class="bi bi-people me-1" aria-hidden="true" />compartilhada
      </span>
    </div>

    <!-- Recolhido: só o texto, em até 2 linhas, e avisos de imagem/tabela -->
    <p v-if="!expandido" class="texto-questao recolhido small mb-0">
      <span v-if="temImagem(questao.texto)" class="badge text-bg-light border fw-normal me-1" title="O enunciado tem imagem">
        <i class="bi bi-image" aria-hidden="true" /><span class="visually-hidden">tem imagem</span>
      </span>
      <span v-if="temTabela(questao.texto)" class="badge text-bg-light border fw-normal me-1" title="O enunciado tem tabela">
        <i class="bi bi-table" aria-hidden="true" /><span class="visually-hidden">tem tabela</span>
      </span>
      {{ textoPuro(questao.texto) || (temImagem(questao.texto) ? '' : '(sem enunciado)') }}
    </p>

    <!-- Expandido: conteúdo formatado completo -->
    <template v-else>
      <ConteudoRico :html="questao.texto" class="small" />
      <ol v-if="questao.alternativas?.length" class="list-unstyled small mt-2 mb-0 d-grid gap-1">
        <li v-for="(alt, i) in questao.alternativas" :key="alt.id" class="d-flex gap-1" :class="{ 'text-success fw-semibold': alt.correta }">
          <span class="flex-shrink-0">{{ LETRAS[i] }})</span>
          <ConteudoRico :html="alt.texto" class="flex-grow-1 min-w-0" />
          <i v-if="alt.correta" class="bi bi-check-circle-fill flex-shrink-0" aria-label="correta" />
        </li>
      </ol>
    </template>

    <button type="button" class="btn btn-link btn-sm p-0 mt-1" @click="expandido = !expandido">
      {{ expandido ? 'Mostrar menos' : questao.alternativas?.length ? 'Ver enunciado completo e alternativas' : 'Ver enunciado completo' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { TIPOS_QUESTAO, NIVEIS_QUESTAO, LETRAS } from '@/utils/formatacao.js'
import { textoPuro, temImagem, temTabela } from '@/utils/conteudo.js'
import ConteudoRico from '@/components/editor/ConteudoRico.vue'

const props = defineProps({
  questao: { type: Object, required: true },
})

const expandido = ref(false)
const tipo = computed(() => TIPOS_QUESTAO[props.questao.tipo])
const nivel = computed(() => NIVEIS_QUESTAO[props.questao.nivel])
</script>

<style scoped>
.min-w-0 {
  min-width: 0;
}

.texto-questao.recolhido {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
