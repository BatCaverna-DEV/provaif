import sanitizeHtml from 'sanitize-html'

// Imagens só podem apontar para arquivos enviados ao próprio servidor (POST /uploads/imagens).
// Isso bloqueia "data:" (base64), endereços externos e javascript:.
export const REGEX_SRC_IMAGEM = /^\/uploads\/imagens\/[a-zA-Z0-9-]+\.(png|jpe?g|gif|webp)$/

const OPCOES = {
    allowedTags: [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
        'ul', 'ol', 'li',
        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'colgroup', 'col',
        'img',
    ],
    allowedAttributes: {
        img: ['src', 'alt', 'width'],
        th: ['colspan', 'rowspan'],
        td: ['colspan', 'rowspan'],
        ol: ['start'],
    },
    allowedSchemes: [],
    allowProtocolRelative: false,
    exclusiveFilter: (frame) => frame.tag === 'img' && !REGEX_SRC_IMAGEM.test(frame.attribs.src || ''),
    transformTags: {
        b: 'strong',
        i: 'em',
    },
}

function escapar(texto) {
    return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Texto simples → HTML: linha em branco separa parágrafos; quebra simples vira <br>. */
export function textoParaHtml(texto) {
    return String(texto)
        .replace(/\r\n?/g, '\n')
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${escapar(p).replace(/\n/g, '<br>')}</p>`)
        .join('')
}

// Tags que indicam conteúdo vindo do editor. Um texto simples como "a <b" ou "<parágrafo>"
// não deve ser confundido com HTML (perderia o trecho e as quebras de linha).
const REGEX_TAG_CONHECIDA = /<\/?(p|br|strong|b|em|i|u|s|sub|sup|ul|ol|li|table|thead|tbody|tr|th|td|colgroup|col|img|div|span|h[1-6])(\s[^>]*)?\/?>/i

/** Se o valor não tem tags conhecidas, é tratado como texto simples. */
export function pareceHtml(valor) {
    return REGEX_TAG_CONHECIDA.test(valor)
}

/** Normaliza e limpa o conteúdo recebido: aceita texto simples ou HTML e devolve HTML seguro. */
export function sanitizarConteudo(valor) {
    if (typeof valor !== 'string') return ''
    const html = pareceHtml(valor) ? valor : textoParaHtml(valor)
    return sanitizeHtml(html, OPCOES)
        // O editor deixa um parágrafo vazio depois de imagens e tabelas; no fim do conteúdo ele só ocupa espaço
        .replace(/(\s*<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>)+\s*$/i, '')
        .trim()
}

/** Texto visível do HTML (sem tags), para validação e buscas. */
export function textoPuro(html) {
    return sanitizeHtml(html || '', { allowedTags: [], allowedAttributes: {} })
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

/** Há algo a mostrar: texto ou pelo menos uma imagem. */
export function temConteudo(html) {
    return !!textoPuro(html) || /<img\s/i.test(html || '')
}
