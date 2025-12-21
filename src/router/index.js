import { createRouter, createWebHistory } from 'vue-router'

// 导入布局组件
const DefaultLayout = () => import('../layouts/DefaultLayout.vue')

// 导入页面组件
const Home = () => import('../views/HomeView.vue')
const Community = () => import('../views/CommunityView.vue')
const About = () => import('../views/AboutView.vue')
const Support = () => import('../views/SupportView.vue')
const Login = () => import('../views/LoginView.vue')
const Gamebar = () => import('../views/GamebarView.vue')
const Useritem = () => import('../views/UseritemView.vue')
const GameDetail = () => import('../views/GameDetailView.vue')
const ShoppingCart = () => import('../views/ShoppingCartView.vue')
const routes = [
  // 默认布局路由 - 包含header和footer
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home
      },
      {
        path: '/community',
        name: 'Community',
        component: Community
      },
      {
        path: '/about',
        name: 'About',
        component: About
      },
      {
        path: '/support',
        name: 'Support',
        component: Support
      },
      {
        path: '/login',
        name: 'Login',
        component: Login
      },
      {
        path: '/gamebar',
        name: 'Gamebar',
        component: Gamebar
      },  
      {
        path: '/useritem',
        name: 'Useritem',
        component: Useritem
      },
      {        
        path: '/gamedetail/:id?',
        name: 'GameDetail',        
        component: GameDetail      
      },
      {
        path: '/shoppingcart',
        name: 'ShoppingCart',
        component: ShoppingCart
      },
    ]
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 每次路由跳转时滚动到页面顶部
    return { top: 0 }
  }
})

export default router