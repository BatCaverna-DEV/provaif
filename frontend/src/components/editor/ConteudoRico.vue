<template>
  <!-- O HTML já é limpo pelo backend ao salvar; htmlSeguro() limpa de novo antes de exibir -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="conteudo-rico" v-html="seguro" />
</template>

<script setup>
import { computed } from 'vue'
import { htmlSeguro, textoParaHtml } from '@/utils/conteudo.js'

/** Exibe o conteúdo rico (HTML) de um enunciado ou alternativa. */
const props = defineProps({
  html: { type: String, default: '' },
})

// Conteúdo antigo em texto simples (sem tags) é exibido como parágrafos
const seguro = computed(() => {
  const valor = props.html || ''
  return htmlSeguro(/<[a-z][\s\S]*>/i.test(valor) ? valor : textoParaHtml(valor))
})
</script>
