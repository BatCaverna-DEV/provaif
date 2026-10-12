import multer from 'multer'
import HttpError from '../utils/HttpError.js'

export const TAMANHO_MAXIMO = 5 * 1024 * 1024 // 5 MB

// O arquivo fica em memória só até ser conferido; quem grava em disco é o uploadService
export const receberImagem = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: TAMANHO_MAXIMO, files: 1 },
}).single('imagem')

/** Traduz os erros do multer para o formato de erro da API. */
export function tratarErroUpload(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        const mensagem = err.code === 'LIMIT_FILE_SIZE'
            ? `A imagem deve ter no máximo ${TAMANHO_MAXIMO / 1024 / 1024} MB.`
            : 'Envio de arquivo inválido. Envie uma imagem no campo "imagem".'
        return next(new HttpError(400, mensagem))
    }
    next(err)
}
