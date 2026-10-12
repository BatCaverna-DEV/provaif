# ProvaIF — Arquitetura e Organização do Sistema

## 1. Visão geral

**ProvaIF** é um sistema de criação de provas. A aplicação segue uma arquitetura **cliente-servidor** separada em dois projetos independentes dentro do mesmo repositório (monorepo simples):

| Camada   | Pasta       | Tecnologia                     | Papel                                   |
|----------|-------------|--------------------------------|-----------------------------------------|
| Frontend | `frontend/` | Vue 3 + Vue Router + Vite      | Interface web (SPA) usada pelo usuário  |
| Backend  | `backend/`  | Node.js + Express 5            | API HTTP que atende o frontend          |

Cada projeto tem seu próprio `package.json`, `node_modules` e é executado separadamente. Os dois se comunicarão via requisições HTTP (a integração ainda não foi implementada).

```
┌──────────────────────┐        HTTP (JSON)        ┌──────────────────────┐
│  Frontend (SPA)      │  ───────────────────────▶ │  Backend (API)       │
│  Vue 3 + Vite        │  ◀─────────────────────── │  Express 5           │
│  dev: porta 5173     │                           │  porta 3000          │
└──────────────────────┘                           └──────────────────────┘
```

> **Estágio atual:** o projeto está na fase inicial. O frontend tem o site público de divulgação, o cadastro de professor, o login e a área logada com a tela principal (painel), o banco de questões e as telas de avaliações. O backend se conecta ao MariaDB via Sequelize (criando o banco e as tabelas a partir do DER), tem autenticação com JWT, a API de usuários, o resumo do painel e o **gerenciamento de questões** (objetivas e discursivas, privadas ou públicas) e o **gerenciamento de avaliações** (criar, editar o cabeçalho, escolher questões, pontuar, ordenar, duplicar, excluir e imprimir). Ainda não há a tela de perfil.

## 2. Estrutura de diretórios

```
provaif/
├── README.md               # Descrição curta do projeto
├── LICENSE                 # Licença MIT (Batcaverna-DEV, 2026)
├── sistema.md              # Este documento
├── .gitignore              # Ignora node_modules, .idea, .env, builds, logs e backend/uploads
│
├── backend/                # API do sistema
│   ├── package.json        # Metadados, scripts e dependências
│   ├── package-lock.json
│   ├── .env.example        # Modelo das variáveis de ambiente (copiar para .env)
│   ├── index.js            # Ponto de entrada: middlewares, rotas, banco e servidor
│   ├── config/
│   │   ├── database.js     # Conexão Sequelize + MariaDB e criação do banco
│   │   └── auth.js         # Segredo e validade do JWT
│   ├── routes/             # Endpoints: ligam URL + método HTTP a um controller
│   │   ├── index.js        # Agrupa todas as rotas (/, /auth, /usuarios, /painel, /avaliacoes, /questoes)
│   │   ├── authRoutes.js
│   │   ├── usuarioRoutes.js
│   │   ├── painelRoutes.js
│   │   ├── avaliacaoRoutes.js
│   │   ├── questaoRoutes.js
│   │   └── uploadRoutes.js
│   ├── controllers/        # Leem req, chamam validação + service, montam a resposta
│   │   ├── authController.js
│   │   ├── usuarioController.js
│   │   ├── painelController.js
│   │   ├── avaliacaoController.js
│   │   ├── questaoController.js
│   │   └── uploadController.js
│   ├── services/           # Regras de negócio e acesso aos models
│   │   ├── authService.js  # Login (gera o JWT) e validação do token
│   │   ├── usuarioService.js
│   │   ├── painelService.js
│   │   ├── avaliacaoService.js  # Avaliações, cabeçalho, questões da prova e total de pontos
│   │   ├── questaoService.js    # Banco de questões: listagem, CRUD, cópia e assuntos
│   │   └── uploadService.js     # Confere o tipo da imagem e grava em uploads/imagens
│   ├── validators/         # Validação e normalização dos dados recebidos
│   │   ├── authValidator.js
│   │   ├── usuarioValidator.js
│   │   ├── avaliacaoValidator.js
│   │   └── questaoValidator.js
│   ├── middlewares/
│   │   ├── autenticar.js   # Exige token (req.usuario) e restringe à própria conta
│   │   ├── uploadImagem.js # Recebe o arquivo (multer) e limita o tamanho
│   │   └── errorHandler.js # 404 e tratamento central de erros
│   ├── utils/
│   │   ├── HttpError.js    # Erro com status HTTP, lançado pelas camadas
│   │   └── html.js         # Limpeza do HTML dos enunciados/alternativas e conversão de texto simples
│   ├── scripts/
│   │   └── migrarConteudoHtml.js # Migração: texto simples → HTML (npm run migrar:html)
│   ├── uploads/            # Imagens enviadas pelos professores (fora do Git)
│   └── models/             # Models do Sequelize (um arquivo por tabela)
│       ├── index.js        # Importa os models, define os relacionamentos e os exporta
│       ├── Usuario.js
│       ├── Questao.js
│       ├── Alternativa.js
│       ├── Avaliacao.js
│       ├── AvaliacaoQuestao.js
│       └── Cabecalho.js
│
└── frontend/               # Aplicação web (SPA)
    ├── index.html          # HTML raiz; monta a aplicação em <div id="app">
    ├── vite.config.js      # Configuração do Vite (plugins e alias "@")
    ├── jsconfig.json       # Suporte do editor ao alias "@/*" → "./src/*"
    ├── package.json        # Scripts dev/build/preview e dependências
    ├── .env.example        # Modelo das variáveis (VITE_API_URL); copiar para .env.local
    ├── public/
    │   └── favicon.ico     # Arquivos estáticos servidos na raiz
    └── src/
        ├── main.js         # Ponto de entrada: estilos, ligação API ↔ sessão, router e montagem
        ├── App.vue         # Componente raiz: <BApp> + layout público ou da área logada
        ├── styles/
        │   └── main.scss   # Tema do Bootstrap (paleta azul) e classes utilitárias próprias
        ├── router/
        │   └── index.js    # Rotas, rolagem para âncoras e título da aba
        ├── stores/
        │   └── auth.js     # Sessão: token, usuário logado, entrar/sair, "lembrar de mim"
        ├── services/       # Comunicação com a API do backend
        │   ├── api.js          # Cliente HTTP (fetch): URL base, token, JSON, tempo limite e ApiError
        │   ├── authService.js
        │   ├── usuarioService.js
        │   ├── painelService.js
        │   ├── avaliacaoService.js
        │   ├── questaoService.js
        │   └── uploadService.js  # Envio de imagens
        ├── utils/
        │   ├── formatacao.js   # Datas, pontos e rótulos de tipo/nível de questão
        │   └── conteudo.js     # Conteúdo rico: endereço das imagens, limpeza (DOMPurify), texto puro
        ├── views/          # Páginas (uma por rota)
        │   ├── HomeView.vue      # Site público: monta as seções de components/home
        │   ├── LoginView.vue     # Tela de login
        │   ├── CadastroView.vue  # Cadastro de professor (POST /usuarios)
        │   └── app/              # Páginas da área logada
        │       ├── PainelView.vue           # Tela principal após o login
        │       ├── AvaliacoesView.vue       # Lista de avaliações
        │       ├── AvaliacaoNovaView.vue    # Criação (dados + cabeçalho)
        │       ├── AvaliacaoEditarView.vue  # Edição: dados, cabeçalho e questões da prova
        │       ├── AvaliacaoImprimirView.vue # Folha da prova para imprimir / salvar PDF
        │       ├── QuestoesView.vue         # Banco de questões (lista paginada com filtros)
        │       └── QuestaoFormView.vue      # Criação e edição de questão, com pré-visualização
        └── components/
            ├── layout/     # Estruturas de página
            │   ├── SiteNavbar.vue  # Menu do site público
            │   ├── SiteFooter.vue  # Rodapé do site público
            │   ├── AppLayout.vue   # Área logada: menu lateral + barra superior + conteúdo
            │   └── AppMenu.vue     # Itens do menu da área logada
            ├── avaliacoes/
            │   ├── AvaliacaoForm.vue          # Campos de dados + cabeçalho (criação e edição)
            │   ├── formularioAvaliacao.js     # Conversão API ↔ formulário e validação local
            │   ├── SeletorQuestoesModal.vue   # Modal para escolher questões do banco
            │   └── NovaQuestaoModal.vue       # Modal para criar uma questão e já colocá-la na prova
            ├── editor/
            │   ├── EditorRico.vue             # Editor (TipTap): parágrafos, listas, tabelas, imagens...
            │   └── ConteudoRico.vue           # Exibe o HTML formatado com segurança
            ├── questoes/
            │   ├── QuestaoResumo.vue          # Exibição compacta de uma questão (lista, prova, seletor)
            │   ├── QuestaoCampos.vue          # Campos da questão (tela de questão e modal da prova)
            │   ├── QuestaoPrevia.vue          # Pré-visualização "como fica na prova"
            │   ├── AlternativasEditor.vue     # Editor das alternativas (correta, ordem, incluir/remover)
            │   └── formularioQuestao.js       # Conversão API ↔ formulário e validação local
            └── home/       # Seções da página inicial, na ordem em que aparecem
                ├── HeroSection.vue         # Chamada principal + prévia ilustrativa de uma prova
                ├── NumerosSection.vue      # Números de uso (fictícios)
                ├── SobreSection.vue        # #sobre: o que é o ProvaIF
                ├── RecursosSection.vue     # #recursos: funcionalidades
                ├── ComoFuncionaSection.vue # #como-funciona: passo a passo
                ├── DepoimentosSection.vue  # #depoimentos (fictícios)
                ├── FaqSection.vue          # #faq: perguntas frequentes (acordeão)
                └── ChamadaSection.vue      # Chamada final para entrar
```

