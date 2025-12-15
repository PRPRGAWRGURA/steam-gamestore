<script>
import { ref, reactive } from 'vue';

export default {
  name: 'HomeGameShowcase',
  setup() {
    // 游戏列表 - 这里会从数据库获取，目前使用模拟数据
    const games = ref([]);
    
    // 当前悬停的游戏
    const hoveredGame = ref(null);
    const hoverPosition = reactive({ x: 0, y: 0 });
    
    // 游戏名称列表
    const gameNames = [
      'Journey',
      '逃鸭科夫',
      'Horizon Zero Dawn',
      'Undertale',
      'Stellar Blade',
      'Uncharted',
      'Red Dead Redemption 2',
      'Animal Well',
      'Colt Canyon',
      'First Cut: Samurai Duel',
      'Celeste',
      'Katana Zero',
      'Bongo Cat',
      'World War V: Last Call',
      'The Last of Us',
      'God of War',
      'Spider-Man',
      'Cyberpunk 2077',
      'Assassin\'s Creed Valhalla',
      'Far Cry 6',
      'Call of Duty: Warzone',
      'Fortnite',
      'Minecraft',
      'Grand Theft Auto V',
      'League of Legends',
      'Apex Legends',
      'Overwatch 2',
      'Rainbow Six Siege',
      'Valorant',
      'Dota 2'
    ];
    
    // GamesImage目录下的实际图片文件名
    const gamesImages = [
      '1007_header.jpg',
      '1024110_header.jpg',
      '1046400_library_header.jpg',
      '1054830_header.jpg',
      '105600_header.jpg',
      '1057090_header.jpg',
      '1070560_header.jpg',
      '107600_header.jpg',
      '1093910_header.jpg',
      '1112520_header.jpg',
      '1112521_header.jpg',
      '1113280_header.jpg',
      '1135280_header.jpg',
      '1143852_header.jpg',
      '1151640_header.jpg',
      '1161040_header.jpg',
      '1174180_header.jpg',
      '1174580_header.jpg',
      '1177880_header.jpg',
      '1179800_header.jpg',
      '1222680_header.jpg',
      '1230140_library_header.jpg',
      '1237970_header.jpg',
      '1238840_header.jpg',
      '1241570_header.jpg',
      '1245040_header.jpg',
      '1245620_header.jpg',
      '1277930_header.jpg',
      '1281930_header.jpg',
      '1282100_header.jpg'
    ];
    
    // 加载游戏数据
    const loadGames = () => {
      // 模拟数据：生成30个游戏对象，之后可替换为从数据库或API导入的数据
      games.value = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        name: gameNames[i % gameNames.length],
        image: `/GamesImage/${gamesImages[i % gamesImages.length]}`, // 使用实际的GamesImage图片
        price: (Math.random() * 100).toFixed(2), // 随机价格模拟
        tags: ['Action', 'Adventure'][i % 2], // 示例标签，可扩展
        genre: ['Action', 'Adventure', 'RPG', 'Shooter', 'Strategy'][i % 5],
        developer: `Developer ${i + 1}`,
        releaseDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000))
      }));
    };
    
    // 处理游戏卡片悬停事件
    const handleGameHover = (game, event) => {
      hoveredGame.value = game;
      
      // 计算悬停信息框的位置
      let x = event.clientX + 20;
      let y = Math.max(20, event.clientY - 50);
      
      // 固定每行显示5个游戏
      const cardsPerRow = 5;
      const gameIndex = games.value.findIndex(g => g.id === game.id);
      const positionInRow = gameIndex % cardsPerRow;
      
      // 如果是每行的后两个游戏，将详细信息面板显示在鼠标左侧
      if (positionInRow >= cardsPerRow - 2) {
        x = event.clientX - 370; // 350px面板宽度 + 20px间距
      }
      
      // 确保信息框不会超出浏览器视口
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const panelWidth = 350;
      const panelHeight = 450;
      
      // 如果信息框超出右侧视口，调整到左侧
      if (x + panelWidth > viewportWidth) {
        x = viewportWidth - panelWidth - 20;
      }
      
      // 如果信息框超出左侧视口，调整到右侧
      if (x < 20) {
        x = 20;
      }
      
      // 如果信息框超出底部视口，调整到上方
      if (y + panelHeight > viewportHeight) {
        y = viewportHeight - panelHeight - 20;
      }
      
      hoverPosition.x = x;
      hoverPosition.y = y;
    };
    
    // 处理鼠标离开事件
    const handleMouseLeave = () => {
      hoveredGame.value = null;
    };
    
    // 格式化日期
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    // 组件挂载时加载游戏数据
    loadGames();
    
    return {
      games,
      hoveredGame,
      hoverPosition,
      handleGameHover,
      handleMouseLeave,
      formatDate
    };
  }
};
</script>

