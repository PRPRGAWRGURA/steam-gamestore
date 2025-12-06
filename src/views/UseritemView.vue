<script>
import GS_body from '../componets/GS_body.vue';
import GS_container from '../componets/GS_container.vue';
import GS_change_userinfo from '../componets/GS_change_userinfo.vue';

export default {
  name: 'UseritemView',
  components: {
    GS_body,
    GS_container,
    GS_change_userinfo
  }
};
</script>

<template>
  <GS_body>
    <GS_container>
      <div class="UserItemBox">
        <div class="UserItemHeader">
          <div class="UserItemHeaderTitle">
            个人资料
          </div>
          
          <!-- 修改用户信息区域 - 整合了修改头像、用户名和密码功能 -->
          <GS_change_userinfo />
        </div>
      </div>
    </GS_container>
  </GS_body>
</template>

<style scoped>
.GS_body {
  min-height: 100vh;
}

.UserItemBox {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
}

.UserItemHeader {
  width: 1100px;
  background-color: #1b2838;
  border-radius: 8px;
  padding: 20px;
  color: white;
}

.UserItemHeaderTitle {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 30px;
  color: white;
}
</style>