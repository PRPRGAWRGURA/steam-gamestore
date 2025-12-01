<script>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/userStore'
import { communityAPI } from '../utils/communityAPI'

export default {
  name: 'PostCreator',
  emits: ['postCreated', 'postUpdated', 'postFailed'],
  setup(props, { emit }) {
    const store = useUserStore()
    
    // 状态管理
    const newPostContent = ref('')
    const previewImage = ref('')
    const selectedFile = ref(null)
    const loading = ref(false)
    
    // 计算属性
    const canSubmitPost = computed(() => {
      return newPostContent.value.trim().length > 0
    })
    
    // 图片处理
    const handleImageSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        selectedFile.value = file
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
      // 重置文件输入
      const fileInput = document.querySelector('[ref="fileInput"]')
      if (fileInput) {
        fileInput.value = ''
      }
    }
    
    // 模拟图片上传函数
    const uploadImage = async (file) => {
      try {
        // 在实际项目中，这里应该调用真实的文件上传API
        // 这里我们模拟上传过程和返回一个临时URL
        return new Promise((resolve) => {
          setTimeout(() => {
            // 返回原始预览URL作为临时解决方案
            resolve(previewImage.value)
          }, 500)
        })
      } catch (error) {
        console.error('图片上传失败:', error)
        throw new Error('图片上传失败')
      }
    }
    
    // 发布消息
    const submitPost = async () => {
      if (!canSubmitPost.value) {
        alert('请输入消息内容')
        return
      }
      
      // 检查用户是否登录
      if (!store.currentUser) {
        alert('请先登录后再发布消息')
        return
      }
      
      const currentUser = store.currentUser
      
      // 1. 创建临时帖子对象（乐观更新）
      const tempPost = {
        id: `temp_${Date.now()}`, // 临时ID
        user_id: currentUser.user_name,
        content: newPostContent.value.trim(),
        image_url: previewImage.value || null,
        user: {
          user_name: currentUser.user_name,
          user_image: currentUser.user_image || '/UserImage/001.png'
        },
        comment_count: 0,
        like_count: 0,
        created_at: new Date().toISOString(),
        is_temp: true // 标记为临时帖子
      }
      
      // 2. 立即发送到父组件，添加到列表顶部
      emit('postCreated', tempPost)
      
      // 3. 重置表单
      newPostContent.value = ''
      removeImage()
      
      // 4. 后台异步上传到服务器
      let imageUrl = null
      try {
        // 显示加载状态
        loading.value = true
        
        // 如果有选择图片，则上传图片
        if (selectedFile.value) {
          console.log('上传图片中...')
          imageUrl = await uploadImage(selectedFile.value)
        }
        
        // 准备消息数据
        const postData = {
          user_id: currentUser.user_name, // 外键约束连接的是normal_user表的user_name字段
          content: tempPost.content,
          image_url: imageUrl || null
        }
        
        console.log('发布消息中:', postData)
        const response = await communityAPI.createPost(postData)
        
        if (response.success) {
          console.log('发布成功:', response.data)
          // 5. 上传成功，通知父组件更新帖子ID和状态
          emit('postUpdated', {
            tempId: tempPost.id,
            realPost: response.data
          })
        } else {
          console.error('发布失败:', response.error)
          // 6. 上传失败，通知父组件
          emit('postFailed', tempPost.id)
        }
      } catch (error) {
        console.error('发布消息出错:', error)
        // 7. 上传出错，通知父组件
        emit('postFailed', tempPost.id)
      } finally {
        loading.value = false
      }
    }
    
    return {
      newPostContent,
      previewImage,
      loading,
      canSubmitPost,
      handleImageSelect,
      removeImage,
      submitPost
    }
  }
}
</script>

<template>
  <div class="post-create-section">
    <div class="post-form-container">
      <textarea 
        v-model="newPostContent" 
        class="post-content-input"
        placeholder="分享你的游戏心得..."
        rows="3"
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
          {{ loading ? '发布中...' : '发布' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 发布消息区域 */
.post-create-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-content-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  box-sizing: border-box;
  border-radius: 10px;
  font-size: 16px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
  max-height: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  resize: none;
  overflow-y: hidden;
}

.post-content-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.image-upload-section {
  margin-bottom: 15px;
}

.image-upload-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.image-upload-btn:hover:not(:disabled) {
  background-color: #d0d0d0;
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
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.post-submit-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.post-submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
