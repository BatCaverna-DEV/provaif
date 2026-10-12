import { api } from './api.js'

/**
 * Cadastra um novo usuário (professor).
 * @param {{ nome: string, email: string, username: string, password: string }} dados
 * @returns {Promise<object>} usuário criado (sem a senha)
 */
export function cadastrarUsuario(dados) {
  return api.post('/usuarios', dados)
}
