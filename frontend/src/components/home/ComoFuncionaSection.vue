<template>
  <section id="como-funciona" class="py-5">
    <BContainer class="py-lg-4">
      <div class="text-center mx-auto mb-5" style="max-width: 40rem">
        <span class="text-primary fw-semibold text-uppercase small">Como funciona</span>
        <h2 class="display-6 fw-bold mt-2">Da ideia à prova em 4 passos</h2>
      </div>

      <BRow class="g-4">
        <BCol v-for="(p, i) in passos" :key="p.titulo" cols="12" sm="6" lg="3">
          <div class="text-center px-2">
            <div class="passo-numero mx-auto mb-3">{{ i + 1 }}</div>
            <h3 class="h5 fw-bold">{{ p.titulo }}</h3>
            <p class="text-secondary mb-0">{{ p.descricao }}</p>
          </div>
        </BCol>
      </BRow>
    </BContainer>
  </section>
</template>

<script setup>
import { BContainer, BRow, BCol } from 'bootstrap-vue-next'

const passos = [
  { titulo: 'Cadastre-se', descricao: 'Crie sua conta de professor gratuitamente e acesse pelo navegador.' },
  { titulo: 'Escreva questões', descricao: 'Monte seu banco com enunciados, alternativas e a resposta correta.' },
  { titulo: 'Monte a avaliação', descricao: 'Selecione as questões, defina os pontos e preencha o cabeçalho.' },
  { titulo: 'Imprima e aplique', descricao: 'Gere a prova pronta e o gabarito para a correção.' },
]
</script>

<style scoped>
.passo-numero {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #123a8c, var(--bs-primary));
  box-shadow: 0 0.5rem 1rem rgba(26, 86, 219, 0.3);
}
</style>
