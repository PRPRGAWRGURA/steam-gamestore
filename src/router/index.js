import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件（稍后创建）
const Home = () => import('../views/HomeView.vue')
const Community = () => import('../views/CommunityView.vue')
const About = () => import('../views/AboutView.vue')
const Support = () => import('../views/SupportView.vue')
const Login = () => import('../views/LoginView.vue')
const Gamebar = () => import('../views/GamebarView.vue')
const Useritem = () => import('../views/UseritemView.vue')

const routes = [
  {
    path: '/',
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
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router