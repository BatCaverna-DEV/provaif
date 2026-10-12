import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { configurarAutenticacao } from './services/api.js'
import { auth } from './stores/auth.js'

import './styles/main.scss'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Toda chamada à API leva o token; se a API responder 401 (sessão vencida ou
// usuário desativado), encerra a sessão e volta para o login
configurarAutenticacao({
  obterToken: auth.token,
  aoNaoAutorizado: () => {
    auth.sair()
    const atual = router.currentRoute.value
    if (atual.meta.requerLogin) {
      router.push({ name: 'login', query: { redirect: atual.fullPath, expirou: '1' } })
    }
  },
})

const app = createApp(App)

app.use(router)

app.mount('#app')
