import { Router } from 'express'
import * as painelController from '../controllers/painelController.js'
import { autenticar } from '../middlewares/autenticar.js'

const router = Router()

router.use(autenticar)

router.get('/resumo', painelController.resumo)

export default router
