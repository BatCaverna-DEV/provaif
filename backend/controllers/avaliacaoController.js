import * as avaliacaoService from '../services/avaliacaoService.js'
import {
    validarAvaliacao, validarPontos, validarQuestaoId, validarOrdem,
} from '../validators/avaliacaoValidator.js'

// GET /avaliacoes?busca=texto
export async function listar(req, res) {
    res.json(await avaliacaoService.listar(req.usuario.id, { busca: req.query.busca }))
}

// GET /avaliacoes/:id
export async function detalhar(req, res) {
    res.json(await avaliacaoService.detalhar(req.usuario.id, req.params.id))
}

// POST /avaliacoes — { descricao, dataCriacao?, cabecalho? }
export async function criar(req, res) {
    const avaliacao = await avaliacaoService.criar(req.usuario.id, validarAvaliacao(req.body))
    res.status(201).location(`/avaliacoes/${avaliacao.id}`).json(avaliacao)
}

// PUT /avaliacoes/:id — atualiza só o que foi enviado
export async function atualizar(req, res) {
    const dados = validarAvaliacao(req.body, { parcial: true })
    res.json(await avaliacaoService.atualizar(req.usuario.id, req.params.id, dados))
}

// DELETE /avaliacoes/:id
export async function remover(req, res) {
    await avaliacaoService.remover(req.usuario.id, req.params.id)
    res.status(204).end()
}

// POST /avaliacoes/:id/duplicar
export async function duplicar(req, res) {
    const copia = await avaliacaoService.duplicar(req.usuario.id, req.params.id)
    res.status(201).location(`/avaliacoes/${copia.id}`).json(copia)
}

// POST /avaliacoes/:id/questoes — { questaoId, pontos }
export async function adicionarQuestao(req, res) {
    const questaoId = validarQuestaoId(req.body.questaoId)
    const pontos = validarPontos(req.body.pontos ?? 0)
    res.status(201).json(await avaliacaoService.adicionarQuestao(req.usuario.id, req.params.id, { questaoId, pontos }))
}

// PUT /avaliacoes/:id/questoes/:questaoId — { pontos }
export async function alterarPontos(req, res) {
    const pontos = validarPontos(req.body.pontos)
    res.json(await avaliacaoService.alterarPontos(req.usuario.id, req.params.id, req.params.questaoId, pontos))
}

// DELETE /avaliacoes/:id/questoes/:questaoId
export async function removerQuestao(req, res) {
    res.json(await avaliacaoService.removerQuestao(req.usuario.id, req.params.id, req.params.questaoId))
}

// PUT /avaliacoes/:id/ordem — { questoes: [id1, id2, ...] }
export async function reordenar(req, res) {
    const ids = validarOrdem(req.body.questoes)
    res.json(await avaliacaoService.reordenar(req.usuario.id, req.params.id, ids))
}
