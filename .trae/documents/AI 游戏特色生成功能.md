# AI 游戏特色生成功能文档

## 1. 功能概述

本功能集成了心流开放平台的AI能力，用于动态生成游戏特色列表。通过调用AI API，系统可以根据游戏的名称、描述和标签，自动生成符合游戏风格的特色描述，提升游戏详情页的内容质量和用户体验。

## 2. 技术架构

### 2.1 系统架构

```
+-------------------+       +-------------------+       +-------------------+
| 游戏详情页面       |       | AI生成服务         |       | 心流开放平台      |
| GameDetailView.vue|------>| gameFeaturesGenerator.js |-->| API              |
+-------------------+       +-------------------+       +-------------------+
        ^                               ^
        |                               |
        |                               v
        |                         +-------------------+
        |                         | 配置管理         |
        |                         | iflowClient.js   |
        +-------------------------+-------------------+
```

### 2.2 核心组件

| 组件名称 | 路径 | 功能描述 |
|---------|------|---------|
| 游戏详情页面 | src/views/GameDetailView.vue | 展示游戏信息和生成的游戏特色 |
| AI生成服务 | src/utils/agent/gameFeaturesGenerator.js | 封装AI调用逻辑，生成游戏特色 |
| 配置管理 | src/utils/core/iflowClient.js | 管理心流API配置和调用 |
| 环境配置 | .env | 存储API密钥等敏感信息 |

## 3. 安装配置

### 3.1 环境要求

- Node.js >= 16.x
- Vite >= 4.x
- Vue >= 3.x

### 3.2 安装步骤

1. **安装依赖**
   ```bash
   npm install
   ```

2. **配置心流API密钥**
   在项目根目录创建或编辑 `.env` 文件，添加以下配置：
   ```
   # 心流开放平台配置
   VITE_IFLOW_API_KEY=your_api_key_here
   VITE_IFLOW_API_URL=https://apis.iflow.cn/v1/chat/completions
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 4. 使用说明

### 4.1 基本使用

游戏特色生成功能会在游戏详情页面加载时自动调用，无需手动触发。生成的游戏特色会显示在"游戏特色"部分，每个特色项前有一个对勾图标。

### 4.2 功能流程

1. 用户访问游戏详情页面
2. 页面加载游戏基本信息
3. 调用AI生成游戏特色
4. 显示生成的游戏特色
5. 若生成失败，显示默认特色列表

### 4.3 页面展示

- **加载状态**：显示加载动画和"生成游戏特色中..."提示
- **成功状态**：显示生成的游戏特色列表
- **空状态**：当特色列表为空时，显示"暂无游戏特色信息"

## 5. API文档

### 5.1 心流API调用

**接口地址**：`https://apis.iflow.cn/v1/chat/completions`

**请求方法**：POST

**请求头**：
```
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**请求体**：
```json
{
  "model": "deepseek-v3.2",
  "messages": [
    {
      "role": "system",
      "content": "你是一位精通游戏行业和玩家心理的资深编辑。"
    },
    {
      "role": "user",
      "content": "基于游戏信息生成5条游戏特色..."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

**响应示例**：
```json
{
  "id": "a20be68e-b142-4e96-be77-9c73717525be",
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "[\"特色1\", \"特色2\", \"特色3\", \"特色4\", \"特色5\"]"
      }
    }
  ]
}
```

## 6. 故障排除

### 6.1 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| API调用失败 | 网络问题或API密钥错误 | 检查网络连接和API密钥配置 |
| 响应格式异常 | AI返回格式不符合预期 | 优化提示词，增强结果解析逻辑；当前版本已支持嵌套数组格式 |
| 只显示第一条特色 | AI返回嵌套数组格式，解析逻辑问题 | 系统已修复，使用贪婪匹配和数组扁平化处理 |
| 模型不支持 | 使用了心流API不支持的模型 | 更换为支持的模型，如`deepseek-v3.2` |
| CORS问题 | 浏览器跨域限制 | 配置Vite代理，或使用后端转发 |

### 6.2 日志调试

系统会在浏览器控制台输出详细日志，包括：
- API请求和响应
- AI生成的原始内容
- 解析结果
- 错误信息

可以通过浏览器开发者工具查看这些日志，帮助定位问题。

## 7. 扩展建议

### 7.1 功能扩展

- **多语言支持**：支持生成多种语言的游戏特色
- **自定义模型**：支持选择不同的AI模型
- **特色分类**：将生成的特色按类型分类显示
- **用户反馈**：允许用户对生成的特色进行评价和反馈

### 7.2 性能优化

- **缓存机制**：缓存生成结果，减少API调用次数
- **异步加载**：延迟加载游戏特色，提升页面初始加载速度
- **批量生成**：支持批量生成多个游戏的特色
- **预生成**：在游戏发布时自动生成特色

### 7.3 安全性

- **API密钥管理**：使用更安全的方式管理API密钥
- **请求验证**：添加请求验证，防止恶意调用
- **内容过滤**：对生成的内容进行过滤，确保符合要求

## 8. 代码示例

### 8.1 调用生成服务

```javascript
import { generateGameFeatures } from '@/utils/agent/gameFeaturesGenerator';

// 生成游戏特色
const features = await generateGameFeatures({
  gameName: '游戏名称',
  gameDescription: '游戏描述',
  gameTags: ['标签1', '标签2', '标签3']
});
```

### 8.2 配置心流客户端

```javascript
// src/utils/core/iflowClient.js
const iflowConfig = {
  apiKey: import.meta.env.VITE_IFLOW_API_KEY,
  apiUrl: '/iflow-api/v1/chat/completions',
  defaultModel: 'deepseek-v3.2'
};
```

## 9. 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| 1.1.0 | 2026-01-10 | 修复AI生成内容解析问题，支持嵌套数组格式；优化解析逻辑，提高成功率 |
| 1.0.0 | 2026-01-10 | 初始版本，实现基本的AI游戏特色生成功能 |

## 10. 联系方式

如有任何问题或建议，请联系开发团队。

---

## 附录

### A. 心流开放平台配置

| 参数 | 说明 | 默认值 |
|------|------|-------|
| apiKey | 心流API密钥 | 从环境变量获取 |
| apiUrl | 心流API地址 | https://apis.iflow.cn/v1/chat/completions |
| defaultModel | 默认使用的AI模型 | deepseek-v3.2 |
| temperature | 生成温度参数 | 0.7 |
| max_tokens | 最大生成 tokens | 500 |

### B. 环境变量

| 变量名 | 说明 | 示例值 |
|-------|------|-------|
| VITE_IFLOW_API_KEY | 心流API密钥 | sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |
| VITE_IFLOW_API_URL | 心流API地址 | https://apis.iflow.cn/v1/chat/completions |

### C. 代码结构

```
src/
├── utils/
│   ├── agent/
│   │   └── gameFeaturesGenerator.js  # AI生成服务
│   └── core/
│       └── iflowClient.js          # 配置管理
└── views/
    └── GameDetailView.vue          # 游戏详情页面
```