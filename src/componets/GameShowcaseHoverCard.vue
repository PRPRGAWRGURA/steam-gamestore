<script>
export default {
  name: 'GameShowcaseHoverCard',
  props: {
    game: {
      type: Object,
      required: true
    },
    formatDate: {
      type: Function,
      required: true
    }
  }
};
</script>

<template>
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
</template>

<style scoped>
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
</style>