<script>
import BaseBody from '@/componets/BaseBody.vue';
import BaseTitle from '@/componets/BaseTitle.vue';
import BaseContainer from '@/componets/BaseContainer.vue';
import { useUserStore } from '@/stores/userStore';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { normalUserAPI } from '@/utils/api/normalUserAPI';

export default {
  name: 'AboutView',
  components: {
    BaseBody,
    BaseTitle,
    BaseContainer,
  },
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    
    const updateCount = async () => {
      await userStore.getCount();
    }
    
    const goToDeveloperPage = () => {
      // 跳转到SupportView，并传递type参数表示发行商申请
      router.push({
        path: '/support',
        query: { type: 'developer' }
      });
    }
    
    const features = ref([
      { 
        icon: 'gamepad', 
        color: '#4299e1', 
        title: '畅玩游戏', 
        description: '访问数千款高品质游戏，从独立佳作到AAA大作，应有尽有。' 
      },
      { 
        icon: 'users', 
        color: '#38b2ac', 
        title: '社区互动', 
        description: '与全球玩家交流，分享游戏心得，加入游戏社区。' 
      },
      { 
        icon: 'palette', 
        color: '#ed8936', 
        title: '创造内容', 
        description: '使用CHAIN Workshop创建和分享游戏内容，发挥你的创意。' 
      },
      { 
        icon: 'ticket', 
        color: '#9f7aea', 
        title: '活动赛事', 
        description: '参与各种游戏活动和电竞赛事，赢取丰厚奖励。' 
      }
    ]);
    
    // 用户增长数据
    const userGrowthData = ref([]);
    const isLoadingGrowthData = ref(false);
    
    // 获取用户增长数据
    const fetchUserGrowthData = async () => {
      isLoadingGrowthData.value = true;
      try {
        const response = await normalUserAPI.getUserGrowthData();
        if (response.success) {
          userGrowthData.value = response.data;
        } else {
          console.error('获取用户增长数据失败:', response.error);
        }
      } catch (error) {
        console.error('获取用户增长数据时发生错误:', error);
      } finally {
        isLoadingGrowthData.value = false;
      }
    };
    
    // 计算最高值，用于图表高度计算
    const maxCount = computed(() => {
      if (userGrowthData.value.length === 0) return 1;
      const max = Math.max(...userGrowthData.value.map(item => item.count));
      // 确保最大值至少为1，避免除以0
      return Math.max(max, 1);
    });
    
    return {
      userStore,
      updateCount,
      features,
      goToDeveloperPage,
      userGrowthData,
      isLoadingGrowthData,
      maxCount,
      fetchUserGrowthData
    }
  },
  mounted() {
    this.updateCount();
    this.fetchUserGrowthData();
  }
}
</script>
<template>
  <BaseBody>
    <BaseTitle/>
    <BaseContainer>
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="hero-title-1">CHAINHUB</span>
            <span class="hero-title-2">游戏商城</span>
          </h1>
          <p class="hero-subtitle">畅玩游戏、讨论游戏、创造游戏的快乐所在</p>
          <div class="stats-container">
            <div class="online-count main-stat">
              <span class="count-label">全球在线玩家</span>
              <span class="count-number">{{ userStore.user_count + 63786849 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">游戏数量</span>
              <span class="stat-number">50,000+</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">社区成员</span>
              <span class="stat-number">1.2亿+</span>
            </div>
          </div>
        </div>
        <div class="hero-bg"></div>
      </div>
      
      <!-- 用户增长图表 -->
      <section class="chart-section">
        <h2 class="section-title">新用户注册趋势</h2>
        <div class="chart-container">
          <!-- 加载状态 -->
          <div v-if="isLoadingGrowthData" class="loading-state">
            <div class="loading-spinner"><FontAwesomeIcon icon="spinner" spin /></div>
            <p>加载用户增长数据中...</p>
          </div>
          
          <!-- 空数据状态 -->
          <div v-else-if="userGrowthData.length === 0" class="empty-state">
            <div class="empty-icon"><FontAwesomeIcon icon="chart-simple" /></div>
            <p>暂无用户增长数据</p>
          </div>
          
          <!-- 图表内容 -->
          <div v-else class="chart-placeholder">
            <div class="chart-bars">
              <div 
                v-for="(item, index) in userGrowthData" 
                :key="index"
                class="chart-bar"
                :style="{ height: `${Math.max(5, (item.count / maxCount) * 100)}%` }"
                :title="`${item.day}: ${item.count}人`"
              >
                <div class="chart-bar-count">{{ item.count }}</div>
              </div>
            </div>
            <div class="chart-labels">
              <span v-for="(item, index) in userGrowthData" :key="index">{{ item.day }}</span>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 特色功能 -->
      <section class="features-section">
        <h2 class="section-title">核心功能</h2>
        <div class="features-grid">
          <div 
            v-for="(feature, index) in features" 
            :key="index"
            class="feature-card"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="feature-icon" :style="{ color: feature.color }"><FontAwesomeIcon :icon="feature.icon" /></div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </section>
      
      <!-- CTA区域 -->
      <section class="cta-section">
        <div class="cta-content">
          <h2 class="cta-title">加入游戏发行者</h2>
          <p class="cta-text">将你的游戏带给全球数亿玩家，开启游戏发行之旅</p>
          <button class="cta-button" @click="goToDeveloperPage">成为发行者</button>
        </div>
      </section>
    </BaseContainer>
  </BaseBody>
</template>
<style scoped>
/* 全局样式重置 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 容器样式 */
.GS_container {
  padding-top: 45px;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a192f 0%, #172a45 50%, #0d1b2a 100%);
}

/* 英雄区域 */
.hero-section {
  position: relative;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 80px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #1a365d 0%, #2d3748 50%, #1a202c 100%);
  z-index: 1;
}

.hero-bg::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(66, 153, 225, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  animation: fadeInUp 1s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title {
  font-size: 6rem;
  font-weight: 900;
  margin-bottom: 20px;
  text-shadow: 0 0 30px rgba(66, 153, 225, 0.5);
}

.hero-title-1 {
  display: block;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: pulse 2s ease-in-out infinite;
}

.hero-title-2 {
  display: block;
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: pulse 2s ease-in-out infinite 0.5s;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 40px;
  opacity: 0.9;
  letter-spacing: 1px;
}

.online-count {
  display: inline-block;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px 30px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: fadeIn 1.5s ease-out 0.5s both;
}

.count-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 5px;
}

.count-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #4299e1;
}

/* 统计容器 */
.stats-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 40px;
  justify-content: center;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px 30px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  animation: fadeIn 1.5s ease-out 0.5s both;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 5px;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #6366f1;
}

