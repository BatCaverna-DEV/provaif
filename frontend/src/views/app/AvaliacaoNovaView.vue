<template>
  <div class="mx-auto" style="max-width: 52rem">
    <RouterLink :to="{ name: 'avaliacoes' }" class="small text-decoration-none">
      <i class="bi bi-arrow-left me-1" aria-hidden="true" />Avaliações
    </RouterLink>
    <h1 class="h3 fw-bold mt-2 mb-4">Nova avaliação</h1>

    <BCard class="border-0 shadow-sm">
      <BAlert v-if="erroGeral" :model-value="true" variant="danger" class="small">{{ erroGeral }}</BAlert>

      <BForm novalidate @submit.prevent="salvar">
        <AvaliacaoForm v-model="form" :erros="erros" />

        <div class="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
          <BButton :to="{ name: 'avaliacoes' }" variant="outline-secondary">Cancelar</BButton>
          <BButton type="submit" variant="primary" :disabled="salvando">
            <BSpinner v-if="salvando" small class="me-1" />
            Criar e escolher questões
            <i class="bi bi-arrow-right ms-1" aria-hidden="true" />
          </BButton>
        </div>
      </BForm>
    </BCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { BCard, BForm, BButton, BSpinner, BAlert, useToast } from 'bootstrap-vue-next'
import AvaliacaoForm from '@/components/avaliacoes/AvaliacaoForm.vue'
import { formularioDe, corpoDe, validarFormulario } from '@/components/avaliacoes/formularioAvaliacao.js'
import { criarAvaliacao } from '@/services/avaliacaoService.js'
import { auth } from '@/stores/auth.js'

const router = useRouter()
const { create: criarToast } = useToast()

// O nome do professor já vem preenchido no cabeçalho
const form = ref(formularioDe(null, { professor: auth.usuario.value?.nome }))
const erros = ref({})
const erroGeral = ref('')
const salvando = ref(false)

async function salvar() {
  erroGeral.value = ''
  erros.value = validarFormulario(form.value)
  if (Object.keys(erros.value).length) return

  salvando.value = true
  try {
    const avaliacao = await criarAvaliacao(corpoDe(form.value))
    criarToast({ body: 'Avaliação criada. Agora adicione as questões.', variant: 'success', pos: 'top-end', modelValue: 3500 })
    router.replace({ name: 'avaliacao', params: { id: avaliacao.id } })
  } catch (e) {
    erros.value = e.detalhes || {}
    erroGeral.value = e.message
  } finally {
    salvando.value = false
  }
}
</script>
