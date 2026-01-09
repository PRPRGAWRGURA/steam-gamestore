<script>
import { ref, reactive, onMounted } from 'vue';
import { gameitemAPI } from '@/utils/api/gameitemAPI';

export default {
  name: 'HomeGameShowcase',
  setup() {
    // 游戏列表 - 从数据库获取
    const games = ref([]);
    const loading = ref(false);
    
    // 当前悬停的游戏
    const hoveredGame = ref(null);
    // 详情面板样式
    const detailStyle = reactive({});
    // 延迟隐藏计时器
    let hideTimer = null;
    // 倒计时计时器
    let countdownTimer = null;
    // 当前倒计时秒数
    const countdown = ref(0);
    // 悬停状态标志
    const isHovering = ref(false);
    
    // 加载游戏数据
    const loadGames = async () => {
      try {
        loading.value = true;
        // 使用真实API获取游戏列表，只返回需要的字段，加载全部数据，按创建时间倒序
        // 重新添加game_tags字段，因为需要显示标签
        // 使用'unlimited'作为pageSize，加载所有游戏数据
        const response = await gameitemAPI.getGames({
          page: 1,
          pageSize: 'unlimited',
          sortBy: 'created_at',
          sortAsc: false,
          fields: 'id,game_name,game_price,game_discount,game_tags,hero_img,created_at'
        });
        
        if (response.success && response.data) {
          // 转换API返回的数据结构，适配组件需要的字段名
          games.value = response.data.items.map(game => {
            // 处理game_tags字段，将逗号分隔的字符串转换为数组
            let tagsArray = [];

            // 根据需求，游戏标签只会是多个且用逗号分隔的字符串
            tagsArray = game.game_tags ? game.game_tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
            
            return {
              id: game.id,
              name: game.game_name,
              image: game.hero_img, // 使用hero_img作为游戏卡片图片
              price: game.game_price,
              discount: game.game_discount,
              game_tags: tagsArray, // 完整的标签数组
              releaseDate: game.created_at
            };
          });
        }
      } catch (error) {
        console.error('加载游戏数据失败:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 处理游戏卡片悬停事件
    const handleGameHover = (game, event) => {
      // 清除所有计时器
      clearCountdown();
      
      isHovering.value = true;
      hoveredGame.value = game;
      
      // 获取游戏卡片的元素
      const cardElement = event.currentTarget;
      // 获取卡片在视口中的位置和尺寸
      const cardRect = cardElement.getBoundingClientRect();
      // 获取游戏卡片包装器的元素
      const wrapperElement = cardElement.parentElement;
      // 获取包装器在视口中的位置
      const wrapperRect = wrapperElement.getBoundingClientRect();
      
      // 固定每行显示5个游戏
      const cardsPerRow = 5;
      const gameIndex = games.value.findIndex(g => g.id === game.id);
      const positionInRow = gameIndex % cardsPerRow;
      
      // 详情面板的尺寸
      const panelWidth = 350;
      const panelHeight = 450;
      
      // 计算详情面板的位置（相对于包装器）
      let left = cardRect.width + 10; // 显示在卡片右侧，间距10px
      let top = 0; // 与卡片顶部对齐
      
      // 如果是每行的后两个游戏，将详细信息面板显示在卡片左侧（与卡片左侧间距50px千万不要修改）
      if (positionInRow >= cardsPerRow - 2) {
        left = -panelWidth - 50;
      }
      
      // 确保信息框不会超出浏览器视口
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // 获取详情面板在视口中的预计位置
      const panelViewportLeft = wrapperRect.left + left;
      const panelViewportRight = panelViewportLeft + panelWidth;
      const panelViewportTop = wrapperRect.top + top;
      const panelViewportBottom = panelViewportTop + panelHeight;
      
      // 如果信息框超出右侧视口，调整到左侧
      if (panelViewportRight > viewportWidth) {
        left = -panelWidth - 50;
      }
      
      // 如果信息框超出左侧视口，调整到右侧
      if (panelViewportLeft < 0) {
        left = cardRect.width + 10;
      }
      
      // 如果信息框超出底部视口，调整到上方
      if (panelViewportBottom > viewportHeight) {
        top = viewportHeight - panelViewportTop - panelHeight - 20;
      }
      
      
      // 设置详情面板样式
      detailStyle.left = `${left}px`;
      detailStyle.top = `${top}px`;
    };
    
    // 开始倒计时
    const startCountdown = () => {
      // 清除现有的计时器
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
      
      // 设置初始倒计时时间（200ms）
      const delay = 200;
      const interval = 10; // 每10ms更新一次
      const totalSteps = delay / interval;
      let step = 0;
      
      // 立即输出开始信息
      console.log('倒计时开始:', delay, 'ms');
      
      // 开始倒计时间隔
      countdownTimer = setInterval(() => {
        step++;
        const remaining = delay - (step * interval);
        
        // 输出当前倒计时和isHovering状态
        console.log('倒计时剩余:', remaining, 'ms, isHovering:', isHovering.value);
        
        // 如果倒计时结束
        if (step >= totalSteps) {
          clearInterval(countdownTimer);
          countdownTimer = null;
          
          // 执行隐藏操作，添加详细日志
          console.log('倒计时结束，准备隐藏详情面板，isHovering:', isHovering.value);
          // 直接隐藏面板，不考虑isHovering状态，因为倒计时结束说明用户已经离开
          hoveredGame.value = null;
          console.log('详情面板已隐藏');
        }
      }, interval);
    };
    
    // 清除倒计时
    const clearCountdown = () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        console.log('倒计时已清除');
      }
    };
    
    // 处理鼠标离开事件
    const handleMouseLeave = () => {
      // 设置延迟隐藏，给用户时间移动鼠标到详情面板
      startCountdown();
    };
    
    // 处理详情面板鼠标进入事件
    const handleDetailMouseEnter = () => {
      isHovering.value = true;
      clearCountdown();
    };
    
    // 处理详情面板鼠标离开事件
    const handleDetailMouseLeave = () => {
      isHovering.value = false;
      // 延迟隐藏，防止快速移动时闪烁
      startCountdown();
    };
    
    // 格式化日期
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    // 计算折扣价格
    const calculateDiscountPrice = (price, discount) => {
      if (discount && discount < 1) {
        return (price * discount).toFixed(2);
      }
      return price.toFixed(2);
    };
    
    // 计算折扣百分比
    const calculateDiscountPercent = (discount) => {
      if (discount && discount < 1) {
        return Math.round((1 - discount) * 100);
      }
      return 0;
    };
    
    // 组件挂载时加载游戏数据
    onMounted(() => {
      loadGames();
    });
    
    return {
      games,
      loading,
      hoveredGame,
      detailStyle,
      handleGameHover,
      handleMouseLeave,
      handleDetailMouseEnter,
      handleDetailMouseLeave,
      formatDate,
      calculateDiscountPrice,
      calculateDiscountPercent
    };
  }
};
</script>

<template>
  <div class="GS_container_games">
    <div 
      v-for="game in games" 
      :key="game.id"
      class="game-card-wrapper"
    >
      <router-link 
        :to="{ path: '/gamedetail/' + game.id }"
        class="game-card"
        @mouseenter="handleGameHover(game, $event)"
        @mouseleave="handleMouseLeave"
      >
        <div class="game-image">
          <img :src="game.image" :alt="game.name" />
        </div>
        <div class="game-info">
            <!-- 去掉游戏标题 -->
            <!-- <h3 class="game-title">{{ game.name }}</h3> -->
            <!-- 隐藏标签显示 -->
            <!-- <div class="game-tags">
              <span class="tag">{{ game.tags }}</span>
            </div> -->
            <div class="game-price-container">
              <!-- 折扣标签 -->
              <span class="discount-badge" v-if="game.discount && game.discount < 1">
                -{{ calculateDiscountPercent(game.discount) }}%
              </span>
              <!-- 原价 -->
              <span class="original-price" v-if="game.discount && game.discount < 1">
                ￥{{ game.price.toFixed(2) }}
              </span>
              <!-- 折扣价格 -->
              <span class="game-price">
                ￥{{ calculateDiscountPrice(game.price, game.discount) }}
              </span>
            </div>
          </div>
      </router-link>
      
      <!-- 悬停详情 - 绝对定位在卡片右侧 -->
      <div 
        v-if="hoveredGame && hoveredGame.id === game.id" 
        class="game-detail"
        :style="detailStyle"
        @mouseenter="handleDetailMouseEnter"
        @mouseleave="handleDetailMouseLeave"
      >
        <div class="detail-content">
          <!-- 游戏名称 -->
          <h3 class="detail-title">{{ hoveredGame.name }}</h3>
          <!-- 发行日期 -->
          <p class="detail-release-date">发行日期：{{ formatDate(hoveredGame.releaseDate) }}</p>

          <!-- 详细图片 -->
          <div class="detail-image">
            <img :src="hoveredGame.image" :alt="hoveredGame.name" />
          </div>
          
          <!-- 游戏信息 -->
          <div class="detail-info">
            <!-- 显示游戏标签 -->
            <div class="info-section">
              <h4>游戏标签</h4>
              <div class="game-tags">
                <span 
                  v-for="(tag, index) in hoveredGame.game_tags" 
                  :key="index" 
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="detail-actions">
            <button class="add-to-cart">加入购物车</button>
            <button class="wishlist">愿望单</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.GS_container_games {
  padding-top: 48px;
  display: grid;
  grid-template-columns: repeat(5, minmax(200px, 1fr)); /* 每行显示5个游戏 */
  gap: 16px; /* 卡片间隙 */
  max-width: 1200px; /* 限制宽度，居中对齐 */
  margin: 0 auto; /* 居中 */
  position: relative;
}

.game-card-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.game-card {
  background-color: #1b2838; /* Steam暗色主题背景 */
  border-radius: 4px; /* 轻微圆角 */
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* 轻微阴影 */
  transition: transform 0.2s, box-shadow 0.2s; /* hover效果 */
  cursor: pointer;
  text-decoration: none; /* 去除下划线 */
  color: #c7d5e0; /* 添加这一行，设置正确的文字颜色 */
}

/* 确保所有链接都没有下划线 */
.game-card, .game-card:hover, .game-card:active, .game-card:visited {
  text-decoration: none; /* 去除所有状态下的下划线 */
}

.game-card:hover {
  transform: scale(1.05); /* 放大效果 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* 增强阴影 */
}

.game-image {
  width: 100%;
  height: 112px; /* 保持原有图片比例 */
  overflow: hidden;
}

.game-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.game-card:hover .game-image img {
  transform: scale(1.1); /* 图片放大效果 */
}

.game-info {
  padding: 8px;
  color: #c7d5e0; /* Steam文字色 */
  background-color: #1b2838;
}

/* 确保游戏信息区域的所有文字都没有下划线 */
.game-info {
  text-decoration: none; /* 去除下划线 */
  color: inherit; /* 继承父元素颜色 */
  padding: 8px;
}

/* 确保所有链接文字都没有下划线 */
.game-card * {
  text-decoration: none; /* 确保所有子元素都没有下划线 */
  color: inherit; /* 继承父元素颜色 */
}

.game-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.tag {
  background-color: #67c1f5; /* Steam标签色 */
  color: #182838;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 2px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  line-height: 1.4;
  height: 20px;
  box-sizing: border-box;
}

.game-price-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  font-size: 14px;
  flex-wrap: nowrap;
}

.game-price {
  color: #fff; /* 白色文字 */
  font-weight: 600;
  font-size: 18px; /* 更大的字体 */
}

.original-price {
  color: #999; /* 灰色文字 */
  text-decoration: line-through;
  font-size: 14px;
}

.discount-badge {
  background-color: #e61c44; /* 红色背景 */
  color: white; /* 白色文字 */
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

/* 悬停详情 */
.game-detail {
  position: absolute;
  width: 350px;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  padding: 20px;
  z-index: 1000;
  pointer-events: auto;
  color: white;
  top: 0;
  height: auto;
  max-height: 100vh;
  overflow-y: auto;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.detail-release-date {
  font-size: 0.9rem;
  color: #67c1f5;
  margin: 5px 0 15px 0;
  font-weight: 500;
}

.detail-image {
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-section h4 {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #4299e1;
}

.detail-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.add-to-cart {
  flex: 1;
  background: linear-gradient(45deg, #4299e1 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
}

.add-to-cart:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(66, 153, 225, 0.3);
}

.wishlist {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
}

.wishlist:hover {
  background: rgba(255, 255, 255, 0.2);
}

</style>