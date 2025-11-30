<script>
import GS_body from '../componets/GS_body.vue';
import GS_title from '../componets/GS_title.vue';
import GS_container from '../componets/GS_container.vue';
export default {
  name: 'AboutView',
  components: {
    GS_body,
    GS_title,
    GS_container,
  }
}
</script>
<template>
  <GS_body>
      <GS_title/>
      <GS_container>
        <div class="about">
          <h1>关于页面</h1>
          <p>了解更多关于Steam的信息！</p>
        </div>
      </GS_container>
  </GS_body>
</template>
<style scoped>
  h1{
    margin: 0;
  }
  .GS_container{
    padding-top: 45px;
  }
</style>