/* 章节标题 */
.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 50px;
  color: white;
  background: linear-gradient(45deg, #4299e1 0%, #6366f1 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* 图表区域 */
.chart-section {
  margin: 100px 20px;
  animation: fadeIn 1s ease-out 1s both;
}

.chart-container {
  background: rgba(255, 255, 255, 0.05);
  padding: 40px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  width: 100%;
  height: 80%;
  gap: 15px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, #4299e1 0%, #6366f1 100%);
  border-radius: 4px 4px 0 0;
  position: relative;
  max-width: 60px;
  transition: height 1s ease-out;
}

.chart-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.1));
  border-radius: 4px 4px 0 0;
}

/* 柱状图上的数字 */
.chart-bar-count {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 0.9rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: rgba(255, 255, 255, 0.7);
  gap: 15px;
}

.loading-spinner {
  font-size: 3rem;
  margin-bottom: 0;
  animation: spin 1s linear infinite;
  color: #4299e1;
  filter: drop-shadow(0 0 10px rgba(66, 153, 225, 0.3));
}

.loading-state p {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 空数据状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 10px;
  opacity: 0.5;
}



.chart-labels {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.chart-labels span {
  flex: 1;
  text-align: center;
  max-width: 60px;
}

/* 特色功能 */
.features-section {
  margin: 100px 0;
  animation: fadeIn 1s ease-out 0.8s both;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  padding: 0 20px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 40px 30px;
  border-radius: 8px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  animation: float 6s ease-in-out infinite;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(66, 153, 225, 0.5);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.feature-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: white;
}

.feature-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

/* CTA区域 */
.cta-section {
  margin: 100px 20px;
  text-align: center;
  animation: fadeIn 1s ease-out 1.2s both;
}

.cta-content {
  background: linear-gradient(135deg, rgba(66, 153, 225, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%);
  padding: 80px 40px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(66, 153, 225, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  color: white;
}

.cta-text {
  font-size: 1.2rem;
  margin-bottom: 40px;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-button {
  background: linear-gradient(45deg, #4299e1 0%, #6366f1 100%);
  color: white;
  padding: 18px 45px;
  font-size: 1.2rem;
  font-weight: 700;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(66, 153, 225, 0.4);
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(66, 153, 225, 0.6);
  background: linear-gradient(45deg, #3182ce 0%, #4f46e5 100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 4rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .games-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
</style>
