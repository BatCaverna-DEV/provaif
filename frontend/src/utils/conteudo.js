// Conteúdo rico (HTML) de enunciados e alternativas.
// No banco, as imagens ficam com endereço relativo à API ("/uploads/imagens/x.png").
// Na tela, esse endereço precisa apontar para o servidor da API.
import DOMPurify from 'dompurify'
import { URL_BASE } from '@/services/api.js'

const PREFIXO_UPLOADS = '/uploads/'

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** HTML do banco → HTML para exibir/editar (imagens com o endereço completo da API). */
export function paraExibicao(html) {
  return (html || '').replace(/src="\/uploads\//g, `src="${URL_BASE}${PREFIXO_UPLOADS}`)
}

/** HTML do editor → HTML para salvar (imagens com endereço relativo). */
export function paraSalvar(html) {
  return (html || '').replace(new RegExp(`src="${escaparRegex(URL_BASE)}/uploads/`, 'g'), 'src="/uploads/')
}

// Mesmas tags aceitas pelo backend (backend/utils/html.js). O backend já limpa o HTML ao
// salvar; esta é uma segunda camada, caso algum conteúdo chegue por outro caminho.
const CONFIG_PURIFY = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'colgroup', 'col', 'img'],
  ALLOWED_ATTR: ['src', 'alt', 'width', 'colspan', 'rowspan', 'start'],
  ALLOWED_URI_REGEXP: /^https?:\/\//i,
}

/** HTML seguro e pronto para v-html. */
export function htmlSeguro(html) {
  return DOMPurify.sanitize(paraExibicao(html), CONFIG_PURIFY)
}

function escapar(texto) {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Conteúdo antigo em texto simples → HTML (linha em branco separa parágrafos). */
export function textoParaHtml(texto) {
  return String(texto || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapar(p).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

/** Texto visível do HTML, sem tags (para resumos, buscas e contagem de caracteres). */
export function textoPuro(html) {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html.replace(/<\/(p|li|td|th)>/gi, ' $&').replace(/<br\s*\/?>/gi, ' '), 'text/html')
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim()
}

export const temImagem = (html) => /<img\s/i.test(html || '')
export const temTabela = (html) => /<table[\s>]/i.test(html || '')

/** Há algo a mostrar: texto ou imagem. */
export function temConteudo(html) {
  return !!textoPuro(html) || temImagem(html)
}
