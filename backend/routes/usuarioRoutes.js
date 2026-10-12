import { Router } from 'express'
import * as usuarioController from '../controllers/usuarioController.js'
import { autenticar, somenteProprioUsuario } from '../middlewares/autenticar.js'

const router = Router()

// Público: cadastro de professor
router.post('/', usuarioController.cadastrar)

// Daqui para baixo, exige login
router.get('/', autenticar, usuarioController.listar)
router.get('/:id', autenticar, usuarioController.buscar)
router.put('/:id', autenticar, somenteProprioUsuario, usuarioController.atualizar)
router.patch('/:id/status', autenticar, somenteProprioUsuario, usuarioController.alterarStatus)
router.delete('/:id', autenticar, somenteProprioUsuario, usuarioController.remover)

export default router
