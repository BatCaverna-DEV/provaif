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

> **Estágio atual:** o projeto está na fase inicial de scaffolding. O backend responde apenas com uma mensagem fixa e o frontend é o template padrão do `create-vue`, sem rotas definidas. Ainda não há banco de dados, autenticação nem regras de negócio.

## 2. Estrutura de diretórios

```
provaif/
├── README.md               # Descrição curta do projeto
├── LICENSE                 # Licença MIT (Batcaverna-DEV, 2026)
├── sistema.md              # Este documento
├── .idea/                  # Configurações do WebStorm/IntelliJ (local, não versionar)
│
├── backend/                # API do sistema
│   ├── package.json        # Metadados e dependências (express)
│   ├── package-lock.json
│   └── index.js            # Ponto de entrada do servidor Express
│
└── frontend/               # Aplicação web (SPA)
    ├── index.html          # HTML raiz; monta a aplicação em <div id="app">
    ├── vite.config.js      # Configuração do Vite (plugins e alias "@")
    ├── jsconfig.json       # Suporte do editor ao alias "@/*" → "./src/*"
    ├── package.json        # Scripts dev/build/preview e dependências
    ├── public/
    │   └── favicon.ico     # Arquivos estáticos servidos na raiz
    └── src/
        ├── main.js         # Ponto de entrada: cria o app Vue e registra o router
        ├── App.vue         # Componente raiz
        └── router/
            └── index.js    # Definição das rotas (Vue Router, modo history)
```

## 3. Backend

### Tecnologias
- **Node.js** com **ES Modules** (`"type": "module"` no `package.json`, uso de `import`).
- **Express 5** (`^5.2.1`) como framework HTTP.

### Funcionamento atual (`backend/index.js`)
- Cria a instância do Express e escuta na porta fixa `3000` (constante `PORTA`).
- Registra um único middleware com `app.use('/')`, que responde `"Olá, Mundo!"` para **qualquer** método e caminho.

### Execução
Não há script `start`/`dev` configurado; o servidor é iniciado diretamente:

```bash
node backend/index.js
```

### Pontos ainda ausentes
- Rotas da API (ex.: provas, questões, usuários) e separação em camadas (rotas / controllers / serviços / modelos).
- Middleware `express.json()` para receber corpo JSON.
- CORS, necessário para o frontend (porta 5173) acessar a API (porta 3000).
- Persistência (banco de dados) e configuração por variáveis de ambiente (porta, credenciais).
- Testes (o script `test` é apenas o placeholder padrão do npm).

## 4. Frontend

### Tecnologias
- **Vue 3** (`^3.5`) com Single File Components (`.vue`) e `<script setup>`.
- **Vue Router 5** para navegação client-side em modo *history* (`createWebHistory`).
- **Vite 8** como servidor de desenvolvimento e bundler.
- **vite-plugin-vue-devtools** para depuração no navegador durante o desenvolvimento.
- Node exigido: `^22.18.0 || >=24.12.0`.

### Fluxo de inicialização
1. `index.html` carrega `/src/main.js` como módulo.
2. `main.js` cria a aplicação com `createApp(App)`, registra o `router` e monta em `#app`.
3. `App.vue` é o componente raiz (atualmente apenas conteúdo de boas-vindas do template).
4. `router/index.js` define o roteador com a lista de rotas **vazia**.

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
- `App.vue` não contém `<RouterView />`, então as rotas, quando criadas, não serão renderizadas até que ele seja adicionado.
- Pastas usuais ainda não criadas: `src/views/` (páginas), `src/components/` (componentes reutilizáveis), `src/services/` (chamadas à API), `src/assets/`.
- Título da página ainda é o padrão (`Vite App`) e `lang` do HTML está vazio.

## 5. Observações sobre o repositório

- `backend/index.js` já está no *stage* do Git; `backend/package.json`, `backend/package-lock.json` e toda a pasta `frontend/` ainda não foram adicionados.
- Não existe `.gitignore` na raiz nem em `backend/`: `backend/node_modules/` e `.idea/` aparecem como não rastreados e devem ser ignorados. O `frontend/` já possui seu próprio `.gitignore`.
