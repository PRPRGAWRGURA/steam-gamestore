<script>
import GS_body from '../componets/GS_body.vue';
import GS_container from '../componets/GS_container.vue';
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';
export default {
  name: 'GamebarView',
  components: {
    GS_body,
    GS_container,
  },
  data() {
    return {
      games: [
        { id: 1, name:'游戏1', image:'/GamesImage/001_header.jpg' },
      ],
    }
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
      <GS_container>
        <div class="gamebar-content" v-if="currentUser">
          <h1>游戏栏</h1>
          <p>这里是游戏栏的内容</p>
          <div class="game-item" v-for="game in games" :key="game.id">
            <p>{{ game.name }}</p>
            <img :src="game.image" alt="{{ game.name }}">
          </div>
        </div>
        <div class="gamebar-content" v-else>
          <h1>游戏栏</h1>
          <p>请先登录查看更多内容</p>
        </div>
      </GS_container>
  </GS_body>
</template>

<style scoped>
.gamebar-container {
  background-color: rgba(255, 255, 255, 0.1);
}
.user-info {
  width: 1220px;
  padding: 15px;
  margin: 0 auto;
  border-radius: 5px;
  color: #fff;
}
.gamebar-container {
  display: flex;
}
.game-item {
  margin-right: 20px;
}
.game-item img{
  width: 100px;
  height: 300px;
}
</style>