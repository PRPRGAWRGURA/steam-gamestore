<script>
import { ref } from 'vue';

export default {
  name: 'DeveloperView',
  setup() {
    const activeTab = ref('dashboard');
    
    const tabs = [
      { id: 'dashboard', name: '仪表盘', icon: '📊' },
      { id: 'games', name: '我的游戏', icon: '🎮' },
      { id: 'analytics', name: '数据分析', icon: '📈' },
      { id: 'monetization', name: '变现管理', icon: '💰' },
      { id: 'community', name: '社区管理', icon: '👥' },
      { id: 'settings', name: '设置', icon: '⚙️' }
    ];
    
    const stats = [
      { name: '总下载量', value: '125,432', change: '+12.5%', color: '#4CAF50' },
      { name: '日活跃用户', value: '8,234', change: '+8.3%', color: '#2196F3' },
      { name: '总收入', value: '$45,678', change: '+15.2%', color: '#FF9800' },
      { name: '评分', value: '4.8/5', change: '+0.2', color: '#9C27B0' }
    ];
    
    return {
      activeTab,
      tabs,
      stats
    };
  }
};
</script>

<template>
  <div class="developer-view">
    <!-- 页面头部 -->
    <header class="developer-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="developer-title">
            <span class="title-icon">🎮</span>
            游戏开发者中心
          </h1>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="user-name">开发者</span>
            <div class="user-avatar">👤</div>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧导航 -->
      <aside class="sidebar">
        <nav class="nav-menu">
          <div 
            v-for="tab in tabs" 
            :key="tab.id"
            class="nav-item"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span class="nav-icon">{{ tab.icon }}</span>
            <span class="nav-label">{{ tab.name }}</span>
          </div>
        </nav>
      </aside>
      
      <!-- 右侧内容 -->
      <main class="content-area">
        <!-- 统计卡片 -->
        <section class="stats-section">
          <div class="stats-grid">
            <div 
              v-for="(stat, index) in stats" 
              :key="index"
              class="stat-card"
            >
              <div class="stat-header">
                <h3 class="stat-name">{{ stat.name }}</h3>
                <span class="stat-change" :style="{ color: stat.color }">
                  {{ stat.change }}
                </span>
              </div>
              <div class="stat-value">{{ stat.value }}</div>
            </div>
          </div>
        </section>
        
        <!-- 内容区域 -->
        <section class="content-section">
          <div class="section-header">
            <h2>{{ tabs.find(tab => tab.id === activeTab)?.name }}</h2>
            <button class="primary-button">
              <span class="button-icon">+</span>
              新建游戏
            </button>
          </div>
          
          <!-- 仪表盘内容 -->
          <div v-if="activeTab === 'dashboard'" class="dashboard-content">
            <div class="content-grid">
              <div class="content-card">
                <h3>最近活动</h3>
                <div class="activity-list">
                  <div class="activity-item">
                    <span class="activity-icon">📥</span>
                    <div class="activity-info">
                      <p class="activity-title">《太空冒险》下载量突破5万</p>
                      <p class="activity-time">2小时前</p>
                    </div>
                  </div>
                  <div class="activity-item">
                    <span class="activity-icon">⭐</span>
                    <div class="activity-info">
                      <p class="activity-title">《星际战争》获得4.9分好评</p>
                      <p class="activity-time">1天前</p>
                    </div>
                  </div>
                  <div class="activity-item">
                    <span class="activity-icon">💰</span>
                    <div class="activity-info">
                      <p class="activity-title">昨日收入 $2,345</p>
                      <p class="activity-time">1天前</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="content-card">
                <h3>即将到来的截止日期</h3>
                <div class="deadline-list">
                  <div class="deadline-item">
                    <span class="deadline-date">12/15</span>
                    <div class="deadline-info">
                      <p class="deadline-title">游戏更新提交</p>
                      <p class="deadline-status">还剩11天</p>
                    </div>
                  </div>
                  <div class="deadline-item">
                    <span class="deadline-date">12/20</span>
                    <div class="deadline-info">
                      <p class="deadline-title">季度报告提交</p>
                      <p class="deadline-status">还剩16天</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 其他标签页内容 -->
          <div v-else class="other-content">
            <div class="empty-state">
              <div class="empty-icon">🚀</div>
              <h3>{{ tabs.find(tab => tab.id === activeTab)?.name }} 功能开发中</h3>
              <p>敬请期待更多精彩功能！</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.developer-view {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0a192f 0%, #172a45 100%);
  color: white;
  font-family: 'Motiva Sans', Arial, sans-serif;
  overflow: hidden;
}

/* 头部样式 */
.developer-header {
  background: rgba(17, 24, 39, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.developer-title {
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(45deg, #4299e1 0%, #6366f1 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.title-icon {
  font-size: 1.8rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: 500;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* 主要内容区域 */
.main-content {
  display: flex;
  height: calc(100vh - 80px);
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  width: 250px;
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;
}

.nav-menu {
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  background: rgba(66, 153, 225, 0.1);
  border-left-color: #4299e1;
  color: #4299e1;
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-label {
  font-weight: 500;
}

/* 内容区域样式 */
.content-area {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  max-width: calc(100% - 250px);
}

/* 统计卡片样式 */
.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  border-color: rgba(66, 153, 225, 0.3);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.stat-name {
  font-size: 0.9rem;
  opacity: 0.8;
  font-weight: 500;
}

.stat-change {
  font-size: 0.8rem;
  font-weight: 600;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(45deg, #4299e1 0%, #6366f1 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* 内容区域样式 */
.content-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

.primary-button {
  background: linear-gradient(45deg, #4299e1 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.3);
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(66, 153, 225, 0.4);
  background: linear-gradient(45deg, #3182ce 0%, #4f46e5 100%);
}

.button-icon {
  font-size: 1rem;
}

/* 仪表盘内容 */
.dashboard-content {
  .content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
}

.content-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.content-card:hover {
  border-color: rgba(66, 153, 225, 0.2);
}

.content-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #4299e1;
}

/* 活动列表 */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.activity-icon {
  font-size: 1.2rem;
  margin-top: 0.25rem;
}

.activity-info {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.8rem;
  opacity: 0.6;
}

/* 截止日期列表 */
.deadline-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.deadline-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.deadline-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.deadline-date {
  background: linear-gradient(45deg, #f59e0b 0%, #ef4444 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
  min-width: 80px;
  text-align: center;
}

.deadline-info {
  flex: 1;
}

.deadline-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.deadline-status {
  font-size: 0.8rem;
  opacity: 0.6;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s ease-in-out infinite;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: white;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-area {
    padding: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .dashboard-content .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
  
  .content-area {
    max-width: calc(100% - 200px);
    padding: 1rem;
  }
  
  .nav-label {
    font-size: 0.9rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>