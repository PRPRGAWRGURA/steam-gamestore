<script>
import BaseBody from '../componets/BaseBody.vue';
import BaseTitle from '../componets/BaseTitle.vue';
import BaseContainer from '../componets/BaseContainer.vue';
import HomeCarousel from '../componets/HomeCarousel.vue'; // 引入新的轮播图组件
import HomeGameShowcase from '../componets/HomeGameShowcase.vue';
export default {
  name: 'HomeView',
  components: {
    BaseBody,
    BaseTitle,
    BaseContainer,
    HomeCarousel,
    HomeGameShowcase
  }
}
</script>

<template>
  <BaseBody>
    <BaseTitle/>
    <BaseContainer>
      <HomeCarousel />
      <HomeGameShowcase />
    </BaseContainer>
  </BaseBody>
</template>

<style scoped>
.GS_container {
  padding-top: 48px;
  min-height: 100vh;
}
</style>