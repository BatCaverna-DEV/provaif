<template>
  <section class="bg-azul-claro py-5">
    <BContainer class="py-lg-4">
      <BRow class="justify-content-center">
        <BCol cols="12" md="10" lg="9" xl="8">
          <BCard no-body class="border-0 shadow overflow-hidden">
            <BRow class="g-0">
              <BCol md="5" class="bg-gradiente-azul text-white p-4 p-lg-5 d-none d-md-flex flex-column">
                <h2 class="h3 fw-bold">Bem-vindo(a) de volta!</h2>
                <p class="text-white-50">
                  Acesse seu banco de questões e continue montando suas avaliações.
                </p>
                <ul class="list-unstyled d-grid gap-2 small mt-auto mb-0">
                  <li><i class="bi bi-check2-circle me-2 texto-azul-claro" aria-hidden="true" />Banco de questões</li>
                  <li><i class="bi bi-check2-circle me-2 texto-azul-claro" aria-hidden="true" />Montagem de avaliações</li>
                  <li><i class="bi bi-check2-circle me-2 texto-azul-claro" aria-hidden="true" />Prova pronta para imprimir</li>
                </ul>
              </BCol>

              <BCol cols="12" md="7" class="p-4 p-lg-5 bg-white">
                <h1 class="h4 fw-bold mb-1">Entrar</h1>
                <p class="text-secondary small mb-4">Use seu e-mail ou usuário e sua senha.</p>

                <BAlert :model-value="!!aviso" variant="warning" class="small">
                  <i class="bi bi-clock-history me-1" aria-hidden="true" />{{ aviso }}
                </BAlert>
                <BAlert :model-value="!!erro" variant="danger" class="small" dismissible @update:model-value="erro = ''">
                  <i class="bi bi-exclamation-triangle-fill me-1" aria-hidden="true" />{{ erro }}
                </BAlert>

                <BForm novalidate @submit.prevent="entrar">
                  <BFormGroup
                    label="E-mail ou usuário"
                    label-for="login-usuario"
                    :state="usuarioState"
                    invalid-feedback="Informe seu e-mail ou usuário"
                  >
                    <BFormInput
                      id="login-usuario"
                      v-model="usuario"
                      :state="usuarioState"
                      autocomplete="username"
                      placeholder="professor@escola.edu.br"
                      required
                    />
                  </BFormGroup>

                  <BFormGroup
                    label="Senha"
                    label-for="login-senha"
                    :state="senhaState"
                    invalid-feedback="Informe sua senha"
                    class="mt-3"
                  >
                    <BInputGroup>
                      <BFormInput
                        id="login-senha"
                        v-model="senha"
                        :type="mostrarSenha ? 'text' : 'password'"
                        :state="senhaState"
                        autocomplete="current-password"
                        required
                      />
                      <BButton
                        variant="outline-secondary"
                        :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
                        @click="mostrarSenha = !mostrarSenha"
                      >
                        <i :class="['bi', mostrarSenha ? 'bi-eye-slash' : 'bi-eye']" aria-hidden="true" />
                      </BButton>
                    </BInputGroup>
                  </BFormGroup>

                  <div class="d-flex justify-content-between align-items-center mt-3">
                    <BFormCheckbox v-model="lembrar">Lembrar de mim</BFormCheckbox>
                    <BLink class="small" @click="emBreve('A recuperação de senha')">Esqueci minha senha</BLink>
                  </div>

                  <BButton type="submit" variant="primary" size="lg" class="w-100 mt-4" :disabled="carregando">
                    <BSpinner v-if="carregando" small class="me-2" />
                    {{ carregando ? 'Entrando...' : 'Entrar' }}
                  </BButton>
                </BForm>

                <p class="text-center text-secondary small mt-4 mb-0">
                  Ainda não tem conta?
                  <RouterLink :to="{ name: 'cadastro' }" class="fw-semibold">Cadastre-se</RouterLink>
                </p>
              </BCol>
            </BRow>
          </BCard>
        </BCol>
      </BRow>
    </BContainer>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  BContainer, BRow, BCol, BCard, BAlert, BForm, BFormGroup, BFormInput, BInputGroup,
  BFormCheckbox, BButton, BSpinner, BLink, useToast,
} from 'bootstrap-vue-next'
import { auth } from '@/stores/auth.js'
import { destinoAposLogin } from '@/router/index.js'

const { create: criarToast } = useToast()
const route = useRoute()
const router = useRouter()

// Vindo do cadastro, o username já chega preenchido (?usuario=...)
const usuario = ref(route.query.usuario || '')
const senha = ref('')
const lembrar = ref(false)
const mostrarSenha = ref(false)
const carregando = ref(false)
const enviado = ref(false)
const erro = ref('')

// ?expirou=1: a sessão caiu enquanto o usuário usava o sistema
// ?redirect=: tentou abrir uma página que exige login
const aviso = computed(() => {
  if (route.query.expirou) return 'Sua sessão expirou. Entre novamente para continuar.'
  if (route.query.redirect) return 'Entre na sua conta para acessar essa página.'
  return ''
})

// Só mostra os erros depois da primeira tentativa de envio
const usuarioState = computed(() => (enviado.value && !usuario.value.trim() ? false : null))
const senhaState = computed(() => (enviado.value && !senha.value ? false : null))

async function entrar() {
  enviado.value = true
  if (usuarioState.value === false || senhaState.value === false) return

  carregando.value = true
  erro.value = ''
  try {
    await auth.entrar(usuario.value.trim(), senha.value, lembrar.value)
    router.replace(destinoAposLogin(route.query.redirect))
  } catch (e) {
    erro.value = e.message
    senha.value = ''
  } finally {
    carregando.value = false
  }
}

function emBreve(recurso) {
  criarToast({
    title: 'Em breve',
    body: `${recurso} estará disponível em breve.`,
    variant: 'primary',
    pos: 'top-end',
    modelValue: 4000,
  })
}
</script>
