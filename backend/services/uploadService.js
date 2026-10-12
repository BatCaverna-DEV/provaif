import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import HttpError from '../utils/HttpError.js'

// backend/uploads/imagens (fora do Git; ver .gitignore)
export const PASTA_UPLOADS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads')
const PASTA_IMAGENS = path.join(PASTA_UPLOADS, 'imagens')

// O tipo é descoberto pelos primeiros bytes do arquivo, e não pelo nome ou pelo
// tipo informado pelo navegador (que podem ser falsificados). SVG não é aceito
// porque pode conter scripts.
function detectarTipo(buffer) {
    const b = buffer
    if (b.length >= 8 && b[0] === 0x89 && b.toString('ascii', 1, 4) === 'PNG') return 'png'
    if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg'
    if (b.length >= 6 && /^GIF8[79]a$/.test(b.toString('ascii', 0, 6))) return 'gif'
    if (b.length >= 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'webp'
    return null
}

/**
 * Grava a imagem enviada e devolve o endereço público dela.
 * @returns {Promise<{ url: string }>} ex.: { url: '/uploads/imagens/<uuid>.png' }
 */
export async function salvarImagem(arquivo) {
    if (!arquivo?.buffer?.length) {
        throw new HttpError(400, 'Envie uma imagem no campo "imagem".')
    }
    const extensao = detectarTipo(arquivo.buffer)
    if (!extensao) {
        throw new HttpError(400, 'Formato não suportado. Use PNG, JPG, GIF ou WebP.')
    }

    await mkdir(PASTA_IMAGENS, { recursive: true })
    const nome = `${randomUUID()}.${extensao}`
    await writeFile(path.join(PASTA_IMAGENS, nome), arquivo.buffer)
    return { url: `/uploads/imagens/${nome}` }
}
