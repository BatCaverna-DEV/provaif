// Migração: enunciados e alternativas passam de texto simples para HTML.
// - Muda alternativas.texto de VARCHAR(250) para TEXT.
// - Converte os textos antigos (linha em branco = novo parágrafo; quebra simples = <br>).
// Pode ser executada mais de uma vez: conteúdo que já é HTML não é alterado.
//
// Uso: npm run migrar:html --prefix backend
import sequelize from '../config/database.js'
import { Questao, Alternativa } from '../models/index.js'
import { pareceHtml, sanitizarConteudo } from '../utils/html.js'

async function converter(Model, rotulo) {
    const registros = await Model.findAll({ attributes: ['id', 'texto'] })
    let convertidos = 0
    for (const r of registros) {
        if (r.texto && !pareceHtml(r.texto)) {
            await r.update({ texto: sanitizarConteudo(r.texto) })
            convertidos += 1
        }
    }
    console.log(`${rotulo}: ${convertidos} de ${registros.length} convertidos para HTML`)
}

try {
    await sequelize.authenticate()
    await Alternativa.sync({ alter: true })
    console.log('alternativas.texto agora é TEXT')
    await converter(Questao, 'Enunciados')
    await converter(Alternativa, 'Alternativas')
} finally {
    await sequelize.close()
}
