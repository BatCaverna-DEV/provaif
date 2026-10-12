import { Op, fn, col } from 'sequelize'
import sequelize from '../config/database.js'
import { Avaliacao, AvaliacaoQuestao, Cabecalho, Questao, Alternativa } from '../models/index.js'
import * as questaoService from './questaoService.js'
import HttpError from '../utils/HttpError.js'

function hoje() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Só o dono enxerga a avaliação; para os demais ela "não existe" (404)
async function buscarDoUsuario(usuarioId, id, opcoes = {}) {
    const avaliacao = await Avaliacao.findOne({ where: { id, usuarioId }, ...opcoes })
    if (!avaliacao) throw new HttpError(404, 'Avaliação não encontrada.')
    return avaliacao
}

// Recalcula total_pontos somando os pontos das questões da avaliação
async function recalcularTotal(avaliacaoId, transaction) {
    const total = await AvaliacaoQuestao.sum('pontos', { where: { avaliacaoId }, transaction })
    await Avaliacao.update({ totalPontos: total || 0 }, { where: { id: avaliacaoId }, transaction })
}

// Grava o cabeçalho da avaliação. O DER permite vários por avaliação; o sistema usa um só.
async function salvarCabecalho(avaliacaoId, dados, transaction) {
    const existente = await Cabecalho.findOne({ where: { avaliacaoId }, order: [['id', 'ASC']], transaction })
    if (existente) await existente.update(dados, { transaction })
    else await Cabecalho.create({ ...dados, avaliacaoId }, { transaction })
}

export async function listar(usuarioId, { busca } = {}) {
    const where = { usuarioId }
    if (busca) where.descricao = { [Op.like]: `%${busca}%` }

    return Avaliacao.findAll({
        where,
        attributes: {
            include: [[fn('COUNT', col('itens.id')), 'totalQuestoes']],
        },
        include: [{ model: AvaliacaoQuestao, as: 'itens', attributes: [] }],
        group: ['Avaliacao.id'],
        order: [['dataCriacao', 'DESC'], ['descricao', 'ASC']],
    })
}

/** Avaliação completa: cabeçalho e questões (com alternativas e pontos), na ordem da prova. */
export async function detalhar(usuarioId, id) {
    const avaliacao = await buscarDoUsuario(usuarioId, id, {
        include: [
            { model: Cabecalho, as: 'cabecalhos' },
            {
                model: AvaliacaoQuestao,
                as: 'itens',
                include: [{
                    model: Questao,
                    as: 'questao',
                    include: [{ model: Alternativa, as: 'alternativas' }],
                }],
            },
        ],
        order: [
            [{ model: AvaliacaoQuestao, as: 'itens' }, 'ordem', 'ASC'],
            [{ model: AvaliacaoQuestao, as: 'itens' }, { model: Questao, as: 'questao' }, { model: Alternativa, as: 'alternativas' }, 'ordem', 'ASC'],
        ],
    })

    const { cabecalhos, itens, ...dados } = avaliacao.toJSON()
    return {
        ...dados,
        cabecalho: cabecalhos[0] || null,
        questoes: itens.map((item) => ({
            ...item.questao,
            pontos: item.pontos,
            ordem: item.ordem,
            propria: item.questao.usuarioId === usuarioId,
        })),
    }
}

export async function criar(usuarioId, { dados, cabecalho }) {
    const id = await sequelize.transaction(async (transaction) => {
        const avaliacao = await Avaliacao.create(
            { dataCriacao: hoje(), ...dados, totalPontos: 0, usuarioId },
            { transaction },
        )
        if (cabecalho) await salvarCabecalho(avaliacao.id, cabecalho, transaction)
        return avaliacao.id
    })
    return detalhar(usuarioId, id)
}

export async function atualizar(usuarioId, id, { dados, cabecalho }) {
    const avaliacao = await buscarDoUsuario(usuarioId, id)
    await sequelize.transaction(async (transaction) => {
        if (Object.keys(dados).length) await avaliacao.update(dados, { transaction })
        if (cabecalho) await salvarCabecalho(id, cabecalho, transaction)
    })
    return detalhar(usuarioId, id)
}

