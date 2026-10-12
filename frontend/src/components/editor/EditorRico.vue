<template>
  <div class="editor-rico" :class="{ invalido: estado === false, compacto: modo === 'compacto' }">
    <!-- Barra de ferramentas -->
    <div v-if="editor" class="barra" role="toolbar" :aria-label="`Formatação: ${rotulo}`">
      <div class="grupo">
        <button v-for="b in botoesTexto" :key="b.nome" type="button" class="botao" :class="{ ativo: editor.isActive(b.nome) }"
          :title="b.titulo" :aria-label="b.titulo" :aria-pressed="editor.isActive(b.nome)" @click="b.acao()">
          <i :class="['bi', b.icone]" aria-hidden="true" />
        </button>
      </div>

      <div class="grupo">
        <button v-for="b in botoesLista" :key="b.nome" type="button" class="botao" :class="{ ativo: editor.isActive(b.nome) }"
          :title="b.titulo" :aria-label="b.titulo" :aria-pressed="editor.isActive(b.nome)" @click="b.acao()">
          <i :class="['bi', b.icone]" aria-hidden="true" />
        </button>
      </div>

      <div class="grupo">
        <button type="button" class="botao" title="Inserir imagem (também é possível colar ou arrastar)" aria-label="Inserir imagem"
          :disabled="enviando" @click="seletorArquivo?.click()">
          <span v-if="enviando" class="spinner-border spinner-border-sm" aria-hidden="true" />
          <i v-else class="bi bi-image" aria-hidden="true" />
        </button>
        <button v-if="modo === 'completo'" type="button" class="botao" title="Inserir tabela (3 × 3)" aria-label="Inserir tabela"
          :disabled="editor.isActive('table')" @click="inserirTabela">
          <i class="bi bi-table" aria-hidden="true" />
        </button>
      </div>

      <!-- Ações de tabela: só aparecem com o cursor dentro de uma tabela -->
      <div v-if="editor.isActive('table')" class="grupo grupo-tabela">
        <button v-for="b in botoesTabela" :key="b.titulo" type="button" class="botao botao-texto" :title="b.titulo" @click="b.acao()">
          <i :class="['bi', b.icone]" aria-hidden="true" /><span class="d-none d-xl-inline ms-1">{{ b.curto }}</span>
        </button>
      </div>

      <div class="grupo ms-auto">
        <button type="button" class="botao" title="Desfazer (Ctrl+Z)" aria-label="Desfazer" :disabled="!editor.can().undo()" @click="editor.chain().focus().undo().run()">
          <i class="bi bi-arrow-counterclockwise" aria-hidden="true" />
        </button>
        <button type="button" class="botao" title="Refazer (Ctrl+Y)" aria-label="Refazer" :disabled="!editor.can().redo()" @click="editor.chain().focus().redo().run()">
          <i class="bi bi-arrow-clockwise" aria-hidden="true" />
        </button>
      </div>

      <input ref="seletorArquivo" type="file" :accept="TIPOS_IMAGEM.join(',')" class="d-none" @change="aoEscolherArquivo" />
    </div>

    <EditorContent :editor="editor" class="area" />

    <div v-if="erroImagem" class="erro-imagem small text-danger px-2 pb-2">
      <i class="bi bi-exclamation-circle me-1" aria-hidden="true" />{{ erroImagem }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { Placeholder } from '@tiptap/extensions'
import { enviarImagem, TAMANHO_MAXIMO_IMAGEM, TIPOS_IMAGEM } from '@/services/uploadService.js'
import { URL_BASE } from '@/services/api.js'
import { paraExibicao, paraSalvar, textoParaHtml } from '@/utils/conteudo.js'

/**
 * Editor de texto rico para enunciados e alternativas.
 * v-model: HTML (com imagens em endereço relativo, ex.: /uploads/imagens/x.png). Vazio = ''.
 * modo: 'completo' (com tabelas) ou 'compacto' (alternativas: sem tabelas, área menor).
 */
const html = defineModel({ type: String, default: '' })

const props = defineProps({
  modo: { type: String, default: 'completo' },
  placeholder: { type: String, default: '' },
  rotulo: { type: String, default: 'texto' },
  id: { type: String, default: undefined },
  // false = inválido (borda vermelha), como o :state do Bootstrap-Vue
  estado: { type: Boolean, default: null },
})

// Células aceitam parágrafos, listas e imagens, mas não outra tabela
// (tabela dentro de tabela fica ilegível na prova). Vale também para conteúdo colado.
const CONTEUDO_CELULA = '(paragraph | bulletList | orderedList | image)+'
const CelulaTabela = TableCell.extend({ content: CONTEUDO_CELULA })
const CabecalhoTabela = TableHeader.extend({ content: CONTEUDO_CELULA })

const seletorArquivo = ref(null)
const enviando = ref(false)
const erroImagem = ref('')

// Conteúdo antigo em texto simples (sem tags) vira parágrafos
function prepararConteudo(valor) {
  if (!valor) return ''
  return paraExibicao(/<[a-z][\s\S]*>/i.test(valor) ? valor : textoParaHtml(valor))
}

const editor = useEditor({
  content: prepararConteudo(html.value),
  extensions: [
    // Só os recursos que o backend aceita (backend/utils/html.js): sem títulos, citações, código e links
    StarterKit.configure({
      heading: false,
      blockquote: false,
      codeBlock: false,
      code: false,
      horizontalRule: false,
      link: false,
    }),
    Subscript,
    Superscript,
    Image.configure({ allowBase64: false }),
    ...(props.modo === 'completo'
      ? [Table.configure({ resizable: false }), TableRow, CelulaTabela, CabecalhoTabela]
      : []),
    Placeholder.configure({ placeholder: props.placeholder }),
  ],
  editorProps: {
    attributes: {
      class: 'conteudo-rico',
      role: 'textbox',
      'aria-multiline': 'true',
      'aria-label': props.rotulo,
      ...(props.id ? { id: props.id } : {}),
    },
    // Imagens coladas ou arrastadas são enviadas ao servidor (em vez de virarem base64)
    handlePaste: (view, event) => inserirArquivos(event.clipboardData?.files),
    handleDrop: (view, event) => inserirArquivos(event.dataTransfer?.files),
  },
  onUpdate: ({ editor: e }) => {
    html.value = e.isEmpty ? '' : paraSalvar(e.getHTML())
  },
})

// Quando o valor muda por fora (ex.: formulário limpo), atualiza o editor
watch(html, (valor) => {
  const e = editor.value
  if (!e) return
  const atual = e.isEmpty ? '' : paraSalvar(e.getHTML())
  if (valor !== atual) e.commands.setContent(prepararConteudo(valor), { emitUpdate: false })
})

onBeforeUnmount(() => editor.value?.destroy())

const cmd = () => editor.value.chain().focus()

const botoesTexto = [
  { nome: 'bold', icone: 'bi-type-bold', titulo: 'Negrito (Ctrl+B)', acao: () => cmd().toggleBold().run() },
  { nome: 'italic', icone: 'bi-type-italic', titulo: 'Itálico (Ctrl+I)', acao: () => cmd().toggleItalic().run() },
  { nome: 'underline', icone: 'bi-type-underline', titulo: 'Sublinhado (Ctrl+U)', acao: () => cmd().toggleUnderline().run() },
  { nome: 'strike', icone: 'bi-type-strikethrough', titulo: 'Tachado', acao: () => cmd().toggleStrike().run() },
  { nome: 'superscript', icone: 'bi-superscript', titulo: 'Sobrescrito (ex.: x²)', acao: () => cmd().toggleSuperscript().run() },
  { nome: 'subscript', icone: 'bi-subscript', titulo: 'Subscrito (ex.: H₂O)', acao: () => cmd().toggleSubscript().run() },
]

const botoesLista = [
  { nome: 'bulletList', icone: 'bi-list-ul', titulo: 'Lista com marcadores', acao: () => cmd().toggleBulletList().run() },
  { nome: 'orderedList', icone: 'bi-list-ol', titulo: 'Lista numerada', acao: () => cmd().toggleOrderedList().run() },
]

const botoesTabela = [
  { icone: 'bi-layout-three-columns', curto: 'Cabeçalho', titulo: 'Primeira linha como cabeçalho', acao: () => cmd().toggleHeaderRow().run() },
  { icone: 'bi-plus-square', curto: 'Linha', titulo: 'Adicionar linha abaixo', acao: () => cmd().addRowAfter().run() },
  { icone: 'bi-dash-square', curto: 'Linha', titulo: 'Remover linha', acao: () => cmd().deleteRow().run() },
  { icone: 'bi-plus-square-dotted', curto: 'Coluna', titulo: 'Adicionar coluna à direita', acao: () => cmd().addColumnAfter().run() },
  { icone: 'bi-dash-square-dotted', curto: 'Coluna', titulo: 'Remover coluna', acao: () => cmd().deleteColumn().run() },
  { icone: 'bi-trash', curto: 'Tabela', titulo: 'Remover tabela', acao: () => cmd().deleteTable().run() },
]

function inserirTabela() {
  if (editor.value.isActive('table')) return
  cmd().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

function validarArquivo(arquivo) {
  if (!TIPOS_IMAGEM.includes(arquivo.type)) return 'Formato não suportado. Use PNG, JPG, GIF ou WebP.'
  if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) return 'A imagem deve ter no máximo 5 MB.'
  return ''
}

/** Envia as imagens e insere no editor. Devolve true se tratou o evento (colar/arrastar). */
function inserirArquivos(lista) {
  const imagens = [...(lista || [])].filter((f) => f.type.startsWith('image/'))
  if (!imagens.length) return false
  ;(async () => {
    for (const arquivo of imagens) await enviarEInserir(arquivo)
  })()
  return true
}

async function enviarEInserir(arquivo) {
  erroImagem.value = validarArquivo(arquivo)
  if (erroImagem.value) return
  enviando.value = true
  try {
    const { url } = await enviarImagem(arquivo)
    // Insere depois da seleção atual: se uma imagem estiver selecionada, ela não é substituída
    const fim = editor.value.state.selection.to
    cmd().setTextSelection(fim).setImage({ src: `${URL_BASE}${url}`, alt: '' }).run()
  } catch (e) {
    erroImagem.value = e.message
  } finally {
    enviando.value = false
  }
}

async function aoEscolherArquivo(evento) {
  const arquivo = evento.target.files?.[0]
  evento.target.value = '' // permite escolher o mesmo arquivo de novo
  if (arquivo) await enviarEInserir(arquivo)
}
</script>

<style scoped>
.editor-rico {
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  background-color: var(--bs-body-bg);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.editor-rico:focus-within {
  border-color: #8daaf0;
  box-shadow: 0 0 0 0.25rem rgba(26, 86, 219, 0.25);
}

.editor-rico.invalido {
  border-color: var(--bs-form-invalid-border-color);
}

.editor-rico.invalido:focus-within {
  box-shadow: 0 0 0 0.25rem rgba(var(--bs-danger-rgb), 0.25);
}

.barra {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.5rem;
  padding: 0.3rem 0.4rem;
  border-bottom: 1px solid var(--bs-border-color);
  background-color: var(--bs-tertiary-bg);
  border-radius: var(--bs-border-radius) var(--bs-border-radius) 0 0;
}

.grupo {
  display: flex;
  gap: 0.1rem;
}

.grupo + .grupo:not(.ms-auto) {
  padding-left: 0.5rem;
  border-left: 1px solid var(--bs-border-color);
}

.grupo-tabela {
  flex-wrap: wrap;
}

.botao {
  min-width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.35rem;
  border: 0;
  border-radius: 0.35rem;
  background: transparent;
  color: var(--bs-body-color);
}

.botao:hover:not(:disabled) {
  background-color: rgba(26, 86, 219, 0.1);
}

.botao.ativo {
  color: #fff;
  background-color: var(--bs-primary);
}

.botao:disabled {
  opacity: 0.4;
}

.botao-texto {
  font-size: 0.8rem;
}

.area :deep(.ProseMirror) {
  min-height: 9rem;
  padding: 0.6rem 0.75rem;
  outline: none;
}

.compacto .area :deep(.ProseMirror) {
  min-height: 2.6rem;
  padding: 0.4rem 0.6rem;
}

.compacto .botao {
  min-width: 1.75rem;
  height: 1.75rem;
}

/* Texto de exemplo do editor vazio */
.area :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  color: var(--bs-secondary-color);
  pointer-events: none;
}

/* Tabela em edição */
.area :deep(.ProseMirror .selectedCell) {
  background-color: rgba(26, 86, 219, 0.12);
}

.area :deep(.ProseMirror img.ProseMirror-selectednode) {
  outline: 3px solid var(--bs-primary);
}
</style>
