<script>
export default {
    props: {
        activeIndex: {
            type: Number,
            required: true,
        }
    },
    computed: {
        // 为每个索引创建特定的计算属性，使模板更清晰
        contentConfig() {
            const configs = {
                0: { className: 'browse-content' },
                1: { className: 'recommend-content' },
                2: { className: 'category-content' },
                3: { className: 'playstyle-content' },
                4: { className: 'special-content' }
            };
            return configs[this.activeIndex] || {};
        },
        // 类别列表数据
        categories() {
            return ['动作冒险', '角色扮演', '策略', '模拟', '体育', '射击', '解谜', '音乐'];
        },
        // 新增玩法列表数据，模仿Steam的标签系统
        playstyles() {
            return ['单人', '多人', '合作', 'VR', '控制器支持', '云存档', '成就', '交易卡'];
        },
        // 示例游戏数据，用于填充内容，基于Steam当前热门游戏
        games() {
            return [
                { title: 'Counter-Strike 2', price: '免费', tags: ['射击', '多人', '竞技'], discount: null, image: '' },
                { title: 'ARC Raiders', price: '¥199', tags: ['动作', '冒险', '科幻'], discount: '20%', image: '' },
                { title: 'Marvel Rivals', price: '免费', tags: ['英雄射击', '多人'], discount: null, image: '' },
                { title: 'Where Winds Meet', price: '¥149', tags: ['开放世界', '武侠'], discount: '10%', image: '' },
                { title: 'Battlefield 6', price: '¥299', tags: ['射击', '多人'], discount: null, image: '' },
                { title: 'PUBG: BATTLEGROUNDS', price: '免费', tags: ['大逃杀', '多人'], discount: null, image: '' },
                { title: 'Red Dead Redemption 2', price: '¥199', tags: ['开放世界', '冒险'], discount: '50%', image: '' },
                { title: 'Grand Theft Auto V', price: '¥99', tags: ['开放世界', '动作'], discount: '30%', image: '' },
                { title: 'Forza Horizon 5', price: '¥249', tags: ['赛车', '开放世界'], discount: null, image: '' },
                { title: 'Stardew Valley', price: '¥48', tags: ['模拟', '农场'], discount: null, image: '' }
            ];
        }
    },
    methods: {
        // 通用的事件处理方法
        handleAction(action, data) {
            console.log(`执行${action}操作:`, data);
            // 可以根据不同的activeIndex执行不同的逻辑
        }
    }
}
</script>
<template>
    <div class="GS_title_expand">
        <div :class="contentConfig.className">
            <template v-if="activeIndex === 0">
                <h2>新品与热门</h2>
                <div class="browse-grid">
                    <div class="browse-card" v-for="(game, i) in games.slice(0, 8)" :key="`browse-${i}`">
                        <div class="card-img" :style="{ backgroundImage: `url(${game.image})` }"></div> <!-- 假设image是URL -->
                        <div class="card-info">
                            <h3>{{ game.title }}</h3>
                            <p>热门游戏介绍</p>
                            <div class="tags">
                                <span v-for="tag in game.tags" :key="tag">{{ tag }}</span>
                            </div>
                            <span class="price" v-if="game.discount">{{ game.price }} <span class="discount">-{{ game.discount }}</span></span>
                            <span class="price" v-else>{{ game.price }}</span>
                        </div>
                    </div>
                </div>
            </template>
            <template v-else-if="activeIndex === 1">
                <div class="recommend-header">
                    <h2>为你推荐</h2>
                    <div class="filter-buttons">
                        <button @click="handleAction('filter', 'all')">全部</button>
                        <button @click="handleAction('filter', 'action')">动作</button>
                        <button @click="handleAction('filter', 'strategy')">策略</button>
                        <button @click="handleAction('filter', 'shooter')">射击</button>
                    </div>
                </div>
                <div class="recommend-list">
                    <div class="recommend-item" v-for="(game, i) in games" :key="`recommend-${i}`">
                        <span class="rank">{{ i + 1 }}</span>
                        <div class="item-details">
                            <h4>{{ game.title }}</h4>
                            <div class="tags">
                                <span v-for="tag in game.tags" :key="tag">{{ tag }}</span>
                            </div>
                        </div>
                        <span class="price" v-if="game.discount">{{ game.price }} <span class="discount">-{{ game.discount }}</span></span>
                        <span class="price" v-else>{{ game.price }}</span>
                    </div>
                </div>
            </template>
            <template v-else-if="activeIndex === 2">
                <h2>游戏类别</h2>
                <div class="category-buttons">
                    <button class="category-btn" v-for="(category, index) in categories" :key="`category-${index}`" @click="handleAction('selectCategory', category)">
                        {{ category }}
                    </button>
                </div>
                <div class="category-subcontent">
                    <h3>热门动作冒险游戏</h3>
                    <div class="sub-grid">
                        <div class="sub-card" v-for="(game, i) in games.filter(g => g.tags.includes('动作') || g.tags.includes('冒险')).slice(0, 4)" :key="`sub-${i}`">
                            <h4>{{ game.title }}</h4>
                            <span>{{ game.price }}</span>
                        </div>
                    </div>
                </div>
            </template>
            <template v-else-if="activeIndex === 3">
                <h2>畅玩方式</h2>
                <div class="playstyle-buttons">
                    <button class="playstyle-btn" v-for="(playstyle, index) in playstyles" :key="`playstyle-${index}`" @click="handleAction('selectPlaystyle', playstyle)">
                        {{ playstyle }}
                    </button>
                </div>
                <div class="playstyle-subcontent">
                    <h3>热门多人游戏</h3>
                    <div class="sub-list">
                        <div class="sub-item" v-for="(game, i) in games.filter(g => g.tags.includes('多人')).slice(0, 6)" :key="`play-${i}`">
                            <h4>{{ game.title }}</h4>
                            <div class="tags">
                                <span v-for="tag in game.tags" :key="tag">{{ tag }}</span>
                            </div>
                            <span>{{ game.price }}</span>
                        </div>
                    </div>
                </div>
            </template>
            <template v-else-if="activeIndex === 4">
                <h2>特别优惠</h2>
                <div class="special-grid">
                    <div class="special-card" v-for="(game, i) in games.filter(g => g.discount)" :key="`special-${i}`">
                        <div class="card-img" :style="{ backgroundImage: `url(${game.image})` }"></div>
                        <div class="card-info">
                            <h3>{{ game.title }}</h3>
                            <div class="tags">
                                <span v-for="tag in game.tags" :key="tag">{{ tag }}</span>
                            </div>
                            <span class="price">{{ game.price }} <span class="discount">-{{ game.discount }}</span></span>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>
