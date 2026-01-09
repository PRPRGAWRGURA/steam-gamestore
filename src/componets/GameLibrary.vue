<script>
import { ref, reactive, onMounted } from 'vue';

export default {
  name: 'GameLibrary',
  setup() {
    // 游戏列表 - 这里会从数据库获取，目前使用模拟数据
    const games = ref([]);
    
    // 游戏库统计信息
    const libraryStats = reactive({
      totalGames: 50,
      displayedGames: 14
    });
    
    // 排序选项
    const sortOptions = [
      { value: 'date', label: '添加至库的日期' },
      { value: 'name', label: '游戏名称' },
      { value: 'playtime', label: '游戏时间' }
    ];
    
    const selectedSort = ref('date');
    
    // 生成模拟游戏数据
    const generateMockGames = () => {
      // 从public/library目录获取的实际图片文件名
      const libraryImages = [
        '1016920_library_600x900.jpg',
        '1044620_library_600x900_schinese.jpg',
        '1046400_library_600x900.jpg',
        '105600_library_600x900.jpg',
        '1057090_library_600x900.jpg',
        '1070910_library_600x900.jpg',
        '107600_library_600x900.jpg',
        '1093910_library_600x900.jpg',
        '1144400_library_600x900_schinese.jpg',
        '1151640_library_600x900.jpg',
        '1174180_library_600x900.jpg',
        '1202540_library_600x900_schinese.jpg',
        '1222140_library_600x900.jpg',
        '1222680_library_600x900.jpg',
        '1227890_library_600x900_schinese.jpg',
        '1230140_library_600x900.jpg',
        '1237970_library_600x900.jpg',
        '1238840_library_600x900.jpg',
        '1245620_library_600x900.jpg',
        '1250760_library_600x900_schinese.jpg',
        '1277930_library_600x900.jpg',
        '1281930_library_600x900.jpg',
        '1282100_library_600x900.jpg',
        '1285670_library_600x900.jpg',
        '1289310_library_600x900.jpg',
        '1306630_library_600x900.jpg',
        '1326470_library_600x900.jpg',
        '1369630_library_600x900.jpg',
        '1398210_library_600x900.jpg',
        '1434480_library_600x900_schinese.jpg',
        '1446780_library_600x900.jpg',
        '1449560_library_600x900.jpg',
        '1451940_library_600x900_schinese.jpg',
        '1501750_library_600x900_schinese.jpg',
        '1549690_library_600x900.jpg',
        '1562700_library_600x900_schinese.jpg',
        '1584090_library_600x900.jpg',
        '1592670_library_600x900.jpg',
        '1608640_library_600x900.jpg',
        '1623730_library_600x900_schinese.jpg',
        '1659420_library_600x900_schinese.jpg',
        '1669980_library_600x900_schinese.jpg',
        '1672970_library_600x900.jpg',
        '1701520_library_600x900_schinese.jpg',
        '1752760_library_600x900.jpg',
        '1755910_library_600x900.jpg',
        '1756470_library_600x900.jpg',
        '18010_library_600x900.jpg',
        '18030_library_600x900.jpg',
        '1817070_library_600x900.jpg'
      ];
      
      // 从public/GamesImage目录获取的实际图片文件名
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
        '1282100_header.jpg',
        '1289310_header.jpg',
        '1300710_header.jpg',
        '1306630_header.jpg',
        '1324970_header.jpg',
        '1326470_header.jpg',
        '1354960_header.jpg',
        '1369630_header.jpg',
        '1391110_header.jpg',
        '1420170_header.jpg',
        '1432640_header.jpg',
        '1446780_header.jpg',
        '1449560_header.jpg',
        '1468290_header.jpg',
        '1493710_header.jpg',
        '1498210_header.jpg',
        '1517030_header.jpg',
        '1543420_header.jpg',
        '1549690_header.jpg',
        '1562700_header.jpg',
        '1580130_header.jpg'
      ];
      
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
        'Dota 2',
        'Rocket League',
        'Among Us',
        'Fall Guys',
        'The Sims 4',
        'Civilization VI',
        'Stardew Valley',
        'Terraria',
        'Hollow Knight',
        'Dead Cells',
        'Dark Souls III',
        'Bloodborne',
        'Sekiro: Shadows Die Twice',
        'Elden Ring',
        'Monster Hunter: World',
        'Resident Evil Village',
        'Death Stranding',
        'Ghost of Tsushima',
        'Persona 5 Royal',
        'Final Fantasy VII Remake',
        'Kingdom Hearts III'
      ];
      
      // 生成50个游戏对象
      const gamesList = [];
      for (let i = 0; i < 50; i++) {
        // 随机生成添加日期
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 365));
        
        // 随机生成游戏时间
        const totalPlaytime = Math.floor(Math.random() * 100);
        const recentPlaytime = Math.floor(Math.random() * 20);
        
        gamesList.push({
          id: i + 1,
          name: gameNames[i % gameNames.length] + (gameNames.length <= i ? ` ${i + 1}` : ''),
          coverImage: `/library/${libraryImages[i % libraryImages.length]}`,
          detailImage: `/GamesImage/${gamesImages[i % gamesImages.length]}`, // 使用实际的详细图片
          addedDate: randomDate,
          playtime: {
            total: totalPlaytime,
            recent: recentPlaytime
          },
          genre: ['Action', 'Adventure'][i % 2],
          developer: `Developer ${i + 1}`
        });
      }
      
      return gamesList;
    };
    
    // 加载游戏数据
    const loadGames = async () => {
      try {
        // 实际项目中，这里会从数据库或API获取数据
        // 例如：const response = await fetch('/api/games');
        //       games.value = await response.json();
        
        // 目前使用模拟数据
        games.value = generateMockGames();
      } catch (error) {
        console.error('Failed to load games:', error);
      }
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
          // 先隐藏面板（触发淡出动画）
          isPanelVisible.value = false;
          // 等待过渡动画结束后再清空悬停游戏
          setTimeout(() => {
            hoveredGame.value = null;
            console.log('详情面板已隐藏');
          }, 300); // 与过渡动画时长一致
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
      if (hoverDelayTimer) {
        clearTimeout(hoverDelayTimer);
        hoverDelayTimer = null;
      }
    };
    
    // 处理游戏卡片悬停事件
    const handleGameHover = (game, event) => {
      // 清除所有计时器
      clearCountdown();
      
      // 如果有悬停延迟计时器，清除它
      if (hoverDelayTimer) {
        clearTimeout(hoverDelayTimer);
        hoverDelayTimer = null;
      }
      
      isHovering.value = true;
      
      // 获取游戏卡片的元素
      const cardElement = event.currentTarget;
      // 获取卡片在视口中的位置和尺寸
      const cardRect = cardElement.getBoundingClientRect();
      // 获取游戏卡片包装器的元素
      const wrapperElement = cardElement.parentElement;
      // 获取包装器在视口中的位置
      const wrapperRect = wrapperElement.getBoundingClientRect();
      
      // 固定每行显示7个游戏
      const cardsPerRow = 7;
      const gameIndex = games.value.findIndex(g => g.id === game.id);
      const positionInRow = gameIndex % cardsPerRow;
      
      // 详情面板的尺寸
      const panelWidth = 350;
      const panelHeight = 450;
      
      // 计算详情面板的位置（相对于包装器）
      let left = cardRect.width + 10; // 显示在卡片右侧，间距10px
      let top = 0; // 与卡片顶部对齐
      
      // 如果是每行的后两个游戏，将详细信息面板显示在卡片左侧（与卡片左侧间距50px千万不要修改）
      if (positionInRow >= cardsPerRow - 3) {
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
      
      // 0.3秒后显示详情面板
      hoverDelayTimer = setTimeout(() => {
        hoveredGame.value = game;
        // 设置详情面板样式
        detailStyle.left = `${left}px`;
        detailStyle.top = `${top}px`;
        
        // 显示面板并触发淡入动画
        isPanelVisible.value = true;
      }, 300); // 0.3秒延迟不要修改
    };
    
    // 处理鼠标离开事件
    const handleMouseLeave = () => {
      // 设置延迟隐藏，给用户时间移动鼠标到详情面板
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
    
    // 格式化游戏时间
    const formatPlaytime = (hours) => {
      if (hours < 1) {
        return `${Math.round(hours * 60)} 分钟`;
      }
      return `${hours} 小时`;
    };
    
    // 组件挂载时加载游戏数据
    onMounted(() => {
      loadGames();
    });
    
    return {
      games,
      libraryStats,
      sortOptions,
      selectedSort,
      formatDate,
      formatPlaytime
    };
  }
};
</script>

