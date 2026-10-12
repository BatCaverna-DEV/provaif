import { Router } from 'express'
import * as uploadController from '../controllers/uploadController.js'
import { autenticar } from '../middlewares/autenticar.js'
import { receberImagem, tratarErroUpload } from '../middlewares/uploadImagem.js'

const router = Router()

// Envio exige login; a leitura dos arquivos é pública (ver express.static em index.js)
router.post('/imagens', autenticar, receberImagem, tratarErroUpload, uploadController.enviarImagem)

export default router
