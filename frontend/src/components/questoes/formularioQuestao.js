import { temConteudo } from '@/utils/conteudo.js'

// Conversão entre a questão da API e o objeto usado no formulário, e validação local
// (enunciado e alternativas são HTML vindos do EditorRico)
// (mesmas regras de backend/validators/questaoValidator.js)

export const TIPO = { OBJETIVA: 1, DISCURSIVA: 2 }
export const ACESSO = { PRIVADA: 0, PUBLICA: 1 }

let contador = 0
/** Alternativa vazia. "chave" identifica a linha na tela (as alternativas não têm id até serem salvas). */
export function novaAlternativa(texto = '', correta = false) {
  contador += 1
  return { chave: `alt-${contador}`, texto, correta }
}

export function formularioDe(questao = null) {
  return {
    tipo: questao?.tipo ?? TIPO.OBJETIVA,
    nivel: questao?.nivel ?? 2,
    acesso: questao?.acesso ?? ACESSO.PRIVADA,
    assunto: questao?.assunto ?? '',
    texto: questao?.texto ?? '',
    alternativas: questao?.alternativas?.length
      ? questao.alternativas.map((a) => novaAlternativa(a.texto, !!a.correta))
      : [novaAlternativa(), novaAlternativa(), novaAlternativa(), novaAlternativa()],
  }
}

/** Formulário "limpo" para comparar alterações (ignora as chaves das linhas). */
export function assinatura(form) {
  return JSON.stringify({ ...form, alternativas: form.alternativas.map(({ texto, correta }) => ({ texto, correta })) })
}

export function corpoDe(form) {
  const objetiva = form.tipo === TIPO.OBJETIVA
  return {
    tipo: form.tipo,
    nivel: form.nivel,
    acesso: form.acesso,
    assunto: form.assunto.trim(),
    texto: form.texto,
    alternativas: objetiva ? form.alternativas.map((a) => ({ texto: a.texto, correta: a.correta })) : [],
  }
}

export function validarFormulario(form) {
  const erros = {}
  if (!form.assunto.trim()) erros.assunto = 'Informe o assunto.'
  if (!temConteudo(form.texto)) erros.texto = 'Escreva o enunciado da questão.'

  if (form.tipo === TIPO.OBJETIVA) {
    form.alternativas.forEach((a, i) => {
      if (!temConteudo(a.texto)) erros[`alternativas.${i}`] = 'Preencha a alternativa.'
    })
    if (form.alternativas.length < 2) erros.alternativas = 'Cadastre pelo menos 2 alternativas.'
    else if (form.alternativas.filter((a) => a.correta).length !== 1) erros.alternativas = 'Marque a alternativa correta.'
  }
  return erros
}
