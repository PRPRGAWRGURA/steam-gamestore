# 游戏API设计方案

## 1. 设计目标

设计一套通用的游戏API，满足以下场景需求：
- 商城首页展示全部游戏
- 搜索栏输入游戏名返回对应游戏列表
- 游戏详细页获取当前浏览游戏的全部数据
- 游戏库展示游戏预览

## 2. API设计

### 2.1 核心API方法

#### 2.1.1 获取游戏列表 `getGames`

**功能**：获取游戏列表，支持多种筛选和排序方式

**参数**：
- `options`: 筛选选项对象
  - `search`: 搜索关键词，用于模糊匹配游戏名称
  - `type`: 游戏类型筛选
  - `sortBy`: 排序字段，支持：created_at, game_price, game_name
  - `sortAsc`: 是否升序排序
  - `page`: 页码，用于分页
  - `pageSize`: 每页数量，用于分页
  - `fields`: 返回字段，用逗号分隔
  - `state`: 游戏状态筛选，如：Available, Unavailable
- `gamePublisher`: 游戏发行商名称，用于过滤当前发行商的游戏

**返回**：
```javascript
{
  success: true,
  data: {
    items: [/* 游戏列表 */],
    pagination: {
      page: 1,
      pageSize: 20,
      total: 100,
      totalPages: 5
    }
  },
  error: null
}
```

#### 2.1.2 获取游戏详情 `getGameById`

**功能**：根据ID获取游戏详情

**参数**：
- `gameId`: 游戏ID

**返回**：
```javascript
{
  success: true,
  data: {/* 游戏详情 */},
  error: null
}
```

#### 2.1.3 获取游戏类型列表 `getGameTypes`

**功能**：获取游戏类型列表

**返回**：
```javascript
{
  success: true,
  data: [/* 游戏类型列表 */],
  error: null
}
```

## 3. 场景应用方案

### 3.1 商城首页展示全部游戏

**需求**：展示全部游戏，支持分页，按最新上架排序

**API调用**：
```javascript
// 获取首页游戏列表，按最新上架排序，每页12个
const response = await gameitemAPI.getGames({
  page: currentPage,
  pageSize: 12,
  sortBy: 'created_at',
  sortAsc: false,
  fields: 'id,game_name,game_price,game_discount,library_img,header_img'
});
```

**返回字段说明**：
- `id`: 游戏ID
- `game_name`: 游戏名称
- `game_price`: 游戏原价
- `game_discount`: 游戏折扣比例
- `library_img`: 游戏库存展示图
- `header_img`: 游戏头图

### 3.2 搜索栏输入游戏名返回对应游戏列表

**需求**：根据用户输入的关键词，返回匹配的游戏列表

**API调用**：
```javascript
// 搜索游戏，按相关度排序
const response = await gameitemAPI.getGames({
  search: searchKeyword,
  page: currentPage,
  pageSize: 12,
  sortBy: 'created_at',
  sortAsc: false,
  fields: 'id,game_name,game_price,game_discount,library_img'
});
```

**返回字段说明**：
- `id`: 游戏ID
- `game_name`: 游戏名称
- `game_price`: 游戏原价
- `game_discount`: 游戏折扣比例
- `library_img`: 游戏库存展示图

### 3.3 游戏详细页获取当前浏览游戏的全部数据

**需求**：获取游戏的完整数据，包括描述、图片、价格等

**API调用**：
```javascript
// 获取游戏详情，返回所有字段
const response = await gameitemAPI.getGameById(gameId);
```

**返回字段说明**：
- 返回游戏的所有字段，包括：
  - 基本信息：id, game_name, game_publisher
  - 价格信息：game_price, game_discount
  - 描述信息：game_description
  - 分类信息：game_type, game_tags
  - 图片信息：library_img, header_img, hero_img
  - 状态信息：state
  - 时间信息：created_at

### 3.4 游戏库展示游戏预览

**需求**：展示用户已购买的游戏，只需要基本信息

