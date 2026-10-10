import express from 'express'
const app = express()

const PORTA = 3000

app.use('/', (req,res,next)=>{
    res.send('Olá, Mundo!');
})

app.listen(PORTA,()=>{
    console.log('Servidor rodando na porta '+PORTA)
} )