<template>
  <div class="gs-game-library">
    <!-- 游戏库头部 -->
    <div class="library-header">
      <div class="library-title">
        <h2>所有游戏 ({{ libraryStats.displayedGames }}/{{ libraryStats.totalGames }})</h2>
        <button class="library-filter">
          <span class="filter-icon"><FontAwesomeIcon icon="gamepad" /></span>
        </button>
      </div>
      
      <div class="library-controls">
        <div class="sort-selector">
          <label>排序方式：</label>
          <select v-model="selectedSort">
            <option 
              v-for="option in sortOptions" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <button class="view-toggle">
          <span class="toggle-icon"><FontAwesomeIcon icon="list" /></span>
        </button>
      </div>
    </div>
    
    <!-- 游戏网格 -->
    <div class="games-grid">
      <div 
        v-for="game in games" 
        :key="game.id"
        class="game-card-wrapper"
      >
        <div 
          class="game-card"
        >
          <div class="game-cover">
            <img :src="game.coverImage" :alt="game.name" />
          </div>
          <div class="game-date">
            {{ formatDate(game.addedDate) }}
          </div>
        </div>
        
        <!-- 悬停详情 - 绝对定位在卡片右侧 -->
        <div class="game-detail">
          <div class="detail-content">
            <!-- 游戏名称 -->
            <h3 class="detail-title">{{ game.name }}</h3>
            <!-- 发行日期 -->
            <p class="detail-release-date">添加日期：{{ formatDate(game.addedDate) }}</p>
            
            <!-- 详细图片 -->
            <div class="detail-image">
              <img :src="game.detailImage" :alt="game.name" />
            </div>
            
            <!-- 游戏信息 -->
            <div class="detail-info">
              <!-- 游戏时间 -->
              <div class="info-section">
                <h4>游戏时间</h4>
                <div class="playtime-info">
                  <div class="playtime-item">
                    <span class="playtime-label">过去两周：</span>
                    <span class="playtime-value">{{ formatPlaytime(game.playtime.recent) }}</span>
                  </div>
                  <div class="playtime-item">
                    <span class="playtime-label">总数：</span>
                    <span class="playtime-value">{{ formatPlaytime(game.playtime.total) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 游戏详情 -->
              <div class="info-section">
                <h4>游戏详情</h4>
                <div class="detail-meta">
                  <div class="meta-item">
                    <span class="meta-label">类型：</span>
                    <span class="meta-value">{{ game.genre }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">开发商：</span>
                    <span class="meta-value">{{ game.developer }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="detail-actions">
              <button class="play-button">开始游戏</button>
              <button class="library-button">管理游戏</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gs-game-library {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* 游戏库头部 */
.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: white;
}

.library-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.library-title h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.library-filter {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.library-filter:hover {
  background: rgba(255, 255, 255, 0.2);
}

.library-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.sort-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.sort-selector select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 0.9rem;
}

.view-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 游戏网格 */
.games-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 40px;
}

.game-card-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.game-card {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.game-card:hover {
  transform: translateY(-5px);
}

.game-cover {
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  aspect-ratio: 2/3; /* 600x900 比例 */
}

.game-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.game-card:hover .game-cover img {
  transform: scale(1.05);
}

.game-date {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 0.75rem;
  z-index: 2;
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
  right: -370px; /* 显示在卡片右侧，间距10px */
  height: auto;
  max-height: 100vh;
  overflow-y: auto;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
  /* 延迟显示 */
  transition-delay: 0.3s;
}

/* 每行后三个游戏，将详情面板显示在左侧 */
.game-card-wrapper:nth-child(7n+5) .game-detail,
.game-card-wrapper:nth-child(7n+6) .game-detail,
.game-card-wrapper:nth-child(7n+7) .game-detail {
  right: auto;
  left: -370px; /* 显示在卡片左侧，间距10px */
}

/* 悬停时显示详情面板 */
.game-card:hover + .game-detail {
  opacity: 1;
  visibility: visible;
  transition-delay: 0.3s;
}

.detail-release-date {
  font-size: 0.9rem;
  color: #67c1f5;
  margin: 5px 0 15px 0;
  font-weight: 500;
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

.playtime-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.playtime-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.playtime-label {
  opacity: 0.8;
}

.playtime-value {
  font-weight: 600;
  color: #4ade80;
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

.play-button {
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

.play-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(66, 153, 225, 0.3);
}

.library-button {
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

.library-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .games-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
  }
  
  .game-detail {
    width: 300px;
    padding: 15px;
  }
}

@media (max-width: 768px) {
  .library-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .library-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .games-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }
  
  /* 移动端隐藏悬停详情，使用点击交互 */
  .game-detail {
    display: none;
  }
}
</style>