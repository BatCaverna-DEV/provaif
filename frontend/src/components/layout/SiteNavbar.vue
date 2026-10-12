<template>
  <BNavbar toggleable="lg" sticky="top" container class="bg-azul-escuro shadow-sm py-2" data-bs-theme="dark">
    <BNavbarBrand :to="{ name: 'home' }" class="fw-bold d-flex align-items-center gap-2">
      <i class="bi bi-file-earmark-check-fill texto-azul-claro fs-4" aria-hidden="true" />
      <span>Prova<span class="texto-azul-claro">IF</span></span>
    </BNavbarBrand>

    <BNavbarToggle target="menu-principal" label="Abrir menu" />

    <BCollapse id="menu-principal" is-nav>
      <BNavbarNav class="mx-auto">
        <BNavItem v-for="link in links" :key="link.hash" :to="{ name: 'home', hash: link.hash }">
          {{ link.texto }}
        </BNavItem>
      </BNavbarNav>

      <div class="d-flex flex-column flex-lg-row gap-2 mt-3 mt-lg-0">
        <BButton v-if="auth.logado.value" :to="{ name: 'painel' }" variant="light" class="fw-semibold px-4">
          <i class="bi bi-speedometer2 me-1" aria-hidden="true" />
          Acessar o painel
        </BButton>
        <template v-else>
          <BButton :to="{ name: 'cadastro' }" variant="outline-light" class="px-4">
            Criar conta
          </BButton>
          <BButton :to="{ name: 'login' }" variant="light" class="fw-semibold px-4">
            <i class="bi bi-box-arrow-in-right me-1" aria-hidden="true" />
            Entrar
          </BButton>
        </template>
      </div>
    </BCollapse>
  </BNavbar>
</template>

<script setup>
import {
  BNavbar, BNavbarBrand, BNavbarToggle, BNavbarNav, BNavItem,
  BCollapse, BButton,
} from 'bootstrap-vue-next'
import { auth } from '@/stores/auth.js'

const links = [
  { texto: 'O que é', hash: '#sobre' },
  { texto: 'Recursos', hash: '#recursos' },
  { texto: 'Como funciona', hash: '#como-funciona' },
  { texto: 'Depoimentos', hash: '#depoimentos' },
  { texto: 'Dúvidas', hash: '#faq' },
]
</script>
