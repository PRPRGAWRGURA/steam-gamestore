<script>
import GS_body from '../componets/GS_body.vue';
import GS_title from '../componets/GS_title.vue';
import GS_container from '../componets/GS_container.vue';
import GS_Carousel from '../componets/GS_Carousel.vue'; // 引入新的轮播图组件
import GS_showgames from '../componets/GS_showgames.vue';
export default {
  name: 'HomeView',
  components: {
    GS_body,
    GS_title,
    GS_container,
    GS_Carousel,
    GS_showgames
  }
}
</script>

<template>
  <GS_body>
    <GS_title/>
    <GS_container>
      <GS_Carousel />
      <GS_showgames />
    </GS_container>
  </GS_body>
</template>

<style scoped>
.GS_container {
  padding-top: 48px;
}
</style>