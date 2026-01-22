<script>
import { ref, onMounted, watch } from 'vue';
import { gameitemAPI } from '@/utils/api/gameitemAPI';
import { loadGamesFromCache, saveGamesToCache } from '@/utils/tools/cacheUtils';
import GameShowcaseHorizontalCard from './GameShowcaseHorizontalCard.vue';
import GameDisplayList from './GameDisplayList.vue';

export default {
  name: 'HomeGameShowcase',
  components: {
    GameShowcaseHorizontalCard,
    GameDisplayList
  },
  setup() {
    // 游戏列表 - 从数据库获取
    const games = ref([]);
    const loading = ref(false);
    
    // 比较两个游戏列表是否相同
    const areGamesEqual = (games1, games2) => {
      // 先比较长度
      if (games1.length !== games2.length) return false;
      
      // 比较每个游戏的关键属性
      for (let i = 0; i < games1.length; i++) {
        const game1 = games1[i];
        const game2 = games2.find(g => g.id === game1.id);
        
        if (!game2) return false;
        
        // 比较关键属性
        if (game1.name !== game2.name ||
            game1.price !== game2.price ||
            game1.discount !== game2.discount ||
            JSON.stringify(game1.game_tags) !== JSON.stringify(game2.game_tags)) {
          return false;
        }
      }
      
      return true;
    };
    
    // 加载游戏数据
    const loadGames = async () => {
      try {
        loading.value = true;
        // 每次刷新页面都进行API请求，增加字段以便在详情页使用缓存数据
        const response = await gameitemAPI.getGames({
          page: 1,
          pageSize: 'unlimited',
          sortBy: 'created_at',
          sortAsc: false,
          fields: 'id,game_name,game_price,game_discount,game_tags,hero_img,library_img,created_at,game_publisher,game_type'
        });
        
        if (response.success && response.data) {
          // 转换API返回的数据结构，适配组件需要的字段名
          const formattedGames = response.data.items.map(game => {
            // 处理game_tags字段，将逗号分隔的字符串转换为数组
            let tagsArray = [];

            // 根据需求，游戏标签只会是多个且用逗号分隔的字符串
            tagsArray = game.game_tags ? game.game_tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
            
            return {
              id: game.id,
              name: game.game_name,
              image: game.hero_img, // 使用hero_img作为游戏卡片图片
              libraryImage: game.library_img, // 新增：保存library_img用于推荐游戏
              price: game.game_price,
              discount: game.game_discount,
              game_tags: tagsArray, // 完整的标签数组
              releaseDate: game.created_at,
              publisher: game.game_publisher, // 新增：保存发行商信息到缓存
              genre: game.game_type // 新增：保存游戏类型到缓存
            };
          });
          
          // 获取当前缓存数据
          const cachedGames = loadGamesFromCache();
          
          // 比较新数据与缓存数据
          if (!cachedGames || !areGamesEqual(formattedGames, cachedGames)) {
            // 数据不一致，更新缓存
            saveGamesToCache(formattedGames);
            console.log('游戏列表已更新并保存到缓存');
          } else {
            console.log('游戏列表未变化，使用缓存数据');
          }
          
          // 无论是否更新缓存，都使用新获取的数据
          games.value = formattedGames;
        }
      } catch (error) {
        console.error('加载游戏数据失败:', error);
        
        // 加载失败时，尝试从缓存获取数据
        const cachedGames = loadGamesFromCache();
        if (cachedGames) {
          console.log('API请求失败，从缓存加载游戏列表');
          games.value = cachedGames;
        }
      } finally {
        loading.value = false;
      }
    };

    // 组件挂载时加载游戏数据
    onMounted(() => {
      loadGames();
    });
    
    // 计算折扣最多的5个游戏
    const discountedGames = () => {
      return [...games.value]
        .filter(game => game.discount < 1) // 筛选出有折扣的游戏
        .sort((a, b) => a.discount - b.discount) // 按折扣率从高到低排序
        .slice(0, 10); // 取前10个
    };
    
    // 按类型推荐游戏
    const gamesByType = (type) => {
      return [...games.value]
        .filter(game => game.genre === type) // 筛选出指定类型的游戏
        .sort((a, b) => b.price - a.price) // 按价格从高到低排序
        .slice(0, 10); // 取前10个
    };

    return {
      games,
      loading,
      discountedGames,
      gamesByType,
      formatDate: gameitemAPI.formatDate,
      calculateDiscountPrice: gameitemAPI.calculateDiscountPrice,
      calculateDiscountPercent: gameitemAPI.calculateDiscountPercent
    };
  }
};
</script>

<template>
  <div>
    <!-- 前20个游戏 -->
    <div class="GS_container_games">
      <GameShowcaseHorizontalCard 
        v-for="game in games.slice(0, 20)" 
        :key="game.id"
        :game="game"
        :format-date="formatDate"
        :calculate-discount-price="calculateDiscountPrice"
        :calculate-discount-percent="calculateDiscountPercent"
      />
    </div>
    <div class="bilibili_container">
      <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=115909255496009&bvid=BV1U1rmBHEoZ&cid=35439903800&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
    </div>
    <!-- 按折扣推荐游戏列表 -->
    <GameDisplayList 
      :games="discountedGames()"
      title="特别优惠"
      :format-date="formatDate"
      :calculate-discount-price="calculateDiscountPrice"
      :calculate-discount-percent="calculateDiscountPercent"
    />

    <!-- 中部10个游戏 -->
    <div class="GS_container_games">
      <GameShowcaseHorizontalCard 
        v-for="game in games.slice(20,30)" 
        :key="game.id"
        :game="game"
        :format-date="formatDate"
        :calculate-discount-price="calculateDiscountPrice"
        :calculate-discount-percent="calculateDiscountPercent"
      />
    </div>
    
    <!-- 按类型推荐游戏列表 -->
    <GameDisplayList 
      :games="gamesByType('动作')"
      title="动作游戏"
      :format-date="formatDate"
      :calculate-discount-price="calculateDiscountPrice"
      :calculate-discount-percent="calculateDiscountPercent"
    />
    
    <!-- 剩余的所有游戏 -->
    <div class="GS_container_games">
      <GameShowcaseHorizontalCard 
        v-for="game in games.slice(30)" 
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
.GS_container_games {
  background-color: rgba(14, 19, 27, 0.1);
  border-radius: 10px;
  padding: 48px 0;
  display: grid;
  grid-template-columns: repeat(5, minmax(200px, 1fr)); /* 每行显示5个游戏 */
  gap: 16px; /* 卡片间隙 */
  max-width: 1200px; /* 限制宽度，居中对齐 */
  margin: 0 auto; /* 居中 */
  position: relative;
}

.bilibili_container {
  max-width: 1200px; /* 与主容器宽度一致 */
  margin: 40px auto; /* 居中并添加上下外边距 */
  width: 100%;
  position: relative;
  padding-bottom: 56.25%; /* 16:9宽高比 (9/16 = 0.5625) */
  height: 0;
  overflow: hidden;
}

.bilibili_container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>