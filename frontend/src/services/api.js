// Cliente HTTP da API do ProvaIF (backend Express)
export const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const TEMPO_LIMITE_MS = 15000

/**
 * Erro devolvido pela API. Segue o formato do backend:
 * { erro: 'mensagem', detalhes?: { campo: 'mensagem' } }
 */
export class ApiError extends Error {
  constructor(status, mensagem, detalhes = {}) {
    super(mensagem)
    this.status = status
    this.detalhes = detalhes
  }
}

// Ligação com a sessão, feita em main.js (evita importação circular com o store)
let autenticacao = {
  obterToken: () => null,
  aoNaoAutorizado: () => {},
}

/**
 * @param {{ obterToken: () => string|null, aoNaoAutorizado: (erro: ApiError) => void }} opcoes
 */
export function configurarAutenticacao(opcoes) {
  autenticacao = { ...autenticacao, ...opcoes }
}

async function requisicao(metodo, caminho, corpo) {
  const token = autenticacao.obterToken()
  // FormData (envio de arquivo): o navegador define o Content-Type com o "boundary"
  const ehArquivo = corpo instanceof FormData
  const headers = {}
  if (corpo !== undefined && !ehArquivo) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let resposta
  try {
    resposta = await fetch(`${URL_BASE}${caminho}`, {
      method: metodo,
      headers,
      body: corpo === undefined || ehArquivo ? corpo : JSON.stringify(corpo),
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    })
  } catch (e) {
    if (e.name === 'TimeoutError') {
      throw new ApiError(0, 'O servidor demorou demais para responder. Tente novamente em instantes.')
    }
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.')
  }

  if (resposta.status === 204) return null

  const dados = await resposta.json().catch(() => null)
  if (!resposta.ok) {
    const erro = new ApiError(
      resposta.status,
      dados?.erro || 'Ocorreu um erro inesperado. Tente novamente.',
      dados?.detalhes || {},
    )
    // Token vencido, inválido ou de usuário desativado: encerra a sessão
    if (resposta.status === 401 && token) autenticacao.aoNaoAutorizado(erro)
    throw erro
  }
  return dados
}

export const api = {
  get: (caminho) => requisicao('GET', caminho),
  post: (caminho, corpo) => requisicao('POST', caminho, corpo),
  put: (caminho, corpo) => requisicao('PUT', caminho, corpo),
  patch: (caminho, corpo) => requisicao('PATCH', caminho, corpo),
  delete: (caminho) => requisicao('DELETE', caminho),
}
