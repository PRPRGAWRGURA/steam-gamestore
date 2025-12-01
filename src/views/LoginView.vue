<script>
import GS_body from '../componets/GS_body.vue';
import GS_title from '../componets/GS_title.vue';
import GS_login from '../componets/GS_login.vue';
export default {
  name: 'LoginView',
  components: {
    GS_body,
    GS_title,
    GS_login,
  }
}
</script>
<template>
  <GS_body>
      <GS_title/>
      <GS_login/>
  </GS_body>
</template>

<style scoped>
  .GS_body{
    min-height: 1200px;
    position: relative;
  }
  .GS_login{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
