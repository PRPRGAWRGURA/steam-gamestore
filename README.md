# GS_User - 游戏商城用户端

GS_User是一个基于Vue 3开发的游戏商城用户端应用，采用现代化的前端技术栈，提供了完整的游戏商城用户体验。该项目作为游戏商城系统的用户端，与GS_Admin管理员端配合，共同构成了完整的游戏商城生态系统。

## 项目概述

GS_User定位为游戏商城的用户交互界面，主要面向普通用户提供游戏浏览、购买、社区交流、客服支持等功能，同时支持开发者申请成为发行商。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5.22 | 前端框架 |
| Vite | 7.1.11 | 构建工具 |
| Pinia | 3.0.4 | 状态管理 |
| Vue Router | 4.6.3 | 路由管理 |
| Supabase | 2.84.0 | 后端服务（认证、存储、数据库） |
| qiankun | 2.10.16 | 微前端架构 |

## 核心功能

- **用户功能**：登录/注册、个人信息管理、头像上传与裁剪
- **游戏功能**：游戏展示、游戏搜索、游戏详情、游戏库
- **社区功能**：帖子发布、帖子列表、点赞评论、双列瀑布流布局
- **支持功能**：客服请求、开发者申请、管理员回复展示
- **性能优化**：本地缓存、乐观更新、图片压缩、加载状态管理

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with ESLint

```sh
npm run lint
```
