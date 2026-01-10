# SiderAgent 组件文档

## 1. 组件简介

SiderAgent 是一个侧边栏 AI 助手组件，提供实时聊天功能，支持展开/收起状态切换，具有现代化的 UI 设计和流畅的交互体验。

**主要功能**：
- AI 实时对话
- 展开/收起状态切换
- 自动滚动到底部
- 支持回车键发送消息
- 打字状态反馈
- 响应式设计

## 2. 组件结构

### 2.1 目录结构
```
├── src/
│   ├── components/
│   │   └── SiderAgent.vue      # AI 助手组件
│   ├── utils/
│   │   └── agent/
│   │       └── aiChatGenerator.js  # AI 对话生成工具
```

### 2.2 组件文件结构

**SiderAgent.vue** 包含三个主要部分：
1. **Script 部分**：组件逻辑实现
2. **Template 部分**：组件 UI 结构
3. **Style 部分**：组件样式定义

## 3. 技术实现

### 3.1 核心逻辑

```javascript
// 主要状态管理
const isExpanded = ref(true); // 控制展开/收起
const isTyping = ref(false); // AI 输入状态
const messages = ref([]); // 对话消息列表
const inputContent = ref(''); // 输入框内容

// 主要方法
const toggleExpand = () => { ... } // 切换展开/收起
const sendMessage = async () => { ... } // 发送消息
const scrollToBottom = async () => { ... } // 滚动到底部
const handleKeyPress = (event) => { ... } // 回车键监听
```

### 3.2 AI 对话流程

1. 用户输入消息并发送
2. 添加用户消息到对话列表
3. 设置 AI 正在输入状态
4. 调用 `generateChatResponse` 获取 AI 回复
5. 移除输入状态，添加 AI 回复到对话列表
6. 自动滚动到底部

### 3.3 依赖关系

| 依赖项 | 用途 | 来源 |
|--------|------|------|
| `generateChatResponse` | 生成 AI 对话响应 | `@/utils/agent/aiChatGenerator` |
| Vue 3 Composition API | 组件状态管理和生命周期 | Vue 3 内置 |

## 4. 组件 API

### 4.1 状态属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| `isExpanded` | `Boolean` | `true` | 控制组件展开/收起状态 |
| `isTyping` | `Boolean` | `false` | 标识 AI 是否正在生成回复 |
| `messages` | `Array` | `[{id: 1, content: '您好！我是盒宝，有什么可以帮助您的吗？', sender: 'ai', timestamp: ...}]` | 对话消息列表 |
| `inputContent` | `String` | `''` | 输入框当前内容 |
| `messagesContainer` | `Object` | `null` | 消息容器 DOM 引用，用于滚动控制 |

### 4.2 方法

| 方法名 | 参数 | 返回值 | 描述 |
|--------|------|--------|------|
| `toggleExpand` | 无 | 无 | 切换组件展开/收起状态 |
| `sendMessage` | 无 | `Promise<void>` | 发送用户消息，处理 AI 回复 |
| `scrollToBottom` | 无 | `Promise<void>` | 将消息容器滚动到底部 |
| `handleKeyPress` | `event: KeyboardEvent` | 无 | 监听回车键，触发发送消息 |

### 4.3 消息对象结构

```javascript
{
  id: Number, // 消息唯一标识符
  content: String, // 消息内容
  sender: String, // 发送者：'user' 或 'ai'
  timestamp: String, // 消息发送时间，格式为本地化时间字符串
  isTyping?: Boolean // 可选，标识是否为 AI 正在输入的临时消息
}
```

## 5. 组件模板结构

### 5.1 展开状态

```html
<div class="sider-agent expanded">
  <div class="agent-container">
    <!-- 头部 -->
    <div class="agent-header">
      <h3>AI助手</h3>
      <button class="toggle-btn" @click="toggleExpand">−</button>
    </div>
    
    <!-- 对话消息区域 -->
    <div class="agent-messages" ref="messagesContainer">
      <div 
        v-for="message in messages" 
        :key="message.id" 
        class="message-item" 
        :class="message.sender === 'user' ? 'user-message' : 'ai-message'"
      >
        <div class="message-content">
          <div class="message-text">{{ message.content }}</div>
          <div class="message-time">{{ message.timestamp }}</div>
        </div>
      </div>
    </div>
    
    <!-- 输入区域 -->
    <div class="agent-input-area">
      <textarea
        v-model="inputContent"
        class="message-input"
        placeholder="输入您的问题..."
        rows="1"
        @keypress="handleKeyPress"
      ></textarea>
      <button class="send-btn" @click="sendMessage">➤</button>
    </div>
  </div>
</div>
```

