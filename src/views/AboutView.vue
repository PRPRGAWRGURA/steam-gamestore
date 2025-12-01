<script>
import GS_body from '@/componets/GS_body.vue';
import GS_title from '@/componets/GS_title.vue';
import GS_container from '@/componets/GS_container.vue';
import { useUserStore } from '@/stores/userStore';
export default {
  name: 'AboutView',
  components: {
    GS_body,
    GS_title,
    GS_container,
  },
  setup() {
    const userStore = useUserStore();
    const updateCount = async () => {
      await userStore.getCount();
    }
    return {
      userStore,
      updateCount
    }
  },
  mounted() {
    this.updateCount();
  }
}
</script>
<template>
  <GS_body>
      <GS_title/>
      <GS_container>
        <div class="about">
          <h1>steam是畅玩游戏、讨论游戏、创造游戏的快乐所在。</h1>
          <p>在线</p><p>{{ userStore.user_count || 0 }}</p>
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
