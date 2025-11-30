<script>
import GS_body from '../componets/GS_body.vue';
import GS_title from '../componets/GS_title.vue';
export default {
  name: 'CommunityView',
  components: {
    GS_body,
    GS_title,
  }
}
</script>
<template>
  <GS_body>
      <div class="community">
        <h1>社区页面</h1>
        <p>加入我们的社区，与其他玩家互动！</p>
      </div>
  </GS_body>
</template>
<style scoped>
 h1{
  margin: 0;
 }
</style>
