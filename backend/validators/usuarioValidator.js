import HttpError from '../utils/HttpError.js'
import { STATUS_USUARIO } from '../models/Usuario.js'

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGEX_USERNAME = /^[a-zA-Z0-9._-]+$/

// Limites de tamanho seguem as colunas da tabela usuarios.
// A senha tem no máximo 72 caracteres porque o bcrypt ignora o que passa disso.
const SENHA_MIN = 8
const SENHA_MAX = 72

function texto(valor) {
    return typeof valor === 'string' ? valor.trim() : valor
}

/**
 * Valida e normaliza os dados de um usuário.
 * @param {object} corpo  dados recebidos na requisição
 * @param {object} opcoes { parcial: true } para atualização (só valida os campos enviados)
 * @returns {object} dados prontos para gravar
 * @throws {HttpError} 400 com a lista de erros por campo
 */
export function validarUsuario(corpo = {}, { parcial = false } = {}) {
    const erros = {}
    const dados = {}
    const informado = (campo) => corpo[campo] !== undefined
    const exigir = (campo) => !parcial || informado(campo)

    if (exigir('nome')) {
        const nome = texto(corpo.nome)
        if (!nome) erros.nome = 'Informe o nome.'
        else if (nome.length > 100) erros.nome = 'O nome deve ter no máximo 100 caracteres.'
        else dados.nome = nome
    }

    if (exigir('email')) {
        const email = texto(corpo.email)?.toLowerCase()
        if (!email) erros.email = 'Informe o e-mail.'
        else if (email.length > 100) erros.email = 'O e-mail deve ter no máximo 100 caracteres.'
        else if (!REGEX_EMAIL.test(email)) erros.email = 'Informe um e-mail válido.'
        else dados.email = email
    }

    if (exigir('username')) {
        const username = texto(corpo.username)?.toLowerCase()
        if (!username) erros.username = 'Informe o nome de usuário.'
        else if (username.length < 3 || username.length > 100) erros.username = 'O nome de usuário deve ter entre 3 e 100 caracteres.'
        else if (!REGEX_USERNAME.test(username)) erros.username = 'Use apenas letras, números, ponto, hífen ou sublinhado.'
        else dados.username = username
    }

    if (exigir('password')) {
        const senha = corpo.password
        if (typeof senha !== 'string' || !senha) erros.password = 'Informe a senha.'
        else if (senha.length < SENHA_MIN || senha.length > SENHA_MAX) erros.password = `A senha deve ter entre ${SENHA_MIN} e ${SENHA_MAX} caracteres.`
        else dados.password = senha
    }

    if (Object.keys(erros).length) {
        throw new HttpError(400, 'Dados inválidos.', erros)
    }
    return dados
}

export function validarStatus(corpo = {}) {
    const status = corpo.status
    if (!Object.values(STATUS_USUARIO).includes(status)) {
        throw new HttpError(400, 'Dados inválidos.', {
            status: `Informe ${STATUS_USUARIO.ATIVO} (ativo) ou ${STATUS_USUARIO.INATIVO} (inativo).`,
        })
    }
    return status
}
