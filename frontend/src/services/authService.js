import { api } from './api.js'

/**
 * Faz login com e-mail ou nome de usuário.
 * @returns {Promise<{ token: string, usuario: object }>}
 */
export function login(login, password) {
  return api.post('/auth/login', { login, password })
}

/** Dados do usuário dono do token atual. */
export function me() {
  return api.get('/auth/me')
}
