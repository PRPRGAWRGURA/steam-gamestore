<script>
import GameShowcaseVerticalCard from './GameShowcaseVerticalCard.vue';

export default {
  name: 'GameDisplayList',
  components: {
    GameShowcaseVerticalCard
  },
  props: {
    games: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      default: '推荐游戏' // 默认标题为"推荐游戏"
    },
    formatDate: {
      type: Function,
      required: true
    },
    calculateDiscountPrice: {
      type: Function,
      required: true
    },
    calculateDiscountPercent: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    // 直接使用传入的games数组，外部已处理好数量
    const featuredGames = () => {
      return props.games;
    };
    
    return {
      featuredGames
    };
  }
};
</script>
<template>
    <!-- 推荐游戏区域 - 纵向卡片横向排列 -->
    <div class="GS_featured_games_section">
      <h2 class="featured_section_title">{{ title }}</h2>
      <div class="GS_container_games_vertical">
        <GameShowcaseVerticalCard 
          v-for="game in featuredGames()" 
          :key="game.id"
          :game="game"
          :format-date="formatDate"
          :calculate-discount-price="calculateDiscountPrice"
          :calculate-discount-percent="calculateDiscountPercent"
        />
      </div>
    </div>
</template>
<style scoped>
/* 推荐游戏区域 */
.GS_featured_games_section {
  padding-bottom: 48px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 推荐游戏标题 */
.featured_section_title {
  color: white;
  font-size: 1.8rem;
  margin-bottom: 24px;
  font-weight: 700;
  text-align: left;
}

/* 纵向卡片横向排列容器 */
.GS_container_games_vertical {
  display: grid;
  grid-template-columns: repeat(10, minmax(180px, 1fr)); /* 横向显示10个游戏 */
  gap: 24px; /* 较大的间隙 */
  max-width: 1200px; /* 与主容器宽度一致 */
  overflow-x: auto; /* 允许水平滚动 */
  overflow-y: hidden;
  margin: 0 auto; /* 居中 */
  padding-bottom: 10px;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: #234a6ab4 transparent;
}
</style>