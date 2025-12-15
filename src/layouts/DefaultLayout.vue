<script>
import BaseHeader from '@/componets/BaseHeader.vue';
import BaseFooter from '@/componets/BaseFooter.vue';

export default {
  name: 'DefaultLayout',
  components: {
    BaseHeader,
    BaseFooter
  }
};
</script>

<template>
  <div class="default-layout">
    <BaseHeader></BaseHeader>
    <main class="main-content">
      <router-view></router-view>
    </main>
    <BaseFooter></BaseFooter>
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