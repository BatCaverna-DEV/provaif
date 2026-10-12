import { Op } from 'sequelize'
import { Usuario } from '../models/index.js'
import HttpError from '../utils/HttpError.js'

// Verifica se e-mail ou username já pertencem a outro usuário
async function garantirUnico({ email, username }, idIgnorado) {
    const condicoes = []
    if (email) condicoes.push({ email })
    if (username) condicoes.push({ username })
    if (!condicoes.length) return

    const where = { [Op.or]: condicoes }
    if (idIgnorado) where.id = { [Op.ne]: idIgnorado }

    const existentes = await Usuario.findAll({ where, attributes: ['email', 'username'] })
    const erros = {}
    for (const u of existentes) {
        if (email && u.email === email) erros.email = 'Este e-mail já está cadastrado.'
        if (username && u.username === username) erros.username = 'Este nome de usuário já está em uso.'
    }
    if (Object.keys(erros).length) {
        throw new HttpError(409, 'Usuário já cadastrado.', erros)
    }
}

export async function listar({ busca, status } = {}) {
    const where = {}
    if (status !== undefined) where.status = status
    if (busca) {
        where[Op.or] = ['nome', 'email', 'username'].map((campo) => ({ [campo]: { [Op.like]: `%${busca}%` } }))
    }
    return Usuario.findAll({ where, order: [['nome', 'ASC']] })
}

export async function buscarPorId(id) {
    const usuario = await Usuario.findByPk(id)
    if (!usuario) throw new HttpError(404, 'Usuário não encontrado.')
    return usuario
}

export async function cadastrar(dados) {
    await garantirUnico(dados)
    return Usuario.create(dados)
}

export async function atualizar(id, dados) {
    const usuario = await buscarPorId(id)
    await garantirUnico(dados, id)
    return usuario.update(dados)
}

export async function alterarStatus(id, status) {
    const usuario = await buscarPorId(id)
    return usuario.update({ status })
}

export async function remover(id) {
    const usuario = await buscarPorId(id)
    await usuario.destroy()
}
