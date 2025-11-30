<script>
export default {
  data() {
    return {
      games: []
    };
  },
  mounted() {
    // 模拟数据：生成30个游戏对象，之后可替换为从数据库或API导入的数据
    // 例如：通过axios或fetch从后端获取数据 this.games = await fetchGamesFromDB();
    this.games = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      name: `Game ${i + 1}`,
      imagePlaceholder: i + 1, // 用数字作为图片占位符
      price: (Math.random() * 100).toFixed(2), // 随机价格模拟
      tags: ['Action', 'Adventure'] // 示例标签，可扩展
    }));
  }
};
</script>

<template>
  <div class="GS_container_games">
    <div v-for="game in games" :key="game.id" class="game-card">
      <div class="image-placeholder">
        {{ game.imagePlaceholder }}
      </div>
      <div class="game-info">
        <h3 class="game-title">{{ game.name }}</h3>
        <div class="game-tags">
          <span v-for="(tag, index) in game.tags" :key="index" class="tag">{{ tag }}</span>
        </div>
        <div class="game-price">
          ${{ game.price }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.GS_container_games {
  padding-top: 48px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* 模仿Steam的响应式网格布局 */
  gap: 16px; /* 卡片间隙，类似Steam的间距 */
  max-width: 1200px; /* 限制宽度，模仿Steam中心对齐 */
  margin: 0 auto; /* 居中 */
}

.game-card {
  background-color: #1b2838; /* Steam暗色主题背景 */
  border-radius: 4px; /* 轻微圆角，模仿Steam卡片 */
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* 轻微阴影 */
  transition: transform 0.2s; /*  hover效果 */
}

.game-card:hover {
  transform: scale(1.05); /* 模仿Steam hover放大 */
}

.image-placeholder {
  width: 100%;
  height: 112px; /* 模仿Steam小卡片图片比例 (约200x112) */
  background-color: #2a475e; /* Steam图片占位背景色 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #c7d5e0; /* Steam文字色 */
  font-weight: bold;
}

.game-info {
  padding: 8px;
  color: #c7d5e0; /* Steam文字色 */
}

.game-title {
  font-size: 14px;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
}

.game-price {
  text-align: right;
  font-size: 14px;
  color: #acdbf5; /* Steam价格色 */
}
</style>