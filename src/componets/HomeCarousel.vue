<script>
export default {
  name: 'Carousel',
  data() {
    return {
      GameId: 1,
      // 新增：跟踪当前悬停的缩略图索引
      hoveredShotIndex: 0,
      // 组件内部数据，不需要从外部获取
      isAutoPlaying: true,
      // 轮播间隔时间（毫秒）
      timeout: 5000,
      // 用于标识当前循环的ID
      autoPlayId: 0,
      gamelite: [
        { id: 1, GameName:'SPLIT FICTION', GamePrice: 298, GamePriceSave: 50},
        { id: 2, GameName:'三角洲行动', GamePrice: 0, GamePriceSave: 0},
        { id: 3, GameName:'EA SPORTS FC™ 26', GamePrice: 199, GamePriceSave: 50},
        { id: 4, GameName:'骑马与砍杀2', GamePrice: 99, GamePriceSave: 60},
        { id: 5, GameName:'霍格沃茨之遗', GamePrice: 298, GamePriceSave: 40},
        { id: 6, GameName:'极限竞速：地平线5', GamePrice: 299, GamePriceSave: 60},
      ],
      gameimage: [
        { id: 1, header:'/CarouselImage/003_header.jpg', item1:'/CarouselImage/003_item1.jpg', item2:'/CarouselImage/003_item2.jpg', item3:'/CarouselImage/003_item3.jpg', item4:'/CarouselImage/003_item4.jpg', },
        { id: 2, header:'/CarouselImage/002_header.jpg', item1:'/CarouselImage/002_item1.jpg', item2:'/CarouselImage/002_item2.jpg', item3:'/CarouselImage/002_item3.jpg', item4:'/CarouselImage/002_item4.jpg', },
        { id: 3, header:'/CarouselImage/001_header.jpg', item1:'/CarouselImage/001_item1.jpg', item2:'/CarouselImage/001_item2.jpg', item3:'/CarouselImage/001_item3.jpg', item4:'/CarouselImage/001_item4.jpg', },
        { id: 4, header:'/CarouselImage/004_header.jpg', item1:'/CarouselImage/004_item1.jpg', item2:'/CarouselImage/004_item2.jpg', item3:'/CarouselImage/004_item3.jpg', item4:'/CarouselImage/004_item4.jpg', },
        { id: 5, header:'/CarouselImage/005_header.jpg', item1:'/CarouselImage/005_item1.jpg', item2:'/CarouselImage/005_item2.jpg', item3:'/CarouselImage/005_item3.jpg', item4:'/CarouselImage/005_item4.jpg', },
        { id: 6, header:'/CarouselImage/006_header.jpg', item1:'/CarouselImage/006_item1.jpg', item2:'/CarouselImage/006_item2.jpg', item3:'/CarouselImage/006_item3.jpg', item4:'/CarouselImage/006_item4.jpg', },
      ]
    }
  },
  methods: {
    // 向前切换轮播图
    prevSlide() {
      this.GameId = this.GameId > 1 ? this.GameId - 1 : this.gamelite.length;
    },
    // 向后切换轮播图
    nextSlide() {
      this.GameId = this.GameId < this.gamelite.length ? this.GameId + 1 : 1;
    },
    // 点击缩略图切换到对应轮播项
    goToSlide(id) {
      this.GameId = id;
    },
    // 新增：暂停自动播放
    pauseAutoPlay() {
      this.isAutoPlaying = false;
    },
    // 新增：恢复自动播放
    resumeAutoPlay() {
      if (!this.isAutoPlaying) {
        this.isAutoPlaying = true;
        this.autoPlayId++;
        // 重新调用loopFunction重启递归链条
        setTimeout(() => {
          this.loopFunction(this.autoPlayId);
        }, this.timeout);
      }
    },    
    // 新增：鼠标悬停到缩略图时的处理函数
    handleThumbHover(shotIndex) {
      this.hoveredShotIndex = shotIndex + 1; // 修正：缩略图索引从1开始
    },
    
    // 新增：鼠标离开缩略图时的处理函数
    handleThumbLeave() {
      // 鼠标离开时恢复显示默认图片（header图片）
      this.hoveredShotIndex = 0;
    },
    
    // 修正：获取当前应该显示的图片
    getCurrentImage(itemId) {
      const imageData = this.gameimage.find(img => img.id === itemId);
      if (!imageData) return '';
      
      // 修正图片选择逻辑
      if (this.hoveredShotIndex === 0) {
        // 默认显示header图片
        return imageData.header;
      } else {
        // 根据悬停的缩略图显示对应图片
        return imageData[`item${this.hoveredShotIndex}`] || imageData.header;
      }
    },
    loopFunction(currentId) {
      if(!this.isAutoPlaying || currentId !== this.autoPlayId) {
        return
      }
      this.nextSlide();
      setTimeout(() => {
        this.loopFunction(currentId);
      }, this.timeout);
    }
  },
  mounted() {
    this.loopFunction(this.autoPlayId);
  },
  beforeUnmount() {
    this.pauseAutoPlay();
  }
}
</script>

