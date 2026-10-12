import * as questaoService from '../services/questaoService.js'
import { validarQuestao } from '../validators/questaoValidator.js'

function inteiroOuNada(valor) {
    if (valor === undefined || valor === '') return undefined
    const n = Number(valor)
    return Number.isInteger(n) && n > 0 ? n : undefined
}

// GET /questoes?busca=&tipo=&nivel=&origem=minhas|publicas&pagina=&porPagina=
// (minhas=1 continua aceito como atalho para origem=minhas)
export async function listar(req, res) {
    const { busca, origem, minhas } = req.query
    res.json(await questaoService.listarDisponiveis(req.usuario.id, {
        busca,
        tipo: inteiroOuNada(req.query.tipo),
        nivel: inteiroOuNada(req.query.nivel),
        origem: minhas === '1' ? 'minhas' : origem,
        pagina: inteiroOuNada(req.query.pagina),
        porPagina: inteiroOuNada(req.query.porPagina),
    }))
}

// GET /questoes/assuntos
export async function assuntos(req, res) {
    res.json(await questaoService.listarAssuntos(req.usuario.id))
}

// GET /questoes/:id
export async function detalhar(req, res) {
    res.json(await questaoService.detalhar(req.usuario.id, req.params.id))
}

// POST /questoes
export async function criar(req, res) {
    const questao = await questaoService.criar(req.usuario.id, validarQuestao(req.body))
    res.status(201).location(`/questoes/${questao.id}`).json(questao)
}

// PUT /questoes/:id — envia a questão completa (as alternativas são substituídas)
export async function atualizar(req, res) {
    res.json(await questaoService.atualizar(req.usuario.id, req.params.id, validarQuestao(req.body)))
}

// DELETE /questoes/:id
export async function remover(req, res) {
    await questaoService.remover(req.usuario.id, req.params.id)
    res.status(204).end()
}

// POST /questoes/:id/copiar — cópia privada no banco do usuário
export async function copiar(req, res) {
    const copia = await questaoService.copiar(req.usuario.id, req.params.id)
    res.status(201).location(`/questoes/${copia.id}`).json(copia)
}
