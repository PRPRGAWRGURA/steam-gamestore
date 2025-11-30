<script>
import GS_body from '../componets/GS_body.vue'
import GS_container from '@/componets/GS_container.vue'
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import { communityAPI } from '../utils/communityAPI'

export default {
  name: 'CommunityView',
  components: {
    GS_body,
    GS_container,
  },
  setup() {
    const store = useUserStore()
    
    // 状态管理
    const posts = ref([])
    const comments = ref({})
    const loading = ref(false)
    const loadingComments = ref([])
    const visibleComments = ref(new Set())
    const offset = ref(0)
    const limit = 20
    const hasMore = ref(true)
    
    // 表单数据
    const newPostContent = ref('')
    const previewImage = ref('')
    const selectedFile = ref(null)
    const commentInputs = ref({})
    const commentInputsVisibility = ref({})
    
    // 默认头像
    const defaultAvatar = 'https://via.placeholder.com/50'
    
    // 计算属性
    const canSubmitPost = computed(() => {
      return newPostContent.value.trim().length > 0
    })
    
    // 方法
    const formatTime = (timeString) => {
      const date = new Date(timeString)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
      if (diff < 2592000000) return Math.floor(diff / 86400000) + '天前'
      
      return date.toLocaleDateString()
    }
    
    const isCurrentUser = (userId) => {
      return store.currentUser && store.currentUser.id === userId
    }
    
    const isCommentsVisible = (postId) => {
      return visibleComments.value.has(postId)
    }
    
    const toggleComments = async (postId) => {
      if (visibleComments.value.has(postId)) {
        visibleComments.value.delete(postId)
      } else {
        visibleComments.value.add(postId)
        if (!comments.value[postId]) {
          await loadComments(postId)
        }
      }
    }
    
    const getComments = (postId) => {
      return comments.value[postId] || []
    }
    
    const getCommentsCount = (postId) => {
      // 优先使用post对象中的comment_count属性
      const post = posts.value.find(p => p.id === postId)
      if (post && post.comment_count !== undefined) {
        return post.comment_count
      }
      // 如果没有comment_count属性，则使用本地评论数组长度
      return getComments(postId).length
    }
    
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
       // 在Composition API中重置文件输入
       const fileInput = document.querySelector('[ref="fileInput"]')
       if (fileInput) {
         fileInput.value = ''
       }
     }
    
    // 加载消息列表
    const loadPosts = async (isLoadMore = false) => {
      if (loading.value) return
      
      loading.value = true
      try {
        const response = await communityAPI.getPosts({
          limit,
          offset: isLoadMore ? offset.value : 0
        })
        
        if (response.success) {
          if (isLoadMore) {
            posts.value = [...posts.value, ...response.data]
          } else {
            posts.value = response.data
          }
          
          // 更新偏移量
          offset.value += response.data.length
          
          // 判断是否还有更多数据
          hasMore.value = response.data.length === limit
                  
          // 自动为每个帖子加载评论，但不展开评论区
          // 只加载新帖子的评论（避免重复加载）
          const newPosts = isLoadMore ? response.data : posts.value
          newPosts.forEach(post => {
            if (!comments.value[post.id]) {
              // 异步加载评论，但不等待完成，避免阻塞UI
              loadComments(post.id).catch(err => console.error('自动加载评论失败:', err))
            }
          })
        } else {
          console.error('加载消息失败:', response.error)
          alert(response.error || '加载失败，请稍后重试')
        }
      } catch (error) {
        console.error('加载消息出错:', error)
        alert('网络错误，请稍后重试')
      } finally {
        loading.value = false
      }
    }
    
    const loadMorePosts = () => {
      loadPosts(true)
    }
    
    // 加载评论
    const loadComments = async (postId) => {
      if (loadingComments.value.includes(postId)) return
      
      loadingComments.value.push(postId)
      try {
        const response = await communityAPI.getCommentsByPostId(postId)
        
        if (response.success) {
          comments.value[postId] = response.data
        } else {
          console.error('加载评论失败:', response.error)
        }
      } catch (error) {
        console.error('加载评论出错:', error)
      } finally {
        loadingComments.value = loadingComments.value.filter(id => id !== postId)
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
           content: newPostContent.value.trim(),
           image_url: imageUrl || null
         }
         
         console.log('发布消息中:', postData)
         const response = await communityAPI.createPost(postData)
         
         if (response.success) {
           console.log('发布成功:', response.data)
           // 重置表单
           newPostContent.value = ''
           removeImage()
           
           // 立即将新帖子添加到列表开头，避免重新加载整个列表
           const newPost = response.data
           // 补充必要的用户信息
           newPost.user = {
             user_name: currentUser.user_name,
             user_image: currentUser.user_image || '/UserImage/001.png' // 使用默认头像作为后备
           }
           newPost.comment_count = 0
           newPost.like_count = 0
           newPost.created_at = new Date().toISOString() // 使用当前时间
           
           // 将新帖子添加到列表开头
           posts.value.unshift(newPost)
           
           alert('发布成功！')
         } else {
           console.error('发布失败:', response.error)
           alert(response.error || '发布失败，请稍后重试')
         }
       } catch (error) {
         console.error('发布消息出错:', error)
         alert('网络错误，请稍后重试')
       } finally {
         loading.value = false
       }
     }
    
    // 提交评论
      const submitComment = async (postId) => {
        const content = commentInputs.value[postId]?.trim()
        
        // 验证评论内容
        if (!content) {
          alert('请输入评论内容')
          return
        }
        
        // 检查用户是否登录
        if (!store.currentUser) {
          alert('请先登录后再发表评论')
          return
        }
        
        // 确保评论仅包含文字（移除可能的HTML标签）
        const plainTextContent = content.replace(/<[^>]*>/g, '')
        if (plainTextContent !== content) {
          alert('评论不支持富文本格式，请仅使用纯文本')
          return
        }
        
        const currentUser = store.currentUser
        
        try {
          // 显示加载状态
          if (!loadingComments.value.includes(postId)) {
            loadingComments.value.push(postId)
          }
          
          const commentData = {
            post_id: postId,
            user_id: currentUser.user_name, // 外键约束连接的是normal_user表的user_name字段
            content: plainTextContent // 确保使用纯文本内容
          }
          
          console.log('发表评论中:', commentData)
          const response = await communityAPI.createComment(commentData)
          
          if (response.success) {
            console.log('评论成功:', response.data)
            // 重置输入框
            commentInputs.value[postId] = ''
            
            // 立即将新评论添加到对应帖子的评论列表中，避免重新加载
            const newComment = response.data
            // 补充必要的用户信息
            newComment.user = {
              user_name: currentUser.user_name,
              user_image: currentUser.user_image || '/UserImage/001.png' // 使用默认头像作为后备
            }
            newComment.created_at = new Date().toISOString() // 使用当前时间
            
            // 确保帖子的评论数组存在
            if (!comments.value[postId]) {
              comments.value[postId] = []
            }
            
            // 将新评论添加到列表
            comments.value[postId].push(newComment)
            
            // 更新帖子的评论计数
            const post = posts.value.find(p => p.id === postId)
            if (post) {
              post.comment_count = (post.comment_count || 0) + 1
            }
          } else {
            console.error('评论失败:', response.error)
            alert(response.error || '评论失败，请稍后重试')
          }
        } catch (error) {
          console.error('提交评论出错:', error)
          alert('网络错误，请稍后重试')
        } finally {
          // 移除加载状态
          loadingComments.value = loadingComments.value.filter(id => id !== postId)
        }
      }
    
    // 编辑消息
    const editPost = (post) => {
      // 这里需要实现编辑消息的功能
      console.log('编辑消息:', post)
      alert('编辑功能待实现')
    }
    
    // 删除消息
    const deletePost = async (postId) => {
      if (!confirm('确定要删除这条消息吗？删除后将无法恢复，同时会删除所有相关评论。')) {
        return
      }
      
      try {
        const response = await communityAPI.deletePost(postId)
        
        if (response.success) {
          // 从列表中移除消息
          posts.value = posts.value.filter(post => post.id !== postId)
          // 移除相关评论
          delete comments.value[postId]
          visibleComments.value.delete(postId)
          
          alert('删除成功！')
        } else {
          alert(response.error || '删除失败，请稍后重试')
        }
      } catch (error) {
        console.error('删除消息出错:', error)
        alert('网络错误，请稍后重试')
      }
    }
    
    // 编辑评论
    const editComment = (comment) => {
      // 这里需要实现编辑评论的功能
      console.log('编辑评论:', comment)
      alert('编辑功能待实现')
    }
    
    // 删除评论
    const deleteComment = async (commentId) => {
      if (!confirm('确定要删除这条评论吗？')) {
        return
      }
      
      try {
        const response = await communityAPI.deleteComment(commentId)
        
        if (response.success) {
          // 重新加载所有评论列表
          for (const postId in comments.value) {
            comments.value[postId] = comments.value[postId].filter(
              comment => comment.id !== commentId
            )
          }
          
          alert('删除成功！')
        } else {
          alert(response.error || '删除失败，请稍后重试')
        }
      } catch (error) {
        console.error('删除评论出错:', error)
        alert('网络错误，请稍后重试')
      }
    }
    
    // 初始化
    // 自动调整textarea高度
  const autoResizeTextarea = (event) => {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }

  onMounted(() => {
    loadPosts()
  })

  return {
      posts,
      loading,
      loadingComments,
      hasMore,
      newPostContent,
      previewImage,
      commentInputs,
      commentInputsVisibility,
      defaultAvatar,
      canSubmitPost,
      formatTime,
      isCurrentUser,
      isCommentsVisible,
      toggleComments,
      getComments,
      getCommentsCount,
      handleImageSelect,
      removeImage,
      loadMorePosts,
      submitPost,
      submitComment,
      editPost,
      deletePost,
      editComment,
      deleteComment,
      autoResizeTextarea
    }
  }
}
</script>

