<script>
import BaseHeader from '@/componets/BaseHeader.vue';
import BaseFooter from '@/componets/BaseFooter.vue';
import SiderAgent from '@/componets/SiderAgent.vue';
import DVDvideo from '@/componets/DVDvideo.vue';
export default {
  name: 'DefaultLayout',
  components: {
    BaseHeader,
    BaseFooter,
    SiderAgent,
    DVDvideo
  },
  data() {
    return {
      showDvd: false // 控制DVD组件的显示与隐藏，初始不可见
    };
  },
  methods: {
    // 处理DVD组件的关闭事件
    handleDvdClose() {
      this.showDvd = false;
    }
  }
};
</script>

<template>
  <div class="default-layout">
    <BaseHeader></BaseHeader>
    <main class="main-content">
      <DVDvideo v-if="showDvd" @close="handleDvdClose"></DVDvideo>
      <SiderAgent v-model:showDvd="showDvd"></SiderAgent>
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