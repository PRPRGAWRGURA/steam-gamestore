<script>
import BaseBody from '../componets/BaseBody.vue';
import BaseContainer from '../componets/BaseContainer.vue';
import UserProfileEdit from '../componets/UserProfileEdit.vue';

export default {
  name: 'UseritemView',
  components: {
    BaseBody,
    BaseContainer,
    UserProfileEdit
  }
};
</script>

<template>
  <BaseBody>
    <BaseContainer>
      <div class="UserItemBox">
        
        <div class="UserItemHeader">
          <div class="UserItemHeaderTitle">
            个人资料
          </div>
          
          <!-- 修改用户信息区域 - 整合了修改头像、用户名和密码功能 -->
          <UserProfileEdit />
        </div>
      </div>
    </BaseContainer>
  </BaseBody>
</template>

<style scoped>
.GS_body {
  min-height: 100vh;
}

.UserItemBox {
  width: 100%;
}

.UserItemHeader {
  width: 100%;
  background-color: #211b3847;
  min-height: 100vh;
  padding: 20px;
  color: white;
}

.UserItemHeaderTitle {
  width: 100%;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 30px;
  color: white;
}
</style>