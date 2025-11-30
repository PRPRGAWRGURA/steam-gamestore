

<script>
import GS_body from '../componets/GS_body.vue';
export default {
  name: 'GamebarView',
  components: {
    GS_body,
  },
  data() {
    return {
      currentUser: null
    }
  },
  mounted() {
    // 组件挂载时获取用户信息
    this.checkUserLogin();
    // 监听storage变化，以便在其他标签页登录状态改变时更新
    window.addEventListener('storage', this.handleStorageChange);
  },
  beforeUnmount() {
    // 清理事件监听
    window.removeEventListener('storage', this.handleStorageChange);
  },
  methods: {
    checkUserLogin() {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          this.currentUser = JSON.parse(userStr);
        } catch (e) {
          console.error('解析用户信息失败:', e);
          localStorage.removeItem('user');
        }
      }
    },
    handleStorageChange(event) {
      if (event.key === 'user') {
        this.checkUserLogin();
      }
    }
  }
}
</script>

<template>
  <GS_body>
    
      <div class="gamebar-container">
        <div class="user-info">
          <p v-if="currentUser">欢迎您，{{ currentUser.user_name }}！</p>
          <p v-else>请先登录查看更多内容</p>
        </div>
      </div>
    
  </GS_body>
</template>

<style scoped>
.user-info {
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  color: #fff;
}
</style>