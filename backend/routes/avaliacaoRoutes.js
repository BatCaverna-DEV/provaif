import { Router } from 'express'
import * as avaliacaoController from '../controllers/avaliacaoController.js'
import { autenticar } from '../middlewares/autenticar.js'

const router = Router()

// Todas as rotas exigem login; cada usuário só enxerga as próprias avaliações
router.use(autenticar)

router.get('/', avaliacaoController.listar)
router.post('/', avaliacaoController.criar)
router.get('/:id', avaliacaoController.detalhar)
router.put('/:id', avaliacaoController.atualizar)
router.delete('/:id', avaliacaoController.remover)
router.post('/:id/duplicar', avaliacaoController.duplicar)

// Questões da avaliação
router.post('/:id/questoes', avaliacaoController.adicionarQuestao)
router.put('/:id/questoes/:questaoId', avaliacaoController.alterarPontos)
router.delete('/:id/questoes/:questaoId', avaliacaoController.removerQuestao)
router.put('/:id/ordem', avaliacaoController.reordenar)

export default router
