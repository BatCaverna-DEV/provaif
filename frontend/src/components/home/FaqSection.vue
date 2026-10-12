<template>
  <section id="faq" class="py-5">
    <BContainer class="py-lg-4" style="max-width: 50rem">
      <div class="text-center mb-5">
        <span class="text-primary fw-semibold text-uppercase small">Dúvidas frequentes</span>
        <h2 class="display-6 fw-bold mt-2">Perguntas e respostas</h2>
      </div>

      <BAccordion>
        <BAccordionItem v-for="p in perguntas" :key="p.pergunta" :title="p.pergunta">
          <p class="text-secondary mb-0">{{ p.resposta }}</p>
        </BAccordionItem>
      </BAccordion>
    </BContainer>
  </section>
</template>

<script setup>
import { BContainer, BAccordion, BAccordionItem } from 'bootstrap-vue-next'

const perguntas = [
  {
    pergunta: 'Quem pode usar o ProvaIF?',
    resposta: 'O ProvaIF é feito para professores. Basta se cadastrar com seu e-mail para começar a criar questões e avaliações.',
  },
  {
    pergunta: 'O ProvaIF é pago?',
    resposta: 'Não. O uso é gratuito para professores.',
  },
  {
    pergunta: 'Quais tipos de questão posso criar?',
    resposta: 'Questões objetivas, com alternativas e indicação da resposta correta, e questões discursivas, com espaço para resposta.',
  },
  {
    pergunta: 'Outros professores conseguem ver minhas questões?',
    resposta: 'Só se você quiser. Cada questão pode ser privada (só você vê) ou pública (disponível para outros professores).',
  },
  {
    pergunta: 'Posso reaproveitar uma questão em várias provas?',
    resposta: 'Sim. A questão fica no seu banco e pode ser usada em quantas avaliações você quiser, com pontuações diferentes em cada uma.',
  },
  {
    pergunta: 'Preciso instalar algum programa?',
    resposta: 'Não. O ProvaIF funciona direto no navegador, no computador ou no celular.',
  },
]
</script>
