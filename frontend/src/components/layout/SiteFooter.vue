<template>
  <footer class="bg-azul-escuro text-white-50 pt-5 pb-4">
    <BContainer>
      <BRow class="g-4">
        <BCol cols="12" lg="5">
          <div class="fw-bold fs-5 text-white mb-2">
            <i class="bi bi-file-earmark-check-fill texto-azul-claro me-1" aria-hidden="true" />
            Prova<span class="texto-azul-claro">IF</span>
          </div>
          <p class="small mb-0">
            Feito por professores, para professores. Crie, organize e imprima suas avaliações
            em minutos, com um banco de questões que cresce junto com você.
          </p>
        </BCol>

        <BCol cols="6" lg="2" offset-lg="1">
          <h2 class="h6 text-white">Produto</h2>
          <ul class="list-unstyled small d-grid gap-1">
            <li><RouterLink :to="{ name: 'home', hash: '#recursos' }" class="link-light link-opacity-50 link-opacity-100-hover text-decoration-none">Recursos</RouterLink></li>
            <li><RouterLink :to="{ name: 'home', hash: '#como-funciona' }" class="link-light link-opacity-50 link-opacity-100-hover text-decoration-none">Como funciona</RouterLink></li>
            <li><RouterLink :to="{ name: 'home', hash: '#faq' }" class="link-light link-opacity-50 link-opacity-100-hover text-decoration-none">Dúvidas frequentes</RouterLink></li>
          </ul>
        </BCol>

        <BCol cols="6" lg="2">
          <h2 class="h6 text-white">Acesso</h2>
          <ul class="list-unstyled small d-grid gap-1">
            <li><RouterLink :to="{ name: 'cadastro' }" class="link-light link-opacity-50 link-opacity-100-hover text-decoration-none">Criar conta</RouterLink></li>
            <li><RouterLink :to="{ name: 'login' }" class="link-light link-opacity-50 link-opacity-100-hover text-decoration-none">Entrar</RouterLink></li>
          </ul>
        </BCol>

        <BCol cols="12" lg="2">
          <h2 class="h6 text-white">Contato</h2>
          <p class="small mb-0">
            <i class="bi bi-envelope me-1" aria-hidden="true" />
            contato@provaif.exemplo
          </p>
        </BCol>
      </BRow>

      <hr class="border-secondary my-4" />

      <p class="small text-center mb-0">
        © {{ ano }} ProvaIF · Batcaverna-DEV · Licença MIT
      </p>
    </BContainer>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { BContainer, BRow, BCol } from 'bootstrap-vue-next'

const ano = new Date().getFullYear()
</script>
