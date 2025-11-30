<script>
import GS_body from '../componets/GS_body.vue';
import GS_title from '../componets/GS_title.vue';
export default {
  name: 'SupportView',
  components: {
    GS_body,
    GS_title,
  }
}
</script>
<template>
  <GS_body>
      <div class="support">
        <h1>客服页面</h1>
        <p>获取Steam客户支持！</p>
      </div>
  </GS_body>
</template>
<style scoped>
  .GS_body{
        height: 100vh;
  }
  h1{
    margin: 0;
  }
</style>