<template>
  <GS_body>
    <GS_container>
      <div class="community-container">
        <h1 class="community-title">游戏社区</h1>
        
        <!-- 发布消息区域 -->
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
                :disabled="!!previewImage"
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
            <button 
              @click="submitPost"
              class="post-submit-btn"
              :disabled="!canSubmitPost"
            >
              发布
            </button>
          </div>
        </div>
        
        <!-- 消息列表 -->
        <div class="posts-list">
          <div v-if="loading" class="loading-indicator">
            加载中...
          </div>
          
          <div v-else-if="posts.length === 0" class="empty-state">
            还没有消息，来发布第一条消息吧！
          </div>
          
          <div v-else class="posts-container">
            <div 
              v-for="post in posts" 
              :key="post.id" 
              class="post-item bilibili-style"
            >
              <!-- 消息头部 -->
              <div class="post-header">
                <div class="user-avatar-wrapper">
                  <img 
                    :src="post.normal_user?.user_image || defaultAvatar" 
                    :alt="post.normal_user?.user_name || '用户'"
                    class="user-avatar"
                  />
                </div>
                <div class="user-info">
                  <div class="user-name">{{ post.normal_user?.user_name || '匿名用户' }}</div>
                  <div class="post-meta">
                    <span class="post-time">{{ formatTime(post.created_at) }}</span>
                    <span class="post-views">浏览 {{ post.views || 0 }}</span>
                  </div>
                </div>
                <!-- 操作按钮 -->
                <div class="post-actions" v-if="isCurrentUser(post.user_id)">
                  <button @click="editPost(post)" class="action-btn edit-btn">
                    <i class="icon-edit">✎</i> 编辑
                  </button>
                  <button @click="deletePost(post.id)" class="action-btn delete-btn">
                    <i class="icon-delete">🗑</i> 删除
                  </button>
                </div>
              </div>
              
              <!-- 消息内容 -->
              <div class="post-content">
                <div class="content-text">{{ post.content }}</div>
                <div class="content-image" v-if="post.image_url">
                  <img :src="post.image_url" :alt="'图片'" class="post-image" />
                </div>
              </div>
              
              <!-- B站风格互动栏 -->
              <div class="post-interaction-bar">
                <button class="interaction-btn like-btn" :class="{liked: post.liked}">
                  <i class="icon-like">👍</i>
                  <span class="interaction-count">{{ post.likes || 0 }}</span>
                </button>
                <button class="interaction-btn collect-btn" :class="{collected: post.collected}">
                  <i class="icon-collect">⭐</i>
                  <span class="interaction-count">{{ post.collections || 0 }}</span>
                </button>
                <button class="interaction-btn comment-btn" @click="toggleComments(post.id)">
                  <i class="icon-comment">💬</i>
                  <span class="interaction-count">{{ getCommentsCount(post.id) }}</span>
                </button>
                <button class="interaction-btn share-btn">
                  <i class="icon-share">🔗</i>
                  <span class="interaction-text">分享</span>
                </button>
              </div>
              
              <!-- 评论区域 -->
              <div class="comments-section" v-if="isCommentsVisible(post.id)">
                <!-- 评论输入框 -->
                <div class="comment-input-wrapper">
                  <textarea 
                    v-model="commentInputs[post.id]"
                    placeholder="写下你的评论..."
                    rows="1"
                    class="comment-input"
                    @keydown.ctrl.enter="submitComment(post.id)"
                    @input="autoResizeTextarea($event)"
                    style="resize: none; overflow-y: hidden;"
                  ></textarea>
                  <button 
                    @click="submitComment(post.id)"
                    class="comment-submit-btn"
                    :disabled="!commentInputs[post.id]?.trim()"
                  >
                    发送
                  </button>
                </div>
                <!-- 评论列表 -->
                <div v-if="isCommentsVisible(post.id)" class="comments-list">
                  <div v-if="loadingComments.includes(post.id)" class="loading-comments">
                    加载评论中...
                  </div>
                  <div v-else-if="getComments(post.id).length === 0" class="no-comments">
                    暂无评论，来发表第一条评论吧！
                  </div>
                  <div v-else>
                    <div 
                      v-for="comment in getComments(post.id)" 
                      :key="comment.id" 
                      class="comment-item"
                    >
                      <img 
                        :src="comment.normal_user?.user_image || defaultAvatar" 
                        :alt="comment.normal_user?.user_name || '用户'"
                        class="commenter-avatar"
                      />
                      <div class="comment-content-wrapper">
                        <div class="comment-header">
                          <span class="commenter-name">{{ comment.normal_user?.user_name || '匿名用户' }}</span>
                          <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
                          <div class="comment-actions" v-if="isCurrentUser(comment.user_id)">
                            <button @click="editComment(comment)" class="action-btn edit-btn">编辑</button>
                            <button @click="deleteComment(comment.id)" class="action-btn delete-btn">删除</button>
                          </div>
                        </div>
                        <div class="comment-text">{{ comment.content }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 加载更多按钮 -->
          <div class="load-more-section" v-if="hasMore && !loading">
            <button @click="loadMorePosts" class="load-more-btn">加载更多</button>
          </div>
        </div>
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
  background-color: #e0e0e0;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.image-upload-btn:hover:not(:disabled) {
  background-color: #d0d0d0;
}

