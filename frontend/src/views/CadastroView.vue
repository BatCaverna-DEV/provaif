<template>
  <section class="bg-azul-claro py-5">
    <BContainer class="py-lg-4">
      <BRow class="justify-content-center">
        <BCol cols="12" md="10" lg="10" xl="9">
          <BCard no-body class="border-0 shadow overflow-hidden">
            <BRow class="g-0">
              <BCol md="5" class="bg-gradiente-azul text-white p-4 p-lg-5 d-none d-md-flex flex-column">
                <h2 class="h3 fw-bold">Crie sua conta de professor</h2>
                <p class="text-white-50">
                  É gratuito. Em poucos minutos você começa a montar seu banco de questões.
                </p>
                <ul class="list-unstyled d-grid gap-3 small mt-auto mb-0">
                  <li v-for="v in vantagens" :key="v.texto" class="d-flex gap-2">
                    <i :class="['bi', v.icone, 'texto-azul-claro']" aria-hidden="true" />
                    {{ v.texto }}
                  </li>
                </ul>
              </BCol>

              <BCol cols="12" md="7" class="p-4 p-lg-5 bg-white">
                <h1 class="h4 fw-bold mb-1">Cadastro</h1>
                <p class="text-secondary small mb-4">Preencha seus dados para criar a conta.</p>

                <BAlert :model-value="!!erroGeral" variant="danger" class="small" dismissible @update:model-value="erroGeral = ''">
                  <i class="bi bi-exclamation-triangle-fill me-1" aria-hidden="true" />
                  {{ erroGeral }}
                </BAlert>

                <BForm novalidate @submit.prevent="cadastrar">
                  <BFormGroup label="Nome completo" label-for="cad-nome" :state="estado('nome')" :invalid-feedback="erros.nome">
                    <BFormInput
                      id="cad-nome"
                      v-model="form.nome"
                      :state="estado('nome')"
                      autocomplete="name"
                      maxlength="100"
                      placeholder="Ana Ribeiro"
                      required
                    />
                  </BFormGroup>

                  <BFormGroup label="E-mail" label-for="cad-email" :state="estado('email')" :invalid-feedback="erros.email" class="mt-3">
                    <BFormInput
                      id="cad-email"
                      v-model="form.email"
                      type="email"
                      :state="estado('email')"
                      autocomplete="email"
                      maxlength="100"
                      placeholder="professor@escola.edu.br"
                      required
                      @update:model-value="sugerirUsername"
                    />
                  </BFormGroup>

                  <BFormGroup
                    label="Nome de usuário"
                    label-for="cad-username"
                    :state="estado('username')"
                    :invalid-feedback="erros.username"
                    description="Letras, números, ponto, hífen ou sublinhado. Você pode usá-lo para entrar."
                    class="mt-3"
                  >
                    <BInputGroup prepend="@">
                      <BFormInput
                        id="cad-username"
                        v-model="form.username"
                        :state="estado('username')"
                        autocomplete="username"
                        maxlength="100"
                        placeholder="ana.ribeiro"
                        required
                        @update:model-value="usernameEditado = true"
                      />
                    </BInputGroup>
                  </BFormGroup>

                  <BRow class="g-3 mt-0">
                    <BCol cols="12" sm="6">
                      <BFormGroup label="Senha" label-for="cad-senha" :state="estado('password')" :invalid-feedback="erros.password">
                        <BInputGroup>
                          <BFormInput
                            id="cad-senha"
                            v-model="form.password"
                            :type="mostrarSenha ? 'text' : 'password'"
                            :state="estado('password')"
                            autocomplete="new-password"
                            maxlength="72"
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
                    </BCol>
                    <BCol cols="12" sm="6">
                      <BFormGroup label="Confirme a senha" label-for="cad-confirmacao" :state="estado('confirmacao')" :invalid-feedback="erros.confirmacao">
                        <BFormInput
                          id="cad-confirmacao"
                          v-model="form.confirmacao"
                          :type="mostrarSenha ? 'text' : 'password'"
                          :state="estado('confirmacao')"
                          autocomplete="new-password"
                          maxlength="72"
                          required
                        />
                      </BFormGroup>
                    </BCol>
                  </BRow>

                  <div class="mt-2" aria-live="polite">
                    <BProgress :value="forcaSenha.valor" :max="4" :variant="forcaSenha.cor" height="0.35rem" />
                    <div class="small text-secondary mt-1">
                      Mínimo de 8 caracteres.
                      <span v-if="form.password">Força da senha: <strong>{{ forcaSenha.texto }}</strong></span>
                    </div>
                  </div>

                  <BButton type="submit" variant="primary" size="lg" class="w-100 mt-4" :disabled="enviando">
                    <BSpinner v-if="enviando" small class="me-2" />
                    {{ enviando ? 'Criando conta...' : 'Criar conta' }}
                  </BButton>
                </BForm>

                <p class="text-center text-secondary small mt-4 mb-0">
                  Já tem conta?
                  <RouterLink :to="{ name: 'login' }" class="fw-semibold">Entrar</RouterLink>
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
import { ref, reactive, computed, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  BContainer, BRow, BCol, BCard, BAlert, BForm, BFormGroup, BFormInput,
  BInputGroup, BButton, BSpinner, BProgress, useToast,
} from 'bootstrap-vue-next'
import { cadastrarUsuario } from '@/services/usuarioService.js'
import { ApiError } from '@/services/api.js'

