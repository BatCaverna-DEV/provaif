import { usuarioDoToken } from '../services/authService.js'
import HttpError from '../utils/HttpError.js'

/**
 * Exige o cabeçalho "Authorization: Bearer <token>".
 * Em caso de sucesso, disponibiliza o usuário logado em req.usuario.
 */
export async function autenticar(req, res, next) {
    const [tipo, token] = (req.headers.authorization || '').split(' ')
    if (tipo !== 'Bearer' || !token) {
        throw new HttpError(401, 'Faça login para continuar.')
    }
    req.usuario = await usuarioDoToken(token)
    next()
}

/**
 * Só permite a ação se o :id da rota for o do próprio usuário logado.
 * Usar depois de autenticar.
 */
export function somenteProprioUsuario(req, res, next) {
    if (req.params.id !== req.usuario.id) {
        throw new HttpError(403, 'Você só pode alterar a sua própria conta.')
    }
    next()
}
