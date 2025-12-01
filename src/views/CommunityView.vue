<script>
import GS_body from '@/componets/GS_body.vue'
import GS_container from '@/componets/GS_container.vue'
import GS_post_creator from '@/componets/GS_post_creator.vue'
import GS_post_list from '@/componets/GS_post_list.vue'
import { ref } from 'vue'

export default {
  name: 'CommunityView',
  components: {
    GS_body,
    GS_container,
    GS_post_creator,
    GS_post_list
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
    
    return {
      postListRef,
      handlePostCreated
    }
  }
}
</script>

<template>
  <GS_body>
    <GS_container>
      <div class="community-container">
        <h1 class="community-title">游戏社区</h1>
        
        <!-- 使用PostCreator组件 -->
        <GS_post_creator @post-created="handlePostCreated" />
        
        <!-- 使用PostList组件 -->
        <GS_post_list ref="postListRef" />
      </div>
    </GS_container>
  </GS_body>
</template>

<style scoped>
.community-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  margin: 0 auto;
}

.community-title {
  font-size: 28px;
  margin-bottom: 30px;
  text-align: center;
  color: #333;
}
</style>