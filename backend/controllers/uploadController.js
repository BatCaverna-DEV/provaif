import * as uploadService from '../services/uploadService.js'

// POST /uploads/imagens — multipart/form-data com o arquivo no campo "imagem"
export async function enviarImagem(req, res) {
    const { url } = await uploadService.salvarImagem(req.file)
    res.status(201).location(url).json({ url })
}