<template>
  <div class="carousel-container">
    <div class="home_cluster">
      <!-- 轮播图标题 -->
      <div class="cluster_title">
        <p>精选与推荐</p>
      </div>
      
      <!-- 左箭头按钮 -->
      <div class="left_btn">
        <button @click="prevSlide" @mouseenter="pauseAutoPlay" @mouseleave="resumeAutoPlay"><img src="/WebResources/left_arrow.svg" alt=""></button>
      </div>
      
      <!-- 轮播图内容容器 -->
      <router-link class="game_item_container" to="/gamedetail" @mouseenter="pauseAutoPlay" @mouseleave="resumeAutoPlay">
        <a href="#" class="game_item" v-for="item in gamelite" :key="item.id" :class="{'active': item.id === GameId}">
          <!-- 游戏截图区域 - 修改为动态显示图片 -->
          <div class="screenshot">
            <img :src="getCurrentImage(item.id)" alt="">
          </div>
          
          <!-- 游戏信息区域 -->
          <div class="info">
            <h2>{{ item.GameName }}</h2>
            
            <!-- 截图缩略图 - 添加鼠标事件 -->
            <div class="screen_shots_box">
              <div class="screen_shots" 
                   v-for="(shot, index) in 4" 
                   :key="index + 1"
                   @mouseenter="handleThumbHover(index)"
                   @mouseleave="handleThumbLeave"
                   :class="{'active': hoveredShotIndex === index + 1}"> <!-- 修正：active类判断 -->
                <img :src="gameimage.find(img => img.id === item.id)[`item${index + 1}`]" alt="">
              </div>
            </div>
            
            <h3>现已推出</h3>
            <p class="info_hot">热销产品</p>
            
            <!-- 游戏价格区域 - 付费游戏 -->
            <div v-if="item.GamePrice !== 0" class="game_price">
              <p class="save">-{{ item.GamePriceSave }}%</p>
              <p class="price_old">¥{{ item.GamePrice.toFixed(2) }}</p>
              <p class="price_now">¥{{ (item.GamePrice - item.GamePrice * item.GamePriceSave / 100).toFixed(2) }}</p>
            </div>
            
            <!-- 免费游戏标签 -->
            <div v-else class="free_game">免费游玩</div>
          </div>
        </a>
      </router-link>
      
      <!-- 右箭头按钮 -->
      <div class="right_btn">
        <button @click="nextSlide" @mouseenter="pauseAutoPlay" @mouseleave="resumeAutoPlay"><img src="/WebResources/left_arrow.svg" alt=""></button>
      </div>
      
      <!-- 轮播图缩略指示器 -->
      <div class="carousel_thumbs">
        <div v-for="item in gamelite" :key="item.id" :class="{'active': item.id === GameId}" @click="goToSlide(item.id)"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.carousel-container {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.home_cluster {
  width: 1100px;
  height: 480px;
  background: radial-gradient(circle at 50% 140%, #1e8df54d 0%, transparent 60%);
  border-bottom: 2px solid #1121324e;
  display: flex;
  flex-wrap: wrap;
}

.cluster_title {
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  padding-left: 50px;
  display: flex;
  justify-content: start;
  align-items: center;
}

.cluster_title p {
  font-size: 15px;
  font-weight: 400;
  color: #fff;
  margin: 0;
}

.left_btn {
  width: 50px;
  height: 400px;
  display: flex;
  align-items: center;
}

.left_btn button {
  background: linear-gradient(to right, #00000095 0%, transparent 100%);
}
.left_btn button:hover {
  background: linear-gradient(to right, #ffffff87 0%, transparent 100%);
}
.left_btn button img {
  filter: invert(1);
  width: 40px;
  height: auto;
}
.right_btn {
  width: 50px;
  height: 400px;
  display: flex;
  align-items: center;
}

.right_btn button {
  background: linear-gradient(to left, #00000095 0%, transparent 100%);
}
.right_btn button:hover {
  background: linear-gradient(to left, #ffffff87 0%, transparent 100%);
}
.right_btn button img {
  transform: rotate(180deg);
  filter: invert(1);
  width: 40px;
  height: auto;
}
.carousel_thumbs {
  display: flex;
  justify-content: center;
  padding-top: 10px;
  width: 1100px;
  height: 40px;
  gap: 5px;
}

.carousel_thumbs div {
  width: 13px;
  height: 7px;
  border-radius: 2px;
  background-color: #797979a0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.carousel_thumbs div.active {
  background-color: #adadadb9;
}

.game_item_container {
  display: flex;
  width: 1000px;
  height: 400px;
  position: relative;
  box-shadow: 0px 0px 10px #000000d0;
  border-radius: 3px;
  overflow: hidden;
}

.game_item {
  display: flex;
  width: 100%;
  height: 100%;
  position: absolute;
  text-decoration: none;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.game_item.active {
  opacity: 1;
  z-index: 10;
}

.screenshot {
  width: 70%;
  height: 100%;
  z-index: 10;
  background-color: #000;
  box-shadow: 0px 0px 40px 14px #000000a3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 48px;
  overflow: hidden;
}
.screenshot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.info {
  display: flex;
  flex-direction: column;
  width: 30%;
  height: 100%;
  background-color: #0b151f;
}

.info h2 {
    z-index: 10;
    color: white;
    font-size: 25px;
    font-weight: 500;
    margin: 20px 10px 25px 18px;
    height: 60px;
    line-height: 30px;
    white-space: wrap;
    overflow: hidden;
    text-overflow: ellipsis;
    box-sizing: border-box;
}

.screen_shots_box {
  width: 95%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

/* 新增：缩略图悬停效果样式 */
.screen_shots {
  width: 140px;
  height: 70px;
  background-color: #2c2c2c;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 2px solid transparent;
}

.screen_shots:hover,
.screen_shots.active {
  border-color: #ffffff;
  transform: scale(1.05);
}

.screen_shots img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.info h3 {
  z-index: 10;
  margin: 12px 0 0 18px;
  color: white;
  font-size: 25px;
  font-weight: 400;
}

.info .info_hot {
  z-index: 10;
  margin: 5px 0 0 18px;
  width: 60px;
  height: 18px;
  border-radius: 2px;
  text-align: center;
  background-color: #4a4949;
  color: white;
  font-size: 11px;
  font-weight: 400;
  line-height: 18px;
}

.game_price {
  display: flex;
  z-index: 10;
  margin: 50px 0 0 18px;
  box-sizing: border-box;
  width: fit-content;
  height: 18px;
  background-color: #4a4949;
  align-items: center;
}

.game_price p {
  margin: 0;
  line-height: 18px;
}

.game_price .save {
  width: 40px;
  padding: 0 5px;
  text-align: center;
  box-sizing: border-box;
  font-weight: 800;
  font-size: 12px;
  background-color: rgba(74, 185, 18, 0.643);
  color: rgb(69, 230, 33);
}

.free_game {
  display: flex;
  z-index: 10;
  margin: 50px 0 0 18px;
  box-sizing: border-box;
  width: fit-content;
  height: 18px;
  align-items: center;
  color: white;
  font-size: 15px;
  transform: translateY(-5px);
}

.game_price .price_old {
  font-size: 14px;
  padding-left: 5px;
  color: rgb(142, 142, 142);
  text-decoration: line-through;
}

.game_price .price_now {
  padding: 0 5px;
  font-size: 14px;
  font-weight: 600;
  color: rgb(95, 219, 37);
}

button {
  width: 100%;
  height: 120px;
  color: white;
  border: none;
  cursor: pointer;
}
</style>