## 3. Backend

### Tecnologias
- **Node.js** com **ES Modules** (`"type": "module"` no `package.json`, uso de `import`).
- **Express 5** (`^5.2.1`) como framework HTTP.
- **Sequelize 6** (ORM) com o driver **mariadb 2.5** para acesso ao banco **MariaDB**.
  > O driver fica em `^2.5.6` de propósito: é a versão com que o Sequelize 6 é testado. Com o `mariadb` 3.x, `sequelize.query()` (consultas SQL diretas) quebra com `Cannot delete property 'meta'`. Não atualize o driver para 3.x enquanto o projeto usar Sequelize 6.
- **dotenv** para carregar as variáveis de ambiente do arquivo `.env`.
- **bcryptjs** para gerar e conferir o hash das senhas.
- **jsonwebtoken** para gerar e validar os tokens de login (JWT).
- **multer** para receber o envio de imagens e **sanitize-html** para limpar o HTML dos enunciados e alternativas.
- **cors** para liberar o acesso da API ao frontend.

### Funcionamento atual (`backend/index.js`)
- Carrega o `.env`, importa `models/index.js` (para registrar os models), chama `conectarBanco()` e, só se a conexão der certo, escuta na porta `PORTA` (padrão `3000`). Se o banco falhar, mostra o erro e encerra o processo.
- Middlewares, nesta ordem: `cors` (libera as origens de `CORS_ORIGEM`, ou qualquer porta de localhost se ela estiver vazia), `express.json()` (lê corpo JSON), as rotas de `routes/index.js`, o 404 e o tratamento central de erros.
- O Express 5 repassa sozinho os erros de funções `async` para o tratamento de erros, então os controllers não precisam de `try/catch`.

### Banco de dados (`backend/config/database.js`)
- Exporta por padrão a instância `sequelize` (dialeto `mariadb`), que os models devem importar para se definir.
- Padrões aplicados a todos os models: `underscored: true` (colunas em `snake_case`, ex.: `created_at`) e `freezeTableName: true` (o Sequelize não pluraliza nomes). Cada model define o nome da tabela explicitamente com `tableName`.
- Fuso horário `-03:00`.
- `conectarBanco()` executa, em ordem:
  1. **Cria o banco** com `CREATE DATABASE IF NOT EXISTS` (charset `utf8mb4`), usando uma conexão direta do driver `mariadb`, pois o Sequelize só conecta a um banco que já existe.
  2. **Testa a conexão** com `sequelize.authenticate()`.
  3. **Gera as tabelas** com `sequelize.sync()`. Só são criadas as tabelas dos models que já foram importados antes dessa chamada.

Variáveis de ambiente (ver `backend/.env.example`):

| Variável     | Padrão      | Descrição                                                      |
|--------------|-------------|----------------------------------------------------------------|
| `PORTA`      | `3000`      | Porta do servidor Express                                      |
| `DB_HOST`    | `localhost` | Endereço do MariaDB                                            |
| `DB_PORTA`   | `3306`      | Porta do MariaDB                                               |
| `DB_USUARIO` | `root`      | Usuário do banco                                               |
| `DB_SENHA`   | *(vazio)*   | Senha do banco                                                 |
| `DB_NOME`    | `provaif`   | Nome do banco (criado automaticamente)                         |
| `DB_LOG`     | `false`     | `true` mostra no console o SQL gerado                          |
| `DB_ALTER`   | `false`     | `true` usa `sync({ alter: true })` para ajustar tabelas existentes |
| `CORS_ORIGEM` | *(vazio)* | Origens autorizadas a chamar a API, separadas por vírgula. Vazio = `http://localhost` e `http://127.0.0.1` em **qualquer porta** (o Vite muda para 5174, 5175... se a 5173 estiver ocupada). Em produção, defina o domínio real |
| `JWT_SEGREDO` | *(vazio)* | Segredo que assina os tokens. **Obrigatório em produção** (`NODE_ENV=production` não sobe sem ele). Em desenvolvimento usa um valor fixo e avisa no console |
| `JWT_EXPIRA_EM` | `8h` | Validade do token (`30m`, `8h`, `7d`...) |

