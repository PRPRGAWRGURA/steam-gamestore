<script>
import { ref, reactive, onMounted } from 'vue';

export default {
  name: 'GameLibrary',
  setup() {
    // 当前悬停的游戏
    const hoveredGame = ref(null);
    const hoverPosition = reactive({ x: 0, y: 0 });
    
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
    
    // 处理游戏卡片悬停事件
    const handleGameHover = (game, event) => {
      hoveredGame.value = game;
      
      // 获取游戏卡片在网格中的索引
      const gameIndex = games.value.findIndex(g => g.id === game.id);
      
      // 固定每行显示7个游戏
      const cardsPerRow = 7;
      
      // 计算游戏卡片在当前行的位置
      const positionInRow = gameIndex % cardsPerRow;
      
      // 计算悬停信息框的位置
      let x = event.clientX + 20;
      
      // 如果是每行的后三个游戏，将详细信息面板显示在鼠标左侧
      if (positionInRow >= cardsPerRow - 3) {
        x = event.clientX - 370; // 350px面板宽度 + 20px间距
      }
      
      // 确保信息框不会超出浏览器顶部
      let y = Math.max(20, event.clientY - 50);
      
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
      hoveredGame,
      hoverPosition,
      handleGameHover,
      handleMouseLeave,
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
        class="game-card"
        @mouseenter="handleGameHover(game, $event)"
        @mouseleave="handleMouseLeave"
        @mousemove="handleGameHover(game, $event)"
      >
        <div class="game-cover">
          <img :src="game.coverImage" :alt="game.name" />
        </div>
        <div class="game-date">
          {{ formatDate(game.addedDate) }}
        </div>
      </div>
    </div>
    
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
          <img :src="hoveredGame.detailImage" :alt="hoveredGame.name" />
        </div>
        
        <!-- 游戏信息 -->
        <div class="detail-info">
          <div class="info-section">
            <h4>游戏时间</h4>
            <div class="playtime-info">
              <div class="playtime-item">
                <span class="playtime-label">过去两周：</span>
                <span class="playtime-value">{{ formatPlaytime(hoveredGame.playtime.recent) }}</span>
              </div>
              <div class="playtime-item">
                <span class="playtime-label">总数：</span>
                <span class="playtime-value">{{ formatPlaytime(hoveredGame.playtime.total) }}</span>
              </div>
            </div>
          </div>
          
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
                <span class="meta-label">添加日期：</span>
                <span class="meta-value">{{ formatDate(hoveredGame.addedDate) }}</span>
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