const router = useRouter()
const { create: criarToast } = useToast()

const vantagens = [
  { icone: 'bi-collection', texto: 'Banco de questões pessoal' },
  { icone: 'bi-ui-checks', texto: 'Montagem de avaliações com pontuação automática' },
  { icone: 'bi-printer', texto: 'Prova pronta para imprimir' },
]

const form = reactive({
  nome: '',
  email: '',
  username: '',
  password: '',
  confirmacao: '',
})

const mostrarSenha = ref(false)
const enviando = ref(false)
const tentouEnviar = ref(false)
const usernameEditado = ref(false)
const erroGeral = ref('')
// Erros devolvidos pela API, por campo. Somem quando o campo é editado.
const errosServidor = reactive({})

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGEX_USERNAME = /^[a-zA-Z0-9._-]+$/

// Mesmas regras do backend (validators/usuarioValidator.js)
const errosLocais = computed(() => {
  const e = {}
  const nome = form.nome.trim()
  const email = form.email.trim()
  const username = form.username.trim()

  if (!nome) e.nome = 'Informe o nome.'

  if (!email) e.email = 'Informe o e-mail.'
  else if (!REGEX_EMAIL.test(email)) e.email = 'Informe um e-mail válido.'

  if (!username) e.username = 'Informe o nome de usuário.'
  else if (username.length < 3) e.username = 'Use pelo menos 3 caracteres.'
  else if (!REGEX_USERNAME.test(username)) e.username = 'Use apenas letras, números, ponto, hífen ou sublinhado.'

  if (!form.password) e.password = 'Informe a senha.'
  else if (form.password.length < 8) e.password = 'A senha deve ter pelo menos 8 caracteres.'

  if (!form.confirmacao) e.confirmacao = 'Confirme a senha.'
  else if (form.confirmacao !== form.password) e.confirmacao = 'As senhas não conferem.'

  return e
})

const erros = computed(() => ({ ...errosLocais.value, ...errosServidor }))

// Só marca os campos depois da primeira tentativa de envio (ou se a API apontou erro)
function estado(campo) {
  if (errosServidor[campo]) return false
  if (!tentouEnviar.value) return null
  return errosLocais.value[campo] ? false : null
}

// Limpa o erro da API de um campo assim que ele é alterado
for (const campo of ['nome', 'email', 'username', 'password']) {
  watch(() => form[campo], () => delete errosServidor[campo])
}

// Sugere o username a partir do e-mail enquanto o usuário não editar o campo
function sugerirUsername(email) {
  if (usernameEditado.value) return
  form.username = String(email).split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '')
}

const forcaSenha = computed(() => {
  const s = form.password
  let pontos = 0
  if (s.length >= 8) pontos++
  if (s.length >= 12) pontos++
  if (/[a-z]/.test(s) && /[A-Z]/.test(s)) pontos++
  if (/\d/.test(s) && /[^a-zA-Z0-9]/.test(s)) pontos++
  const niveis = [
    { texto: 'muito fraca', cor: 'danger' },
    { texto: 'fraca', cor: 'danger' },
    { texto: 'média', cor: 'warning' },
    { texto: 'boa', cor: 'info' },
    { texto: 'forte', cor: 'success' },
  ]
  return { valor: pontos, ...niveis[pontos] }
})

async function cadastrar() {
  tentouEnviar.value = true
  erroGeral.value = ''
  if (Object.keys(errosLocais.value).length) return

  enviando.value = true
  try {
    const usuario = await cadastrarUsuario({
      nome: form.nome.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      password: form.password,
    })
    criarToast({
      title: 'Conta criada!',
      body: `Bem-vindo(a), ${usuario.nome}. Agora é só entrar.`,
      variant: 'success',
      pos: 'top-end',
      modelValue: 5000,
    })
    router.push({ name: 'login', query: { usuario: usuario.username } })
  } catch (e) {
    if (e instanceof ApiError && Object.keys(e.detalhes).length) {
      Object.assign(errosServidor, e.detalhes)
      erroGeral.value = e.status === 409 ? 'Já existe uma conta com esses dados.' : 'Confira os campos destacados.'
    } else {
      erroGeral.value = e.message || 'Não foi possível concluir o cadastro.'
    }
  } finally {
    enviando.value = false
  }
}
</script>
