<script>
import GameShowcaseHoverCard from './GameShowcaseHoverCard.vue';

export default {
  name: 'GameShowcaseHorizontalCard',
  components: {
    GameShowcaseHoverCard
  },
  props: {
    game: {
      type: Object,
      required: true
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
  }
};
</script>

<template>
  <div class="game-card-wrapper">
    <router-link 
      :to="{ path: '/gamedetail/' + game.id }"
      class="game-card"
    >
      <div class="game-image">
        <img :src="game.image" :alt="game.name" />
      </div>
      <div class="game-info">
          <div class="game-price-container" :class="{'isdiscount': game.discount !== 1}">
            <!-- 折扣标签 -->
            <span class="discount-badge" v-if="game.discount !== undefined && game.discount < 1 && game.price > 0">
              -{{ calculateDiscountPercent(game.discount) }}%
            </span>
            <!-- 原价 -->
            <span class="original-price" v-if="game.discount !== undefined && game.discount < 1 && game.price > 0">
              ￥{{ game.price.toFixed(2) }}
            </span>
            <!-- 折扣价格 -->
            <span class="game-price" :class="{'discount': game.discount !== undefined && game.discount < 1 && game.price > 0}">
              {{ calculateDiscountPrice(game.price, game.discount) === '免费' ? '' : '￥' }}{{ calculateDiscountPrice(game.price, game.discount) }}
            </span>
          </div>
        </div>
    </router-link>
    
    <!-- 使用外部悬停卡片组件 -->
    <GameShowcaseHoverCard 
      :game="game"
      :format-date="formatDate"
    />
  </div>
</template>

<style scoped>
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

.game-price-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: transparent;
  width: fit-content;
  height: 18px;
  line-height: 18px;
  box-sizing: border-box;
  font-size: 14px;
  flex-wrap: nowrap;
}

.isdiscount {
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
  width: 45px;
  padding: 0 5px;
  text-align: center;
  box-sizing: border-box;
  font-weight: 800;
  font-size: 12px;
}
</style>