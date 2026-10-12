import { api } from './api.js'

function montarQuery(filtros = {}) {
  const params = new URLSearchParams()
  if (filtros.busca) params.set('busca', filtros.busca)
  if (filtros.tipo) params.set('tipo', filtros.tipo)
  if (filtros.nivel) params.set('nivel', filtros.nivel)
  if (filtros.minhas) params.set('origem', 'minhas')
  else if (filtros.origem) params.set('origem', filtros.origem)
  if (filtros.pagina) params.set('pagina', filtros.pagina)
  if (filtros.porPagina) params.set('porPagina', filtros.porPagina)
  const query = params.toString()
  return query ? `/questoes?${query}` : '/questoes'
}

/**
 * Questões disponíveis (próprias + públicas de outros professores), sem paginação (até 200).
 * @param {{ busca?: string, tipo?: number, nivel?: number, minhas?: boolean, origem?: 'minhas'|'publicas' }} filtros
 * @returns {Promise<object[]>}
 */
export function listarQuestoes(filtros = {}) {
  return api.get(montarQuery({ ...filtros, pagina: undefined }))
}

/**
 * Mesma busca, paginada.
 * @returns {Promise<{ itens: object[], total: number, pagina: number, porPagina: number }>}
 */
export function listarQuestoesPaginado(filtros = {}, pagina = 1, porPagina = 20) {
  return api.get(montarQuery({ ...filtros, pagina, porPagina }))
}

/** Assuntos já usados (para sugerir ao digitar). */
export const listarAssuntos = () => api.get('/questoes/assuntos')

export const obterQuestao = (id) => api.get(`/questoes/${id}`)

/**
 * @param {{ tipo: number, nivel: number, acesso: number, assunto: string, texto: string,
 *           alternativas?: { texto: string, correta: boolean }[] }} dados
 */
export const criarQuestao = (dados) => api.post('/questoes', dados)

/** Envia a questão completa; as alternativas são substituídas. */
export const atualizarQuestao = (id, dados) => api.put(`/questoes/${id}`, dados)

export const removerQuestao = (id) => api.delete(`/questoes/${id}`)

/** Cria uma cópia privada da questão no banco do usuário. */
export const copiarQuestao = (id) => api.post(`/questoes/${id}/copiar`)
