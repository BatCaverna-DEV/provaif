// Formatação e rótulos usados em várias telas

/** 'AAAA-MM-DD' (DATEONLY) → 'DD/MM/AAAA'. Montar a data à mão evita erro de fuso. */
export function formatarData(valor) {
  if (!valor) return ''
  const [ano, mes, dia] = String(valor).slice(0, 10).split('-').map(Number)
  return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR')
}

/** 10.5 → '10,5' (até 2 casas) */
export function formatarNumero(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

/** 10.5 → '10,5 pts' / 1 → '1 pt' */
export function formatarPontos(valor) {
  const n = Number(valor || 0)
  return `${formatarNumero(n)} ${n === 1 ? 'pt' : 'pts'}`
}

// Mesmos códigos de backend/models/Questao.js
export const TIPOS_QUESTAO = {
  1: { texto: 'Objetiva', icone: 'bi-ui-radios' },
  2: { texto: 'Discursiva', icone: 'bi-text-paragraph' },
}

export const NIVEIS_QUESTAO = {
  1: { texto: 'Fácil', cor: 'success' },
  2: { texto: 'Médio', cor: 'warning' },
  3: { texto: 'Difícil', cor: 'danger' },
}

export const LETRAS = 'abcdefghijklmnopqrstuvwxyz'
