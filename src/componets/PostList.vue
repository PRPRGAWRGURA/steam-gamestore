<script>
import { ref, onMounted, onUnmounted,computed } from 'vue'
import { useUserStore } from '../stores/userStore'
import { communityAPI } from '../utils/api/communityAPI'
import { loadPostsFromCache, savePostsToCache } from '../utils/tools/cacheUtils'

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
    
    // 使用computed从Pinia store获取当前用户信息，确保响应式更新
    const currentUser = computed(() => {
      return store.currentUser || null;
    });
    
    // 状态管理
    const posts = ref(props.initialPosts || [])
    const comments = ref({})
    const loading = ref(false)
    const loadingComments = ref([])
    const visibleComments = ref(new Set())
    const offset = ref(0)
    // 优化加载策略：初始加载30条，后续每次加载20条
    const initialLimit = 20 // 初始加载20条，减少用户初期的加载次数
    const loadMoreLimit = 20 // 后续每次加载20条，平衡加载速度和数据量
    const hasMore = ref(true)
    const commentInputs = ref({})
    // 图片放大显示功能相关状态
    const enlargedImage = ref(null)
    
    // 默认头像
    const defaultAvatar = '/UserImage/001.png'
    
    // 从本地缓存加载帖子
    const loadPostsFromCacheLocal = () => {
      const cachedPosts = loadPostsFromCache()
      if (cachedPosts) {
        posts.value = cachedPosts
        // 设置offset为缓存帖子的数量，确保下次加载更多时从正确位置开始
        offset.value = cachedPosts.length
      }
    }
    
    // 判断是否为当前用户
    const isCurrentUser = (userId) => {
      return currentUser.value && currentUser.value.user_name === userId
    }
    
    // 按数组索引位置将帖子分为两列
    // 第一列：从第一条数据开始隔行读取（索引0, 2, 4...）
    const firstColumnPosts = computed(() => {
      return posts.value.filter((_, index) => index % 2 === 0)
    })
    
    // 第二列：从第二条数据开始隔行读取（索引1, 3, 5...）
    const secondColumnPosts = computed(() => {
      return posts.value.filter((_, index) => index % 2 === 1)
    })
    
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
      // 使用API返回的comments_count属性
      const post = posts.value.find(p => p.id === postId)
      return post ? post.comments_count || 0 : 0
    }
    
    // 自动调整textarea高度
    const autoResizeTextarea = (event) => {
      const textarea = event.target;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
    
    // 加载帖子 - 用于刷新数据
    const loadPosts = async () => {
      if (loading.value) return
      
      loading.value = true
      try {
        // 获取当前用户ID（使用user_name，因为外键关联的是normal_user表的user_name字段）
        const currentUserId = currentUser.value?.user_name || null
        
        const response = await communityAPI.getPosts({
          limit: initialLimit,
          offset: 0
        }, currentUserId)
        
        if (response.success) {
          let updatedPosts = []
          
          // 1. 保留临时帖子
          const tempPosts = posts.value.filter(post => post.is_temp)
          
          // 2. 获取服务器返回的帖子ID集合
          const serverPostIds = new Set(response.data.map(post => post.id))
          
          // 3. 从现有帖子中只保留临时帖子和存在于服务器返回结果中的帖子
          // 同时保留帖子的图片加载状态
          const existingValidPosts = posts.value.filter(post => {
            return post.is_temp || serverPostIds.has(post.id)
          })
          
          // 4. 合并服务器返回的帖子，去重并确保临时帖子在最前面
          // 首先将服务器返回的帖子转换为Map，便于去重
          const serverPostsMap = new Map()
          response.data.forEach(post => {
            serverPostsMap.set(post.id, post)
          })
          
          // 5. 合并所有帖子：临时帖子 + (现有有效帖子与服务器帖子合并)
          updatedPosts = [...tempPosts]
          
          // 合并现有有效帖子和服务器帖子，保留图片加载状态
          const mergedPostsMap = new Map()
          
          // 先添加现有有效帖子，保留它们的图片加载状态
          existingValidPosts.forEach(post => {
            mergedPostsMap.set(post.id, post)
          })
          
          // 再添加服务器帖子，更新帖子内容但保留图片加载状态
          serverPostsMap.forEach((serverPost, postId) => {
            const existingPost = mergedPostsMap.get(postId)
            if (existingPost) {
              // 保留现有帖子的图片加载状态，更新其他内容
              mergedPostsMap.set(postId, {
                ...serverPost,
                imageLoaded: existingPost.imageLoaded // 保留图片加载状态
              })
            } else {
              // 新增帖子，直接添加
              mergedPostsMap.set(postId, serverPost)
            }
          })
          
          // 将合并后的帖子添加到updatedPosts
          updatedPosts.push(...mergedPostsMap.values())
          
          // 6. 统一按时间排序，最新的在前面
          // 使用id排序，数字大的帖子最新，性能更好
          updatedPosts.sort((a, b) => {
            // 先按id排序，id大的帖子最新
            if (b.id && a.id) {
              // 如果id是数字，直接比较数字大小
              const idA = Number(a.id)
              const idB = Number(b.id)
              if (!isNaN(idA) && !isNaN(idB)) {
                return idB - idA
              }
            }
            // 否则按created_at排序
            return new Date(b.created_at) - new Date(a.created_at)
          })
          
          // API已经返回完整的帖子数据，包括user对象、点赞状态、点赞数量和评论数量
          posts.value = updatedPosts
          
          // 更新偏移量
          offset.value = response.data.length
          
          // 使用返回的帖子数量判断是否还有更多数据
          hasMore.value = response.data.length >= initialLimit
          
          // 自动为每个帖子加载评论，但不展开评论区
          posts.value.forEach(post => {
            loadComments(post.id).catch(err => console.error('自动加载评论失败:', err))
          })
          
          // 保存到本地缓存
          savePostsToCache(posts.value)
          
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
    
    // 加载更多帖子 - 专门用于滚动加载
    const loadMorePosts = async () => {
      if (loading.value || !hasMore.value) return
      
      loading.value = true
      try {
        // 获取当前用户ID（使用user_name，因为外键关联的是normal_user表的user_name字段）
        const currentUserId = currentUser.value?.user_name || null
        
        const response = await communityAPI.getPosts({
          limit: loadMoreLimit,
          offset: offset.value
        }, currentUserId)
        
        if (response.success) {
          const newPosts = response.data
          
          if (newPosts.length > 0) {
            // 1. 直接将新帖子添加到现有列表
            posts.value.push(...newPosts)
            
            // 2. 自动为新帖子加载评论
            newPosts.forEach(post => {
              if (!comments.value[post.id]) {
                loadComments(post.id).catch(err => console.error('自动加载评论失败:', err))
              }
            })
            
            // 3. 更新偏移量
            offset.value += newPosts.length
            
            // 4. 判断是否还有更多数据
            hasMore.value = newPosts.length >= loadMoreLimit
            
            // 5. 保存到本地缓存
            savePostsToCache(posts.value)
            
            // 6. 向父组件发送事件
            emit('postsLoaded', posts.value)
          } else {
            // 没有更多数据
            hasMore.value = false
          }
        } else {
          console.error('加载更多消息失败:', response.error)
        }
      } catch (error) {
        console.error('加载更多消息出错:', error)
      } finally {
        loading.value = false
      }
    }
    
    // 更新临时帖子为真实帖子（乐观更新成功）
    const updateTempPost = (tempId, realPost) => {
      const index = posts.value.findIndex(post => post.id === tempId)
      if (index !== -1) {
        // 保存临时帖子的互动数据
        const tempPost = posts.value[index]
        
        // 合并真实帖子和临时帖子的数据，确保互动字段完整
        const updatedPost = {
          ...realPost,
          // 确保点赞和评论相关字段存在且类型正确
          liked: realPost.liked || tempPost.liked || false,
          likes_count: realPost.likes_count !== undefined ? realPost.likes_count : (tempPost.likes_count || 0),
          comments_count: realPost.comments_count !== undefined ? realPost.comments_count : (tempPost.comments_count || 0),
          // 确保normal_user字段存在，用于显示用户信息
          normal_user: realPost.normal_user || tempPost.normal_user || {
            user_name: '',
            user_image: '/UserImage/001.png'
          }
        }
        
        // 使用合并后的数据替换
        posts.value[index] = updatedPost
        // 保存到缓存
        savePostsToCache(posts.value)
      }
    }
    
    // 处理帖子上传失败（乐观更新失败）
    const handlePostFailed = (data) => {
      // 支持新旧两种调用方式
      const tempId = data.tempId || data;
      const error = data.error || null;
      
      const index = posts.value.findIndex(post => post.id === tempId)
      if (index !== -1) {
        // 从列表中移除失败的临时帖子
        posts.value.splice(index, 1)
        // 保存到缓存
        savePostsToCache(posts.value)
        
        // 根据错误信息显示不同的提示
        let errorMessage = '消息发布失败，请稍后重试';
        
        if (error) {
          // 将错误转换为字符串，以便进行includes检查
          const errorStr = typeof error === 'string' ? error : 
                         error.message || error.error || JSON.stringify(error);
          
          if (errorStr.includes('StorageError') || errorStr.includes('storage')) {
            errorMessage = '图片上传失败，请检查网络或图片格式';
          } else if (errorStr.includes('File') || errorStr.includes('文件')) {
            errorMessage = '文件格式不支持或大小超过限制';
          } else if (errorStr.includes('permission') || errorStr.includes('权限')) {
            errorMessage = '权限不足，请检查登录状态';
          } else if (errorStr.includes('Invalid key')) {
            errorMessage = '图片上传失败，文件名包含不支持的字符';
          } else {
            // 尝试提取更具体的错误信息
            const errorObj = typeof error === 'string' ? { message: error } : error;
            errorMessage = errorObj.message || errorObj.error || errorMessage;
          }
        }
        
        // 提示用户
        alert(errorMessage);
      }
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
      if (!currentUser.value) {
        alert('请先登录后再发表评论')
        return
      }
      
      // 确保评论仅包含文字（移除可能的HTML标签）
      const plainTextContent = content.replace(/<[^>]*>/g, '')
      if (plainTextContent !== content) {
        alert('评论不支持富文本格式，请仅使用纯文本')
        return
      }
      
      const user = currentUser.value
      
      // 1. 创建临时评论对象（乐观更新）
      const tempComment = {
        id: `temp_${Date.now()}`, // 临时ID
        post_id: postId,
        user_id: user.user_name,
        content: content,
        created_at: new Date().toISOString(),
        normal_user: {
          user_name: user.user_name,
          user_image: user.user_image 
        },
        is_temp: true // 标记为临时评论
      }
      
      // 2. 立即更新评论列表
      if (!comments.value[postId]) {
        comments.value[postId] = []
      }
      comments.value[postId].push(tempComment)
      
      // 3. 立即更新帖子评论计数
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.comments_count = (post.comments_count || 0) + 1
      }
      
      // 4. 重置输入框
      commentInputs.value[postId] = ''
      
      try {
        // 显示加载状态
        if (!loadingComments.value.includes(postId)) {
          loadingComments.value.push(postId)
        }
        
        const commentData = {
        post_id: postId,
        user_id: user.user_name, // 外键约束连接的是normal_user表的user_name字段
        content: content
      }
        
        const response = await communityAPI.createComment(commentData)
        
        if (response.success) {
          // 5. API调用成功，替换临时评论为真实评论
          const tempCommentIndex = comments.value[postId].findIndex(comment => comment.id === tempComment.id)
          if (tempCommentIndex !== -1) {
            comments.value[postId][tempCommentIndex] = response.data.comment
          }
          
          // 6. 更新帖子的真实评论计数
          if (post) {
            post.comments_count = response.data.comments_count
            // 立即更新缓存，确保下次刷新时数据最新
            savePostsToCache(posts.value)
          }
        } else {
          // 7. API调用失败，移除临时评论
          const tempCommentIndex = comments.value[postId].findIndex(comment => comment.id === tempComment.id)
          if (tempCommentIndex !== -1) {
            comments.value[postId].splice(tempCommentIndex, 1)
          }
          
          // 回滚评论计数
          if (post) {
            post.comments_count = Math.max(0, (post.comments_count || 1) - 1)
          }
          
          alert(response.error || '发表评论失败，请稍后重试')
        }
      } catch (error) {
        console.error('发表评论出错:', error)
        
        // 8. 网络错误，移除临时评论
        const tempCommentIndex = comments.value[postId].findIndex(comment => comment.id === tempComment.id)
        if (tempCommentIndex !== -1) {
          comments.value[postId].splice(tempCommentIndex, 1)
        }
        
        // 回滚评论计数
        if (post) {
          post.comments_count = Math.max(0, (post.comments_count || 1) - 1)
        }
        
        alert('网络错误，请稍后重试')
      } finally {
        loadingComments.value = loadingComments.value.filter(id => id !== postId)
      }
    }
    
    // 处理点赞
    const handleLike = async (postId) => {
      // 检查用户是否登录
      if (!currentUser.value) {
        alert('请先登录后再点赞')
        return
      }
      
      const user = currentUser.value
      const post = posts.value.find(p => p.id === postId)
      
      if (!post) return
      
      try {
        // 乐观更新：立即更新UI，提升用户体验
        const wasLiked = post.liked || false;
        const currentLikes = Number(post.likes_count) || 0;
        
        // 更新本地UI状态
        post.liked = !wasLiked;
        post.likes_count = wasLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
        
        // 异步更新服务器数据（使用user_name作为userId，因为外键关联的是normal_user.user_name）
        const response = await communityAPI.toggleLike(user.user_name, postId);
        
        if (response.success) {
          // 服务器更新成功，更新点赞数量和评论数量
          post.liked = response.data.liked;
          post.likes_count = response.data.likes_count;
          post.comments_count = response.data.comments_count;
          // 更新缓存
          savePostsToCache(posts.value);
        } else {
          // 服务器更新失败，回滚UI状态
          post.liked = wasLiked;
          post.likes_count = currentLikes;
          alert(response.error || '点赞失败，请稍后重试');
        }
      } catch (error) {
        console.error('点赞出错:', error);
        // 网络错误，回滚UI状态
        post.liked = wasLiked;
        post.likes_count = currentLikes;
        alert('网络错误，请稍后重试');
      }
    }
    
    // 删除帖子
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
          // 更新缓存
          savePostsToCache(posts.value)
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
          
          // 更新帖子的评论计数
          if (response.data.post_id) {
            const post = posts.value.find(p => p.id === response.data.post_id)
            if (post) {
              post.comments_count = response.data.comments_count
              // 更新缓存
              savePostsToCache(posts.value)
            }
          }
          
        } else {
          alert(response.error || '删除失败，请稍后重试')
        }
      } catch (error) {
        console.error('删除评论出错:', error)
        alert('网络错误，请稍后重试')
      }
    }
    
    // 图片放大显示功能相关方法
    // 放大显示指定图片
    const enlargeImage = (imageUrl) => {
      enlargedImage.value = imageUrl
    }
    
    // 关闭放大显示的图片
    const closeImage = () => {
      enlargedImage.value = null
    }
    
    // 添加新帖子（从父组件接收）
    const addNewPost = (newPost) => {
      posts.value.unshift(newPost)
    }
    
    // 刷新帖子方法
    const refreshPosts = () => {
      // 重置offset，重新加载所有帖子
      offset.value = 0
      loadPosts()
    }
    
    // 滚动处理函数，实现预加载
    const handleScroll = () => {
      // 直接获取滚动元素，确保正确的滚动目标
      const target = document.querySelector('.posts-list')
      if (!target) return
      
      const scrollHeight = target.scrollHeight
      const scrollTop = target.scrollTop
      const clientHeight = target.clientHeight
      
      // 当滚动到距离底部200px时，预加载下一页
      if (scrollHeight - scrollTop - clientHeight < 200 && !loading.value && hasMore.value) {
        loadMorePosts()
      }
    }
    
    // 组件挂载时加载帖子
    onMounted(() => {
      // 先从本地缓存加载数据
      loadPostsFromCacheLocal()
      
      // 如果缓存中有数据，延迟2秒后再从服务器获取最新数据，避免阻塞初始渲染
      // 如果缓存中没有数据，立即从服务器获取数据
      if (posts.value.length > 0) {
        setTimeout(() => {
          loadPosts()
        }, 2000)
      } else {
        loadPosts()
      }
      
      // 添加滚动监听，实现预加载
      const postsListElement = document.querySelector('.posts-list')
      if (postsListElement) {
        postsListElement.addEventListener('scroll', handleScroll)
      }
    })
    
    // 组件卸载时移除滚动监听，避免内存泄漏
    onUnmounted(() => {
      const postsListElement = document.querySelector('.posts-list')
      if (postsListElement) {
        postsListElement.removeEventListener('scroll', handleScroll)
      }
    })
    
    return {
      posts,
      firstColumnPosts,
      secondColumnPosts,
      loading,
      loadingComments,
      hasMore,
      commentInputs,
      defaultAvatar,
      // 使用API提供的格式化方法
      formatTime: communityAPI.formatTime,
      isCurrentUser,
      isCommentsVisible,
      toggleComments,
      getComments,
      getCommentsCount,
      loadMorePosts,
      refreshPosts,
      submitComment,
      deletePost,
      deleteComment,
      autoResizeTextarea,
      addNewPost,
      updateTempPost,
      handlePostFailed,
      handleLike,
      // 使用API提供的格式化方法
      formatContent: communityAPI.formatContent,
      // 图片放大显示功能相关
      enlargedImage,
      enlargeImage,
      closeImage
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
      <div class="posts-columns">
        <!-- 第一列：从第一条数据开始隔行读取 -->
        <div class="posts-column first-column">
          <div 
            v-for="post in firstColumnPosts" 
            :key="post.id" 
            class="post-item"
          >
        <!-- 消息头部 -->
        <div class="post-header">
          <div class="user-avatar-wrapper">
            <img 
              :src="post.normal_user?.user_image || defaultAvatar" 
              :alt="post.normal_user?.user_name || ' '"
              class="user-avatar"
            />
          </div>
          <div class="user-info">
            <div class="user-name">{{ post.normal_user?.user_name || ' ' }}</div>
            <div class="post-meta">
              <span class="post-time">{{ formatTime(post.created_at) }}</span>
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
          <div class="content-text" v-html="formatContent(post.content)"></div>
          <div class="content-image" v-if="post.image_url">
            <div class="image-container">
              <!-- 模糊占位图，使用CSS实现加载效果 -->
              <div class="image-placeholder" :class="{ 'loaded': post.imageLoaded }">
                <img 
                  :src="post.image_url" 
                  :alt="'图片'" 
                  class="post-image" 
                  loading="lazy"
                  @click="enlargeImage(post.image_url)"
                  @load="post.imageLoaded = true"
                  style="cursor: pointer;"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- 互动栏 -->
        <div class="post-interaction-bar">
          <button class="interaction-btn like-btn" :class="{liked: post.liked}" @click="handleLike(post.id)">
            <img class="icon-like normal" src="/WebResources/likes.svg" alt="点赞" />
            <img class="icon-like active" src="/WebResources/likes_click.svg" alt="点赞" />
            <span class="interaction-count">{{ post.likes_count }}</span>
          </button>
          <button class="interaction-btn comment-btn" :class="{active: isCommentsVisible(post.id)}" @click="toggleComments(post.id)">
            <img class="icon-comment normal" src="/WebResources/comment.svg" alt="评论" />
            <img class="icon-comment active" src="/WebResources/comment_click.svg" alt="评论" />
            <span class="interaction-count">{{ getCommentsCount(post.id) }}</span>
          </button>
          <button class="interaction-btn share-btn">
            <img class="icon-share" src="/WebResources/share.svg" alt="分享" />
            <span class="interaction-text">分享</span>
          </button>
        </div>
        
        <!-- 评论区域 -->
        <div class="comments-section" :class="{ expanded: isCommentsVisible(post.id) }">
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
                    <span class="commenter-name">{{ comment.normal_user?.user_name || ' ' }}</span>
                    <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
                    <div class="comment-actions" v-if="isCurrentUser(comment.user_id)">
                      <button @click="deleteComment(comment.id)" class="action-btn delete-btn">
                      <img src="/WebResources/close.svg" alt="删除" class="delete-icon normal-icon" />
                      <img src="/WebResources/close_red.svg" alt="删除" class="delete-icon hover-icon" />
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
        </div>
        <!-- 第二列：从第二条数据开始隔行读取 -->
        <div class="posts-column second-column">
          <div 
            v-for="post in secondColumnPosts" 
            :key="post.id" 
            class="post-item"
          >
        <!-- 消息头部 -->
        <div class="post-header">
          <div class="user-avatar-wrapper">
            <img 
              :src="post.normal_user?.user_image || defaultAvatar" 
              :alt="post.normal_user?.user_name || ' '"
              class="user-avatar"
            />
          </div>
          <div class="user-info">
            <div class="user-name">{{ post.normal_user?.user_name || ' ' }}</div>
            <div class="post-meta">
              <span class="post-time">{{ formatTime(post.created_at) }}</span>
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
          <div class="content-text" v-html="formatContent(post.content)"></div>
          <div class="content-image" v-if="post.image_url">
            <div class="image-container">
              <!-- 模糊占位图，使用CSS实现加载效果 -->
              <div class="image-placeholder" :class="{ 'loaded': post.imageLoaded }">
                <img 
                  :src="post.image_url" 
                  :alt="'图片'" 
                  class="post-image" 
                  loading="lazy"
                  @click="enlargeImage(post.image_url)"
                  @load="post.imageLoaded = true"
                  style="cursor: pointer;"
                />
              </div>
            </div>
          </div>
        </div>
        
        <!-- 互动栏 -->
        <div class="post-interaction-bar">
          <button class="interaction-btn like-btn" :class="{liked: post.liked}" @click="handleLike(post.id)">
            <img class="icon-like normal" src="/WebResources/likes.svg" alt="点赞" />
            <img class="icon-like active" src="/WebResources/likes_click.svg" alt="点赞" />
            <span class="interaction-count">{{ post.likes_count }}</span>
          </button>
          <button class="interaction-btn comment-btn" :class="{active: isCommentsVisible(post.id)}" @click="toggleComments(post.id)">
            <img class="icon-comment normal" src="/WebResources/comment.svg" alt="评论" />
            <img class="icon-comment active" src="/WebResources/comment_click.svg" alt="评论" />
            <span class="interaction-count">{{ getCommentsCount(post.id) }}</span>
          </button>
          <button class="interaction-btn share-btn">
            <img class="icon-share" src="/WebResources/share.svg" alt="分享" />
            <span class="interaction-text">分享</span>
          </button>
        </div>
        
        <!-- 评论区域 -->
        <div class="comments-section" :class="{ expanded: isCommentsVisible(post.id) }">
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
                    <span class="commenter-name">{{ comment.normal_user?.user_name || ' ' }}</span>
                    <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
                    <div class="comment-actions" v-if="isCurrentUser(comment.user_id)">
                      <button @click="deleteComment(comment.id)" class="action-btn delete-btn">
                      <img src="/WebResources/close.svg" alt="删除" class="delete-icon normal-icon" />
                      <img src="/WebResources/close_red.svg" alt="删除" class="delete-icon hover-icon" />
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
        </div>
      </div>
    </div>
      
      <!-- 加载更多进度条 -->
      <div v-if="loading && posts.length > 0" class="load-more-progress">
        <div class="progress-bar"></div>
      </div>
      
      <!-- 图片放大显示模态框 -->
      <div v-if="enlargedImage" class="image-modal" @click="closeImage">
        <div class="image-modal-content" @click.stop>
          <span class="close-button" @click="closeImage">
            <img src="/WebResources/close.svg" alt="关闭" class="close-icon">
          </span>
          <img :src="enlargedImage" alt="放大图片" class="enlarged-image">
        </div>
      </div>
  </div>
</template>

<style scoped>
/* 消息列表样式 */
.posts-list {
  width: 100%;
  height: 100%;
  overflow: auto;
  overflow-x: hidden;
  border-left: 2px solid transparent;
  border-right: 2px solid transparent;
  border-image: linear-gradient(to top, #0d1723, #499deb) 1;
  box-sizing: border-box;
  scroll-behavior: smooth;
  scrollbar-color: #499deb30 transparent;
  scrollbar-width: thin;
}

.loading-indicator,
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.posts-container {
  display: block;
  width: 100%;
}

.posts-columns {
  display: flex;
  gap: 15px;
  width: 100%;
}

.posts-column {
  flex: 1;
  width: 50%;
}

.post-item {
  position: relative;
  display: flex;
  background-color: #07121f;
  color: rgb(225, 229, 234);
  padding: 20px;
  transition: box-shadow 0.3s ease;
  margin-bottom: 15px;
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

/* 帖子头部样式 */
.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.user-avatar-wrapper {
  margin-right: 15px;
  transition: transform 0.3s ease;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-right: 3px solid #1a9efe ;
  object-fit: cover;
}
.user-avatar-wrapper:hover {
  transform: scale(1.1);
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
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
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
   width: 100%; 
   height: auto; 
   margin-bottom: 15px; 
 }

.content-text {
  max-height: 350px;
  overflow: auto; 
  scrollbar-width: thin; 
  overflow-x: hidden; 
  margin-bottom: 10px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}



.post-image {
  max-width: 100%;
  transition: all 0.3s ease;
  opacity: 0;
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.post-image:hover {
  box-shadow: 0 0 10px rgba(41, 104, 163, 0.34);
}

/* 渐进式图片加载样式 */
.image-container {
  width: 100%;
  position: relative;
  overflow: hidden;
}

.image-placeholder {
  width: 100%;
  background-color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 加载中的模糊效果 */
.image-placeholder::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  opacity: 1;
  transition: opacity 0.5s ease;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 图片加载完成后隐藏占位符 */
.image-placeholder.loaded::before {
  opacity: 0;
}

/* 图片加载完成后的显示效果 */
.image-placeholder.loaded .post-image {
  opacity: 1;
  transform: scale(1);
}

/* 为图片添加骨架屏效果 */
.image-placeholder::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iNCIvPgo8Y2lyY2xlIGN4PSIyNSIgY3k9IjI1IiByPSI0Ii8+Cjwvc3ZnPgo=');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 50px;
  opacity: 0.3;
  transition: opacity 0.5s ease;
}

.image-placeholder.loaded::after {
  opacity: 0;
}

/* 互动栏样式 */
.post-interaction-bar {
  align-self: flex-end;
  display: flex;
  gap: 10px;
  padding-top: 15px;
  border-top: 2px solid #4167ada7;
}

.interaction-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background-color: #0c1f35;
  color: rgb(205, 218, 225);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}
.interaction-btn img {
  width: 16px;
  height: auto;
  transition: opacity 0.3s ease;
}

/* 点赞按钮样式切换 */
.like-btn .icon-like.normal,
.comment-btn .icon-comment.normal {
  display: block;
  
}

.like-btn .icon-like.active,
.comment-btn .icon-comment.active {
  display: none;
  
}

.like-btn.liked .icon-like.normal,
.comment-btn.active .icon-comment.normal {
  display: none;
  
}

.like-btn.liked .icon-like.active,
.comment-btn.active .icon-comment.active {
  display: block;
  
}
.interaction-btn:hover {
  background-color: #e0e0e0;
}

.like-btn.liked {
  color: #393939;
  background-color: rgb(53, 142, 215);
}

.comment-btn.active {
  background-color: rgb(123, 215, 53);
  color: black;
}

/* 评论区域样式 */
.comments-section {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #07121f;
  padding: 20px;
  border-bottom: 2px solid #3ba0de;
  border-top: none;
  z-index: 10;
  overflow-y: auto;
  overflow: hidden;
  /* 移除max-height: 0，使用transform和opacity控制显示隐藏 */
  max-height: 0;
  opacity: 0;
  transform: translateY(0px);
  visibility: hidden;
  pointer-events: none;
  transition: all 0.3s ease-out;
  box-sizing: border-box;
}

.comments-section.expanded {
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
  pointer-events: auto;
  
  max-height: 600px;
}

.comment-input-wrapper {
  margin-top: 0;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
  border-top: none;
}

.comment-input {
  padding: 10px;
  border: 1px solid #ddd;
  background-color: #00050e;
  color: white;
  border: none;
  border-radius: 5px;
  resize: none;
  font-size: 14px;
  transition: all 0.3s ease;
}
.comment-input:focus {
  outline: none;
  border: 1px solid #499deb;
}
.comment-submit-btn {
  width: 60px;
  height: 36px;
  text-align: center;
  line-height: 36px;
  background-color: #499deb;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  align-self: flex-end;
}

.comment-submit-btn:hover:not(:disabled) {
  background-color: #5ba5ea;
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



/* 图片放大显示功能样式 */
/* 模态框背景 */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
}

/* 图片容器 */
.image-modal-content {
  background-color: #171a21;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  position: relative;
  max-width: 90%;
  max-height: 90%;
  cursor: default;
}

/* 放大图片 */
.enlarged-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 4px;
}

/* 关闭按钮 */
.close-button {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
}

.close-button:hover {
  background-color: #dc3545;
  transform: scale(1.1);
}

.close-icon {
  width: 16px;
  height: 16px;
}

/* 加载更多进度条样式 */
.load-more-progress {
  width: 100%;
  padding: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-bar {
  width: 80%;
  height: 4px;
  background-color: #0c1f35;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, #499deb, transparent);
  animation: progress-animation 1.5s infinite;
}

@keyframes progress-animation {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>