import { Questao, Avaliacao } from '../models/index.js'

/**
 * Números e últimas avaliações exibidos na tela principal do professor.
 */
export async function resumo(usuarioId) {
    const [totalQuestoes, totalAvaliacoes, ultimasAvaliacoes] = await Promise.all([
        Questao.count({ where: { usuarioId } }),
        Avaliacao.count({ where: { usuarioId } }),
        Avaliacao.findAll({
            where: { usuarioId },
            order: [['dataCriacao', 'DESC']],
            limit: 5,
            attributes: ['id', 'descricao', 'dataCriacao', 'totalPontos'],
        }),
    ])

    return { totalQuestoes, totalAvaliacoes, ultimasAvaliacoes }
}
