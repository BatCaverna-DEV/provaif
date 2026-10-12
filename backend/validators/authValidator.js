import HttpError from '../utils/HttpError.js'

export function validarLogin(corpo = {}) {
    const erros = {}
    const login = typeof corpo.login === 'string' ? corpo.login.trim().toLowerCase() : ''
    const password = typeof corpo.password === 'string' ? corpo.password : ''

    if (!login) erros.login = 'Informe o e-mail ou nome de usuário.'
    if (!password) erros.password = 'Informe a senha.'

    if (Object.keys(erros).length) {
        throw new HttpError(400, 'Dados inválidos.', erros)
    }
    return { login, password }
}
