<template>
  <section class="bg-gradiente-azul text-white py-5">
    <BContainer class="py-lg-5">
      <BRow class="align-items-center g-5">
        <BCol cols="12" lg="6">
          <BBadge variant="light" text-variant="primary" pill class="mb-3 px-3 py-2">
            <i class="bi bi-stars me-1" aria-hidden="true" />
            Gratuito para professores
          </BBadge>

          <h1 class="display-5 fw-bold lh-sm mb-3">
            Suas provas prontas em <span class="texto-azul-claro">minutos</span>, não em horas.
          </h1>

          <p class="lead text-white-50 mb-4">
            O ProvaIF reúne seu banco de questões, monta a avaliação, calcula a pontuação e gera
            uma prova pronta para imprimir, com o cabeçalho da sua instituição.
          </p>

          <div class="d-flex flex-column flex-sm-row gap-3">
            <BButton :to="{ name: 'cadastro' }" variant="light" size="lg" class="fw-semibold px-4">
              Criar conta grátis
              <i class="bi bi-arrow-right ms-1" aria-hidden="true" />
            </BButton>
            <BButton :to="{ name: 'home', hash: '#como-funciona' }" variant="outline-light" size="lg" class="px-4">
              Ver como funciona
            </BButton>
          </div>
        </BCol>

        <BCol cols="12" lg="6">
          <!-- Ilustração: prévia de uma prova gerada -->
          <div class="folha-prova bg-white text-body rounded-4 shadow-lg p-4 mx-auto" aria-hidden="true">
            <div class="border rounded-3 p-3 mb-3 small">
              <div class="fw-bold text-primary">Instituto Federal · Campus Centro</div>
              <div class="d-flex flex-wrap gap-3 text-secondary">
                <span>Disciplina: Matemática</span>
                <span>Turma: 2º A</span>
                <span>Data: 15/10</span>
              </div>
              <div class="mt-2 border-bottom pb-1 text-secondary">Aluno(a):</div>
            </div>

            <div v-for="(q, i) in questoesExemplo" :key="i" class="mb-3">
              <div class="d-flex justify-content-between gap-2 small fw-semibold">
                <span>{{ i + 1 }}. {{ q.enunciado }}</span>
                <span class="badge text-bg-light text-primary align-self-start">{{ q.pontos }} pts</span>
              </div>
              <div class="d-grid gap-1 mt-2 small text-secondary">
                <div v-for="(alt, j) in q.alternativas" :key="j" class="d-flex align-items-center gap-2">
                  <span class="alternativa" :class="{ correta: j === q.correta }">{{ letras[j] }}</span>
                  {{ alt }}
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center border-top pt-3 small">
              <span class="text-secondary">Total</span>
              <span class="fw-bold text-primary">10,0 pontos</span>
            </div>
          </div>
        </BCol>
      </BRow>
    </BContainer>
  </section>
</template>

<script setup>
import { BContainer, BRow, BCol, BButton, BBadge } from 'bootstrap-vue-next'

const letras = ['a', 'b', 'c', 'd']

const questoesExemplo = [
  { enunciado: 'Qual é a raiz de 2x − 8 = 0?', pontos: '5,0', alternativas: ['x = 2', 'x = 4', 'x = 6', 'x = 8'], correta: 1 },
  { enunciado: 'Quanto vale 15% de 200?', pontos: '5,0', alternativas: ['15', '20', '30', '45'], correta: 2 },
]
</script>

<style scoped>
.folha-prova {
  max-width: 30rem;
  transform: rotate(1.5deg);
}

.alternativa {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--bs-border-color);
  border-radius: 50%;
  font-size: 0.75rem;
}

.alternativa.correta {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  color: #fff;
}
</style>