<style scoped>
    .GS_title_expand {
        display: flex;
        flex-direction: column; 
        max-width: 1200px; 
        margin: 0 auto;
        margin-bottom: 20px;
        padding: 20px;
        box-sizing: border-box;
        color: #c6d4e1; 
        background-color: #1b2838; 
    }
    h2 {
        font-size: 24px;
        color: #ffffff;
        margin-bottom: 15px;
    }
    .browse-content, .recommend-content, .category-content, .playstyle-content, .special-content {
        width: 100%;
    }
    .browse-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
    }
    .browse-card {
        background: #2a475e;
        border-radius: 4px;
        overflow: hidden;
    }
    .card-img {
        height: 112px; /* 模仿Steam小胶囊尺寸 */
        background-size: cover;
        background-color: #000; /* 占位 */
    }
    .card-info {
        padding: 10px;
    }
    .tags span {
        background: #67c1f5;
        color: #1b2838;
        padding: 2px 6px;
        margin-right: 5px;
        border-radius: 2px;
        font-size: 12px;
    }
    .price {
        color: #acdbf5;
        font-weight: bold;
    }
    .discount {
        background: #4c6b22;
        color: #bfff00;
        padding: 2px 4px;
        border-radius: 2px;
    }
    /* 推荐列表：模仿Steam排行榜 */
    .recommend-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    .filter-buttons button {
        background: #67c1f5;
        color: #1b2838;
        border: none;
        padding: 5px 10px;
        margin-right: 5px;
        border-radius: 2px;
        cursor: pointer;
    }
    .recommend-list {
        display: flex;
        flex-direction: column;
        max-height: 500px;
        overflow: scroll;
        scrollbar-width: thin;
        overflow-x: hidden;
        scrollbar-color: #2a475e #1b2838;
    }
    .recommend-item {
        display: flex;
        align-items: center;
        padding: 10px;
        background: #2a475e;
        margin-bottom: 5px;
        border-radius: 4px;
    }
    .rank {
        font-size: 18px;
        width: 30px;
        text-align: center;
        color: #ffffff;
    }
    .item-details {
        flex: 1;
        margin-left: 10px;
    }
    /* 类别按钮：模仿Steam类别网格 */
    .category-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
    }
    .category-btn {
        background: #316282;
        color: #ffffff;
        border: none;
        padding: 10px;
        font-size: 16px;
        border-radius: 4px;
        cursor: pointer;
    }
    .category-subcontent {
        margin-top: 20px;
    }
    .sub-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
    }
    .sub-card {
        background: #2a475e;
        padding: 10px;
        border-radius: 4px;
    }
    /* 玩法按钮：类似类别 */
    .playstyle-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
    }
    .playstyle-btn {
        background: #316282;
        color: #ffffff;
        border: none;
        padding: 10px;
        font-size: 16px;
        border-radius: 4px;
        cursor: pointer;
    }
    .playstyle-subcontent {
        margin-top: 20px;
    }
    .sub-list .sub-item {
        padding: 10px;
        background: #2a475e;
        margin-bottom: 5px;
        border-radius: 4px;
    }
    /* 特别网格：模仿折扣网格 */
    .special-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
    }
    .special-card {
        background: #2a475e;
        border-radius: 4px;
        overflow: hidden;
    }
    /* 可以添加更多Steam-like样式，如hover效果 */
    .browse-card:hover, .recommend-item:hover, .category-btn:hover, .playstyle-btn:hover, .special-card:hover {
        background: #67c1f5;
        color: #1b2838;
    }
</style>