### Execução
Pré-requisito: um servidor MariaDB rodando e acessível com as credenciais do `.env`.

```bash
npm start --prefix backend
```

| Script  | Ação                                                 |
|---------|------------------------------------------------------|
| `start` | Inicia o servidor (`node index.js`)                  |
| `dev`   | Inicia com reinício automático (`node --watch`)      |
| `migrar:html` | Migração única: muda `alternativas.texto` para TEXT e converte enunciados/alternativas antigos (texto simples) em HTML. Pode ser executada de novo sem efeito |

### Models (`backend/models/`)
Os models seguem o DER do sistema. Todas as tabelas têm nome no plural, sem colunas `created_at`/`updated_at` (`timestamps: false`). As chaves primárias são `VARCHAR(50)` preenchidas automaticamente com UUID v4, exceto em `cabecalhos`, que usa `INT AUTO_INCREMENT`.

No código, os atributos ficam em *camelCase* e as colunas no banco em *snake_case* (ex.: `dataCriacao` → `data_criacao`, `usuarioId` → `usuarios_id`).

| Model              | Tabela                | Colunas                                                                                                  |
|--------------------|-----------------------|----------------------------------------------------------------------------------------------------------|
| `Usuario`          | `usuarios`            | `id`, `nome`, `email`, `username`, `password`, `status` (INT)                                             |
| `Questao`          | `questoes`            | `id`, `tipo`, `acesso`, `nivel` (INT), `assunto`, `texto` (LONGTEXT), `usuarios_id`                       |
| `Alternativa`      | `alternativas`        | `id`, `texto` (TEXT ⚠️), `correta` (INT), `ordem` (INT) ⚠️, `questoes_id`                                |
| `Avaliacao`        | `avaliacoes`          | `id`, `descricao` (VARCHAR 45), `data_criacao` (DATE), `total_pontos` (DECIMAL 10,2), `usuarios_id`      |
| `AvaliacaoQuestao` | `avaliacoes_questoes` | `id`, `pontos` (DECIMAL 10,2), `ordem` (INT) ⚠️, `avaliacoes_id`, `questoes_id`                           |
| `Cabecalho`        | `cabecalhos`          | `id` (INT), `instituicao`, `campos`, `curso`, `disciplina`, `professor`, `turma`, `data` (DATE), `instrucoes` (LONGTEXT), `avaliacoes_id` |

As colunas comuns podem ficar vazias (NULL). As chaves estrangeiras são obrigatórias (NOT NULL).

> ⚠️ **Diferença em relação ao DER:** `avaliacoes_questoes.ordem` (INT, NOT NULL, padrão 0) **não existe no DER**. Ela guarda a posição da questão na prova (1, 2, 3...). Sem ela, a ordem das questões seria aleatória, pois o `id` é um UUID. Foi criada com `sync({ alter: true })`; em um banco novo é criada automaticamente.
>
> ⚠️ Pelo mesmo motivo, `alternativas.ordem` (INT, NOT NULL, padrão 0) **também não existe no DER**: guarda a posição da alternativa (1 = a, 2 = b...), para que as alternativas apareçam sempre na ordem cadastrada.
>
> ⚠️ `alternativas.texto` é **VARCHAR(250) no DER** e foi alterada para **TEXT**, para guardar alternativas com formatação, tabelas e imagens (HTML).

**Significado dos campos inteiros** (constantes exportadas pelos models):

| Campo | Valores |
|-------|---------|
| `questoes.tipo` (`TIPO_QUESTAO`) | `1` objetiva · `2` discursiva |
| `questoes.acesso` (`ACESSO_QUESTAO`) | `0` privada (só o autor usa) · `1` pública (outros professores podem usar em suas provas) |
| `questoes.nivel` (`NIVEL_QUESTAO`) | `1` fácil · `2` médio · `3` difícil |
| `alternativas.correta` | `1` correta · `0` incorreta |
| `usuarios.status` (`STATUS_USUARIO`) | `1` ativo · `0` inativo |

- `avaliacoes.total_pontos` (padrão 0) é **calculado** pelo `avaliacaoService`: a cada questão adicionada, removida ou com pontos alterados, ele soma os `pontos` de `avaliacoes_questoes`.
- O DER permite vários cabeçalhos por avaliação; o sistema usa **um** (o primeiro), criado ou atualizado junto com a avaliação.

#### Relacionamentos (`models/index.js`)

| Relação                          | Tipo | Alias (lado "um" → lado "muitos")   | Ao apagar o "pai"                  |
|----------------------------------|------|-------------------------------------|------------------------------------|
| Usuário → Questões               | 1:N  | `usuario.questoes` / `questao.usuario` | **Bloqueia** se houver questões  |
| Usuário → Avaliações             | 1:N  | `usuario.avaliacoes` / `avaliacao.usuario` | **Bloqueia** se houver avaliações |
| Questão → Alternativas           | 1:N  | `questao.alternativas` / `alternativa.questao` | Apaga as alternativas      |
| Avaliação → Cabeçalhos           | 1:N  | `avaliacao.cabecalhos` / `cabecalho.avaliacao` | Apaga os cabeçalhos        |
| Avaliação ↔ Questões             | N:N  | `avaliacao.questoes` / `questao.avaliacoes` (via `avaliacoes_questoes`) | Apagar a avaliação remove os vínculos; apagar uma questão usada em alguma avaliação é **bloqueado** |

- O par (`avaliacoes_id`, `questoes_id`) é único: a mesma questão não pode entrar duas vezes na mesma avaliação.
- A pontuação da questão na avaliação fica na tabela associativa. Para gravar, use `avaliacao.addQuestao(questao, { through: { pontos: 2.5 } })`. Para ler, use `questao.AvaliacaoQuestao.pontos` ao incluir as questões de uma avaliação.
- Também há acesso direto à tabela associativa pelos aliases `avaliacao.itens` e `questao.itens`.
- Os aliases têm singular e plural definidos à mão, porque o Sequelize usa regras do inglês para pluralizar. Por isso os métodos gerados ficam em português: `getQuestoes`, `addQuestao`, `getAlternativas`, `countAvaliacoes` etc.

Exemplo de consulta de uma avaliação completa:

```js
import { Avaliacao, Usuario, Cabecalho, Questao, Alternativa } from './models/index.js'

const avaliacao = await Avaliacao.findByPk(id, {
    include: [
        { model: Usuario, as: 'usuario' },
        { model: Cabecalho, as: 'cabecalhos' },
        { model: Questao, as: 'questoes', include: [{ model: Alternativa, as: 'alternativas' }] },
    ],
})
```

> **Novos models:** crie o arquivo em `models/`, importe-o e defina seus relacionamentos em `models/index.js`. Para que o `sync()` altere tabelas que já existem, rode uma vez com `DB_ALTER=true`.

