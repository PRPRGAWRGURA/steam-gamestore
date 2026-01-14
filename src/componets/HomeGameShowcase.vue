<script>
import { ref, onMounted } from 'vue';
import { gameitemAPI } from '@/utils/api/gameitemAPI';
import { loadGamesFromCache, saveGamesToCache } from '@/utils/tools/cacheUtils';

export default {
  name: 'HomeGameShowcase',
  setup() {
    // 游戏列表 - 从数据库获取
    const games = ref([]);
    const loading = ref(false);
    
    // 比较两个游戏列表是否相同
    const areGamesEqual = (games1, games2) => {
      // 先比较长度
      if (games1.length !== games2.length) return false;
      
      // 比较每个游戏的关键属性
      for (let i = 0; i < games1.length; i++) {
        const game1 = games1[i];
        const game2 = games2.find(g => g.id === game1.id);
        
        if (!game2) return false;
        
        // 比较关键属性
        if (game1.name !== game2.name ||
            game1.price !== game2.price ||
            game1.discount !== game2.discount ||
            JSON.stringify(game1.game_tags) !== JSON.stringify(game2.game_tags)) {
          return false;
        }
      }
      
      return true;
    };
    
    // 加载游戏数据
    const loadGames = async () => {
      try {
        loading.value = true;
        // 每次刷新页面都进行API请求，增加字段以便在详情页使用缓存数据
        const response = await gameitemAPI.getGames({
          page: 1,
          pageSize: 'unlimited',
          sortBy: 'created_at',
          sortAsc: false,
          fields: 'id,game_name,game_price,game_discount,game_tags,hero_img,created_at,game_publisher,game_type'
        });
        
        if (response.success && response.data) {
          // 转换API返回的数据结构，适配组件需要的字段名
          const formattedGames = response.data.items.map(game => {
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
              releaseDate: game.created_at,
              publisher: game.game_publisher, // 新增：保存发行商信息到缓存
              genre: game.game_type // 新增：保存游戏类型到缓存
            };
          });
          
          // 获取当前缓存数据
          const cachedGames = loadGamesFromCache();
          
          // 比较新数据与缓存数据
          if (!cachedGames || !areGamesEqual(formattedGames, cachedGames)) {
            // 数据不一致，更新缓存
            saveGamesToCache(formattedGames);
            console.log('游戏列表已更新并保存到缓存');
          } else {
            console.log('游戏列表未变化，使用缓存数据');
          }
          
          // 无论是否更新缓存，都使用新获取的数据
          games.value = formattedGames;
        }
      } catch (error) {
        console.error('加载游戏数据失败:', error);
        
        // 加载失败时，尝试从缓存获取数据
        const cachedGames = loadGamesFromCache();
        if (cachedGames) {
          console.log('API请求失败，从缓存加载游戏列表');
          games.value = cachedGames;
        }
      } finally {
        loading.value = false;
      }
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
      // 先计算最终价格
      let finalPrice = price;
      if (discount && discount < 1) {
        finalPrice = price * discount;
      }
      
      // 如果最终价格为0，显示"免费"
      if (finalPrice === 0) {
        return "免费";
      }
      
      return finalPrice.toFixed(2);
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
    >
        <div class="game-image">
          <img :src="game.image" :alt="game.name" />
        </div>
        <div class="game-info">
            <div class="game-price-container" :class="{'free': game.discount && game.discount < 1 && game.price > 0}">
              <!-- 折扣标签 -->
              <span class="discount-badge" v-if="game.discount && game.discount < 1 && game.price > 0">
                -{{ calculateDiscountPercent(game.discount) }}%
              </span>
              <!-- 原价 -->
              <span class="original-price" v-if="game.discount && game.discount < 1 && game.price > 0">
                ￥{{ game.price.toFixed(2) }}
              </span>
              <!-- 折扣价格 -->
              <span class="game-price" :class="{'discount': game.discount && game.discount < 1 && game.price > 0}">
                {{ calculateDiscountPrice(game.price, game.discount) === '免费' ? '' : '￥' }}{{ calculateDiscountPrice(game.price, game.discount) }}
              </span>
            </div>
          </div>
      </router-link>
      
      <!-- 悬停详情 - 绝对定位在卡片右侧 -->
      <div class="game-detail">
        <div class="detail-content">
          <!-- 游戏名称 -->
          <h3 class="detail-title">{{ game.name }}</h3>
          <!-- 发行日期 -->
          <p class="detail-release-date">发行日期：{{ formatDate(game.releaseDate) }}</p>

          <!-- 详细图片 -->
          <div class="detail-image">
            <img :src="game.image" :alt="game.name" />
          </div>
          
          <!-- 游戏信息 -->
          <div class="detail-info">
            <!-- 显示游戏标签 -->
            <div class="info-section">
              <h4>游戏标签</h4>
              <div class="game-tags">
                <span 
                  v-for="(tag, index) in game.game_tags" 
                  :key="index" 
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
          
          
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.GS_container_games {
  padding: 48px 0;
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
  height: auto;
  background-color: #4773a07f;
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
  padding-bottom: 4px;
  padding-left: 4px;
  color: #c7d5e0; /* Steam文字色 */
  background-color: #4773a07f;
  text-decoration: none; /* 去除下划线 */
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
  background-color: transparent;
  width: fit-content;
  height: 18px;
  line-height: 18px;
  box-sizing: border-box;
  gap: 8px;
  font-size: 14px;
  flex-wrap: nowrap;
}

.free {
  background-color: #4a4949;
}

.game-price {
  padding: 0 5px;
  font-size: 14px;
  font-weight: 600;
  color: #fff; /* 白色文字 */
}

.discount {
  color: rgb(95, 219, 37);
}

.original-price {
  color: #999; /* 灰色文字 */
  text-decoration: line-through;
  font-size: 14px;
}

.discount-badge {
  background-color: rgba(74, 185, 18, 0.643);
  color: rgb(69, 230, 33);
  width: 40px;
  padding: 0 5px;
  text-align: center;
  box-sizing: border-box;
  font-weight: 800;
  font-size: 12px;
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
  right: -400px; /* 显示在卡片右侧，间距10px */
  height: auto;
  max-height: 100vh;
  overflow-y: auto;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
  /* 延迟显示 */
  transition-delay: 0.3s;
}

/* 每行后两个游戏，将详情面板显示在左侧 */
.game-card-wrapper:nth-child(5n+4) .game-detail,
.game-card-wrapper:nth-child(5n+5) .game-detail {
  right: auto;
  left: -400px; /* 显示在卡片左侧，间距10px */
}

/* 悬停时显示详情面板 */
.game-card:hover + .game-detail {
  opacity: 1;
  visibility: visible;
  transition-delay: 0.3s;
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



</style>