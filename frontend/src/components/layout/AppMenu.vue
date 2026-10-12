<template>
  <nav aria-label="Menu principal">
    <ul class="nav flex-column gap-1">
      <li v-for="item in itens" :key="item.texto" class="nav-item">
        <RouterLink
          v-if="item.to"
          :to="item.to"
          class="nav-link item-menu d-flex align-items-center gap-2"
          :class="{ ativo: ativo(item) }"
          :aria-current="ativo(item) ? 'page' : undefined"
          @click="$emit('navegou')"
        >
          <i :class="['bi', item.icone]" aria-hidden="true" />
          {{ item.texto }}
        </RouterLink>
        <span v-else class="nav-link item-menu desabilitado d-flex align-items-center gap-2" aria-disabled="true">
          <i :class="['bi', item.icone]" aria-hidden="true" />
          {{ item.texto }}
          <span class="badge rounded-pill bg-light bg-opacity-10 ms-auto fw-normal">em breve</span>
        </span>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'

defineEmits(['navegou'])

const route = useRoute()

// Itens sem "to" ainda não têm tela e aparecem como "em breve".
// "caminho" marca o item como ativo também nas sub-páginas (ex.: /avaliacoes/123).
const itens = [
  { texto: 'Início', icone: 'bi-house-door', to: { name: 'painel' }, caminho: '/painel' },
  { texto: 'Questões', icone: 'bi-collection', to: { name: 'questoes' }, caminho: '/questoes' },
  { texto: 'Avaliações', icone: 'bi-file-earmark-text', to: { name: 'avaliacoes' }, caminho: '/avaliacoes' },
  { texto: 'Meu perfil', icone: 'bi-person-circle' },
]

function ativo(item) {
  return route.path === item.caminho || route.path.startsWith(`${item.caminho}/`)
}
</script>

<style scoped>
.item-menu {
  color: rgba(255, 255, 255, 0.75);
  border-radius: 0.5rem;
  padding: 0.6rem 0.85rem;
}

.item-menu:not(.desabilitado):hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.08);
}

.item-menu.ativo {
  color: #fff;
  background-color: var(--bs-primary);
}

.item-menu.desabilitado {
  color: rgba(255, 255, 255, 0.4);
  cursor: default;
}
</style>
