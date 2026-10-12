import { Router } from 'express'
import authRoutes from './authRoutes.js'
import usuarioRoutes from './usuarioRoutes.js'
import painelRoutes from './painelRoutes.js'
import avaliacaoRoutes from './avaliacaoRoutes.js'
import questaoRoutes from './questaoRoutes.js'
import uploadRoutes from './uploadRoutes.js'

const router = Router()

// Verificação rápida de que a API está no ar
router.get('/', (req, res) => {
    res.json({ api: 'ProvaIF', status: 'ok' })
})

router.use('/auth', authRoutes)
router.use('/usuarios', usuarioRoutes)
router.use('/painel', painelRoutes)
router.use('/avaliacoes', avaliacaoRoutes)
router.use('/questoes', questaoRoutes)
router.use('/uploads', uploadRoutes)

export default router
