import { Router } from 'express'
import * as authController from '../controllers/authController.js'
import { autenticar } from '../middlewares/autenticar.js'

const router = Router()

router.post('/login', authController.login)
router.get('/me', autenticar, authController.me)

export default router
