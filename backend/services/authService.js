import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import { Usuario } from '../models/index.js'
import { STATUS_USUARIO } from '../models/Usuario.js'
import { JWT_SEGREDO, JWT_EXPIRA_EM } from '../config/auth.js'
import HttpError from '../utils/HttpError.js'

// Mesma mensagem para usuário inexistente e senha errada, para não revelar quais contas existem
const CREDENCIAIS_INVALIDAS = 'E-mail/usuário ou senha incorretos.'

function gerarToken(usuario) {
    return jwt.sign({ sub: usuario.id }, JWT_SEGREDO, { expiresIn: JWT_EXPIRA_EM })
}

/**
 * Autentica por e-mail ou username + senha.
 * @returns {Promise<{ token: string, usuario: object }>}
 */
export async function login({ login, password }) {
    const usuario = await Usuario.scope('comSenha').findOne({
        where: { [Op.or]: [{ email: login }, { username: login }] },
    })

    if (!usuario || !(await usuario.conferirSenha(password))) {
        throw new HttpError(401, CREDENCIAIS_INVALIDAS)
    }
    if (usuario.status !== STATUS_USUARIO.ATIVO) {
        throw new HttpError(403, 'Esta conta está desativada.')
    }

    return { token: gerarToken(usuario), usuario }
}

/**
 * Valida o token e devolve o usuário dono dele (precisa existir e estar ativo).
 * @throws {HttpError} 401
 */
export async function usuarioDoToken(token) {
    let payload
    try {
        payload = jwt.verify(token, JWT_SEGREDO)
    } catch (e) {
        const mensagem = e.name === 'TokenExpiredError'
            ? 'Sua sessão expirou. Entre novamente.'
            : 'Token de acesso inválido.'
        throw new HttpError(401, mensagem)
    }

    const usuario = await Usuario.findByPk(payload.sub)
    if (!usuario || usuario.status !== STATUS_USUARIO.ATIVO) {
        throw new HttpError(401, 'Usuário não encontrado ou desativado.')
    }
    return usuario
}
