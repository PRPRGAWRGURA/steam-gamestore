<script>
import GS_body from '../componets/GS_body.vue';
import GS_container from '../componets/GS_container.vue';
import GS_support_form from '../componets/GS_support_form.vue';

export default {
  name: 'SupportView',
  components: {
    GS_body,
    GS_container,
    GS_support_form
  },
}
</script>
<template>
  <GS_body>
      <GS_container>
        <div class="support">
          <h1 class="support-title">客服页面</h1>
          <p class="support-subtitle">获取Steam客户支持！</p>
          <GS_support_form />
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
