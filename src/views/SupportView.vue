<script>
import GS_body from '../componets/GS_body.vue';
import GS_container from '../componets/GS_container.vue';
import GS_support_form from '../componets/GS_support_form.vue';
import { useRoute } from 'vue-router';

export default {
  name: 'SupportView',
  components: {
    GS_body,
    GS_container,
    GS_support_form
  },
  setup() {
    const route = useRoute();
    
    // 获取路由参数，判断是否为发行商申请
    const isDeveloperApplication = route.query.type === 'developer';
    
    return {
      isDeveloperApplication
    };
  }
}
</script>
<template>
  <GS_body>
      <GS_container>
        <div class="support">
          <h1 class="support-title">{{ isDeveloperApplication ? '发行商申请' : '客服页面' }}</h1>
          <p class="support-subtitle">{{ isDeveloperApplication ? '申请成为游戏发行商，将你的游戏带给全球玩家！' : '获取Steam客户支持！' }}</p>
          <GS_support_form :is-developer-application="isDeveloperApplication" />
        </div>
      </GS_container>
  </GS_body>
</template>
<style scoped>
.support {
  padding: 20px 0;
}

.support-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 10px;
  text-align: center;
  background: linear-gradient(45deg, #4299e1 0%, #6366f1 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.support-subtitle {
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 40px;
  color: rgba(255, 255, 255, 0.8);
}
</style>