### Organização em camadas
Cada requisição percorre as camadas abaixo. Cada camada só conhece a seguinte:

```
index.js → routes/ → controllers/ → validators/  (valida e normaliza a entrada)
                                  → services/    → models/ → banco de dados
                 erros (HttpError, Sequelize) → middlewares/errorHandler.js
```

| Camada         | Responsabilidade                                                                    |
|----------------|-------------------------------------------------------------------------------------|
| `routes/`      | Associar método + URL ao controller. Sem lógica.                                     |
| `controllers/` | Ler `req` (params, query, body), chamar validator e service, escolher status e JSON. |
| `validators/`  | Conferir campos obrigatórios, formatos e tamanhos. Lança `HttpError(400)` com `detalhes` por campo. |
| `services/`    | Regras de negócio (ex.: e-mail único) e uso dos models. Lança `HttpError(404/409)`.  |
| `models/`      | Estrutura das tabelas, relacionamentos e hooks (ex.: hash da senha).                |

**Padrão das respostas de erro** (todas as rotas):

```json
{ "erro": "Dados inválidos.", "detalhes": { "email": "Informe um e-mail válido." } }
```

| Status | Quando                                                                                 |
|--------|----------------------------------------------------------------------------------------|
| 400    | Dados inválidos (com `detalhes` por campo) ou JSON malformado                          |
| 401    | Sem login: token ausente, inválido, vencido ou de usuário desativado; ou credenciais erradas no login |
| 403    | Logado, mas sem permissão (ex.: alterar a conta de outro usuário; login de conta desativada) |
| 404    | Registro ou rota não encontrados                                                       |
| 409    | Conflito: e-mail/username já cadastrado, ou remoção bloqueada por registros vinculados |
| 500    | Erro inesperado (detalhes só no console do servidor)                                   |

### Autenticação (`/auth`)
A API usa **JWT** (JSON Web Token). O login devolve um token, que o frontend envia em todas as chamadas seguintes no cabeçalho:

```
Authorization: Bearer <token>
```

| Método | Rota          | Login? | Descrição                                                                 | Sucesso |
|--------|---------------|--------|---------------------------------------------------------------------------|---------|
| `POST` | `/auth/login` | não    | `{ "login": "<e-mail ou username>", "password": "..." }`. Não diferencia maiúsculas no login | `200` + `{ token, usuario }` |
| `GET`  | `/auth/me`    | sim    | Dados do usuário dono do token                                            | `200` + usuário |

- Usuário inexistente e senha errada devolvem a **mesma** mensagem (`401`), para não revelar quais contas existem.
- Conta desativada não consegue entrar (`403`).
- O token guarda só o id do usuário (`sub`) e vence conforme `JWT_EXPIRA_EM`. Token vencido devolve *"Sua sessão expirou"*.
- **Middleware `autenticar`** (`middlewares/autenticar.js`): valida o token, carrega o usuário e o coloca em `req.usuario`. Se o usuário foi desativado ou removido depois do login, o token deixa de valer na hora.
- **Middleware `somenteProprioUsuario`**: usado depois de `autenticar`, só deixa passar se o `:id` da rota for o do usuário logado (`403` caso contrário).

Para proteger uma rota nova, basta incluir `autenticar` antes do controller (ou `router.use(autenticar)` para o arquivo de rotas todo).

### API de usuários (`/usuarios`)
Usuários são os professores que usam o sistema.

| Método   | Rota                   | Login? | Descrição                                                   | Sucesso |
|----------|------------------------|--------|-------------------------------------------------------------|---------|
| `POST`   | `/usuarios`            | não    | Cadastra um usuário (status inicial `1` = ativo)            | `201` + usuário |
| `GET`    | `/usuarios`            | sim    | Lista em ordem de nome. Filtros: `?busca=` (nome, e-mail ou username) e `?status=` (`0` ou `1`) | `200` + lista |
| `GET`    | `/usuarios/:id`        | sim    | Busca um usuário                                            | `200` + usuário |
| `PUT`    | `/usuarios/:id`        | só a própria conta | Atualiza **só os campos enviados** (`nome`, `email`, `username`, `password`) | `200` + usuário |
| `PATCH`  | `/usuarios/:id/status` | só a própria conta | Ativa ou desativa: `{ "status": 1 }` ou `{ "status": 0 }`   | `200` + usuário |
| `DELETE` | `/usuarios/:id`        | só a própria conta | Remove. Retorna `409` se o usuário tiver questões ou avaliações; nesse caso, desative-o | `204` |

### Painel (`/painel`)

| Método | Rota             | Login? | Descrição | Sucesso |
|--------|------------------|--------|-----------|---------|
| `GET`  | `/painel/resumo` | sim    | Dados da tela principal do usuário logado: `totalQuestoes`, `totalAvaliacoes` e `ultimasAvaliacoes` (as 5 mais recentes por `dataCriacao`) | `200` |

### API de avaliações (`/avaliacoes`)
Todas as rotas exigem login. Cada professor só enxerga as **próprias** avaliações; a de outro professor responde `404`, como se não existisse.

| Método   | Rota                                   | Descrição | Sucesso |
|----------|----------------------------------------|-----------|---------|
| `GET`    | `/avaliacoes?busca=`                   | Lista as avaliações do usuário (mais recentes primeiro), com `totalQuestoes` | `200` + lista |
| `POST`   | `/avaliacoes`                          | Cria. Corpo: `{ descricao, dataCriacao?, cabecalho? }`. Sem `dataCriacao`, usa hoje | `201` + avaliação completa |
| `GET`    | `/avaliacoes/:id`                      | Avaliação completa (ver formato abaixo) | `200` |
| `PUT`    | `/avaliacoes/:id`                      | Atualiza só o que foi enviado (inclusive campos soltos do cabeçalho) | `200` + avaliação completa |
| `DELETE` | `/avaliacoes/:id`                      | Exclui a avaliação, o cabeçalho e os vínculos com as questões (as questões continuam no banco) | `204` |
| `POST`   | `/avaliacoes/:id/duplicar`             | Cria uma cópia ("Cópia de ...") com a data de hoje, o mesmo cabeçalho e as mesmas questões/pontos | `201` + cópia |
| `POST`   | `/avaliacoes/:id/questoes`             | Adiciona uma questão: `{ questaoId, pontos }`. Entra no fim da prova. `409` se já estiver na prova; `404` se a questão for privada de outro professor | `201` + avaliação completa |
| `PUT`    | `/avaliacoes/:id/questoes/:questaoId`  | Altera os pontos: `{ pontos }` | `200` + avaliação completa |
| `DELETE` | `/avaliacoes/:id/questoes/:questaoId`  | Remove a questão da prova (não apaga a questão) | `200` + avaliação completa |
| `PUT`    | `/avaliacoes/:id/ordem`                | Reordena: `{ questoes: [id1, id2, ...] }` com **todos** os ids da prova, na nova ordem | `200` + avaliação completa |

