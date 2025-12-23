<script>
import BaseBody from '../componets/BaseBody.vue';
import BaseTitle from '../componets/BaseTitle.vue';
import BaseContainer from '@/componets/BaseContainer.vue';
import LoginForm from '../componets/LoginForm.vue';
export default {
  name: 'LoginView',
  components: {
    BaseBody,
    BaseTitle,
    LoginForm,
    BaseContainer,
  }
}
</script>
<template>
  <BaseBody>
      <BaseTitle/>
      <BaseContainer>
        <LoginForm/>
      </BaseContainer>
  </BaseBody>
</template>

<style scoped>
  .GS_container{
    min-height: 100vh;
  }
</style>