<template>
  <div class="GS_container_games">
    <router-link 
      v-for="game in games" 
      :key="game.id"
      :to="{ path: '/gamedetail/' + game.id }"
      class="game-card"
      @mouseenter="handleGameHover(game, $event)"
      @mouseleave="handleMouseLeave"
      @mousemove="handleGameHover(game, $event)"
    >
      <div class="game-image">
        <img :src="game.image" :alt="game.name" />
      </div>
      <div class="game-info">
        <h3 class="game-title">{{ game.name }}</h3>
        <div class="game-tags">
          <span class="tag">{{ game.tags }}</span>
        </div>
        <div class="game-price">
          ${{ game.price }}
        </div>
      </div>
    </router-link>
    
    <!-- 悬停详情 -->
    <div 
      v-if="hoveredGame" 
      class="game-detail"
      :style="{
        left: `${hoverPosition.x}px`,
        top: `${hoverPosition.y}px`
      }"
    >
      <div class="detail-content">
        <!-- 游戏名称 -->
        <h3 class="detail-title">{{ hoveredGame.name }}</h3>
        
        <!-- 详细图片 -->
        <div class="detail-image">
          <img :src="hoveredGame.image" :alt="hoveredGame.name" />
        </div>
        
        <!-- 游戏信息 -->
        <div class="detail-info">
          <div class="info-section">
            <h4>游戏详情</h4>
            <div class="detail-meta">
              <div class="meta-item">
                <span class="meta-label">类型：</span>
                <span class="meta-value">{{ hoveredGame.genre }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">开发商：</span>
                <span class="meta-value">{{ hoveredGame.developer }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">发布日期：</span>
                <span class="meta-value">{{ formatDate(hoveredGame.releaseDate) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">价格：</span>
                <span class="meta-value">${{ hoveredGame.price }}</span>
              </div>
            </div>
          </div>
          
          <div class="info-section">
            <h4>游戏标签</h4>
            <div class="game-tags">
              <span class="tag">{{ hoveredGame.tags }}</span>
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

.game-card {
  background-color: #1b2838; /* Steam暗色主题背景 */
  border-radius: 4px; /* 轻微圆角 */
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* 轻微阴影 */
  transition: transform 0.2s, box-shadow 0.2s; /* hover效果 */
  cursor: pointer;
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

.game-title {
  font-size: 14px;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
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
}

.game-price {
  text-align: right;
  font-size: 14px;
  color: #acdbf5; /* Steam价格色 */
  font-weight: 600;
}

/* 悬停详情 */
.game-detail {
  position: fixed;
  width: 350px;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  padding: 20px;
  z-index: 1000;
  pointer-events: none;
  color: white;
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

.detail-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.9rem;
}

.meta-item {
  display: flex;
  justify-content: space-between;
}

.meta-label {
  opacity: 0.8;
}

.meta-value {
  font-weight: 500;
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .GS_container_games {
    grid-template-columns: repeat(4, minmax(200px, 1fr)); /* 响应式调整为每行4个 */
    max-width: 1000px;
  }
}

@media (max-width: 1000px) {
  .GS_container_games {
    grid-template-columns: repeat(3, minmax(200px, 1fr)); /* 响应式调整为每行3个 */
    max-width: 750px;
  }
}

@media (max-width: 750px) {
  .GS_container_games {
    grid-template-columns: repeat(2, minmax(200px, 1fr)); /* 响应式调整为每行2个 */
    max-width: 500px;
  }
}

@media (max-width: 500px) {
  .GS_container_games {
    grid-template-columns: 1fr; /* 响应式调整为每行1个 */
    max-width: 300px;
  }
}
</style>