### 5.2 收起状态

```html
<div class="sider-agent">
  <div class="agent-collapsed">
    <button class="expand-btn" @click="toggleExpand">
      <span class="expand-icon">🤖</span>
      <span class="expand-text">AI助手</span>
    </button>
  </div>
</div>
```

## 6. 样式说明

### 6.1 设计风格

- **主题色**：蓝色系渐变（#1e3a8a 到 #3b82f6）
- **背景**：半透明深色背景，带有毛玻璃效果
- **圆角**：使用大圆角设计，增强现代感
- **阴影**：多层次阴影效果，提升立体感
- **过渡动画**：所有交互元素都有平滑的过渡效果

### 6.2 主要样式类

| 样式类 | 描述 |
|--------|------|
| `.sider-agent` | 组件根容器，控制整体位置和尺寸 |
| `.expanded` | 展开状态类，控制容器显示 |
| `.agent-container` | 展开状态下的主容器 |
| `.agent-header` | 头部区域，包含标题和切换按钮 |
| `.agent-messages` | 消息列表容器，支持滚动 |
| `.message-item` | 单条消息容器 |
| `.user-message` | 用户消息样式 |
| `.ai-message` | AI 消息样式 |
| `.agent-input-area` | 输入区域，包含文本框和发送按钮 |
| `.agent-collapsed` | 收起状态容器 |
| `.expand-btn` | 收起状态下的展开按钮 |

### 6.3 响应式设计

组件采用固定定位，默认显示在页面右下角，不影响页面其他内容布局。展开状态下宽度为 320px，高度为 450px，收起状态下仅显示一个按钮。

## 7. 使用方法

### 7.1 基本使用

在需要使用 AI 助手的页面中直接引入组件即可：

```html
<template>
  <div class="app">
    <!-- 其他页面内容 -->
    <SiderAgent />
  </div>
</template>

<script>
import SiderAgent from '@/components/SiderAgent.vue';

export default {
  components: {
    SiderAgent
  }
};
</script>
```

### 7.2 自定义初始消息

可以通过修改 `messages` 初始值来自定义 AI 的欢迎消息：

```javascript
const messages = ref([
  {
    id: 1,
    content: '欢迎使用 AI 助手！有什么可以帮助您的吗？',
    sender: 'ai',
    timestamp: new Date().toLocaleTimeString()
  }
]);
```

## 8. 扩展建议

1. **支持自定义主题色**：通过 props 传入主题色，实现主题定制
2. **添加消息历史记录**：将对话记录保存到本地存储，支持刷新页面后恢复
3. **支持消息类型扩展**：如图片、链接、代码块等富文本消息
4. **添加快捷回复**：提供常用问题的快捷回复选项
5. **支持多语言**：添加语言切换功能
6. **优化移动端体验**：针对移动端设备优化布局和交互
7. **添加语音输入**：集成语音识别功能，支持语音输入
8. **支持消息撤回**：允许用户撤回刚刚发送的消息

## 9. 技术亮点

1. **现代化 UI 设计**：采用渐变色彩、毛玻璃效果和流畅动画，符合现代设计趋势
2. **流畅的交互体验**：打字状态反馈、自动滚动、平滑过渡等细节处理
3. **清晰的状态管理**：使用 Vue 3 Composition API，状态管理清晰高效
4. **模块化设计**：组件结构清晰，易于维护和扩展
5. **性能优化**：使用 `nextTick` 优化滚动，避免不必要的重渲染
6. **良好的代码组织**：代码结构清晰，注释完善，易于理解

## 10. 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 11. 总结

SiderAgent 组件是一个功能完整、设计现代化的 AI 助手组件，提供了良好的用户体验和扩展能力。通过简单的引入即可在项目中使用，支持多种扩展方式，可以根据业务需求进行定制化开发。

该组件采用了 Vue 3 Composition API，具有良好的性能和可维护性，适合在各种 Web 应用中集成 AI 聊天功能。