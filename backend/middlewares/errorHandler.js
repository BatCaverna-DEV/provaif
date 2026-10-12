import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize'
import HttpError from '../utils/HttpError.js'

// Rota não encontrada
export function naoEncontrado(req, res) {
    res.status(404).json({ erro: 'Rota não encontrada.' })
}

// Tratamento central de erros. Toda resposta de erro segue o formato:
// { erro: 'mensagem', detalhes?: { campo: 'mensagem' } }
// eslint-disable-next-line no-unused-vars
export function tratarErros(err, req, res, next) {
    if (err instanceof HttpError) {
        return res.status(err.status).json({ erro: err.message, detalhes: err.detalhes })
    }

    // JSON malformado no corpo da requisição
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' })
    }

    // Garantia extra caso dois cadastros iguais cheguem ao mesmo tempo
    if (err instanceof UniqueConstraintError) {
        return res.status(409).json({ erro: 'Registro já cadastrado.' })
    }

    // Ex.: apagar um usuário que ainda tem questões ou avaliações
    if (err instanceof ForeignKeyConstraintError) {
        return res.status(409).json({ erro: 'Não é possível remover: existem registros vinculados.' })
    }

    console.error(err)
    res.status(500).json({ erro: 'Erro interno do servidor.' })
}