.image-upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-preview {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.image-preview img {
  max-width: 150px;
  max-height: 100px;
  border-radius: 4px;
}

.remove-image-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.remove-image-btn:hover {
  background-color: #d32f2f;
}

.post-submit-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.post-submit-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.post-submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* 消息列表 */
.posts-list {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  gap: 16px;
}

.loading-indicator, .empty-state, .no-comments {
  text-align: center;
  padding: 40px 0;
  color: #666;
  font-style: italic;
}

/* B站风格的帖子卡片 */
.post-item {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;
}

/* 增强的B站风格 */
.post-item.bilibili-style {
  border-radius: 12px;
  background-color: #fff;
  border: 1px solid #e6e6e6;
  padding: 16px 20px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

/* B站风格头部 */
.post-item.bilibili-style .post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.post-item.bilibili-style .user-avatar-wrapper {
  margin-right: 12px;
}

.post-item.bilibili-style .user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #f0f0f0;
  transition: transform 0.2s ease;
}

.post-item.bilibili-style .user-avatar:hover {
  transform: scale(1.05);
}

.post-item.bilibili-style .user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.post-item.bilibili-style .user-name {
  font-weight: 600;
  color: #333;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-item.bilibili-style .post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #999;
}

.post-item.bilibili-style .post-time {
  font-size: 13px;
  color: #999;
}

.post-item.bilibili-style .post-views {
  font-size: 13px;
  color: #999;
}

.post-actions, .comment-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.edit-btn {
  color: #00a1d6;
}

.edit-btn:hover {
  background-color: rgba(0, 161, 214, 0.1);
}

.delete-btn {
  color: #f44336;
}

.delete-btn:hover {
  background-color: #ffebee;
}

/* B站风格内容区 */
.post-item.bilibili-style .post-content {
  margin-bottom: 16px;
  line-height: 1.7;
  color: #333;
}

.post-item.bilibili-style .content-text {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
  word-break: break-word;
}

.post-item.bilibili-style .content-image {
  margin-top: 12px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f0f0f0;
  display: inline-block;
}

.post-item.bilibili-style .post-image {
  max-width: 100%;
  max-height: 500px;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.post-item.bilibili-style .post-image:hover {
  transform: scale(1.01);
}

/* B站风格互动栏 */
.post-item.bilibili-style .post-interaction-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.post-item.bilibili-style .interaction-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.post-item.bilibili-style .interaction-btn:hover {
  background-color: #f5f5f5;
  color: #00a1d6;
}

.post-item.bilibili-style .interaction-btn.liked {
  color: #00a1d6;
}

.post-item.bilibili-style .interaction-btn.collected {
  color: #ff6b6b;
}

.post-item.bilibili-style .interaction-btn.comment-btn {
  color: #36cfc9;
}

.post-item.bilibili-style .interaction-count {
  font-size: 14px;
  font-weight: 500;
}

.post-item.bilibili-style .interaction-text {
  font-size: 14px;
}

/* 评论区域 */
.comments-section {
  display: flex;
  flex-direction: column;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* B站风格评论输入框 */
.post-item.bilibili-style .comment-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.post-item.bilibili-style .comment-input {
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

.post-item.bilibili-style .comment-input:focus {
  outline: none;
  border-color: #00a1d6;
  background-color: white;
  box-shadow: 0 0 0 2px rgba(0, 161, 214, 0.1);
}

.post-item.bilibili-style .comment-submit-btn {
  background-color: #00a1d6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  align-self: flex-end;
  transition: all 0.3s ease;
}

.post-item.bilibili-style .comment-submit-btn:hover:not(:disabled) {
  background-color: #0091c6;
  transform: translateY(-1px);
}

.post-item.bilibili-style .comment-submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
}

/* B站风格评论列表 */
.post-item.bilibili-style .comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item.bilibili-style .loading-comments {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
}

.post-item.bilibili-style .no-comments {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}

.post-item.bilibili-style .comment-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.post-item.bilibili-style .comment-item:hover {
  background-color: #f0f0f0;
}

.post-item.bilibili-style .commenter-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.post-item.bilibili-style .comment-content-wrapper {
  flex: 1;
}

.post-item.bilibili-style .comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.post-item.bilibili-style .commenter-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.post-item.bilibili-style .comment-time {
  font-size: 13px;
  color: #999;
}

.post-item.bilibili-style .comment-text {
  font-size: 14px;
  line-height: 1.7;
  color: #333;
  word-break: break-word;
}

/* 评论操作按钮 */
.post-item.bilibili-style .comment-actions {
  margin-left: auto;
}

.post-item.bilibili-style .comment-actions .action-btn {
  font-size: 12px;
  padding: 2px 6px;
}

/* 加载更多 */
.load-more-section {
  text-align: center;
  padding: 20px 0;
}

.load-more-btn {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.load-more-btn:hover {
  background-color: #e0e0e0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .community-container {
    padding: 15px;
  }
  
  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .post-actions {
    align-self: flex-end;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .comment-actions {
    align-self: flex-start;
  }
}
</style>