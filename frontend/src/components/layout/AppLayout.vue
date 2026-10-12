<template>
  <div class="d-flex min-vh-100 bg-azul-claro">
    <!-- Menu lateral fixo (telas grandes) -->
    <aside class="menu-lateral bg-azul-escuro text-white d-none d-lg-flex flex-column p-3">
      <RouterLink :to="{ name: 'painel' }" class="marca text-white text-decoration-none fw-bold fs-5 px-2 py-2 mb-3">
        <i class="bi bi-file-earmark-check-fill texto-azul-claro me-1" aria-hidden="true" />
        Prova<span class="texto-azul-claro">IF</span>
      </RouterLink>
      <AppMenu />
    </aside>

    <!-- Menu lateral em gaveta (celular e tablet) -->
    <BOffcanvas v-model="menuAberto" placement="start" width="17rem" class="bg-azul-escuro text-white" header-close-class="btn-close-white">
      <template #title>
        <span class="fw-bold">Prova<span class="texto-azul-claro">IF</span></span>
      </template>
      <AppMenu @navegou="menuAberto = false" />
    </BOffcanvas>

    <div class="flex-grow-1 d-flex flex-column min-w-0">
      <!-- Barra superior -->
      <header class="bg-white border-bottom sticky-top">
        <div class="d-flex align-items-center gap-2 px-3 px-lg-4 py-2">
          <BButton variant="link" class="d-lg-none text-body p-1" aria-label="Abrir menu" @click="menuAberto = true">
            <i class="bi bi-list fs-3" aria-hidden="true" />
          </BButton>
          <span class="fw-bold d-lg-none">Prova<span class="text-primary">IF</span></span>

          <BDropdown variant="link" placement="bottom-end" no-caret class="ms-auto" toggle-class="text-decoration-none p-1">
            <template #button-content>
              <span class="d-flex align-items-center gap-2 text-body">
                <span class="avatar">{{ iniciais }}</span>
                <span class="d-none d-sm-block text-start lh-sm">
                  <span class="d-block fw-semibold small">{{ usuario?.nome }}</span>
                  <span class="d-block text-secondary small">@{{ usuario?.username }}</span>
                </span>
                <i class="bi bi-chevron-down small text-secondary" aria-hidden="true" />
              </span>
            </template>

            <BDropdownHeader>
              <div class="fw-semibold text-body">{{ usuario?.nome }}</div>
              <div class="small">{{ usuario?.email }}</div>
            </BDropdownHeader>
            <BDropdownDivider />
            <BDropdownItem disabled>
              <i class="bi bi-person-circle me-2" aria-hidden="true" />Meu perfil <small>(em breve)</small>
            </BDropdownItem>
            <BDropdownItem variant="danger" @click="sair">
              <i class="bi bi-box-arrow-right me-2" aria-hidden="true" />Sair
            </BDropdownItem>
          </BDropdown>
        </div>
      </header>

      <main class="flex-grow-1 p-3 p-lg-4">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  BButton, BOffcanvas, BDropdown, BDropdownItem, BDropdownHeader, BDropdownDivider, useToast,
} from 'bootstrap-vue-next'
import AppMenu from './AppMenu.vue'
import { auth } from '@/stores/auth.js'

const router = useRouter()
const { create: criarToast } = useToast()

const menuAberto = ref(false)
const usuario = auth.usuario

const iniciais = computed(() =>
  (usuario.value?.nome || '?')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)

function sair() {
  auth.sair()
  router.push({ name: 'login' })
  criarToast({ body: 'Você saiu da sua conta.', variant: 'secondary', pos: 'top-end', modelValue: 3000 })
}
</script>

<style scoped>
.menu-lateral {
  width: 16rem;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
}

.min-w-0 {
  min-width: 0;
}

.avatar {
  width: 2.25rem;
  height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #123a8c, var(--bs-primary));
}
</style>
