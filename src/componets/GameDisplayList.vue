<script>
import GameShowcaseVerticalCard from './GameShowcaseVerticalCard.vue';
import { ref, computed } from 'vue';

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
    const currentIndex = ref(0);
    const gamesPerPage = 5;
    
    // 计算当前显示的游戏，确保中间的是c位
    const currentGames = computed(() => {
      const result = [];
      const gameArray = props.games || [];
      const totalGames = gameArray.length;
      
      // 确保游戏数组不为空
      if (totalGames === 0) {
        // 返回5个空对象作为占位符
        for (let i = 0; i < 5; i++) {
          result.push({ id: `placeholder-${i}`, name: '', price: 0, discount: 1 });
        }
        return result;
      }
      
      // 计算显示的游戏索引，中间的是currentIndex
      for (let i = -2; i <= 2; i++) {
        const index = (currentIndex.value + i + totalGames) % totalGames;
        const game = gameArray[index];
        // 确保游戏对象有效
        if (game) {
          result.push(game);
        } else {
          // 添加占位符对象
          result.push({ id: `placeholder-${i}`, name: '', price: 0, discount: 1 });
        }
      }
      
      return result;
    });
    
    // 切换到上一个游戏
    const prevGame = () => {
      const gameArray = props.games || [];
      const totalGames = gameArray.length;
      if (totalGames > 0) {
        currentIndex.value = (currentIndex.value - 1 + totalGames) % totalGames;
      }
    };
    
    // 切换到下一个游戏
    const nextGame = () => {
      const gameArray = props.games || [];
      const totalGames = gameArray.length;
      if (totalGames > 0) {
        currentIndex.value = (currentIndex.value + 1) % totalGames;
      }
    };
    
    // 计算每个卡片的样式，实现3D环形分布
    const getCardStyle = (index) => {
      const centerIndex = 2; // 中间位置
      const distanceFromCenter = index - centerIndex;
      
      // 计算倾斜角度，越靠近边缘倾斜角度越大
      const tiltAngle = distanceFromCenter * -15; // 每个位置倾斜15度
      
      // 计算缩放比例，中间的卡片最大，两侧逐渐缩小
      const scale = 1 - Math.abs(distanceFromCenter) * 0.10; // 每个位置缩小10%
      
      // 计算Z轴位置，中间的卡片靠前，两侧靠后
      const zIndex = gamesPerPage - Math.abs(distanceFromCenter);
      
      // 计算X轴位置，实现环形分布
      const translateX = distanceFromCenter * 20; // 每个位置偏移20px
      
      // 计算透明度，最左侧和最右侧的卡片透明度较低
      const opacity = 0.7 + (1 - Math.abs(distanceFromCenter) * 0.3);
      
      return {
        transform: `perspective(1000px) rotateY(${tiltAngle}deg) scale(${scale}) translateX(${translateX}px)`,
        zIndex: zIndex,
        opacity: opacity,
        transition: 'transform 0.5s ease, opacity 0.5s ease'
      };
    };
    
    return {
      currentGames,
      prevGame,
      nextGame,
      getCardStyle
    };
  }
};
</script>
<template>
    <!-- 推荐游戏区域 - 纵向卡片横向排列 -->
    <div class="GS_featured_games_section">
      <h2 class="featured_section_title">{{ title }}</h2>
      <div class="games-slider-container">
        <div class="slider-btn left_btn">
          <button @click="prevGame"><img src="/WebResources/left_arrow.svg" alt=""></button>
        </div>
        <div class="GS_container_games_vertical">
          <div class="game-cards-wrapper">
            <div 
              v-for="(game, index) in currentGames" 
              :key="game.id || index"
              class="game-card-wrapper"
              :style="getCardStyle(index)"
            >
              <GameShowcaseVerticalCard 
                :game="game"
                :format-date="formatDate"
                :calculate-discount-price="calculateDiscountPrice"
                :calculate-discount-percent="calculateDiscountPercent"
              />
            </div>
          </div>
        </div>
        <div class="slider-btn right_btn">
          <button @click="nextGame"><img src="/WebResources/left_arrow.svg" alt=""></button>
        </div>
      </div>
    </div>
</template>
<style scoped>
/* 推荐游戏区域 */
.GS_featured_games_section {
  background: radial-gradient(circle at 50% 140%, #1ec6f530 0%, transparent 60%);
  border-bottom: 2px solid #1121324e;
  padding-bottom: 24px;
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

/* 游戏滑动容器 */
.games-slider-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  perspective: 1000px;
}

/* 纵向卡片横向排列容器 */
.GS_container_games_vertical {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 320px;
  margin: 0 auto; /* 居中 */
  padding-top: 15px;
  padding-bottom: 25px;
  position: relative;
  perspective: 1000px;
  overflow: visible;
}

/* 游戏卡片包装器容器 */
.game-cards-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 游戏卡片包装器 */
.game-card-wrapper {
  flex: 0 0 auto;
  width: 180px;
  margin: 0 10px;
  position: relative;
}



/* 滑块按钮 */
.slider-btn {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  z-index: 10;
}

.left_btn {
  left: 0;
  width: 50px;
}

.right_btn {
  right: 0;
  width: 50px;
}

.left_btn button {
  background: linear-gradient(to right, #00000095 0%, transparent 100%);
  border: none;
  cursor: pointer;
  padding: 40px 8px;
  border-radius: 4px;
}

.left_btn button:hover {
  background: linear-gradient(to right, #ffffff87 0%, transparent 100%);
}

.left_btn button img {
  filter: invert(1);
  width: 40px;
  height: auto;
}

.right_btn button {
  background: linear-gradient(to left, #00000095 0%, transparent 100%);
  border: none;
  cursor: pointer;
  padding: 40px 8px;
  border-radius: 4px;
}

.right_btn button:hover {
  background: linear-gradient(to left, #ffffff87 0%, transparent 100%);
}

.right_btn button img {
  filter: invert(1);
  width: 40px;
  height: auto;
  transform: rotate(180deg);
}

</style>