export async function remover(usuarioId, id) {
    const avaliacao = await buscarDoUsuario(usuarioId, id)
    await avaliacao.destroy() // cabeçalhos e vínculos com questões são apagados em cascata
}

/** Cria uma cópia da avaliação (cabeçalho e questões), com a data de hoje. */
export async function duplicar(usuarioId, id) {
    const original = await detalhar(usuarioId, id)
    const novoId = await sequelize.transaction(async (transaction) => {
        const copia = await Avaliacao.create({
            descricao: `Cópia de ${original.descricao}`.slice(0, 45),
            dataCriacao: hoje(),
            totalPontos: original.totalPontos,
            usuarioId,
        }, { transaction })

        if (original.cabecalho) {
            const { id: _id, avaliacaoId: _a, ...cabecalho } = original.cabecalho
            await Cabecalho.create({ ...cabecalho, avaliacaoId: copia.id }, { transaction })
        }
        await AvaliacaoQuestao.bulkCreate(
            original.questoes.map((q) => ({ avaliacaoId: copia.id, questaoId: q.id, pontos: q.pontos, ordem: q.ordem })),
            { transaction },
        )
        return copia.id
    })
    return detalhar(usuarioId, novoId)
}

export async function adicionarQuestao(usuarioId, id, { questaoId, pontos }) {
    await buscarDoUsuario(usuarioId, id)
    await questaoService.buscarDisponivel(usuarioId, questaoId)

    const jaExiste = await AvaliacaoQuestao.findOne({ where: { avaliacaoId: id, questaoId } })
    if (jaExiste) throw new HttpError(409, 'Esta questão já está na avaliação.')

    await sequelize.transaction(async (transaction) => {
        const ultima = await AvaliacaoQuestao.max('ordem', { where: { avaliacaoId: id }, transaction })
        await AvaliacaoQuestao.create({ avaliacaoId: id, questaoId, pontos, ordem: (ultima || 0) + 1 }, { transaction })
        await recalcularTotal(id, transaction)
    })
    return detalhar(usuarioId, id)
}

async function buscarItem(avaliacaoId, questaoId) {
    const item = await AvaliacaoQuestao.findOne({ where: { avaliacaoId, questaoId } })
    if (!item) throw new HttpError(404, 'Esta questão não está na avaliação.')
    return item
}

export async function alterarPontos(usuarioId, id, questaoId, pontos) {
    await buscarDoUsuario(usuarioId, id)
    const item = await buscarItem(id, questaoId)
    await sequelize.transaction(async (transaction) => {
        await item.update({ pontos }, { transaction })
        await recalcularTotal(id, transaction)
    })
    return detalhar(usuarioId, id)
}

export async function removerQuestao(usuarioId, id, questaoId) {
    await buscarDoUsuario(usuarioId, id)
    const item = await buscarItem(id, questaoId)
    await sequelize.transaction(async (transaction) => {
        await item.destroy({ transaction })
        await recalcularTotal(id, transaction)
    })
    return detalhar(usuarioId, id)
}

/** Define a nova ordem das questões. Recebe todos os ids das questões da avaliação, na ordem desejada. */
export async function reordenar(usuarioId, id, idsQuestoes) {
    await buscarDoUsuario(usuarioId, id)
    const itens = await AvaliacaoQuestao.findAll({ where: { avaliacaoId: id } })

    const atuais = new Set(itens.map((i) => i.questaoId))
    const mesmasQuestoes = idsQuestoes.length === atuais.size
        && new Set(idsQuestoes).size === idsQuestoes.length
        && idsQuestoes.every((q) => atuais.has(q))
    if (!mesmasQuestoes) {
        throw new HttpError(400, 'A nova ordem deve conter exatamente as questões da avaliação.')
    }

    await sequelize.transaction(async (transaction) => {
        for (const [indice, questaoId] of idsQuestoes.entries()) {
            await AvaliacaoQuestao.update({ ordem: indice + 1 }, { where: { avaliacaoId: id, questaoId }, transaction })
        }
    })
    return detalhar(usuarioId, id)
}
