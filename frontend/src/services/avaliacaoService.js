import { api } from './api.js'

const base = '/avaliacoes'

export const listarAvaliacoes = (busca) =>
  api.get(busca ? `${base}?busca=${encodeURIComponent(busca)}` : base)

/** Avaliação completa: dados, cabecalho e questoes (com alternativas, pontos e ordem). */
export const obterAvaliacao = (id) => api.get(`${base}/${id}`)

/** @param {{ descricao: string, dataCriacao?: string, cabecalho?: object }} dados */
export const criarAvaliacao = (dados) => api.post(base, dados)

export const atualizarAvaliacao = (id, dados) => api.put(`${base}/${id}`, dados)

export const removerAvaliacao = (id) => api.delete(`${base}/${id}`)

export const duplicarAvaliacao = (id) => api.post(`${base}/${id}/duplicar`)

// As operações nas questões devolvem a avaliação completa já atualizada (com o novo total)
export const adicionarQuestao = (id, questaoId, pontos) =>
  api.post(`${base}/${id}/questoes`, { questaoId, pontos })

export const alterarPontosQuestao = (id, questaoId, pontos) =>
  api.put(`${base}/${id}/questoes/${questaoId}`, { pontos })

export const removerQuestao = (id, questaoId) => api.delete(`${base}/${id}/questoes/${questaoId}`)

/** @param {string[]} idsQuestoes todos os ids das questões, na nova ordem */
export const reordenarQuestoes = (id, idsQuestoes) => api.put(`${base}/${id}/ordem`, { questoes: idsQuestoes })
