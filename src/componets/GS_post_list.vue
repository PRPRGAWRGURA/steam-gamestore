<script>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import { communityAPI } from '../utils/communityAPI'

export default {
  name: 'PostList',
  props: {
    // 可以从父组件接收初始帖子数据
    initialPosts: {
      type: Array,
      default: () => []
    }
  },
  emits: ['postsLoaded', 'postUpdated', 'postFailed'],
  setup(props, { emit }) {
    const store = useUserStore()
    
    // 状态管理
    const posts = ref(props.initialPosts || [])
    const comments = ref({})
    const loading = ref(false)
    const loadingComments = ref([])
    const visibleComments = ref(new Set())
    const offset = ref(0)
    const limit = 10 // 减少初始加载的帖子数量，提高加载速度
    const hasMore = ref(true)
    const commentInputs = ref({})
    
    // 默认头像
    const defaultAvatar = '/UserImage/001.png'
    
    // 缓存配置
    const CACHE_KEY = 'community_posts'
    const CACHE_EXPIRE_TIME = 30 * 60 * 1000 // 30分钟
    
    // 从本地缓存加载帖子
    const loadPostsFromCache = () => {
      const cachedPosts = localStorage.getItem(CACHE_KEY)
      const cacheTime = localStorage.getItem(`${CACHE_KEY}_time`)
      
      if (cachedPosts && cacheTime) {
        const cacheAge = Date.now() - parseInt(cacheTime)
        // 检查缓存是否在有效期内
        if (cacheAge < CACHE_EXPIRE_TIME) {
          const loadedPosts = JSON.parse(cachedPosts)
          
          // 更新当前用户帖子的用户信息
          if (store.currentUser) {
            loadedPosts.forEach(post => {
              if (post.user_id === store.currentUser.user_name) {
                post.user = {
                  user_name: store.currentUser.user_name,
                  user_image: store.currentUser.user_image || defaultAvatar
                }
              }
            })
          }
          
          posts.value = loadedPosts
        }
      }
    }
    
    // 保存帖子到本地缓存
    const savePostsToCache = () => {
      localStorage.setItem(CACHE_KEY, JSON.stringify(posts.value))
      localStorage.setItem(`${CACHE_KEY}_time`, Date.now().toString())
    }
    
    // 格式化时间
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
    
    // 判断是否为当前用户
    const isCurrentUser = (userId) => {
      return store.currentUser && store.currentUser.user_name === userId
    }
    
    // 评论可见性控制
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
    
    // 获取评论相关
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
    
    // 自动调整textarea高度
    const autoResizeTextarea = (event) => {
      const textarea = event.target;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
    
    // 加载帖子
    const loadPosts = async (isLoadMore = false) => {
      if (loading.value) return
      
      loading.value = true
      try {
        const response = await communityAPI.getPosts({
          limit,
          offset: isLoadMore ? offset.value : 0
        })
        
        if (response.success) {
          let updatedPosts = []
          
          if (isLoadMore) {
            // 加载更多时，合并数据并去重
            const existingIds = new Set(posts.value.map(post => post.id))
            const newPosts = response.data.filter(post => !existingIds.has(post.id))
            updatedPosts = [...posts.value, ...newPosts]
          } else {
            // 刷新数据时，保留临时帖子
            const tempPosts = posts.value.filter(post => post.is_temp)
            const newPosts = response.data.filter(post => !tempPosts.some(temp => temp.content === post.content))
            updatedPosts = [...tempPosts, ...newPosts]
          }
          
          posts.value = updatedPosts
          
          // 更新偏移量
          offset.value += response.data.length
          
          // 判断是否还有更多数据
          hasMore.value = response.data.length === limit
                  
          // 处理每个帖子的用户信息
          updatedPosts.forEach(post => {
            // 检查是否为当前用户的帖子
            const isCurrentUserPost = store.currentUser && store.currentUser.user_name === post.user_id
            
            // 如果是当前用户的帖子，优先使用store中的用户信息
            if (isCurrentUserPost) {
              post.user = {
                user_name: store.currentUser.user_name,
                user_image: store.currentUser.user_image || defaultAvatar
              }
            } else {
              // 其他用户的帖子使用服务器返回的信息
              post.user = {
                user_name: post.normal_user?.user_name || '匿名用户',
                user_image: post.normal_user?.user_image || defaultAvatar
              }
            }
          })
          
          // 自动为每个帖子加载评论，但不展开评论区
          const newPosts = isLoadMore ? response.data : posts.value
          newPosts.forEach(post => {
            if (!comments.value[post.id]) {
              loadComments(post.id).catch(err => console.error('自动加载评论失败:', err))
            }
          })
          
          // 保存到本地缓存
          savePostsToCache()
          
          // 向父组件发送事件
          emit('postsLoaded', posts.value)
        } else {
          console.error('加载消息失败:', response.error)
          // 不显示错误提示，避免影响用户体验
        }
      } catch (error) {
        console.error('加载消息出错:', error)
        // 不显示错误提示，避免影响用户体验
      } finally {
        loading.value = false
      }
    }
    // 更新临时帖子为真实帖子（乐观更新成功）
    const updateTempPost = (tempId, realPost) => {
      const index = posts.value.findIndex(post => post.id === tempId)
      if (index !== -1) {
        // 检查是否为当前用户的帖子
        const isCurrentUserPost = store.currentUser && store.currentUser.user_name === realPost.user_id
        
        // 替换临时帖子为真实帖子
        posts.value[index] = {
          ...realPost,
          user: {
            // 如果是当前用户的帖子，优先使用store中的用户信息
            user_name: isCurrentUserPost ? store.currentUser.user_name : (realPost.normal_user?.user_name || '匿名用户'),
            user_image: isCurrentUserPost ? (store.currentUser.user_image || defaultAvatar) : (realPost.normal_user?.user_image || defaultAvatar)
          },
          comment_count: realPost.comment_count || 0,
          like_count: realPost.like_count || 0
        }
        // 保存到缓存
        savePostsToCache()
      }
    }
    
    // 处理帖子上传失败（乐观更新失败）
    const handlePostFailed = (tempId) => {
      const index = posts.value.findIndex(post => post.id === tempId)
      if (index !== -1) {
        // 从列表中移除失败的临时帖子
        posts.value.splice(index, 1)
        // 保存到缓存
        savePostsToCache()
        // 提示用户
        alert('消息发布失败，请稍后重试')
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
          content: content
        }
        
        const response = await communityAPI.createComment(commentData)
        
        if (response.success) {
          // 更新评论列表
          if (!comments.value[postId]) {
            comments.value[postId] = []
          }
          
          // 补充用户信息
          const newComment = response.data
          newComment.normal_user = {
            user_name: currentUser.user_name,
            user_image: currentUser.user_image || defaultAvatar
          }
          
          comments.value[postId].push(newComment)
          
          // 重置输入框
          commentInputs.value[postId] = ''
          
          // 更新帖子的评论计数
          const post = posts.value.find(p => p.id === postId)
          if (post) {
            post.comment_count = (post.comment_count || 0) + 1
          }
        } else {
          alert(response.error || '发表评论失败，请稍后重试')
        }
      } catch (error) {
        console.error('发表评论出错:', error)
        alert('网络错误，请稍后重试')
      } finally {
        loadingComments.value = loadingComments.value.filter(id => id !== postId)
      }
    }
    
    // 删除帖子（这里只包含基本结构，实际实现可能需要更多逻辑）
    const deletePost = async (postId) => {
      if (!confirm('确定要删除这条消息吗？')) {
        return
      }
      
      try {
        const response = await communityAPI.deletePost(postId)
        
        if (response.success) {
          // 从列表中移除帖子
          posts.value = posts.value.filter(post => post.id !== postId)
          // 同时删除相关评论
          delete comments.value[postId]
          // 移除可见状态
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
    
    // 删除评论
    const deleteComment = async (commentId) => {
      if (!confirm('确定要删除这条评论吗？')) {
        return
      }
      
      try {
        const response = await communityAPI.deleteComment(commentId)
        
        if (response.success) {
          // 从评论列表中移除
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
    
    // 添加新帖子（从父组件接收）
    const addNewPost = (newPost) => {
      posts.value.unshift(newPost)
    }
    
    // 组件挂载时加载帖子
    onMounted(() => {
      // 先从本地缓存加载数据
      loadPostsFromCache()
      
      // 如果缓存中有数据，延迟2秒后再从服务器获取最新数据，避免阻塞初始渲染
      // 如果缓存中没有数据，立即从服务器获取数据
      if (posts.value.length > 0) {
        setTimeout(() => {
          loadPosts()
        }, 2000)
      } else {
        loadPosts()
      }
    })
    
    return {
      posts,
      loading,
      loadingComments,
      hasMore,
      commentInputs,
      defaultAvatar,
      formatTime,
      isCurrentUser,
      isCommentsVisible,
      toggleComments,
      getComments,
      getCommentsCount,
      loadMorePosts,
      submitComment,
      deletePost,
      deleteComment,
      autoResizeTextarea,
      addNewPost,
      updateTempPost,
      handlePostFailed
    }
  }
}
</script>

<template>
  <div class="posts-list">
    <div v-if="loading && posts.length === 0" class="loading-indicator">
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
            <button @click="deletePost(post.id)" class="action-btn delete-btn">
              <img src="/WebResources/close.svg" alt="删除" class="delete-icon normal-icon" />
              <img src="/WebResources/close_red.svg" alt="删除" class="delete-icon hover-icon" />
            </button>
          </div>
        </div>
        
        <!-- 消息内容 -->
        <div class="post-content">
          <div class="content-text">{{ post.content }}</div>
          <div class="content-image" v-if="post.image_url">
            <img 
              :src="post.image_url" 
              :alt="'图片'" 
              class="post-image" 
              loading="lazy"
            />
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
              :disabled="!commentInputs[post.id]?.trim() || loadingComments.includes(post.id)"
            >
              发送
            </button>
          </div>
          <!-- 评论列表 -->
          <div class="comments-list">
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
                      <button @click="deleteComment(comment.id)" class="action-btn delete-btn">
                        <img src="/WebResources/close.svg" alt="删除" class="delete-icon" />
                      </button>
                    </div>
                  </div>
                  <div class="comment-text">{{ comment.content }}</div>
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
</template>

<style scoped>
/* 消息列表样式 */
.posts-list {
  width: 100%;
}

.loading-indicator,
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.posts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-item {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.post-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 帖子头部样式 */
.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.user-avatar-wrapper {
  margin-right: 15px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.post-meta {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 14px;
}

.post-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.edit-btn {
  background-color: #e0e0e0;
}

.edit-btn:hover {
  background-color: #d0d0d0;
}

.delete-btn {
  background-color: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  width: 16px;
  height: 16px;
 
}

.normal-icon {
  display: block;
}

.hover-icon {
  display: none;
}

.delete-btn:hover .normal-icon {
  display: none;
}

.delete-btn:hover .hover-icon {
  display: block;
}

/* 调整帖子操作区的布局 */
.post-actions {
  display: flex;
  gap: 5px;
}

/* 帖子内容样式 */
.post-content {
  margin-bottom: 15px;
}

.content-text {
  margin-bottom: 10px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.post-image {
  max-width: 100%;
  border-radius: 4px;
}

/* 互动栏样式 */
.post-interaction-bar {
  display: flex;
  gap: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.interaction-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.interaction-btn:hover {
  background-color: #e0e0e0;
}

.like-btn.liked {
  color: #ff6b6b;
}

.collect-btn.collected {
  color: #ffd700;
}

/* 评论区域样式 */
.comments-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.comment-input-wrapper {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.comment-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  resize: none;
  font-size: 14px;
}

.comment-submit-btn {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  align-self: flex-end;
}

.comment-submit-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.comment-submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.loading-comments,
.no-comments {
  text-align: center;
  padding: 20px 0;
  color: #666;
  font-size: 14px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.commenter-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content-wrapper {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.commenter-name {
  font-weight: bold;
  font-size: 14px;
}

.comment-time {
  color: #666;
  font-size: 12px;
}

.comment-text {
  line-height: 1.5;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.comment-actions .action-btn {
  font-size: 12px;
  padding: 2px 8px;
}

/* 加载更多按钮 */
.load-more-section {
  text-align: center;
  padding: 20px 0;
}

.load-more-btn {
  padding: 10px 20px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.load-more-btn:hover {
  background-color: #e0e0e0;
}
</style>