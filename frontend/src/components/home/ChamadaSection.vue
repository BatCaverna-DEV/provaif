<template>
  <section class="pb-5">
    <BContainer>
      <div class="bg-gradiente-azul text-white rounded-4 shadow p-4 p-md-5 text-center">
        <h2 class="display-6 fw-bold mb-3">Pronto para montar sua próxima prova?</h2>
        <p class="lead text-white-50 mx-auto mb-4" style="max-width: 36rem">
          Crie sua conta gratuita e comece a construir seu banco de questões hoje mesmo.
        </p>
        <div class="d-flex flex-column flex-sm-row justify-content-center gap-3">
          <BButton :to="{ name: 'cadastro' }" variant="light" size="lg" class="fw-semibold px-5">
            <i class="bi bi-person-plus me-1" aria-hidden="true" />
            Criar conta grátis
          </BButton>
          <BButton :to="{ name: 'login' }" variant="outline-light" size="lg" class="px-5">
            Já tenho conta
          </BButton>
        </div>
      </div>
    </BContainer>
  </section>
</template>

<script setup>
import { BContainer, BButton } from 'bootstrap-vue-next'
</script>
