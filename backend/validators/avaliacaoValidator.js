import HttpError from '../utils/HttpError.js'

const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/
const PONTOS_MAX = 99999999.99 // DECIMAL(10,2)
const INSTRUCOES_MAX = 5000

// Campos de texto do cabeçalho (todos opcionais, até 100 caracteres, como na tabela cabecalhos)
const CAMPOS_CABECALHO = ['instituicao', 'campos', 'curso', 'disciplina', 'professor', 'turma']

function dataValida(valor) {
    if (typeof valor !== 'string' || !REGEX_DATA.test(valor)) return false
    const [ano, mes, dia] = valor.split('-').map(Number)
    const d = new Date(Date.UTC(ano, mes - 1, dia))
    return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia
}

function validarCabecalho(cabecalho, erros) {
    if (cabecalho === undefined) return undefined
    if (cabecalho === null || typeof cabecalho !== 'object' || Array.isArray(cabecalho)) {
        erros.cabecalho = 'Cabeçalho inválido.'
        return undefined
    }

    const dados = {}
    for (const campo of CAMPOS_CABECALHO) {
        if (cabecalho[campo] === undefined) continue
        const valor = cabecalho[campo] === null ? '' : String(cabecalho[campo]).trim()
        if (valor.length > 100) erros[`cabecalho.${campo}`] = 'Máximo de 100 caracteres.'
        else dados[campo] = valor || null
    }

    if (cabecalho.data !== undefined) {
        if (cabecalho.data === null || cabecalho.data === '') dados.data = null
        else if (!dataValida(cabecalho.data)) erros['cabecalho.data'] = 'Data inválida (use AAAA-MM-DD).'
        else dados.data = cabecalho.data
    }

    if (cabecalho.instrucoes !== undefined) {
        const valor = cabecalho.instrucoes === null ? '' : String(cabecalho.instrucoes).trim()
        if (valor.length > INSTRUCOES_MAX) erros['cabecalho.instrucoes'] = `Máximo de ${INSTRUCOES_MAX} caracteres.`
        else dados.instrucoes = valor || null
    }

    return dados
}

/**
 * Valida os dados de uma avaliação (e, opcionalmente, do seu cabeçalho).
 * @param {object} opcoes { parcial: true } na atualização (só valida o que foi enviado)
 */
export function validarAvaliacao(corpo = {}, { parcial = false } = {}) {
    const erros = {}
    const dados = {}

    if (!parcial || corpo.descricao !== undefined) {
        const descricao = typeof corpo.descricao === 'string' ? corpo.descricao.trim() : ''
        if (!descricao) erros.descricao = 'Informe a descrição da avaliação.'
        else if (descricao.length > 45) erros.descricao = 'A descrição deve ter no máximo 45 caracteres.'
        else dados.descricao = descricao
    }

    if (corpo.dataCriacao !== undefined) {
        if (!dataValida(corpo.dataCriacao)) erros.dataCriacao = 'Data inválida (use AAAA-MM-DD).'
        else dados.dataCriacao = corpo.dataCriacao
    }

    const cabecalho = validarCabecalho(corpo.cabecalho, erros)

    if (Object.keys(erros).length) {
        throw new HttpError(400, 'Dados inválidos.', erros)
    }
    return { dados, cabecalho }
}

export function validarPontos(valor) {
    const pontos = typeof valor === 'string' ? Number(valor.replace(',', '.')) : valor
    if (typeof pontos !== 'number' || !Number.isFinite(pontos) || pontos < 0 || pontos > PONTOS_MAX) {
        throw new HttpError(400, 'Dados inválidos.', { pontos: 'Informe uma pontuação válida (0 ou mais).' })
    }
    return Math.round(pontos * 100) / 100
}

export function validarQuestaoId(valor) {
    if (typeof valor !== 'string' || !valor.trim()) {
        throw new HttpError(400, 'Dados inválidos.', { questaoId: 'Informe a questão.' })
    }
    return valor.trim()
}

export function validarOrdem(valor) {
    if (!Array.isArray(valor) || !valor.length || valor.some((id) => typeof id !== 'string')) {
        throw new HttpError(400, 'Dados inválidos.', { questoes: 'Envie a lista de ids das questões na nova ordem.' })
    }
    return valor
}
