# Vue 应用中 React 微应用加载问题解决方案

## 问题描述
在 Vue 应用中点击 "Become Developer" 按钮后，React 微应用无法在 http://localhost:5173/developer 页面显示，出现了多种错误，包括：
- `Cannot use import statement outside a module`
- `ReferenceError: System is not defined`
- `single-spa minified message #31`

## 解决方案

### 1. React 应用构建配置调整

**文件**: `GS_Developer/vite.config.js`

将构建格式从 SystemJS 改为 IIFE（立即执行函数表达式），这是浏览器兼容性最好的脚本格式：

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // 基本的React插件，禁用fastRefresh避免生成ES模块语法
    react({
      fastRefresh: false
    })
  ],
  // 服务器配置
  server: {
    port: 3001,
    cors: true
  },
  // 构建配置
  build: {
    // 生成兼容的IIFE格式，不需要额外加载器
    rollupOptions: {
      output: {
        // 使用IIFE格式，直接在浏览器中运行
        format: 'iife',
        // 全局变量名
        name: 'ReactDeveloperApp',
        // 输出目录
        dir: 'dist',
        // 确保生成的文件可以被qiankun正确加载
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
})
```

### 2. React 应用入口文件优化

**文件**: `GS_Developer/src/main.jsx`

确保生命周期函数直接挂载到 window 对象上：

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 导出qiankun需要的生命周期函数
let root = null;

function render(props = {}) {
  const { container } = props;
  // 确保根元素存在
  const rootElement = container 
    ? container.querySelector('#root') || container.appendChild(document.createElement('div'))
    : document.getElementById('root') || document.body.appendChild(document.createElement('div'));
  
  if (!rootElement.id) {
    rootElement.id = 'root';
  }
  
  root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// 直接挂载到window对象，供qiankun调用
window['react-developer-app'] = {
  bootstrap: async () => {
    console.log('React微应用bootstrap');
    return Promise.resolve();
  },
  mount: async (props) => {
    console.log('React微应用mount，props:', props);
    render(props);
    return Promise.resolve();
  },
  unmount: async () => {
    console.log('React微应用unmount');
    if (root) {
      root.unmount();
      root = null;
    }
    return Promise.resolve();
  },
  update: async (props) => {
    console.log('React微应用update，props:', props);
    return Promise.resolve();
  }
};

// 如果不在qiankun环境中，直接渲染
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}
```

### 3. Vue 主应用微应用加载方式

**文件**: `GS_User/src/layouts/DeveloperLayout.vue`

使用手动 `loadMicroApp` 方式加载 React 微应用，直接指定 JS 文件路径：

```vue
<template>
  <div class="developer-layout">
    <!-- React应用容器 -->
    <div id="react-app-container" style="width: 100%; height: 100vh;"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { loadMicroApp } from 'qiankun'

// 存储微应用实例
const microAppRef = ref(null)

onMounted(() => {
  // 手动加载React微应用
  loadReactMicroApp()
})

onUnmounted(() => {
  // 卸载微应用
  if (microAppRef.value) {
    microAppRef.value.unmount()
  }
})

function loadReactMicroApp() {
  // 创建微应用实例
  microAppRef.value = loadMicroApp({
    name: 'react-developer-app',
    // 直接使用绝对路径加载构建后的JS文件
    entry: {
      scripts: ['/GS_Developer/dist/assets/index-dCxVwryB.js']
    },
    container: '#react-app-container',
    props: {
      message: 'Hello from Vue App',
      routerBase: '/developer'
    }
  })
}
</script>

<style scoped>
.developer-layout {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
```

### 4. Vue 主应用 qiankun 配置简化

**文件**: `GS_User/src/main.js`

移除自动 `registerMicroApps` 配置，仅保留 `start()` 初始化：

```javascript
// 启动qiankun，仅初始化环境，不自动注册应用
start({
  sandbox: {
    strictStyleIsolation: true
  },
  prefetch: false
})
```

## 构建和部署流程

1. 修复 React 应用配置后，重新构建：
   ```bash
   cd GS_Developer
   npm run build
   ```

2. 将构建产物复制到 Vue 主应用的 public 目录：
   ```bash
   xcopy /E /Y dist e:\web集中营\GameStore\GS_User\public\GS_Developer\dist
   ```

3. 确保 Vue 主应用的开发服务器正在运行：
   ```bash
   cd GS_User
   npm run dev
   ```

## 关键教训

1. **选择正确的构建格式**：IIFE 是浏览器兼容性最好的脚本格式，不需要额外加载器
2. **手动加载更可靠**：对于简单场景，手动 `loadMicroApp` 比自动 `registerMicroApps` 更可控
3. **简化配置**：移除不必要的插件和配置，减少复杂性和潜在问题
4. **正确处理生命周期**：确保微应用能够正确挂载和卸载，避免内存泄漏
5. **确保根元素存在**：增强根元素创建逻辑，确保容器存在

## 最终效果

现在，当用户在 Vue 应用中点击 "Become Developer" 按钮后，React 微应用将能够在 http://localhost:5173/developer 页面正确显示，不再出现之前的各种错误。