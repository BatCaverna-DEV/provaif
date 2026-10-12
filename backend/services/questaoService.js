import { Op, literal } from 'sequelize'
import sequelize from '../config/database.js'
import { Questao, Alternativa, AvaliacaoQuestao } from '../models/index.js'
import { ACESSO_QUESTAO } from '../models/Questao.js'
import HttpError from '../utils/HttpError.js'

const POR_PAGINA_MAX = 100
const LIMITE_SEM_PAGINACAO = 200

// Questões que o usuário pode usar: as dele e as públicas de outros professores
function condicaoDisponivel(usuarioId) {
    return { [Op.or]: [{ usuarioId }, { acesso: ACESSO_QUESTAO.PUBLICA }] }
}

// Em quantas avaliações a questão está (de qualquer professor)
const USOS = [literal('(SELECT COUNT(*) FROM avaliacoes_questoes aq WHERE aq.questoes_id = `Questao`.`id`)'), 'usos']

const INCLUIR_ALTERNATIVAS = { model: Alternativa, as: 'alternativas' }
const ORDEM_ALTERNATIVAS = [INCLUIR_ALTERNATIVAS, 'ordem', 'ASC']

function paraJson(questao, usuarioId) {
    const dados = questao.toJSON()
    return { ...dados, usos: dados.usos !== undefined ? Number(dados.usos) : undefined, propria: dados.usuarioId === usuarioId }
}

/**
 * Lista as questões disponíveis para o usuário.
 * Filtros: busca (assunto/enunciado), tipo, nivel, origem ('minhas' | 'publicas' = públicas de outros professores).
 * Com `pagina`, devolve { itens, total, pagina, porPagina }; sem ela, um array (até 200 questões).
 */
export async function listarDisponiveis(usuarioId, { busca, tipo, nivel, origem, pagina, porPagina } = {}) {
    const condicoes = []
    if (origem === 'minhas') condicoes.push({ usuarioId })
    else if (origem === 'publicas') condicoes.push({ acesso: ACESSO_QUESTAO.PUBLICA, usuarioId: { [Op.ne]: usuarioId } })
    else condicoes.push(condicaoDisponivel(usuarioId))

    if (tipo !== undefined) condicoes.push({ tipo })
    if (nivel !== undefined) condicoes.push({ nivel })
    if (busca) {
        condicoes.push({
            [Op.or]: [
                { assunto: { [Op.like]: `%${busca}%` } },
                { texto: { [Op.like]: `%${busca}%` } },
            ],
        })
    }
    const where = { [Op.and]: condicoes }
    const ordem = [['assunto', 'ASC'], ['id', 'ASC']]

    if (!pagina) {
        const questoes = await Questao.findAll({
            where,
            attributes: { include: [USOS] },
            include: [INCLUIR_ALTERNATIVAS],
            order: [...ordem, ORDEM_ALTERNATIVAS],
            limit: LIMITE_SEM_PAGINACAO,
        })
        return questoes.map((q) => paraJson(q, usuarioId))
    }

    // Paginado: primeiro os ids da página (o LIMIT não pode incidir sobre as alternativas)
    const tamanho = Math.min(Math.max(porPagina || 20, 1), POR_PAGINA_MAX)
    const { count, rows } = await Questao.findAndCountAll({
        where,
        attributes: ['id'],
        order: ordem,
        limit: tamanho,
        offset: (pagina - 1) * tamanho,
    })
    const itens = rows.length
        ? await Questao.findAll({
            where: { id: rows.map((r) => r.id) },
            attributes: { include: [USOS] },
            include: [INCLUIR_ALTERNATIVAS],
            order: [...ordem, ORDEM_ALTERNATIVAS],
        })
        : []

    return { itens: itens.map((q) => paraJson(q, usuarioId)), total: count, pagina, porPagina: tamanho }
}

/** Assuntos já usados nas questões disponíveis (para sugerir ao digitar). */
export async function listarAssuntos(usuarioId) {
    const linhas = await Questao.findAll({
        where: { ...condicaoDisponivel(usuarioId), assunto: { [Op.ne]: null } },
        attributes: [[literal('DISTINCT `assunto`'), 'assunto']],
        order: [['assunto', 'ASC']],
        raw: true,
    })
    return linhas.map((l) => l.assunto)
}

/** Busca uma questão que o usuário pode usar; 404 se não existir ou for privada de outro professor. */
export async function buscarDisponivel(usuarioId, id) {
    const questao = await Questao.findOne({
        where: { id, ...condicaoDisponivel(usuarioId) },
        attributes: { include: [USOS] },
        include: [INCLUIR_ALTERNATIVAS],
        order: [ORDEM_ALTERNATIVAS],
    })
    if (!questao) throw new HttpError(404, 'Questão não encontrada.')
    return questao
}

export async function detalhar(usuarioId, id) {
    return paraJson(await buscarDisponivel(usuarioId, id), usuarioId)
}

// Para editar ou excluir: a questão precisa ser do usuário
async function buscarPropria(usuarioId, id) {
    const questao = await buscarDisponivel(usuarioId, id)
    if (questao.usuarioId !== usuarioId) {
        throw new HttpError(403, 'Só o autor pode alterar ou excluir esta questão. Use "Copiar para minhas questões" para ter uma versão sua.')
    }
    return questao
}

export async function criar(usuarioId, { dados, alternativas }) {
    const id = await sequelize.transaction(async (transaction) => {
        const questao = await Questao.create({ ...dados, usuarioId }, { transaction })
        if (alternativas.length) {
            await Alternativa.bulkCreate(alternativas.map((a) => ({ ...a, questaoId: questao.id })), { transaction })
        }
        return questao.id
    })
    return detalhar(usuarioId, id)
}

/** Atualiza a questão. As alternativas são substituídas pelas enviadas. */
export async function atualizar(usuarioId, id, { dados, alternativas }) {
    const questao = await buscarPropria(usuarioId, id)
    await sequelize.transaction(async (transaction) => {
        await questao.update(dados, { transaction })
        await Alternativa.destroy({ where: { questaoId: id }, transaction })
        if (alternativas.length) {
            await Alternativa.bulkCreate(alternativas.map((a) => ({ ...a, questaoId: id })), { transaction })
        }
    })
    return detalhar(usuarioId, id)
}

export async function remover(usuarioId, id) {
    const questao = await buscarPropria(usuarioId, id)
    const usos = await AvaliacaoQuestao.count({ where: { questaoId: id } })
    if (usos) {
        throw new HttpError(409, `Esta questão está em ${usos} ${usos === 1 ? 'avaliação' : 'avaliações'}. Remova-a das provas antes de excluir.`)
    }
    await questao.destroy() // alternativas são apagadas em cascata
}

/** Copia uma questão disponível (própria ou pública) para o banco do usuário, como privada. */
export async function copiar(usuarioId, id) {
    const original = await buscarDisponivel(usuarioId, id)
    const { tipo, nivel, assunto, texto } = original
    return criar(usuarioId, {
        dados: { tipo, nivel, assunto, texto, acesso: ACESSO_QUESTAO.PRIVADA },
        alternativas: original.alternativas.map((a, i) => ({ texto: a.texto, correta: a.correta, ordem: i + 1 })),
    })
}
