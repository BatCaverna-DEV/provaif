<template>
  <section id="recursos" class="bg-azul-claro py-5">
    <BContainer class="py-lg-4">
      <div class="text-center mx-auto mb-5" style="max-width: 40rem">
        <span class="text-primary fw-semibold text-uppercase small">Recursos</span>
        <h2 class="display-6 fw-bold mt-2">Tudo o que você precisa para avaliar</h2>
        <p class="text-secondary mb-0">
          Do enunciado à folha impressa, o ProvaIF cuida das partes repetitivas para você focar no
          que importa: o conteúdo.
        </p>
      </div>

      <BRow class="g-4">
        <BCol v-for="r in recursos" :key="r.titulo" cols="12" md="6" lg="4">
          <BCard class="h-100 border-0 shadow-sm card-hover">
            <span class="icone-recurso mb-3">
              <i :class="['bi', r.icone]" aria-hidden="true" />
            </span>
            <h3 class="h5 fw-bold">{{ r.titulo }}</h3>
            <p class="text-secondary mb-0">{{ r.descricao }}</p>
          </BCard>
        </BCol>
      </BRow>
    </BContainer>
  </section>
</template>

<script setup>
import { BContainer, BRow, BCol, BCard } from 'bootstrap-vue-next'

const recursos = [
  {
    icone: 'bi-collection',
    titulo: 'Banco de questões',
    descricao: 'Cadastre questões objetivas e discursivas uma única vez e reutilize em quantas provas quiser.',
  },
  {
    icone: 'bi-funnel',
    titulo: 'Assunto e nível',
    descricao: 'Classifique cada questão por assunto e nível de dificuldade e encontre o que precisa em segundos.',
  },
  {
    icone: 'bi-ui-checks',
    titulo: 'Montagem de avaliações',
    descricao: 'Escolha as questões, defina quanto vale cada uma e veja o total de pontos calculado na hora.',
  },
  {
    icone: 'bi-card-heading',
    titulo: 'Cabeçalho personalizado',
    descricao: 'Instituição, campus, curso, disciplina, turma, data e instruções no topo de cada prova.',
  },
  {
    icone: 'bi-people',
    titulo: 'Questões compartilhadas',
    descricao: 'Deixe suas questões privadas ou públicas e aproveite as questões de outros professores.',
  },
  {
    icone: 'bi-printer',
    titulo: 'Pronta para imprimir',
    descricao: 'Gere a prova formatada e o gabarito com as alternativas corretas para facilitar a correção.',
  },
]
</script>