As operações em questões devolvem a avaliação completa já atualizada (com o novo `totalPontos`), para o frontend só redesenhar a tela.

**Formato da avaliação completa:**

```json
{
  "id": "…", "descricao": "Prova 1", "dataCriacao": "2026-10-10", "totalPontos": 10, "usuarioId": "…",
  "cabecalho": { "instituicao": "…", "campos": "…", "curso": "…", "disciplina": "…", "professor": "…",
                 "turma": "…", "data": "2026-10-20", "instrucoes": "…" },
  "questoes": [
    { "id": "…", "tipo": 1, "nivel": 1, "acesso": 0, "assunto": "…", "texto": "…",
      "alternativas": [{ "id": "…", "texto": "…", "correta": 1 }],
      "pontos": 3.5, "ordem": 1, "propria": true }
  ]
}
```

**Validação** (`validators/avaliacaoValidator.js`):

| Campo | Regra |
|-------|-------|
| `descricao` | Obrigatória, até **45** caracteres (limite do DER) |
| `dataCriacao`, `cabecalho.data` | Data válida no formato `AAAA-MM-DD` |
| `cabecalho.instituicao`, `campos`, `curso`, `disciplina`, `professor`, `turma` | Opcionais, até 100 caracteres. Vazio vira `NULL` |
| `cabecalho.instrucoes` | Opcional, até 5000 caracteres |
| `pontos` | Número ≥ 0 (aceita `"6,5"`), arredondado para 2 casas |

Erros de campos do cabeçalho vêm com o nome completo, ex.: `"cabecalho.turma"`.

### API de questões (`/questoes`)
Todas as rotas exigem login. Cada professor **vê** as próprias questões e as **públicas** de outros professores; só o **autor** edita ou exclui (`403` para os demais; questão privada de outro professor responde `404`).

| Método   | Rota                    | Descrição | Sucesso |
|----------|-------------------------|-----------|---------|
| `GET`    | `/questoes`             | Lista as questões disponíveis (ver filtros abaixo) | `200` |
| `POST`   | `/questoes`             | Cria uma questão com suas alternativas | `201` + questão |
| `GET`    | `/questoes/assuntos`    | Assuntos já usados nas questões disponíveis (para autocompletar) | `200` + lista de textos |
| `GET`    | `/questoes/:id`         | Busca uma questão | `200` + questão |
| `PUT`    | `/questoes/:id`         | Atualiza a questão **completa**; as alternativas são **substituídas** pelas enviadas. Só o autor | `200` + questão |
| `DELETE` | `/questoes/:id`         | Exclui (e as alternativas). Só o autor. `409` se a questão estiver em alguma avaliação | `204` |
| `POST`   | `/questoes/:id/copiar`  | Copia uma questão disponível (própria ou pública) para o banco do usuário, como **privada** | `201` + cópia |

**Filtros de `GET /questoes`:**

| Parâmetro | Descrição |
|-----------|-----------|
| `busca` | Procura no assunto e no enunciado |
| `tipo`, `nivel` | Códigos de tipo (1–2) e nível (1–3) |
| `origem` | `minhas` (só as próprias) ou `publicas` (só as públicas de **outros** professores). Sem ela, todas as disponíveis. `minhas=1` também é aceito |
| `pagina`, `porPagina` | Paginação (`porPagina` padrão 20, máximo 100). **Com `pagina`**, a resposta é `{ itens, total, pagina, porPagina }`; **sem**, é um array com até 200 questões (usado pelo seletor das avaliações) |

Ordenação: por assunto. Cada questão vem com `alternativas` (na ordem), `usos` (em quantas avaliações está) e `propria` (se é do usuário logado).

**Validação** (`validators/questaoValidator.js`):

| Campo | Regra |
|-------|-------|
| `tipo` | Obrigatório: `1` objetiva ou `2` discursiva |
| `nivel` | Obrigatório: `1` fácil, `2` médio ou `3` difícil |
| `acesso` | `0` privada (padrão) ou `1` pública |
| `assunto` | Obrigatório, até 100 caracteres |
| `texto` (enunciado) | Obrigatório (texto ou imagem), **HTML**, até 20.000 caracteres de texto visível |
| `alternativas` | **Objetiva:** de 2 a 10, cada uma com conteúdo **HTML** (texto ou imagem; até 1.000 caracteres de texto visível) e **exatamente uma** `correta`. A ordem do array é a ordem a), b), c)... **Discursiva:** ignoradas |

Erros de alternativas vêm por posição (`"alternativas.0"`, `"alternativas.1"`...) e o geral em `"alternativas"`.

> Editar uma questão que já está em avaliações altera também essas provas (a avaliação guarda a referência, não uma cópia).

### Conteúdo rico (enunciados e alternativas)
Enunciados e alternativas são guardados como **HTML**. O backend aceita HTML ou texto simples; texto simples (sem tags conhecidas) é convertido: linha em branco = novo parágrafo, quebra simples = `<br>`.

**Limpeza do HTML** (`utils/html.js`, com `sanitize-html`), feita sempre ao salvar — importante porque questões públicas aparecem para outros professores:

| Permitido | Removido |
|-----------|----------|
| Parágrafos e quebras (`p`, `br`), `strong`, `em`, `u`, `s`, `sub`, `sup` | `script`, `iframe`, `style`, links, títulos, atributos `on*` (onclick, onerror...), `style`, `class` |
| Listas (`ul`, `ol`, `li`) e tabelas (`table`, `thead`, `tbody`, `tr`, `th`, `td`, com `colspan`/`rowspan`) | Imagens externas, `data:` (base64) e `javascript:` |
| Imagens (`img` com `src`, `alt`, `width`) **somente** se o `src` for `/uploads/imagens/<uuid>.<png\|jpg\|gif\|webp>` | Parágrafos vazios no fim do conteúdo |

### Envio de imagens (`/uploads`)

| Método | Rota | Login? | Descrição | Sucesso |
|--------|------|--------|-----------|---------|
| `POST` | `/uploads/imagens` | sim | `multipart/form-data` com o arquivo no campo `imagem` | `201` + `{ "url": "/uploads/imagens/<uuid>.png" }` |
| `GET`  | `/uploads/imagens/<arquivo>` | não | Serve a imagem (cabeçalho `X-Content-Type-Options: nosniff`, cache de 30 dias) | `200` |

- Formatos: **PNG, JPG, GIF e WebP**, até **5 MB**. O tipo é descoberto pelos **bytes iniciais** do arquivo (não pelo nome nem pelo tipo informado pelo navegador). **SVG não é aceito** (pode conter scripts).
- O arquivo recebe um nome aleatório (UUID) e fica em `backend/uploads/imagens/` — pasta **fora do Git**: faça backup dela junto com o banco.
- O HTML guarda o endereço **relativo** (`/uploads/imagens/...`); o frontend completa com o endereço da API ao exibir.
- Imagens enviadas e depois removidas do texto continuam na pasta (ainda não há limpeza automática de arquivos órfãos).

