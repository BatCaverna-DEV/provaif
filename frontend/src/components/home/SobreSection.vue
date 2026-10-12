<template>
  <section id="sobre" class="py-5">
    <BContainer class="py-lg-4">
      <BRow class="align-items-center g-5">
        <BCol cols="12" lg="6">
          <span class="text-primary fw-semibold text-uppercase small">O que é o ProvaIF</span>
          <h2 class="display-6 fw-bold mt-2 mb-3">Uma plataforma para criar provas</h2>
          <p class="text-secondary">
            O ProvaIF nasceu da rotina de professores que gastavam horas formatando provas no
            editor de texto, copiando questões de arquivos antigos e somando pontos na mão.
          </p>
          <p class="text-secondary mb-4">
            Aqui, cada questão que você escreve fica guardada no seu banco, organizada por assunto e
            nível de dificuldade. Na hora de montar uma avaliação, basta escolher as questões,
            definir a pontuação e imprimir.
          </p>

          <ul class="list-unstyled d-grid gap-2 mb-0">
            <li v-for="item in vantagens" :key="item" class="d-flex gap-2">
              <i class="bi bi-check-circle-fill text-primary" aria-hidden="true" />
              {{ item }}
            </li>
          </ul>
        </BCol>

        <BCol cols="12" lg="6">
          <BRow class="g-3">
            <BCol v-for="c in comparativo" :key="c.titulo" cols="12" sm="6">
              <BCard class="h-100 border-0 shadow-sm" :class="c.destaque ? 'bg-primary text-white' : 'bg-azul-claro'">
                <h3 class="h6 fw-bold" :class="c.destaque ? 'text-white' : 'text-secondary'">
                  <i :class="['bi', c.icone, 'me-1']" aria-hidden="true" />
                  {{ c.titulo }}
                </h3>
                <ul class="small mb-0 ps-3" :class="c.destaque ? 'text-white' : 'text-secondary'">
                  <li v-for="t in c.itens" :key="t" class="mb-1">{{ t }}</li>
                </ul>
              </BCard>
            </BCol>
          </BRow>
        </BCol>
      </BRow>
    </BContainer>
  </section>
</template>

<script setup>
import { BContainer, BRow, BCol, BCard } from 'bootstrap-vue-next'

const vantagens = [
  'Banco de questões pessoal, sempre à mão',
  'Pontuação total calculada automaticamente',
  'Cabeçalho com instituição, curso, turma e instruções',
  'Acesso pelo navegador, sem instalar nada',
]

const comparativo = [
  {
    titulo: 'Sem o ProvaIF',
    icone: 'bi-hourglass-split',
    destaque: false,
    itens: ['Questões espalhadas em vários arquivos', 'Formatação refeita a cada prova', 'Soma de pontos manual'],
  },
  {
    titulo: 'Com o ProvaIF',
    icone: 'bi-lightning-charge-fill',
    destaque: true,
    itens: ['Todas as questões em um só lugar', 'Layout padronizado e pronto', 'Pontuação calculada sozinha'],
  },
]
</script>
