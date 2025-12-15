<script>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/userStore'
import { communityAPI } from '../utils/api/communityAPI'

export default {
  name: 'PostCreator',
  emits: ['postCreated', 'postUpdated', 'postFailed'],
  setup(props, { emit }) {
    const store = useUserStore()
    
    // 使用computed从Pinia store获取当前用户信息，确保响应式更新
    const currentUser = computed(() => {
      return store.currentUser || null;
    });
    
    // 状态管理
    const newPostContent = ref('')
    const previewImage = ref('')
    const selectedFile = ref(null)
    const loading = ref(false)
    const fileInput = ref(null)
    
    //切换属性
    const isEditing = ref(false)

    // 计算属性
    const canSubmitPost = computed(() => {
      // 当有文字内容或有选择的图片时，允许提交
      return newPostContent.value.trim().length > 0 || !!selectedFile.value
    })
    
    // 图片处理
    const handleImageSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        // 前端文件验证
        // 验证文件类型
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
        if (!validTypes.includes(file.type)) {
          alert('只支持以下图片格式: jpg, jpeg, png, gif, webp, svg')
          return
        }
        
        // 验证文件大小（限制为15MB）
        const maxSize = 15 * 1024 * 1024 // 15MB
        if (file.size > maxSize) {
          alert('图片大小不能超过15MB')
          return
        }
        
        selectedFile.value = file
        console.log('选择图片文件:', { name: file.name, size: file.size, type: file.type })
        const reader = new FileReader()
        reader.onload = (e) => {
          previewImage.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    
    const removeImage = () => {
      previewImage.value = ''
      selectedFile.value = null
      // 重置文件输入，使用Vue的引用
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }
    
    // 图片上传现在通过communityAPI直接处理，不再需要单独的上传函数
    
    // 发布消息
    const submitPost = async () => {
      if (!canSubmitPost.value) {
        alert('请输入消息内容')
        return
      }
      
      // 检查用户是否登录
      if (!currentUser.value) {
        alert('请先登录后再发布消息')
        return
      }
      
      const user = currentUser.value
      
      // 1. 创建临时帖子对象（乐观更新）
      const tempPost = {
        id: `temp_${Date.now()}`, // 临时ID
        user_id: user.user_name,
        content: newPostContent.value.trim(),
        image_url: previewImage.value || null,
        normal_user: {
          user_name: user.user_name,
          user_image: user.user_image 
        },
        comments_count: 0,
        likes_count: 0,
        liked: false,
        created_at: new Date().toISOString(),
        is_temp: true // 标记为临时帖子
      }
      
      // 2. 立即发送到父组件，添加到列表顶部
      emit('postCreated', tempPost)
      
      // 4. 后台异步上传到服务器
      try {
        // 显示加载状态
        loading.value = true
        
        // 准备消息数据，直接传入图片文件
        const postData = {
          user_id: user.user_name, // 外键约束连接的是normal_user表的user_name字段
          content: tempPost.content,
          image: selectedFile.value // 直接传递File对象给API
        }
        console.log('发布消息中:', {
          user_id: postData.user_id,
          contentLength: postData.content.length,
          hasImage: !!postData.image,
          imageInfo: postData.image ? {
            name: postData.image.name,
            size: postData.image.size,
            type: postData.image.type
          } : null
        })
        
        try {
          const response = await communityAPI.createPost(postData)
          
          if (response.success) {
            console.log('发布成功:', response.data)
            // 5. 上传成功，通知父组件更新帖子ID和状态
            emit('postUpdated', {
              tempId: tempPost.id,
              realPost: response.data
            })
          } else {
            console.error('发布失败:', {
              errorCode: response.error?.code || 'unknown',
              errorMessage: response.error?.message || response.error
            })
            // 6. 上传失败，通知父组件并显示具体错误
            emit('postFailed', {
              tempId: tempPost.id,
              error: response.error
            })
          }
        } catch (apiError) {
          console.error('API调用异常:', {
            error: apiError,
            errorName: apiError.name,
            errorMessage: apiError.message,
            errorStack: apiError.stack
          })
          // 7. API调用出错，通知父组件
          emit('postFailed', {
            tempId: tempPost.id,
            error: apiError
          })
        }
      } catch (error) {
        console.error('全局错误捕获:', {
          error: error,
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack
        })
        // 7. 上传出错，通知父组件
        emit('postFailed', {
          tempId: tempPost.id,
          error: error
        })
      } finally {
        loading.value = false
        // 重置表单，在API调用完成后执行
        newPostContent.value = ''
        removeImage()
      }
    }
    
    return {
      newPostContent,
      previewImage,
      loading,
      canSubmitPost,
      isEditing,
      handleImageSelect,
      removeImage,
      submitPost,
    }
  }
}
</script>

<template>
  
  <div class="post-create-section" :class="{'active': isEditing}" >
    <div class="edit-btn" :class="{'edit-btn-active': isEditing}" @click="isEditing = !isEditing">{{ isEditing ? '取消' : '发布' }}</div>
    <div class="post-title" v-if="!isEditing">发布一条帖子吧</div>
    <div class="post-form-container" v-if="isEditing">
      <textarea 
        v-model="newPostContent" 
        class="post-content-input"
        placeholder="分享你的游戏心得..."
      ></textarea>
      
      <!-- 图片上传区域 -->
      <div class="image-upload-section">
        <input 
          type="file" 
          ref="fileInput"
          accept="image/*"
          @change="handleImageSelect"
          style="display: none"
        />
        <button 
          @click="$refs.fileInput.click()"
          class="image-upload-btn"
          :disabled="!!previewImage || loading"
        >
          {{ previewImage ? '已选择图片' : '添加图片' }}
        </button>
        
        <!-- 图片预览 -->
        <div v-if="previewImage" class="image-preview">
          <img :src="previewImage" alt="预览图片" />
          <button @click="removeImage" class="remove-image-btn">
            移除
          </button>
        </div>
      </div>
      
      <!-- 发布按钮 -->
      <div class="post-submit-wrapper">
        <button 
          @click="submitPost"
          class="post-submit-btn"
          :disabled="!canSubmitPost || loading"
        >
          {{ loading ? '发布中' : '发布' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.edit-btn {
  position: absolute;
  z-index: 10;
  width: 72px;
  height: 43px;
  bottom: 20px;
  right: 100px;
  transform: translateX(80px);
  text-align: center;
  line-height: 48px;
  font-size: 16px;
  color: #464646;
  border-radius: 5px;
  background-color: #3593eb;
  color: white;
  border: none;
}
.edit-btn-active {
  color: #ffffff;
  background-color: transparent;
  transform: translateX(-20%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.edit-btn-active:hover {
  background-color: #f15f45;
}
.post-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 20%);
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  position: relative;
  display: inline-block;
  /* 使用渐变背景并只作用于文字 */
  background: linear-gradient(
    90deg,
    #5fbefafb 0%,
    #5fbefafb 25%,
    #ffffff 50%,
    #5fbefafb 75%,
    #5fbefafb 100%
  );
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: lightShine 2s ease-in-out infinite;
}

@keyframes lightShine {
  100% {
    background-position: 0% 50%;
  }
  0% {
    background-position: 100% 50%;
  }
}
/* 发布消息区域 */
.post-create-section {
  position: fixed;
  z-index: 100;
  width: 20%;
  min-height: 50px;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  transition: width 0.3s ease;
  background-color: #07121f;
  border: 2px solid #3ba0de;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.post-create-section.active {
  width: 40%;
}
.post-content-input {
  width: 100%;
  padding: 12px 16px;
  border: none;
  box-sizing: border-box;
  border-radius: 10px;
  font-size: 16px;
  background-color: #00050e;
  transition: all 0.3s ease;
  min-height: 200px;
  overflow: auto;
  text-overflow: ellipsis;
  color: white;
  font-size: 16px;
  font-weight: 500;
  resize: none;
  overflow-x: hidden;
}

.post-content-input:focus {
  outline: none;
  border: 1px solid #393939;
}

.image-upload-section {
  margin-bottom: 15px;
}

.image-upload-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: transparent;
  color: rgb(224, 237, 241);
  border: 2px solid #44bbf6d0;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.image-upload-btn:hover:not(:disabled) {
  background-color: #cfcfcf;
  color: #210942;
}

.image-upload-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.image-preview {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.image-preview img {
  max-width: 100px;
  max-height: 100px;
  border-radius: 4px;
}

.remove-image-btn {
  padding: 4px 12px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.post-submit-wrapper {
  display: flex;
  justify-content: flex-end;
}

.post-submit-btn {
  padding: 10px 20px;
  background-color: #499deb;;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.post-submit-btn:hover:not(:disabled) {
  background-color: #5ba5ea;
}

.post-submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
