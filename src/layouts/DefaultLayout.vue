<script>
import GS_header from '@/componets/GS_header.vue';
import GS_bottom from '@/componets/GS_bottom.vue';

export default {
  name: 'DefaultLayout',
  components: {
    GS_header,
    GS_bottom
  }
};
</script>

<template>
  <div class="default-layout">
    <GS_header></GS_header>
    <main class="main-content">
      <router-view></router-view>
    </main>
    <GS_bottom></GS_bottom>
  </div>
</template>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}
</style>