Exemplo de cadastro:

```json
POST /usuarios
{ "nome": "Ana Ribeiro", "email": "ana@escola.edu.br", "username": "ana.ribeiro", "password": "segredo123" }
```

Regras de validação:

| Campo      | Regra                                                                                  |
|------------|----------------------------------------------------------------------------------------|
| `nome`     | Obrigatório, até 100 caracteres (espaços nas pontas são removidos)                     |
| `email`    | Obrigatório, formato de e-mail, até 100 caracteres, **único**. Guardado em minúsculas  |
| `username` | Obrigatório, 3 a 100 caracteres, só letras, números, `.`, `-` e `_`, **único**. Guardado em minúsculas |
| `password` | Obrigatória, 8 a 72 caracteres (limite do bcrypt)                                      |

**Segurança da senha:**
- O hook `beforeSave` do model `Usuario` grava sempre o **hash bcrypt** (10 rounds), tanto no cadastro quanto na troca de senha.
- A senha **nunca é retornada**: o `defaultScope` exclui a coluna e o `toJSON` a remove das respostas.
- No login, o usuário é carregado com `Usuario.scope('comSenha')` e a senha é conferida com `usuario.conferirSenha(senhaDigitada)`.
- `email` e `username` têm índices únicos no banco (`usuarios_email_unique` e `usuarios_username_unique`), além da verificação no service. Assim o 409 vem com a mensagem do campo e, mesmo em dois cadastros simultâneos, o banco impede a duplicação.

O `status` usa as constantes `STATUS_USUARIO` exportadas por `models/Usuario.js`: `ATIVO = 1` e `INATIVO = 0`.

### Pontos ainda ausentes
- **Perfis de acesso** (ex.: administrador). Hoje todo usuário logado pode listar e ver os dados de qualquer outro usuário, mas só altera a própria conta.
- Revogação de tokens (logout no servidor). O "Sair" apenas apaga o token no navegador; o token continua válido até vencer.
- Limite de tentativas de login (proteção contra força bruta).
- Limpeza de imagens órfãs (enviadas e depois removidas do enunciado ou de questões excluídas).
- Testes (o script `test` é apenas o placeholder padrão do npm).

## 4. Frontend

### Tecnologias
- **Vue 3** (`^3.5`) com Single File Components (`.vue`) e `<script setup>`.
- **Vue Router 5** para navegação client-side em modo *history* (`createWebHistory`).
- **Vite 8** como servidor de desenvolvimento e bundler.
- **vite-plugin-vue-devtools** para depuração no navegador durante o desenvolvimento.
- **Bootstrap 5.3** (via SCSS, compilado com **sass**) para o visual, e **bootstrap-vue-next** para os componentes Vue (`BNavbar`, `BCard`, `BForm`, `BAccordion`...).
- **bootstrap-icons** para os ícones (`<i class="bi bi-...">`).
- Node exigido: `^22.18.0 || >=24.12.0`.

### Fluxo de inicialização
1. `index.html` (`lang="pt-BR"`) carrega `/src/main.js` como módulo.
2. `main.js` importa o tema (`styles/main.scss`), o CSS do bootstrap-vue-next e os ícones; liga o cliente da API à sessão (`configurarAutenticacao`); cria a aplicação, registra o `router` e monta em `#app`.
3. `App.vue` envolve tudo em `<BApp>` (necessário para `useToast`/`useModal`) e escolhe o layout pela rota (`meta.layout`):
   - `publico`: `SiteNavbar` no topo, `<RouterView />` no meio e `SiteFooter` no rodapé.
   - `app`: `AppLayout`, com menu lateral, barra superior com o usuário logado e o conteúdo da página.

### Rotas (`router/index.js`)

| Caminho  | Nome    | Página          | Descrição                                       |
|----------|---------|-----------------|-------------------------------------------------|
| `/`      | `home`  | `HomeView`      | Site público de divulgação                       |
| `/login` | `login` | `LoginView`     | Login do professor (carregada sob demanda). Aceita `?usuario=` para já vir preenchido |
| `/cadastro` | `cadastro` | `CadastroView` | Cadastro de professor (carregada sob demanda) |
| `/painel` | `painel` | `PainelView` | Tela principal da área logada (exige login) |
| `/questoes` | `questoes` | `QuestoesView` | Banco de questões (exige login) |
| `/questoes/nova` | `questao-nova` | `QuestaoFormView` | Nova questão (exige login) |
| `/questoes/:id/editar` | `questao-editar` | `QuestaoFormView` | Edição de questão (exige login; recebe `id` como prop) |
| `/avaliacoes` | `avaliacoes` | `AvaliacoesView` | Lista de avaliações (exige login) |
| `/avaliacoes/nova` | `avaliacao-nova` | `AvaliacaoNovaView` | Nova avaliação (exige login) |
| `/avaliacoes/:id` | `avaliacao` | `AvaliacaoEditarView` | Edição da avaliação (exige login; recebe `id` como prop) |
| `/avaliacoes/:id/imprimir` | `avaliacao-imprimir` | `AvaliacaoImprimirView` | Prova para imprimir, sem menus (layout `impressao`) |
| qualquer outro | — | —               | Redireciona para `/`                            |

- Cada rota define `meta.titulo` (título da aba) e `meta.layout` (`publico`, `app` ou `impressao`).
- **Proteção de rotas** (`router.beforeEach`):
  - `meta.requerLogin`: sem login, vai para `/login?redirect=<página>`. Se havia uma sessão com token vencido, acrescenta `&expirou=1`.
  - `meta.somenteVisitante` (login e cadastro): quem já está logado vai direto para o painel.
- Depois do login, `destinoAposLogin()` leva para o `?redirect=` (só caminhos internos, começando com `/`; endereços externos são ignorados) ou para o painel.
- Os links do menu apontam para âncoras da página inicial (`/#recursos`, `/#faq`...). O `scrollBehavior` rola suavemente até a seção, e o CSS `scroll-margin-top` evita que a navbar fixa cubra o título.
- Ao trocar de página, a rolagem volta ao topo com `behavior: 'instant'`. Com a rolagem suave do Bootstrap, ela era interrompida no meio quando a nova página era montada.

### Tema visual (`styles/main.scss`)
As variáveis do Bootstrap são sobrescritas antes de importá-lo, então `primary`, `dark`, `light` etc. já saem nos tons de azul em todos os componentes:

| Variável     | Cor       | Uso                                   |
|--------------|-----------|---------------------------------------|
| `$primary`   | `#1a56db` | Botões, links, destaques              |
| `$dark`      | `#0b1f44` | Navbar, rodapé, seção de depoimentos  |
| `$light`     | `#f1f6ff` | Fundos de seção azul-claro            |
| `$info`      | `#0ea5e9` | Avisos informativos                   |

Classes próprias: `bg-azul-escuro`, `bg-azul-claro`, `bg-gradiente-azul`, `texto-azul-claro`, `icone-recurso` e `card-hover`.

