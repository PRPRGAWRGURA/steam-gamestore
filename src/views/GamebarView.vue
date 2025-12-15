<script>
import BaseBody from '../componets/BaseBody.vue';
import BaseContainer from '../componets/BaseContainer.vue';
import GameLibrary from '../componets/GameLibrary.vue';
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';
export default {
  name: 'GamebarView',
  components: {
    BaseBody,
    BaseContainer,
    GameLibrary
  },
  setup() {
    const userStore = useUserStore();
    
    // 从Pinia store获取用户信息
    const currentUser = computed(() => userStore.currentUser);
    
    return {
      currentUser
    }
  }
}
</script>
<template>
  <BaseBody>
      <div class="gamebar-container">
        <div class="user-info">
          <p v-if="currentUser">欢迎您，{{ currentUser.user_name }}！</p>
          <p v-else>请先登录查看更多内容</p>
        </div>
      </div>
      <BaseContainer>
        <div class="gamebar-content" v-if="currentUser">
          <h1 class="gamebar-title">游戏库</h1>
          <GameLibrary />
        </div>
        <div class="gamebar-content" v-else>
          <h1 class="gamebar-title">游戏库</h1>
          <div class="login-prompt">
            <div class="prompt-icon">🔒</div>
            <h2>请先登录查看您的游戏库</h2>
            <p>登录后即可访问您的游戏收藏和游戏时间统计</p>
          </div>
        </div>
      </BaseContainer>
  </BaseBody>
</template>
<style scoped>
.gamebar-container {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.user-info {
  max-width: 1400px;
  padding: 15px 20px;
  margin: 0 auto;
  color: #fff;
  font-size: 0.95rem;
}

.gamebar-content {
  padding: 20px 0;
}

.gamebar-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 30px 0;
  text-align: center;
  background: linear-gradient(45deg, #4299e1 0%, #6366f1 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.login-prompt {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  max-width: 600px;
  margin: 0 auto;
}

.prompt-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: bounce 2s ease-in-out infinite;
}

.login-prompt h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: white;
}

.login-prompt p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>