import * as usuarioService from '../services/usuarioService.js'
import { validarUsuario, validarStatus } from '../validators/usuarioValidator.js'

// GET /usuarios?busca=texto&status=1
export async function listar(req, res) {
    const { busca } = req.query
    const status = req.query.status !== undefined ? Number(req.query.status) : undefined
    const usuarios = await usuarioService.listar({ busca, status })
    res.json(usuarios)
}

// GET /usuarios/:id
export async function buscar(req, res) {
    const usuario = await usuarioService.buscarPorId(req.params.id)
    res.json(usuario)
}

// POST /usuarios — cadastro de professor
export async function cadastrar(req, res) {
    const dados = validarUsuario(req.body)
    const usuario = await usuarioService.cadastrar(dados)
    res.status(201).location(`/usuarios/${usuario.id}`).json(usuario)
}

// PUT /usuarios/:id — atualiza só os campos enviados
export async function atualizar(req, res) {
    const dados = validarUsuario(req.body, { parcial: true })
    const usuario = await usuarioService.atualizar(req.params.id, dados)
    res.json(usuario)
}

// PATCH /usuarios/:id/status — ativa (1) ou desativa (0)
export async function alterarStatus(req, res) {
    const status = validarStatus(req.body)
    const usuario = await usuarioService.alterarStatus(req.params.id, status)
    res.json(usuario)
}

// DELETE /usuarios/:id
export async function remover(req, res) {
    await usuarioService.remover(req.params.id)
    res.status(204).end()
}