O `vite.config.js` silencia os avisos de depreciação do Sass que vêm do SCSS do próprio Bootstrap (`@import` e funções globais).

### Site público (`HomeView`)
Página de divulgação montada a partir das seções em `components/home/`. **Os textos, números e depoimentos são fictícios** e devem ser revisados antes da publicação. Os recursos descritos seguem o DER: banco de questões, assunto e nível, montagem de avaliações com pontuação, cabeçalho personalizado, questões públicas/privadas e prova pronta para imprimir.

### Comunicação com a API (`services/`)
- `api.js` concentra as chamadas HTTP: `api.get/post/put/patch/delete(caminho, corpo)`.
  - URL base em `VITE_API_URL` (padrão `http://localhost:3000`).
  - Envia e recebe JSON e tem **tempo limite de 15 s** por requisição.
  - Em caso de erro lança `ApiError` com `status`, `message` (campo `erro` da API) e `detalhes` (erros por campo). Falha de rede ou tempo esgotado viram `ApiError` com `status = 0` e uma mensagem amigável.
- Cada recurso da API tem seu arquivo de service (ex.: `usuarioService.js` com `cadastrarUsuario`). As telas chamam os services e nunca usam `fetch` diretamente.

| Variável       | Padrão                  | Descrição               |
|----------------|-------------------------|-------------------------|
| `VITE_API_URL` | `http://localhost:3000` | Endereço da API (backend) |

### Cadastro (`CadastroView`)
- Campos: nome completo, e-mail, nome de usuário, senha e confirmação da senha (com botão para mostrar/ocultar).
- **Validação no navegador** com as mesmas regras do backend (`validators/usuarioValidator.js`), mais a confirmação de senha. Os campos só ficam vermelhos depois da primeira tentativa de envio.
- Enquanto o usuário não edita o campo *nome de usuário*, ele é **sugerido a partir do e-mail** (parte antes do `@`).
- Indicador de **força da senha** (tamanho, maiúsculas/minúsculas, números e símbolos). É só informativo; a regra obrigatória é o mínimo de 8 caracteres.
- Envia `POST /usuarios`. Se a API devolver erros por campo (400 ou 409, ex.: e-mail já cadastrado), eles aparecem no campo correspondente e somem quando o campo é editado.
- No sucesso, mostra um aviso (toast) e leva para `/login?usuario=<username>`, já com o usuário preenchido.
- Os botões *Criar conta* (navbar), *Criar conta grátis* (topo e chamada final), o link do rodapé e o *Cadastre-se* do login levam para esta tela.

### Sessão (`stores/auth.js`)
Store simples (sem Pinia), compartilhado por todo o app:

| Item | Descrição |
|------|-----------|
| `auth.logado` | `computed`: há usuário e o token não venceu |
| `auth.usuario` | `computed`: dados do usuário logado (`nome`, `email`, `username`...) |
| `auth.entrar(login, senha, lembrar)` | Chama `POST /auth/login` e guarda token + usuário |
| `auth.sair()` | Apaga a sessão |
| `auth.recarregarUsuario()` | Busca de novo os dados em `GET /auth/me` |

- **Lembrar de mim** marcado: a sessão fica no `localStorage` e sobrevive ao fechar o navegador. Desmarcado: fica no `sessionStorage` e some ao fechar a aba. A chave é `provaif.sessao`.
- Ao abrir o site, uma sessão salva com token vencido é descartada (a data de expiração é lida do próprio JWT).
- O `api.js` envia o token em todas as chamadas. Se a API responder **401** a uma chamada com token (sessão vencida, token inválido, usuário desativado), a sessão é encerrada e o usuário volta para `/login?expirou=1`.

### Login (`LoginView`)
- Campos *e-mail ou usuário* e *senha* (com botão para mostrar/ocultar), *lembrar de mim*, *esqueci minha senha* e *cadastre-se*.
- Os campos só são marcados como inválidos depois da primeira tentativa de envio.
- Envia para `POST /auth/login`. Erros da API (credenciais incorretas, conta desativada, servidor fora do ar) aparecem em um alerta, e o campo de senha é limpo.
- Mostra um aviso quando chega por redirecionamento: *"Entre na sua conta para acessar essa página"* (`?redirect=`) ou *"Sua sessão expirou"* (`?expirou=1`).
- *Esqueci minha senha* ainda mostra um aviso de "em breve". *Cadastre-se* leva para `/cadastro`.

### Área logada (`AppLayout` + `PainelView`)
- **Menu lateral** (`AppMenu`) fixo em telas grandes; no celular/tablet vira uma gaveta (`BOffcanvas`) aberta pelo botão ☰ e fechada ao escolher um item. Itens: *Início* (painel), *Questões*, *Avaliações* e, ainda como "em breve", *Meu perfil*. Novos itens são adicionados no array `itens` de `AppMenu.vue` (sem `to`, aparecem como "em breve"; `caminho` faz o item ficar ativo também nas sub-páginas, ex.: `/avaliacoes/123`).
- **Barra superior** com as iniciais, nome e @username do usuário e um menu com *Meu perfil* (em breve) e **Sair**.
- **Painel** (tela principal), com dados de `GET /painel/resumo`:
  - Saudação conforme o horário (*Bom dia/Boa tarde/Boa noite*) e data de hoje.
  - Atalhos *Nova questão* e *Nova avaliação*.
  - Cartões com o total de questões e de avaliações, e os dados da conta.
  - Lista das últimas avaliações, cada uma levando à edição, e o link *Ver todas* (ou um convite para criar a primeira).
  - *Primeiros passos*, que vão sendo marcados conforme o professor cria questões e avaliações.
  - Se a API falhar, mostra o erro com o botão *Tentar de novo*.
- No site público, quem está logado vê **Acessar o painel** no lugar de *Criar conta*/*Entrar*.

### Banco de questões
- **Lista** (`QuestoesView`): filtros de busca (assunto/enunciado), tipo, nível e origem (*Todas*, *Minhas*, *De outros*), com 20 questões por página. Cada questão mostra assunto, tipo, nível e o enunciado (expansível, com as alternativas e a correta).
  - Nas **próprias**: selo *Pública*/*Privada*, em quantas provas está e as ações *Editar*, *Duplicar* e *Excluir* (com confirmação; se a questão estiver em provas, avisa que é preciso removê-la delas antes).
  - Nas **de outros professores** (selo *compartilhada*): *Copiar para minhas*, que cria uma cópia privada editável.
