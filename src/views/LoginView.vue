<script>
import BaseBody from '../componets/BaseBody.vue';
import BaseTitle from '../componets/BaseTitle.vue';
import LoginForm from '../componets/LoginForm.vue';
export default {
  name: 'LoginView',
  components: {
    BaseBody,
    BaseTitle,
    LoginForm,
  }
}
</script>
<template>
  <BaseBody>
      <BaseTitle/>
      <LoginForm/>
  </BaseBody>
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
