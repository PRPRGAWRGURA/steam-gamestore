<script>
import BaseBody from '@/componets/BaseBody.vue'
import BaseContainer from '@/componets/BaseContainer.vue'
import PostCreator from '@/componets/PostCreator.vue'
import PostList from '@/componets/PostList.vue'
import { ref } from 'vue'

export default {
  name: 'CommunityView',
  components: {
    BaseBody,
    BaseContainer,
    PostCreator,
    PostList
  },
  setup() {
    const postListRef = ref(null)
    
    // 处理新帖子创建后的回调
    const handlePostCreated = (newPost) => {
      // 调用PostList组件的方法添加新帖子
      if (postListRef.value) {
        postListRef.value.addNewPost(newPost)
      }
    }
    
    // 处理帖子更新成功的回调
    const handlePostUpdated = (data) => {
      if (postListRef.value) {
        postListRef.value.updateTempPost(data.tempId, data.realPost)
      }
    }
    
    // 处理帖子上传失败的回调
    const handlePostFailed = (tempId) => {
      if (postListRef.value) {
        postListRef.value.handlePostFailed(tempId)
      }
    }
    
    return {
      postListRef,
      handlePostCreated,
      handlePostUpdated,
      handlePostFailed
    }
  }
}
</script>

<template>
  <BaseBody>
    <div class="community-title">
      <div class="community-title-line"></div>
      <div class="community-title-text">社区内容</div>
    </div>
    <BaseContainer>
      <div class="community-container">
        <!-- 使用PostCreator组件 -->
        <PostCreator 
          @post-created="handlePostCreated" 
          @post-updated="handlePostUpdated"
          @post-failed="handlePostFailed"
        />
        
        <!-- 使用PostList组件 -->
        <PostList ref="postListRef" />
      </div>
    </BaseContainer>
  </BaseBody>
</template>

<style scoped>
.community-container {
  position: relative;
  height: 2000px;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  margin: 0 auto;
}

.community-title {
  background: linear-gradient(to bottom, #0d1723 0%, transparent 100%);
}
.community-title-line {
  height: 3px;
  background-color: #0d1723;
}
.community-title-text  {
  width: 1220px;
  height: 80px;
  line-height: 80px;
  margin: 0 auto;
  border-radius: 5px;
  background-color: #0d1723;
  font-size: 25px;
  font-weight: bold;
  padding-left: 20px;
  box-sizing: border-box;
  border: 2px solid transparent;
  border-top: none;
  border-image: linear-gradient(to bottom,  #0d1723 15%,  #499deb 100%) 1;
  color: #fff;
}
</style>