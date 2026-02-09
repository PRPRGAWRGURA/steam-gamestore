<script>
import { ref, reactive, onMounted, watch } from 'vue';
import { gamelibraryAPI } from '@/utils/api/gamelibraryAPI';
import { useUserStore } from '@/stores/userStore';

export default {
  name: 'GameLibrary',
  setup() {
    const userStore = useUserStore();
    // 游戏列表 - 从数据库获取
    const games = ref([]);
    const isLoading = ref(false);
    const errorMessage = ref('');
    
    // 游戏库统计信息
    const libraryStats = reactive({
      totalGames: 0,
      displayedGames: 0
    });
    
    // 排序选项
    const sortOptions = [
      { value: 'date', label: '入库时间' },
      { value: 'name', label: '游戏名称' },
    ];
    
    const selectedSort = ref('date');
    // 自定义下拉栏状态
    const isDropdownOpen = ref(false);
    
    // 加载游戏数据
    const loadGames = async () => {
      try {
        isLoading.value = true;
        errorMessage.value = '';
        
        // 检查用户是否登录
        if (!userStore.currentUser) {
          errorMessage.value = '请先登录';
          return;
        }
        
        // 从API获取游戏库数据
        const result = await gamelibraryAPI.getUserGameLibrary(userStore.currentUser.id);
        
        if (result.success) {
          games.value = result.data;
          // 更新统计信息
          libraryStats.totalGames = result.data.length;
          libraryStats.displayedGames = result.data.length;
          // 加载完成后排序游戏列表
          sortGames();
        } else {
          errorMessage.value = result.error || '获取游戏库失败';
        }
      } catch (error) {
        console.error('加载游戏库时发生错误:', error);
        errorMessage.value = '加载游戏库时发生错误';
      } finally {
        isLoading.value = false;
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
    
    // 格式化游戏时间
    const formatPlaytime = (hours) => {
      if (hours < 1) {
        return `${Math.round(hours * 60)} 分钟`;
      }
      return `${hours} 小时`;
    };
    
    // 排序游戏列表
    const sortGames = () => {
      if (!games.value || games.value.length === 0) return;
      
      games.value.sort((a, b) => {
        switch (selectedSort.value) {
          case 'date':
            // 按入库时间排序（最新的在前）
            return new Date(b.addedDate) - new Date(a.addedDate);
          case 'name':
            // 按游戏名称排序（字母顺序）
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
    };
    
    // 自定义下拉栏方法
    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };
    
    const getSelectedOptionLabel = () => {
      const option = sortOptions.find(opt => opt.value === selectedSort.value);
      return option ? option.label : '';
    };
    
    const selectOption = (value) => {
      selectedSort.value = value;
      isDropdownOpen.value = false;
      // 选择选项后排序游戏列表
      sortGames();
    };
    
    // 监听排序选项变化
    watch(selectedSort, () => {
      sortGames();
    });
    
    // 组件挂载时加载游戏数据
    onMounted(() => {
      loadGames();
    });
    
    return {
      games,
      libraryStats,
      sortOptions,
      selectedSort,
      isLoading,
      errorMessage,
      formatDate,
      formatPlaytime,
      isDropdownOpen,
      toggleDropdown,
      getSelectedOptionLabel,
      selectOption
    };
  }
};
</script>

<template>
  <div class="gs-game-library">
    <!-- 消息提示区域 -->
    <div v-if="errorMessage" class="message error">
      {{ errorMessage }}
    </div>
    
    <!-- 游戏库头部 -->
    <div class="library-header">
      <div class="library-title">
        <h2>所有游戏（{{ libraryStats.totalGames }}）</h2>
        <button class="library-filter">
          <span class="filter-icon"><FontAwesomeIcon icon="gamepad" /></span>
        </button>
      </div>
      
      <div class="library-controls">
        <div class="sort-selector">
          <label>排序方式：</label>
          <div class="custom-select" @click="toggleDropdown">
            <div class="select-value">{{ getSelectedOptionLabel() }}</div>
            <div class="select-arrow">{{ isDropdownOpen ? '▲' : '▼' }}</div>
            <div v-if="isDropdownOpen" class="select-options">
              <div 
                v-for="option in sortOptions" 
                :key="option.value" 
                class="select-option" 
                :class="{ active: selectedSort === option.value }"
                @click.stop="selectOption(option.value)"
              >
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>
        
        <button class="view-toggle">
          <span class="toggle-icon"><FontAwesomeIcon icon="list" /></span>
        </button>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载游戏库...</p>
    </div>
    
    <!-- 游戏库为空时的提示 -->
    <div v-else-if="games.length === 0 && !errorMessage" class="empty-library">
      <p>游戏库是空的</p>
      <p class="empty-hint">购买游戏后会显示在这里</p>
    </div>
    
    <!-- 游戏网格 -->
    <div v-else class="games-grid">
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

/* 消息提示样式 */
.message {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.message.error {
  background-color: rgba(231, 76, 60, 0.1);
  border: 1px solid #e74c3c;
  color: #e74c3c;
}

/* 加载状态样式 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: rgba(10, 26, 46, 0.8);
  border-radius: 8px;
  margin: 20px 0;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #499deb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 空游戏库样式 */
.empty-library {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: rgba(10, 26, 46, 0.8);
  border-radius: 8px;
  margin: 20px 0;
  color: white;
  text-align: center;
}

.empty-library p {
  margin: 8px 0;
  font-size: 18px;
}

.empty-hint {
  color: #666;
  font-size: 14px !important;
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
  line-height: 1.2;
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

.filter-icon {
  display: flex;
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

.custom-select {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.custom-select:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.select-value {
  display: inline-block;
  vertical-align: middle;
}

.select-arrow {
  display: flex;
  position: absolute;
  right: 0;
  margin-right: 8px;
  font-size: 0.7rem;
  transition: transform 0.3s ease;
}

.select-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(75, 75, 75, 0.5);
  backdrop-filter: blur(2px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0 0 4px 4px;
  margin-top: 2px;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.select-option {
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-option:hover {
  background: rgba(255, 255, 255, 0.5);
}

.select-option.active {
  background: #f9f9f9d6;
  color: black;
}

/* 自定义滚动条 */
.select-options::-webkit-scrollbar {
  width: 6px;
}

.select-options::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.select-options::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.select-options::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
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
  top: -10px;
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

/* 每行后三个游戏，将详情面板显示在左侧 */
.game-card-wrapper:nth-child(7n+5) .game-detail,
.game-card-wrapper:nth-child(7n+6) .game-detail,
.game-card-wrapper:nth-child(7n+7) .game-detail {
  right: auto;
  left: -400px; /* 显示在卡片左侧，间距10px */
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