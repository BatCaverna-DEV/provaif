import { Router } from 'express'
import * as questaoController from '../controllers/questaoController.js'
import { autenticar } from '../middlewares/autenticar.js'

const router = Router()

// Todas exigem login. Leitura: próprias + públicas. Alteração e exclusão: só o autor.
router.use(autenticar)

router.get('/', questaoController.listar)
router.post('/', questaoController.criar)
router.get('/assuntos', questaoController.assuntos)
router.get('/:id', questaoController.detalhar)
router.put('/:id', questaoController.atualizar)
router.delete('/:id', questaoController.remover)
router.post('/:id/copiar', questaoController.copiar)

export default router