**API调用**：
```javascript
// 获取游戏库游戏列表，按游戏名称排序
const response = await gameitemAPI.getGames({
  page: currentPage,
  pageSize: 20,
  sortBy: 'game_name',
  sortAsc: true,
  fields: 'id,game_name,header_img,state'
});
```

**返回字段说明**：
- `id`: 游戏ID
- `game_name`: 游戏名称
- `header_img`: 游戏头图
- `state`: 游戏状态

## 4. API设计优势

### 4.1 灵活性

- 支持多种筛选条件：搜索、类型、状态
- 支持多种排序方式：按创建时间、价格、名称
- 支持分页：可调整每页数量
- 支持字段选择：只返回需要的字段，减少数据传输

### 4.2 高效性

- 使用Supabase的查询优化
- 支持分页，减少单次查询的数据量
- 支持字段选择，减少数据传输量
- 搜索使用模糊匹配，效率高

### 4.3 易用性

- 统一的API接口，易于使用
- 清晰的参数说明和返回数据结构
- 支持多种场景，无需为每个场景设计单独的API

### 4.4 可扩展性

- 可以轻松添加新的筛选条件
- 可以轻松添加新的排序字段
- 可以轻松添加新的返回字段

## 5. 代码实现

### 5.1 getGames方法实现

```javascript
async getGames(options = {}, gamePublisher) {
    try {
        const {
            search = '',
            type = '',
            sortBy = 'created_at',
            sortAsc = false,
            page = 1,
            pageSize = 20,
            fields = '*',
            state = ''
        } = options;
        
        let query = supabase.from('game_item').select(fields, { count: 'exact' });
        
        // 添加发行商过滤
        if (gamePublisher) {
            query = query.eq('game_publisher', gamePublisher);
        }
        
        // 添加搜索条件
        if (search) {
            query = query.ilike('game_name', `%${search}%`);
        }
        
        // 添加类型筛选
        if (type) {
            query = query.eq('game_type', type);
        }
        
        // 添加状态筛选
        if (state) {
            query = query.eq('state', state);
        }
        
        // 添加排序
        query = query.order(sortBy, { ascending: sortAsc });
        
        // 添加分页
        const offset = (page - 1) * pageSize;
        query = query.range(offset, offset + pageSize - 1);
        
        const response = await query;
        
        return {
            success: true,
            data: {
                items: response.data,
                pagination: {
                    page,
                    pageSize,
                    total: response.count,
                    totalPages: Math.ceil(response.count / pageSize)
                }
            },
            error: null
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            error: error.message
        };
    }
}
```

### 5.2 getGameById方法实现

```javascript
async getGameById(gameId) {
    try {
        const response = await supabase
            .from('game_item')
            .select('*')
            .eq('id', gameId)
            .single();
        
        if (response.error) {
            return {
                success: false,
                data: null,
                error: response.error.message
            };
        }
        
        return {
            success: true,
            data: response.data,
            error: null
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            error: error.message
        };
    }
}
```

### 5.3 getGameTypes方法实现

```javascript
async getGameTypes() {
    try {
        const response = await supabase
            .from('game_item')
            .select('game_type')
            .distinct();
        
        if (response.error) {
            return {
                success: false,
                data: null,
                error: response.error.message
            };
        }
        
        // 提取类型数组
        const types = response.data.map(item => item.game_type).filter(type => type);
        
        return {
            success: true,
            data: types,
            error: null
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            error: error.message
        };
    }
}
```

## 6. 总结

本API设计方案通过一个通用的`getGames`方法，配合不同的参数组合，实现了多种场景的需求，包括：
- 商城首页展示全部游戏
- 搜索栏输入游戏名返回对应游戏列表
- 游戏库展示游戏预览

同时，`getGameById`方法满足了游戏详情页的需求，`getGameTypes`方法提供了游戏类型列表，用于筛选功能。

这种设计方案具有以下优势：
- 灵活性：支持多种筛选、排序和分页方式
- 高效性：减少数据传输量，优化查询性能
- 易用性：统一的API接口，易于使用
- 可扩展性：易于添加新的功能和字段

通过这种设计，可以满足商城项目中各种游戏展示场景的需求，同时保持代码的简洁性和可维护性。