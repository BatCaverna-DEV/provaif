import HttpError from '../utils/HttpError.js'
import { TIPO_QUESTAO, ACESSO_QUESTAO, NIVEL_QUESTAO } from '../models/Questao.js'
import { sanitizarConteudo, textoPuro, temConteudo } from '../utils/html.js'

// Enunciado e alternativas são HTML (parágrafos, listas, tabelas, imagens).
// Os limites valem para o texto visível; o HTML tem um teto maior por causa das tags.
const TEXTO_MAX = 20000
const TEXTO_HTML_MAX = 200000
const ALTERNATIVA_MAX = 1000
const ALTERNATIVA_HTML_MAX = 20000
const ALTERNATIVAS_MIN = 2
const ALTERNATIVAS_MAX = 10

const valores = (obj) => Object.values(obj)

/**
 * Valida e normaliza uma questão com suas alternativas.
 * Enunciado e alternativas podem vir como texto simples ou HTML; o HTML é limpo
 * (só tags de formatação e imagens enviadas ao servidor) antes de ser gravado.
 * - Objetiva: de 2 a 10 alternativas, exatamente uma correta.
 * - Discursiva: sem alternativas (as enviadas são ignoradas).
 * @returns {{ dados: object, alternativas: object[] }}
 */
export function validarQuestao(corpo = {}) {
    const erros = {}
    const dados = {}

    const tipo = Number(corpo.tipo)
    if (!valores(TIPO_QUESTAO).includes(tipo)) erros.tipo = 'Escolha o tipo: objetiva ou discursiva.'
    else dados.tipo = tipo

    const nivel = Number(corpo.nivel)
    if (!valores(NIVEL_QUESTAO).includes(nivel)) erros.nivel = 'Escolha o nível: fácil, médio ou difícil.'
    else dados.nivel = nivel

    const acesso = corpo.acesso === undefined ? ACESSO_QUESTAO.PRIVADA : Number(corpo.acesso)
    if (!valores(ACESSO_QUESTAO).includes(acesso)) erros.acesso = 'Acesso inválido.'
    else dados.acesso = acesso

    const assunto = typeof corpo.assunto === 'string' ? corpo.assunto.trim() : ''
    if (!assunto) erros.assunto = 'Informe o assunto.'
    else if (assunto.length > 100) erros.assunto = 'O assunto deve ter no máximo 100 caracteres.'
    else dados.assunto = assunto

    const texto = sanitizarConteudo(corpo.texto)
    if (!temConteudo(texto)) erros.texto = 'Escreva o enunciado da questão.'
    else if (textoPuro(texto).length > TEXTO_MAX || texto.length > TEXTO_HTML_MAX) erros.texto = `O enunciado deve ter no máximo ${TEXTO_MAX} caracteres.`
    else dados.texto = texto

    let alternativas = []
    if (dados.tipo === TIPO_QUESTAO.OBJETIVA) {
        const lista = Array.isArray(corpo.alternativas) ? corpo.alternativas : []
        if (lista.length < ALTERNATIVAS_MIN || lista.length > ALTERNATIVAS_MAX) {
            erros.alternativas = `Cadastre de ${ALTERNATIVAS_MIN} a ${ALTERNATIVAS_MAX} alternativas.`
        } else {
            alternativas = lista.map((alt, i) => {
                const textoAlt = sanitizarConteudo(alt?.texto)
                if (!temConteudo(textoAlt)) erros[`alternativas.${i}`] = 'Preencha a alternativa.'
                else if (textoPuro(textoAlt).length > ALTERNATIVA_MAX || textoAlt.length > ALTERNATIVA_HTML_MAX) erros[`alternativas.${i}`] = `Máximo de ${ALTERNATIVA_MAX} caracteres.`
                return { texto: textoAlt, correta: alt?.correta ? 1 : 0, ordem: i + 1 }
            })
            const corretas = alternativas.filter((a) => a.correta).length
            if (corretas !== 1) erros.alternativas = 'Marque exatamente uma alternativa como correta.'
        }
    }

    if (Object.keys(erros).length) {
        throw new HttpError(400, 'Dados inválidos.', erros)
    }
    return { dados, alternativas }
}