- **Formulário** (`QuestaoFormView`, para nova e edição):
  - Tipo (*Objetiva*/*Discursiva*), assunto (com sugestões dos assuntos já usados), nível (*Fácil*/*Médio*/*Difícil*) e **enunciado com editor de texto rico** (ver "Editor de texto rico" abaixo).
  - **Alternativas** (`AlternativasEditor`, só na objetiva): começa com 4; de 2 a 10; cada uma com o editor rico em modo compacto; clique na letra para marcar a correta; botões para subir, descer e remover.
  - Chave *Compartilhar com outros professores* (questão pública).
  - **Pré-visualização** ao lado, mostrando como a questão sai na prova.
  - *Salvar e cadastrar outra* (só na criação) mantém tipo, nível, assunto e acesso e limpa o resto, para cadastrar várias questões em sequência.
  - Na edição de uma questão usada em provas, avisa que as alterações aparecerão nelas. Questões de outros professores não abrem para edição.
  - Validação local com as mesmas regras do backend; os erros somem ao corrigir o campo. Pergunta antes de sair com alterações não salvas (inclusive ao ir para outra questão).
- No seletor de questões das avaliações, o link *Não encontrou? Criar nova questão* (e o botão do estado vazio) troca o seletor pelo modal de criação.
- A tela de questão e o modal de criação na prova usam os mesmos componentes (`QuestaoCampos`, `AlternativasEditor` e `QuestaoPrevia`).

### Editor de texto rico (`components/editor/`)
- **`EditorRico`** (baseado no **TipTap 3**), com barra de ferramentas:
  - **Parágrafos**: Enter cria um novo parágrafo; Shift+Enter quebra a linha.
  - Negrito, itálico, sublinhado, tachado, **sobrescrito** (x²) e **subscrito** (H₂O).
  - **Listas** com marcadores e numeradas (também pelos atalhos `- ` e `1. `).
  - **Tabelas** (só no modo completo, usado no enunciado): insere 3×3 com linha de cabeçalho; com o cursor na tabela aparecem as ações de cabeçalho, adicionar/remover linha e coluna e remover a tabela. Tabela dentro de tabela não é permitida (nem colando).
  - **Imagens**: pelo botão, colando (Ctrl+V) ou arrastando o arquivo. A imagem é enviada para `POST /uploads/imagens` e inserida no texto; formatos e tamanho são conferidos antes do envio.
  - Desfazer/refazer.
  - Os recursos que o backend não aceita (títulos, citações, código, links) ficam desligados.
  - Modo `compacto` (alternativas): sem tabelas e com área menor.
- **`ConteudoRico`** exibe o HTML formatado na lista de questões (ao expandir), na pré-visualização e na prova impressa. Antes de exibir, o HTML passa de novo por uma limpeza (**DOMPurify**) e os endereços das imagens são completados com o endereço da API (`utils/conteudo.js`).
- Estilos do conteúdo (parágrafos, listas, tabelas com bordas, imagens até a largura da página) ficam na classe global `.conteudo-rico` (`styles/main.scss`) e valem igual no editor, na tela e na impressão.
- Na lista de questões recolhida aparece só o texto, com selos indicando que o enunciado tem **imagem** e/ou **tabela**.

### Avaliações
- **Lista** (`AvaliacoesView`): busca pela descrição enquanto digita; cada item mostra data, nº de questões e total de pontos, com as ações *Editar*, *Imprimir*, *Duplicar* e *Excluir* (com confirmação).
- **Nova** (`AvaliacaoNovaView`): descrição (contador de 45 caracteres), data de criação (hoje) e o cabeçalho, com o nome do professor já preenchido. Ao salvar, abre a edição para escolher as questões.
- **Edição** (`AvaliacaoEditarView`):
  - Seções empilhadas: **Dados da avaliação** no topo e **Questões da prova** logo abaixo.
  - *Dados da avaliação* aparece como um resumo (descrição, datas, campos do cabeçalho e instruções; campos vazios como "não informado"). O botão *Editar dados* abre o formulário (`AvaliacaoForm`) no próprio card; *Salvar dados* grava e volta ao resumo, *Cancelar* descarta as alterações. Há um indicador de "alterações não salvas" e, ao tentar sair da página com alterações, uma confirmação.
  - *Questões da prova*, numeradas na ordem da prova. Para cada uma: pontos editáveis (salvos ao sair do campo ou com Enter), *subir*/*descer* e *remover da prova*. O total é atualizado na hora.
  - **Criar questão** abre o `NovaQuestaoModal`: os mesmos campos da tela de questão (`QuestaoCampos`), o campo *Pontos nesta prova* e a pré-visualização já com o número que a questão terá na prova. *Criar e adicionar à prova* salva a questão no banco do professor e a coloca no fim da prova. O formulário começa limpo a cada abertura (os pontos da última criação são mantidos) e não fecha ao clicar fora, para não perder o que foi digitado. Se a questão for criada mas não puder entrar na prova, o modal fecha e um aviso orienta a usar *Adicionar do banco* (evita criar a questão duas vezes).
  - *Adicionar do banco* abre o `SeletorQuestoesModal`: busca, filtros de tipo e nível, "só as minhas", pontos padrão para cada questão adicionada, e o selo *Na prova* nas que já foram escolhidas. Questões públicas de outros professores aparecem como *compartilhada*.
  - Ações *Visualizar e imprimir*, *Duplicar* e *Excluir*.
- **Impressão** (`AvaliacaoImprimirView`, layout `impressao`, sem menus): folha A4 com instituição/campus, curso, título, quadro com aluno, nota, disciplina, professor, turma e data, instruções e valor total; questões numeradas com a pontuação; alternativas `a)`, `b)`... nas objetivas e 5 linhas de resposta nas discursivas. A chave *Mostrar gabarito* destaca as alternativas corretas. O botão *Imprimir / salvar PDF* usa a impressão do navegador; a barra de ferramentas não sai no papel e cada questão evita ser quebrada entre páginas.
- Formatação compartilhada (datas, pontos, rótulos de tipo e nível) fica em `utils/formatacao.js`.

### Convenções
- Alias `@` aponta para `frontend/src` (configurado em `vite.config.js` e `jsconfig.json`), permitindo imports como `import X from '@/components/X.vue'`.

### Scripts

```bash
npm run dev --prefix frontend
```

| Script    | Ação                                            |
|-----------|-------------------------------------------------|
| `dev`     | Servidor de desenvolvimento com hot reload      |
| `build`   | Gera a versão de produção em `frontend/dist/`   |
| `preview` | Serve localmente o build de produção            |

### Pontos ainda ausentes
- Recuperação de senha.
- Tela de perfil (já prevista no menu como "em breve").
- Fórmulas matemáticas (LaTeX). Hoje é possível usar sobrescrito/subscrito ou inserir a fórmula como imagem.
- Conteúdo definitivo do site público (textos, números, depoimentos e contato reais).

## 5. Observações sobre o repositório

- O `.gitignore` da raiz vale para todo o repositório (inclusive `backend/`). O `frontend/` também tem o seu próprio `.gitignore`, gerado pelo `create-vue`.
- `node_modules/` e `.idea/` não são versionados. Depois de clonar, instale as dependências de cada projeto:

```bash
npm install --prefix backend
```

```bash
npm install --prefix frontend
```

- Arquivos `.env` são ignorados. Se for preciso documentar variáveis de ambiente, use um `.env.example`.
