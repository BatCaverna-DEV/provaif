import { reactive, computed } from 'vue'
import * as authService from '@/services/authService.js'

// Sessão do usuário logado (token JWT + dados do usuário).
// "Lembrar de mim" guarda no localStorage (sobrevive ao fechar o navegador);
// sem ele, guarda no sessionStorage (some ao fechar a aba).
const CHAVE = 'provaif.sessao'

function lerSessaoSalva() {
  for (const armazenamento of [localStorage, sessionStorage]) {
    try {
      const salvo = armazenamento.getItem(CHAVE)
      if (salvo) return JSON.parse(salvo)
    } catch {
      // armazenamento indisponível ou corrompido: ignora
    }
  }
  return null
}

function limparSessaoSalva() {
  for (const armazenamento of [localStorage, sessionStorage]) {
    try {
      armazenamento.removeItem(CHAVE)
    } catch {
      // ignora
    }
  }
}

// Lê a data de expiração (exp) de dentro do JWT, sem validar a assinatura
// (quem valida é o backend; aqui serve só para não usar um token já vencido)
function expiracaoDoToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.exp ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

const salvo = lerSessaoSalva()

const estado = reactive({
  token: salvo?.token || null,
  usuario: salvo?.usuario || null,
  lembrar: salvo?.lembrar || false,
})

function salvar() {
  limparSessaoSalva()
  const armazenamento = estado.lembrar ? localStorage : sessionStorage
  try {
    armazenamento.setItem(CHAVE, JSON.stringify(estado))
  } catch {
    // sem armazenamento, a sessão vale só enquanto a página estiver aberta
  }
}

function tokenValido() {
  if (!estado.token) return false
  const expira = expiracaoDoToken(estado.token)
  return !expira || expira > Date.now()
}

async function entrar(login, senha, lembrar = false) {
  const { token, usuario } = await authService.login(login, senha)
  Object.assign(estado, { token, usuario, lembrar })
  salvar()
  return usuario
}

function sair() {
  Object.assign(estado, { token: null, usuario: null, lembrar: false })
  limparSessaoSalva()
}

// Busca de novo os dados do usuário no backend (ex.: depois de editar o perfil)
async function recarregarUsuario() {
  estado.usuario = await authService.me()
  salvar()
  return estado.usuario
}

// Sessão salva com token vencido é descartada já ao abrir o site
if (estado.token && !tokenValido()) sair()

export const auth = {
  estado,
  logado: computed(() => !!estado.usuario && tokenValido()),
  usuario: computed(() => estado.usuario),
  token: () => estado.token,
  tokenValido,
  entrar,
  sair,
  recarregarUsuario,
}
