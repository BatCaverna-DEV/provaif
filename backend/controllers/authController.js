import * as authService from '../services/authService.js'
import { validarLogin } from '../validators/authValidator.js'

// POST /auth/login — { login: e-mail ou username, password }
export async function login(req, res) {
    const credenciais = validarLogin(req.body)
    const { token, usuario } = await authService.login(credenciais)
    res.json({ token, usuario })
}

// GET /auth/me — dados do usuário logado
export async function me(req, res) {
    res.json(req.usuario)
}
