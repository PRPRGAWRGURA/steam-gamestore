<script>
import GS_body from '../componets/GS_body.vue';
import GS_container from '../componets/GS_container.vue';
export default {
  name: 'SupportView',
  components: {
    GS_body,
    GS_container,
  }
}
</script>
<template>
  <GS_body>
      <GS_container>
        <div class="support">
          <h1>客服页面</h1>
          <p>获取Steam客户支持！</p>
        </div>
      </GS_container>
  </GS_body>
</template>
<style scoped>
  h1{
    margin: 0;
  }
</style>
