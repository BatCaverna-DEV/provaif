<template>
  <section class="bg-white border-bottom py-4">
    <BContainer>
      <BRow class="text-center g-4">
        <BCol v-for="n in numeros" :key="n.rotulo" cols="6" md="3">
          <div class="display-6 fw-bold text-primary">{{ n.valor }}</div>
          <div class="small text-secondary">{{ n.rotulo }}</div>
        </BCol>
      </BRow>
    </BContainer>
  </section>
</template>

<script setup>
import { BContainer, BRow, BCol } from 'bootstrap-vue-next'

// Números ilustrativos (fictícios)
const numeros = [
  { valor: '1.200+', rotulo: 'professores cadastrados' },
  { valor: '35 mil', rotulo: 'questões no banco' },
  { valor: '8 mil', rotulo: 'provas geradas' },
  { valor: '70%', rotulo: 'menos tempo para montar uma prova' },
]
</script>
