import { createApp } from 'vue'
import { createPinia} from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/userStore'
import { registerMicroApps, start } from 'qiankun'

// Font Awesome 配置
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faCheck, 
  faLock, 
  faGamepad, 
  faUsers, 
  faPalette, 
  faTicket, 
  faChartSimple, 
  faCheckCircle, 
  faPenToSquare, 
  faList, 
  faSpinner 
} from '@fortawesome/free-solid-svg-icons'

// 注册图标到库
library.add(
  faCheck, 
  faLock, 
  faGamepad, 
  faUsers, 
  faPalette, 
  faTicket, 
  faChartSimple, 
  faCheckCircle, 
  faPenToSquare, 
  faList,
  faSpinner
)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.mount('#app')

// 初始化用户状态
const userStore = useUserStore()
userStore.initUser()

// 启动qiankun，仅初始化环境，不自动注册应用
start({
  sandbox: {
    strictStyleIsolation: true
  },
  prefetch: false
})

