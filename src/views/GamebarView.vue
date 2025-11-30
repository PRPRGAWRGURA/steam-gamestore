

<script>
import GS_body from '../componets/GS_body.vue';
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';
export default {
  name: 'GamebarView',
  components: {
    GS_body,
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