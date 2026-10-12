import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { auth } from '@/stores/auth.js'

// meta.layout:          'publico' (site de divulgação), 'app' (área logada) ou 'impressao' (só a página)
// meta.requerLogin:     só acessa logado; senão vai para o login
// meta.somenteVisitante: logado não acessa (login e cadastro); vai para o painel
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { titulo: 'ProvaIF — Crie provas em minutos', layout: 'publico' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { titulo: 'Entrar — ProvaIF', layout: 'publico', somenteVisitante: true },
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: () => import('@/views/CadastroView.vue'),
      meta: { titulo: 'Criar conta — ProvaIF', layout: 'publico', somenteVisitante: true },
    },
    {
      path: '/painel',
      name: 'painel',
      component: () => import('@/views/app/PainelView.vue'),
      meta: { titulo: 'Início — ProvaIF', layout: 'app', requerLogin: true },
    },
    {
      path: '/questoes',
      name: 'questoes',
      component: () => import('@/views/app/QuestoesView.vue'),
      meta: { titulo: 'Banco de questões — ProvaIF', layout: 'app', requerLogin: true },
    },
    {
      path: '/questoes/nova',
      name: 'questao-nova',
      component: () => import('@/views/app/QuestaoFormView.vue'),
      meta: { titulo: 'Nova questão — ProvaIF', layout: 'app', requerLogin: true },
    },
    {
      path: '/questoes/:id/editar',
      name: 'questao-editar',
      component: () => import('@/views/app/QuestaoFormView.vue'),
      props: true,
      meta: { titulo: 'Editar questão — ProvaIF', layout: 'app', requerLogin: true },
    },
    {
      path: '/avaliacoes',
      name: 'avaliacoes',
      component: () => import('@/views/app/AvaliacoesView.vue'),
      meta: { titulo: 'Avaliações — ProvaIF', layout: 'app', requerLogin: true },
    },
    {
      path: '/avaliacoes/nova',
      name: 'avaliacao-nova',
      component: () => import('@/views/app/AvaliacaoNovaView.vue'),
      meta: { titulo: 'Nova avaliação — ProvaIF', layout: 'app', requerLogin: true },
    },
    {
      path: '/avaliacoes/:id',
      name: 'avaliacao',
      component: () => import('@/views/app/AvaliacaoEditarView.vue'),
      props: true,
      meta: { titulo: 'Editar avaliação — ProvaIF', layout: 'app', requerLogin: true },
    },
    {
      path: '/avaliacoes/:id/imprimir',
      name: 'avaliacao-imprimir',
      component: () => import('@/views/app/AvaliacaoImprimirView.vue'),
      props: true,
      meta: { titulo: 'Imprimir avaliação — ProvaIF', layout: 'impressao', requerLogin: true },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    // 'instant' porque o Bootstrap define scroll-behavior: smooth, e a rolagem suave
    // é interrompida quando a nova página é montada
    return { top: 0, behavior: 'instant' }
  },
})

router.beforeEach((to) => {
  const logado = auth.logado.value

  if (to.meta.requerLogin && !logado) {
    const query = { redirect: to.fullPath }
    if (auth.estado.token) {
      // havia sessão, mas o token venceu
      auth.sair()
      query.expirou = '1'
    }
    return { name: 'login', query }
  }
  if (to.meta.somenteVisitante && logado) {
    return { name: 'painel' }
  }
})

router.afterEach((to) => {
  document.title = to.meta.titulo || 'ProvaIF'
})

/**
 * Destino depois do login: o ?redirect= (se for um caminho interno) ou o painel.
 * Caminhos externos ("//site.com", "https://...") são ignorados.
 */
export function destinoAposLogin(redirect) {
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }
  return { name: 'painel' }
}

export default router
