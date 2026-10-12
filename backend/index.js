import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { conectarBanco } from './config/database.js'
import './models/index.js'
import routes from './routes/index.js'
import { naoEncontrado, tratarErros } from './middlewares/errorHandler.js'
import { PASTA_UPLOADS } from './services/uploadService.js'

const app = express()

const PORTA = process.env.PORTA || 3000

// CORS_ORIGEM aceita uma lista separada por vírgula. Sem ela, libera o frontend
// local em qualquer porta (o Vite usa 5174, 5175... quando a 5173 está ocupada).
const origensCors = process.env.CORS_ORIGEM
    ? process.env.CORS_ORIGEM.split(',').map((o) => o.trim())
    : /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/
app.use(cors({ origin: origensCors }))
// Enunciados em HTML podem passar dos 100 KB padrão (imagens não vêm no JSON, só o endereço)
app.use(express.json({ limit: '1mb' }))

// Imagens enviadas pelos professores (backend/uploads). nosniff impede o navegador de
// "adivinhar" outro tipo de conteúdo; o nome do arquivo é um UUID, então pode ficar em cache.
app.use('/uploads', express.static(PASTA_UPLOADS, {
    index: false,
    immutable: true,
    maxAge: '30d',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}))

app.use(routes)

app.use(naoEncontrado)
app.use(tratarErros)

try {
    await conectarBanco()
    app.listen(PORTA,()=>{
        console.log('Servidor rodando na porta '+PORTA)
    } )
} catch (erro) {
    console.error('Erro ao conectar ao banco de dados:', erro.message)
    process.exit(1)
}
