<template>
  <div>
    <h3 class="h6 fw-bold text-primary mb-3">Avaliação</h3>
    <BRow class="g-3">
      <BCol cols="12" sm="8">
        <BFormGroup
          label="Descrição"
          label-for="av-descricao"
          :state="estado('descricao')"
          :invalid-feedback="erros.descricao"
          :description="`${form.descricao.length}/45 caracteres`"
        >
          <BFormInput
            id="av-descricao"
            v-model="form.descricao"
            :state="estado('descricao')"
            maxlength="45"
            placeholder="Ex.: Prova 1 – Funções"
            required
          />
        </BFormGroup>
      </BCol>
      <BCol cols="12" sm="4">
        <BFormGroup label="Data de criação" label-for="av-data" :state="estado('dataCriacao')" :invalid-feedback="erros.dataCriacao">
          <BFormInput id="av-data" v-model="form.dataCriacao" type="date" :state="estado('dataCriacao')" />
        </BFormGroup>
      </BCol>
    </BRow>

    <h3 class="h6 fw-bold text-primary mt-4 mb-1">Cabeçalho da prova</h3>
    <p class="small text-secondary mb-3">Aparece no topo da prova impressa. Todos os campos são opcionais.</p>
    <BRow class="g-3">
      <BCol v-for="c in camposTexto" :key="c.campo" cols="12" :sm="c.sm">
        <BFormGroup :label="c.rotulo" :label-for="`cab-${c.campo}`" :state="estado(`cabecalho.${c.campo}`)" :invalid-feedback="erros[`cabecalho.${c.campo}`]">
          <BFormInput
            :id="`cab-${c.campo}`"
            v-model="form.cabecalho[c.campo]"
            :state="estado(`cabecalho.${c.campo}`)"
            maxlength="100"
            :placeholder="c.exemplo"
          />
        </BFormGroup>
      </BCol>
      <BCol cols="12" sm="6">
        <BFormGroup label="Data de aplicação" label-for="cab-data" :state="estado('cabecalho.data')" :invalid-feedback="erros['cabecalho.data']">
          <BFormInput id="cab-data" v-model="form.cabecalho.data" type="date" :state="estado('cabecalho.data')" />
        </BFormGroup>
      </BCol>
      <BCol cols="12">
        <BFormGroup label="Instruções" label-for="cab-instrucoes" :state="estado('cabecalho.instrucoes')" :invalid-feedback="erros['cabecalho.instrucoes']">
          <BFormTextarea
            id="cab-instrucoes"
            v-model="form.cabecalho.instrucoes"
            :state="estado('cabecalho.instrucoes')"
            rows="3"
            maxlength="5000"
            placeholder="Ex.: Leia com atenção. Use caneta azul ou preta. Não é permitido o uso de calculadora."
          />
        </BFormGroup>
      </BCol>
    </BRow>
  </div>
</template>

<script setup>
import { BRow, BCol, BFormGroup, BFormInput, BFormTextarea } from 'bootstrap-vue-next'

/**
 * Formulário de dados + cabeçalho de uma avaliação.
 * v-model: objeto { descricao, dataCriacao, cabecalho: { instituicao, campos, curso, disciplina, professor, turma, data, instrucoes } }
 * erros: erros por campo, no formato da API ('descricao', 'cabecalho.turma'...)
 */
const form = defineModel({ type: Object, required: true })

const props = defineProps({
  erros: { type: Object, default: () => ({}) },
})

function estado(campo) {
  return props.erros[campo] ? false : null
}

const camposTexto = [
  { campo: 'instituicao', rotulo: 'Instituição', exemplo: 'Instituto Federal', sm: 6 },
  { campo: 'campos', rotulo: 'Campus', exemplo: 'Campus Centro', sm: 6 },
  { campo: 'curso', rotulo: 'Curso', exemplo: 'Técnico em Informática', sm: 6 },
  { campo: 'disciplina', rotulo: 'Disciplina', exemplo: 'Matemática', sm: 6 },
  { campo: 'professor', rotulo: 'Professor(a)', exemplo: '', sm: 6 },
  { campo: 'turma', rotulo: 'Turma', exemplo: '2º ano A', sm: 6 },
]
</script>
