<template>
  <BApp>
    <AppLayout v-if="layout === 'app'">
      <RouterView />
    </AppLayout>

    <RouterView v-else-if="layout === 'impressao'" />

    <div v-else-if="layout === 'publico'" class="d-flex flex-column min-vh-100">
      <SiteNavbar />
      <main class="flex-grow-1">
        <RouterView />
      </main>
      <SiteFooter />
    </div>
  </BApp>
</template>

<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { BApp } from 'bootstrap-vue-next'
import SiteNavbar from '@/components/layout/SiteNavbar.vue'
import SiteFooter from '@/components/layout/SiteFooter.vue'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()

// Site de divulgação (navbar + rodapé), área logada (menu lateral) ou impressão (só a página).
// Antes da primeira rota ser resolvida não há layout, o que evita "piscar" o layout errado.
const layout = computed(() => (route.matched.length ? route.meta.layout || 'publico' : null))
</script>
