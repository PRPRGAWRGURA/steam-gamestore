# 组件重命名映射表

## 命名规则

1. **通用基础组件**：使用 `Base` 前缀，如 `BaseHeader.vue`
2. **页面特定组件**：使用页面名称作为前缀，如 `HomeCarousel.vue`
3. **功能组件**：使用功能描述作为名称，如 `PostList.vue`
4. **组件类型后缀**：根据组件类型添加后缀，如 `Header.vue`, `Footer.vue`, `Carousel.vue` 等

## 重命名映射

| 当前名称 | 新名称 | 功能描述 | 所属页面/用途 |
|----------|--------|----------|---------------|
| `GS_body.vue` | `BaseBody.vue` | 页面主体容器 | 通用 |
| `GS_bottom.vue` | `BaseFooter.vue` | 页面底部 | 通用 |
| `GS_Carousel.vue` | `HomeCarousel.vue` | 轮播图组件 | HomeView |
| `GS_change_userinfo.vue` | `UserProfileEdit.vue` | 用户信息修改组件 | UseritemView |
| `GS_container.vue` | `BaseContainer.vue` | 内容容器 | 通用 |
| `GS_game_library.vue` | `GameLibrary.vue` | 游戏库组件 | GamebarView |
| `GS_header_user.vue` | `HeaderUser.vue` | 头部用户信息组件 | 通用 |
| `GS_header.vue` | `BaseHeader.vue` | 页面头部 | 通用 |
| `GS_login.vue` | `LoginForm.vue` | 登录组件 | LoginView |
| `GS_post_creator.vue` | `PostCreator.vue` | 帖子创建组件 | CommunityView |
| `GS_post_list.vue` | `PostList.vue` | 帖子列表组件 | CommunityView |
| `GS_showgames.vue` | `HomeGameShowcase.vue` | 游戏展示组件 | HomeView |
| `GS_support_form.vue` | `SupportForm.vue` | 支持表单组件 | SupportView |
| `GS_title_expand.vue` | `HomeTitleExpand.vue` | 标题展开组件 | HomeView |
| `GS_title_inner.vue` | `TitleInner.vue` | 标题内部组件 | 通用 |
| `GS_title_search.vue` | `TitleSearch.vue` | 标题搜索组件 | 通用 |
| `GS_title.vue` | `BaseTitle.vue` | 标题组件 | 通用 |

## 重命名注意事项

1. 重命名后需要更新所有引用这些组件的文件
2. 确保组件的 props、emits 等 API 保持不变
3. 确保组件的功能和样式保持不变
4. 重命名过程中需要小心处理大小写和拼写

## 重命名步骤

1. 执行重命名操作
2. 更新所有引用这些组件的文件
3. 测试应用确保正常运行
