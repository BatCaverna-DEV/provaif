import { api } from './api.js'

/**
 * Resumo da tela principal do usuário logado.
 * @returns {Promise<{ totalQuestoes: number, totalAvaliacoes: number, ultimasAvaliacoes: object[] }>}
 */
export function obterResumo() {
  return api.get('/painel/resumo')
}
