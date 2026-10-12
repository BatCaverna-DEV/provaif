import { api } from './api.js'

export const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024 // 5 MB (mesmo limite do backend)
export const TIPOS_IMAGEM = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

/**
 * Envia uma imagem para o servidor.
 * @param {File} arquivo
 * @returns {Promise<{ url: string }>} endereço relativo, ex.: '/uploads/imagens/<uuid>.png'
 */
export function enviarImagem(arquivo) {
  const dados = new FormData()
  dados.append('imagem', arquivo)
  return api.post('/uploads/imagens', dados)
}
