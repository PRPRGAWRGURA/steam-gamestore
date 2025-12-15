<script>
import BaseBody from '@/componets/BaseBody.vue';
import BaseContainer from '@/componets/BaseContainer.vue';
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default {
    name: 'GameDetailView',
    components: {
        BaseBody,
        BaseContainer
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const gameId = parseInt(route.params.id);
        const isLoading = ref(true);
        const notFound = ref(false);
        
        // 返回上一页
        const goBack = () => {
            router.go(-1);
        };
        
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
          'Dota 2'
        ];
        
        // GamesImage目录下的实际图片文件名
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
          '1282100_header.jpg'
        ];
        
        // 生成游戏数据，与GS_showgames.vue保持一致
        const generateGameData = () => {
          return Array.from({ length: 30 }, (_, i) => ({
            id: i + 1,
            name: gameNames[i % gameNames.length],
            image: `/GamesImage/${gamesImages[i % gamesImages.length]}`,
            price: (Math.random() * 100).toFixed(2),
            tags: ['Action', 'Adventure'][i % 2],
            genre: ['Action', 'Adventure', 'RPG', 'Shooter', 'Strategy'][i % 5],
            developer: `Developer ${i + 1}`,
            publisher: `Publisher ${i + 1}`,
            releaseDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)),
            description: `这是一款精彩的${['Action', 'Adventure', 'RPG', 'Shooter', 'Strategy'][i % 5]}游戏，由${`Developer ${i + 1}`}开发。在游戏中，你将体验到令人兴奋的游戏玩法和精彩的故事情节。探索广阔的游戏世界，完成各种任务和挑战，与其他玩家互动，创造属于你的游戏传奇。`,
            features: [
              '精美的游戏画面',
              '流畅的游戏体验',
              '丰富的游戏内容',
              '多种游戏模式',
              '支持多人联机'
            ],
            systemRequirements: {
              minimum: {
                os: 'Windows 10 64-bit',
                processor: 'Intel Core i5-6600K / AMD Ryzen 5 1600',
                memory: '8 GB RAM',
                graphics: 'NVIDIA GeForce GTX 1060 3GB / AMD Radeon RX 580 4GB',
                storage: '50 GB available space'
              },
              recommended: {
                os: 'Windows 10 64-bit',
                processor: 'Intel Core i7-8700K / AMD Ryzen 7 2700X',
                memory: '16 GB RAM',
                graphics: 'NVIDIA GeForce RTX 2070 SUPER / AMD Radeon RX 5700 XT',
                storage: '50 GB available space SSD'
              }
            }
          }));
        };
        
        const gameitem = ref(null);
        
        // 格式化日期
        const formatDate = (date) => {
          return new Date(date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        };
        
        // 加载游戏详情
        const loadGameDetail = () => {
          isLoading.value = true;
          notFound.value = false;
          
          try {
            const games = generateGameData();
            const foundGame = games.find(game => game.id === gameId);
            
            if (foundGame) {
              gameitem.value = foundGame;
            } else {
              notFound.value = true;
            }
          } catch (error) {
            console.error('Failed to load game details:', error);
            notFound.value = true;
          } finally {
            isLoading.value = false;
          }
        };
        
        // 组件挂载时加载游戏详情
        onMounted(() => {
          loadGameDetail();
        });
        
        return {
          gameitem,
          isLoading,
          notFound,
          formatDate,
          goBack
        };
    }
}
</script>
<template>
    <BaseBody>
        <BaseContainer> 
            <!-- 加载状态 -->
            <div v-if="isLoading" class="loading-container">
                <button class="back-button" @click="goBack">
                    ← 返回上一页
                </button>
                <div class="loading-spinner"></div>
                <p>加载游戏详情...</p>
            </div>
            
            <!-- 未找到游戏 -->
            <div v-else-if="notFound" class="not-found-container">
                <button class="back-button" @click="goBack">
                    ← 返回上一页
                </button>
                <h1>游戏未找到</h1>
                <p>抱歉，找不到您请求的游戏。</p>
                <div class="back-links">
                    <router-link to="/" class="back-link">返回首页</router-link>
                </div>
            </div>
            
            <!-- 游戏详情 -->
            <div v-else-if="gameitem" class="game-detail-container">
                <!-- 返回按钮 -->
                <div class="back-button-container">
                    <button class="back-button" @click="goBack">
                        ← 返回上一页
                    </button>
                </div>
                
                <!-- 游戏封面和基本信息 -->
                <div class="game-hero">
                    <div class="hero-image">
                        <img :src="gameitem.image" :alt="gameitem.name" class="cover-image" />
                    </div>
                    <div class="hero-info">
                        <h1 class="game-title">{{ gameitem.name }}</h1>
                        <div class="game-meta">
                            <span class="meta-tag">{{ gameitem.genre }}</span>
                            <span class="meta-divider">•</span>
                            <span class="meta-text">发布日期: {{ formatDate(gameitem.releaseDate) }}</span>
                            <span class="meta-divider">•</span>
                            <span class="meta-text">{{ gameitem.developer }}</span>
                        </div>
                        <div class="game-price">
                            <span class="price">${{ gameitem.price }}</span>
                        </div>
                        <div class="game-actions">
                            <button class="add-to-cart">加入购物车</button>
                            <button class="wishlist">愿望单</button>
                        </div>
                    </div>
                </div>
                
                <!-- 游戏描述 -->
                <div class="game-description">
                    <h2>游戏描述</h2>
                    <p>{{ gameitem.description }}</p>
                </div>
                
                <!-- 游戏特色 -->
                <div class="game-features">
                    <h2>游戏特色</h2>
                    <div class="features-list">
                        <div v-for="(feature, index) in gameitem.features" :key="index" class="feature-item">
                            <span class="feature-icon">✓</span>
                            <span class="feature-text">{{ feature }}</span>
                        </div>
                    </div>
                </div>
                
                <!-- 详细信息 -->
                <div class="game-details">
                    <h2>详细信息</h2>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-label">开发商:</span>
                            <span class="detail-value">{{ gameitem.developer }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">发行商:</span>
                            <span class="detail-value">{{ gameitem.publisher }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">发布日期:</span>
                            <span class="detail-value">{{ formatDate(gameitem.releaseDate) }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">类型:</span>
                            <span class="detail-value">{{ gameitem.genre }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">标签:</span>
                            <span class="detail-value">{{ gameitem.tags }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">价格:</span>
                            <span class="detail-value">${{ gameitem.price }}</span>
                        </div>
                    </div>
                </div>
                
                <!-- 系统要求 -->
                <div class="system-requirements">
                    <h2>系统要求</h2>
                    <div class="requirements-grid">
                        <div class="requirements-column">
                            <h3>最低配置</h3>
                            <div class="requirement-item">
                                <span class="req-label">操作系统:</span>
                                <span class="req-value">{{ gameitem.systemRequirements.minimum.os }}</span>
                            </div>
                            <div class="requirement-item">
                                <span class="req-label">处理器:</span>
                                <span class="req-value">{{ gameitem.systemRequirements.minimum.processor }}</span>
                            </div>
                            <div class="requirement-item">
                                <span class="req-label">内存:</span>
                                <span class="req-value">{{ gameitem.systemRequirements.minimum.memory }}</span>
                            </div>
                            <div class="requirement-item">
                                <span class="req-label">显卡:</span>
                                <span class="req-value">{{ gameitem.systemRequirements.minimum.graphics }}</span>
                            </div>
                            <div class="requirement-item">
                                <span class="req-label">存储空间:</span>
                                <span class="req-value">{{ gameitem.systemRequirements.minimum.storage }}</span>
                            </div>
                        </div>
                        <div class="requirements-column">
                            <h3>推荐配置</h3>
                            <div class="requirement-item">
                                <span class="req-label">操作系统:</span>
                                <span class="req-value">{{ gameitem.systemRequirements.recommended.os }}</span>
                            </div>
                            <div class="requirement-item">
                                <span class="req-label">处理器:</span>
                                <span class="req-value">{{ gameitem.systemRequirements.recommended.processor }}</span>
                            </div>
                            <div class="requirement-item">
                                <span class="req-label">内存:</span>
                                <span class="req-value">{{ gameitem.systemRequirements.recommended.memory }}</span>
                            </div>
                            <div class="requirement-item">
                                <span class="req-label">显卡:</span>
                                <span class="req-value">{{ gameitem.systemRequirements.recommended.graphics }}</span>
                            </div>
                            <div class="requirement-item">
                                <span class="req-label">存储空间:</span>
                                <span class="req-value">{{ gameitem.systemRequirements.recommended.storage }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BaseContainer>
    </BaseBody>
</template>
<style scoped>
.game-detail-container {
    padding: 20px 0;
    max-width: 1200px;
    margin: 0 auto;
}

/* 加载状态 */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 0;
    color: white;
    gap: 20px;
}

.loading-container .back-button {
    align-self: flex-start;
    margin-bottom: 0;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: #4299e1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* 未找到游戏 */
.not-found-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100px 0;
    color: white;
    gap: 20px;
}

.not-found-container .back-button {
    align-self: flex-start;
    margin-bottom: 0;
}

.back-links {
    display: flex;
    gap: 12px;
    margin-top: 12px;
}

.not-found-container h1 {
    font-size: 2.5rem;
    margin-bottom: 16px;
    color: #e74c3c;
}

.not-found-container p {
    font-size: 1.2rem;
    margin-bottom: 24px;
}

.back-link {
    display: inline-block;
    background: linear-gradient(45deg, #4299e1 0%, #6366f1 100%);
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
}

.back-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(66, 153, 225, 0.4);
}

/* 游戏详情 */
.game-hero {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 24px;
    margin-bottom: 40px;
    background: rgba(17, 24, 39, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}

.hero-image {
    grid-column: 1;
    height: 100%;
    overflow: hidden;
}

.cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.cover-image:hover {
    transform: scale(1.05);
}

.hero-info {
    grid-column: 2;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.game-title {
    font-size: 2rem;
    margin: 0 0 16px 0;
    color: white;
    line-height: 1.2;
}

.game-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
    flex-wrap: wrap;
}

.meta-tag {
    background: #67c1f5;
    color: #182838;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 600;
}

.meta-divider {
    color: rgba(255, 255, 255, 0.5);
}

.meta-text {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
}

.game-price {
    margin-bottom: 24px;
}

.price {
    font-size: 1.8rem;
    font-weight: 700;
    color: #acdbf5;
}

.game-actions {
    display: flex;
    gap: 12px;
}

.add-to-cart,
.wishlist {
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.add-to-cart {
    flex: 1;
    background: linear-gradient(45deg, #4299e1 0%, #6366f1 100%);
    color: white;
}

.add-to-cart:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(66, 153, 225, 0.4);
}

.wishlist {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.wishlist:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

/* 游戏描述 */
.game-description,
.game-features,
.game-details,
.system-requirements {
    margin-bottom: 40px;
    background: rgba(17, 24, 39, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.game-description h2,
.game-features h2,
.game-details h2,
.system-requirements h2 {
    margin: 0 0 16px 0;
    color: #4299e1;
    font-size: 1.5rem;
}

.game-description p {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    font-size: 1rem;
}

/* 游戏特色 */
.features-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.9);
}

.feature-icon {
    color: #4299e1;
    font-weight: bold;
}

/* 详细信息 */
.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-label {
    color: rgba(255, 255, 255, 0.6);
}

.detail-value {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
}

/* 系统要求 */
.requirements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
}

.requirements-column h3 {
    margin: 0 0 16px 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.2rem;
}

.requirement-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
}

.req-label {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
}

.req-value {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1rem;
}

/* 返回按钮样式 */
.back-button-container {
    margin-bottom: 20px;
}

.back-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.back-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(66, 153, 225, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.back-button:active {
    transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 1024px) {
    .game-hero {
        grid-template-columns: 1fr;
    }
    
    .hero-image {
        height: 400px;
    }
    
    .hero-info {
        grid-column: 1;
    }
}

@media (max-width: 768px) {
    .game-detail-container {
        padding: 10px 0;
    }
    
    .game-title {
        font-size: 1.5rem;
    }
    
    .price {
        font-size: 1.5rem;
    }
    
    .game-actions {
        flex-direction: column;
    }
    
    .features-list,
    .details-grid,
    .requirements-grid {
        grid-template-columns: 1fr;
    }
}
</style>