<template>
  <section id="depoimentos" class="bg-azul-escuro text-white py-5">
    <BContainer class="py-lg-4">
      <div class="text-center mx-auto mb-5" style="max-width: 40rem">
        <span class="texto-azul-claro fw-semibold text-uppercase small">Depoimentos</span>
        <h2 class="display-6 fw-bold mt-2">Quem usa, recomenda</h2>
      </div>

      <BRow class="g-4">
        <BCol v-for="d in depoimentos" :key="d.nome" cols="12" md="4">
          <BCard class="h-100 border-0 bg-white bg-opacity-10 text-white">
            <i class="bi bi-quote fs-1 texto-azul-claro lh-1" aria-hidden="true" />
            <p class="mb-4">{{ d.texto }}</p>
            <div class="d-flex align-items-center gap-3 mt-auto">
              <span class="avatar">{{ iniciais(d.nome) }}</span>
              <div>
                <div class="fw-semibold">{{ d.nome }}</div>
                <div class="small text-white-50">{{ d.cargo }}</div>
              </div>
            </div>
          </BCard>
        </BCol>
      </BRow>
    </BContainer>
  </section>
</template>

<script setup>
import { BContainer, BRow, BCol, BCard } from 'bootstrap-vue-next'

// Depoimentos ilustrativos (fictícios)
const depoimentos = [
  {
    nome: 'Ana Ribeiro',
    cargo: 'Professora de Matemática',
    texto: 'Eu levava uma tarde inteira para montar uma prova. Agora escolho as questões do meu banco e em 15 minutos está pronta.',
  },
  {
    nome: 'Carlos Mendes',
    cargo: 'Professor de Programação',
    texto: 'O cálculo automático dos pontos acabou com aquela prova que somava 9,5 sem ninguém perceber.',
  },
  {
    nome: 'Juliana Costa',
    cargo: 'Professora de Biologia',
    texto: 'Gosto de poder separar as questões por nível. Consigo montar provas equilibradas para cada turma.',
  },
]

function iniciais(nome) {
  return nome.split(' ').map((p) => p[0]).slice(0, 2).join('')
}
</script>

<style scoped>
.avatar {
  width: 2.75rem;
  height: 2.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  background-color: var(--bs-primary);
}
</style>
