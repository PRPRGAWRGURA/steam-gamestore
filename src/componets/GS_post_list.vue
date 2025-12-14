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
    // 图片放大显示功能相关状态
    const enlargedImage = ref(null)
    
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
    
    // 点赞相关状态
    const likesCount = ref({}); // 存储每个帖子的点赞数量
    const isLoadingLikes = ref(new Set()); // 存储正在加载点赞的帖子ID
    
    // 加载帖子的点赞数量
    const loadLikesCount = async (postId) => {
      if (isLoadingLikes.value.has(postId)) return;
      
      try {
        isLoadingLikes.value.add(postId);
        const response = await communityAPI.getLikesByPostId(postId);
        
        if (response.success) {
          likesCount.value[postId] = response.data.length;
        } else {
          console.error('加载点赞数量失败:', response.error);
          likesCount.value[postId] = 0;
        }
      } catch (error) {
        console.error('加载点赞数量出错:', error);
        likesCount.value[postId] = 0;
      } finally {
        isLoadingLikes.value.delete(postId);
      }
    };
    
    // 批量加载点赞数量
    const loadLikesForPosts = async (postIds) => {
      // 过滤掉已经加载或正在加载的帖子ID
      const postsToLoad = postIds.filter(id => !likesCount.value[id] && !isLoadingLikes.value.has(id));
      
      if (postsToLoad.length > 0) {
        // 并行加载所有帖子的点赞数量
        await Promise.all(postsToLoad.map(id => loadLikesCount(id)));
      }
    };
    
    // 获取点赞数量
    const getLikesCount = (postId) => {
      // 如果还没有加载点赞数量，触发加载
      if (likesCount.value[postId] === undefined) {
        loadLikesCount(postId);
        return 0;
      }
      return likesCount.value[postId];
    };
    
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
        // 获取当前用户ID（使用user_name，因为外键关联的是normal_user表的user_name字段）
        const currentUserId = store.currentUser?.user_name || null
        
        const response = await communityAPI.getPosts({
          limit,
          offset: isLoadMore ? offset.value : 0
        }, currentUserId)
        
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
          
          // 处理每个帖子的用户信息，确保在设置posts.value之前完成
          updatedPosts.forEach(post => {
            // 检查是否为当前用户的帖子
            const isCurrentUserPost = store.currentUser && store.currentUser.user_name === post.user_id
            
            // 为每个帖子设置user对象，确保立即显示正确的用户名和头像
            post.user = {
              user_name: isCurrentUserPost ? store.currentUser.user_name : (post.normal_user?.user_name || ' '),
              user_image: isCurrentUserPost ? (store.currentUser.user_image || defaultAvatar) : (post.normal_user?.user_image || defaultAvatar)
            }
            
            // 点赞状态已由API返回，无需手动设置
          })
          
          // 重新排序帖子，使其在CSS Columns布局下呈现从左到右、从上到下的视觉效果
          // 同时保持时间顺序从新到旧
          const columns = 3;
          const reorderedPosts = [];
          const totalPosts = updatedPosts.length;
          
          // 按行填充帖子，确保视觉上从左到右、从上到下排列
          for (let i = 0; i < totalPosts; i++) {
            reorderedPosts.push(updatedPosts[i]);
          }
          
          posts.value = reorderedPosts
          
          // 更新偏移量
          offset.value += response.data.length
          
          // 判断是否还有更多数据
          hasMore.value = response.data.length === limit
          
          // 批量加载点赞数量
          const postIds = response.data.map(post => post.id);
          await loadLikesForPosts(postIds);
          
          // 自动为每个帖子加载评论，但不展开评论区。千万不要删这个
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
            user_name: isCurrentUserPost ? store.currentUser.user_name : (realPost.normal_user?.user_name || ' '),
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
    const handlePostFailed = (data) => {
      // 支持新旧两种调用方式
      const tempId = data.tempId || data;
      const error = data.error || null;
      
      const index = posts.value.findIndex(post => post.id === tempId)
      if (index !== -1) {
        // 从列表中移除失败的临时帖子
        posts.value.splice(index, 1)
        // 保存到缓存
        savePostsToCache()
        
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
    
    // 处理点赞
    const handleLike = async (postId) => {
      // 检查用户是否登录
      if (!store.currentUser) {
        alert('请先登录后再点赞')
        return
      }
      
      const currentUser = store.currentUser
      const post = posts.value.find(p => p.id === postId)
      
      if (!post) return
      
      try {
      // 乐观更新：立即更新UI，提升用户体验
      const wasLiked = post.liked;
      const currentLikes = likesCount.value[postId] || 0;
      
      // 更新本地UI状态
      post.liked = !wasLiked;
      // 使用likesCount状态而不是post.likes
      likesCount.value[postId] = wasLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
      
      // 更新本地存储（仍使用id作为标识，确保用户名改变时点赞状态保持一致）
      const likedPosts = JSON.parse(localStorage.getItem(`liked_posts_${currentUser.id}`) || '[]');
      let updatedLikedPosts;
      if (post.liked) {
        updatedLikedPosts = [...new Set([...likedPosts, postId])];
      } else {
        updatedLikedPosts = likedPosts.filter(id => id !== postId);
      }
      localStorage.setItem(`liked_posts_${currentUser.id}`, JSON.stringify(updatedLikedPosts));
      
      // 保存到本地缓存
      savePostsToCache();
      
      // 异步更新服务器数据（使用user_name作为userId，因为外键关联的是normal_user.user_name）
      const response = await communityAPI.toggleLike(currentUser.user_name, postId);
      
      if (response.success) {
        // 服务器更新成功，更新点赞数量
        likesCount.value[postId] = response.data.likes;
      } else {
        // 服务器更新失败，回滚UI状态
        post.liked = wasLiked;
        likesCount.value[postId] = currentLikes;
        
        // 回滚本地存储
        localStorage.setItem(`liked_posts_${currentUser.id}`, JSON.stringify(likedPosts));
        savePostsToCache();
        alert(response.error || '点赞失败，请稍后重试');
      }
    } catch (error) {
      console.error('点赞出错:', error);
      // 网络错误，回滚UI状态
      post.liked = wasLiked;
      likesCount.value[postId] = currentLikes;
      
      // 回滚本地存储
      localStorage.setItem(`liked_posts_${currentUser.id}`, JSON.stringify(likedPosts));
      savePostsToCache();
      alert('网络错误，请稍后重试');
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
    
    // 格式化内容，将URL转换为可点击的链接
    const formatContent = (content) => {
      if (!content) return ''
      
      // URL正则表达式，匹配http/https链接
      const urlRegex = /(https?:\/\/[^\s]+)/g
      
      // 将URL转换为a标签
      return content.replace(urlRegex, (url) => {
        // 确保URL的完整性
        let fullUrl = url
        // 移除可能的标点符号
        fullUrl = fullUrl.replace(/[.,!?;:)]$/, '')
        return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="post-link">${fullUrl}</a>`
      })
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
      handlePostFailed,
      handleLike,
      formatContent,
      // 点赞相关
      likesCount,
      isLoadingLikes,
      loadLikesCount,
      loadLikesForPosts,
      getLikesCount,
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
            <img 
              :src="post.image_url" 
              :alt="'图片'" 
              class="post-image" 
              loading="lazy"
              @click="enlargeImage(post.image_url)"
              style="cursor: pointer;"
            />
          </div>
        </div>
        
        <!-- B站风格互动栏 -->
        <div class="post-interaction-bar">
          <button class="interaction-btn like-btn" :class="{liked: post.liked}" @click="handleLike(post.id)">
            <img class="icon-like normal" src="/WebResources/likes.svg" alt="点赞" />
            <img class="icon-like active" src="/WebResources/likes_click.svg" alt="点赞" />
            <span class="interaction-count">{{ getLikesCount(post.id) }}</span>
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
    <!-- 加载更多按钮 -->
      <div class="load-more-section" v-if="hasMore && !loading">
        <button @click="loadMorePosts" class="load-more-btn">加载更多</button>
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
  overflow: scroll;
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
  column-count: 3;
  column-gap: 15px;
  column-fill: balance;
}

.post-item {
  background-color: #07121f;
  color: rgb(225, 229, 234);
  padding: 20px;
  transition: box-shadow 0.3s ease;
  margin-bottom: 15px;
  break-inside: avoid;
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
   width: 100%; 
   height: auto; 
   max-height: 700px; 
   overflow: auto; 
   scrollbar-width: thin; 
   overflow-x: hidden; 
   margin-bottom: 15px; 
 }

.content-text {
  margin-bottom: 10px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 链接样式 */
.post-link {
  color: #499deb;
  text-decoration: underline;
  word-break: break-all;
  transition: color 0.3s ease;
}

.post-link:hover {
  color: #6bb7ff;
}

.post-image {
  max-width: 100%;
  transition: all 0.3s ease;
}

.post-image:hover {
  transform: scale(1.01);
  box-shadow: 0 0 10px rgba(41, 104, 163, 0.34);
}

/* 互动栏样式 */
.post-interaction-bar {
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
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.comments-section.expanded {
  max-height: 1000px;
}

.comment-input-wrapper {
  border-top: 2px solid #385894a7;
  margin-top: 20px;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
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

/* 加载更多按钮 */
.load-more-section {
  width: 100%;
  text-align: center;
  padding: 20px 0;
}

.load-more-btn {
  width: 100%;
  padding: 10px 20px;
  background-color: #274760b6;
  color: #dce3e6;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.load-more-btn:hover {
  background-color: #345f7fb6;
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
</style>