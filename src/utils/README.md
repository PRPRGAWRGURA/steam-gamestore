# 工具分类

## 目录结构

```
src/utils/
├── core/            # 核心配置文件
├── api/             # API服务模块
├── tools/           # 工具函数
└── README.md        # 工具分类说明
```

## 1. 核心配置 (core/)

| 文件名 | 功能描述 |
|--------|----------|
| `supabase.js` | 创建并导出Supabase客户端实例，配置数据库连接 |

## 2. API服务 (api/)

| 文件名 | 功能描述 |
|--------|----------|
| `normalUserAPI.js` | 用户相关API，提供登录、注册、信息更新、头像上传等功能 |
| `communityAPI.js` | 社区相关API，提供帖子、点赞、评论等功能 |
| `supportAPI.js` | 支持相关API，提供客服请求、开发者申请等功能 |

## 3. 工具函数 (tools/)

| 文件名 | 功能描述 |
|--------|----------|
| `cacheUtils.js` | 缓存管理工具，提供localStorage缓存的设置、获取、删除等功能，支持社区帖子缓存 |
| `canvasAPI.js` | Canvas图片处理工具，用于头像裁剪、图片压缩等功能 |
| `validation.js` | 表单验证工具，提供密码、用户名、简介、图片文件等验证功能 |

## 4. 使用说明

### 4.1 核心配置

直接导入使用，无需额外配置：

```javascript
import supabase from './core/supabase.js'
```

### 4.2 API服务

根据功能需求导入对应API模块：

```javascript
import normalUserAPI from './api/normalUserAPI.js'
import communityAPI from './api/communityAPI.js'
import supportAPI from './api/supportAPI.js'
```

### 4.3 工具函数

根据功能需求导入对应工具函数：

```javascript
// 导入全部缓存工具
import * as cacheUtils from './tools/cacheUtils.js'

// 或导入特定函数
import { setCache, getCache } from './tools/cacheUtils.js'

// Canvas工具
import { ImageCropper } from './tools/canvasAPI.js'

// 验证工具
import * as validation from './tools/validation.js'
```

## 5. 组件中使用

在Vue组件中导入示例：

```javascript
// 导入API
import { communityAPI } from '../utils/api/communityAPI'

// 导入工具函数
import { loadPostsFromCache, savePostsToCache } from '../utils/tools/cacheUtils'
```

## 6. 扩展建议

1. **新增API服务**：在`api/`目录下创建新文件，遵循现有API命名规范
2. **新增工具函数**：在`tools/`目录下创建新文件，根据功能类型选择合适的分类
3. **统一工具规范**：所有工具函数应包含清晰的注释和类型说明
4. **单元测试**：为工具函数编写单元测试，确保功能正确性
5. **核心配置扩展**：在`core/`目录下添加新的核心配置文件，如第三方服务配置等
