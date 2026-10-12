// Conversão entre a avaliação da API e o objeto usado no AvaliacaoForm

const CAMPOS_CABECALHO = ['instituicao', 'campos', 'curso', 'disciplina', 'professor', 'turma', 'data', 'instrucoes']

export function hojeISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Objeto do formulário a partir de uma avaliação da API (ou vazio, para uma nova). */
export function formularioDe(avaliacao = null, padroes = {}) {
  const cabecalho = {}
  for (const campo of CAMPOS_CABECALHO) {
    cabecalho[campo] = avaliacao?.cabecalho?.[campo] ?? padroes[campo] ?? ''
  }
  return {
    descricao: avaliacao?.descricao ?? '',
    dataCriacao: avaliacao?.dataCriacao ?? hojeISO(),
    cabecalho,
  }
}

/** Corpo enviado à API (campos vazios viram null). */
export function corpoDe(form) {
  const cabecalho = {}
  for (const campo of CAMPOS_CABECALHO) {
    const valor = typeof form.cabecalho[campo] === 'string' ? form.cabecalho[campo].trim() : form.cabecalho[campo]
    cabecalho[campo] = valor || null
  }
  return {
    descricao: form.descricao.trim(),
    dataCriacao: form.dataCriacao || undefined,
    cabecalho,
  }
}

/** Validação local, com as mesmas regras do backend para a descrição. */
export function validarFormulario(form) {
  const erros = {}
  const descricao = form.descricao.trim()
  if (!descricao) erros.descricao = 'Informe a descrição da avaliação.'
  else if (descricao.length > 45) erros.descricao = 'A descrição deve ter no máximo 45 caracteres.'
  return erros
}
