<script>
import BaseBody from '../componets/BaseBody.vue';
import BaseContainer from '../componets/BaseContainer.vue';
import BaseTitle from '@/componets/BaseTitle.vue';
import SupportForm from '../componets/SupportForm.vue';
import { useRoute } from 'vue-router';

export default {
  name: 'SupportView',
  components: {
    BaseBody,
    BaseContainer,
    SupportForm,
    BaseTitle
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
  <BaseBody>
      <BaseTitle/>
      <BaseContainer>
        <div class="support">
          <h1 class="support-title">{{ isDeveloperApplication ? '发行商申请' : '客服页面' }}</h1>
          <p class="support-subtitle">{{ isDeveloperApplication ? '申请成为游戏发行商，将你的游戏带给全球玩家！' : '获取CHAINHUB客户支持！' }}</p>
          <SupportForm :is-developer-application="isDeveloperApplication" />
          <div class="fix"></div>
        </div>
      </BaseContainer>
  </BaseBody>
</template>
<style scoped>
.GS_container {
  padding-top: 45px;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a192f 0%, #172a45 50%, #0d1b2a 100%);
}
.support {
  padding: 20px 0;
}
.fix {
  width: 100%;
  height: 900px;
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
