# B站视频URL自动转换为iframe播放器

## 功能描述
当用户在社区帖子中分享B站视频URL时，系统会自动将其转换为可播放的iframe播放器，用户可以直接在网站内观看视频内容，无需跳转到B站。

## 支持的URL格式
1. **标准BV格式**：`https://www.bilibili.com/video/BV1xxx.../?spm_id_from=xxx&vd_source=xxx`
2. **b23短链接**：`https://b23.tv/xxxx`
3. **稍后再看格式**：`https://www.bilibili.com/watchlater/#/avxxxxxx`

## 实现步骤

### 1. 分析B站URL规律
通过分析B站分享的URL，发现以下特点：
- 所有B站视频URL都带有`spm_id_from`和`vd_source`等追踪参数
- 这些参数是B站内部用于统计的，对视频播放不是必需的
- 有效的iframe只需要`bvid`参数

### 2. 修改URL处理函数
在`communityAPI.js`中修改`formatContent`函数，添加B站视频URL的识别和转换逻辑：

```javascript
/**
 * 格式化帖子内容，将URL转换为可点击的链接，将B站视频URL转换为iframe
 * @param {string} content - 原始帖子内容
 * @returns {string} 格式化后的内容，包含可点击的链接和B站iframe
 */
formatContent(content) {
  if (!content) return ''
  
  let formattedContent = content
  
  // 1. 先处理B站视频URL，转换为iframe
    // 匹配完整URL，包括所有查询参数，解决残留URL尾巴问题
    const bilibiliRegex = /https?:\/\/(www\.)?(bilibili\.com\/video\/BV[0-9A-Za-z]+|b23\.tv\/[0-9A-Za-z]+)(?:\/[\s\S]*?)?(?=\s|$)/g
    
    formattedContent = formattedContent.replace(bilibiliRegex, (match) => {
    // 提取BV号或b23短链接，忽略其他参数
    let bvid = ''
    let page = 1
    
    // 提取核心URL部分，去除查询参数
    const coreUrl = match.split('?')[0].replace(/\/$/, '')
    
    if (coreUrl.includes('bilibili.com/video/')) {
      // 标准BV格式：bilibili.com/video/BV1xxx...
      bvid = coreUrl.match(/BV[0-9A-Za-z]+/)[0]
      // 检查原始URL中是否有page参数
      const pageMatch = match.match(/\?.*?p=(\d+)/)
      if (pageMatch) {
        page = parseInt(pageMatch[1])
      }
    } else if (coreUrl.includes('b23.tv/')) {
      // b23短链接格式：b23.tv/xxxx
      bvid = coreUrl.replace('b23.tv/', '')
    }
    
    // 生成B站iframe，使用标准的iframe格式
    return `<iframe src="//player.bilibili.com/player.html?isOutside=true&bvid=${bvid}&page=${page}" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="width: 100%; height: 300px;"></iframe>`
  })
  
  // 2. 处理其他普通URL，转换为a标签
  const urlRegex = /(https?:\/\/[^\s<>]+)/g
  
  formattedContent = formattedContent.replace(urlRegex, (url) => {
    // 确保URL的完整性
    let fullUrl = url
    // 移除可能的标点符号
    fullUrl = fullUrl.replace(/[.,!?;:)]$/, '')
    return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="post-link">${fullUrl}</a>`
  })
  
  return formattedContent
}
```

### 3. 添加iframe样式
在`PostList.vue`中添加iframe样式，确保播放器正确显示：

```css
/* B站视频iframe样式 */
.content-text iframe {
  display: block;
  margin: 15px 0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  width: 100% !important;
  height: 300px !important;
  max-width: 100%;
}

/* 确保链接样式不影响iframe */
.content-text a.post-link {
  color: #499deb;
  text-decoration: none;
  transition: color 0.3s;
}

.content-text a.post-link:hover {
  color: #6bb8f0;
  text-decoration: underline;
}
```

## 技术要点

### 1. 正则表达式优化
使用精确的正则表达式匹配完整的B站URL，包括所有查询参数，解决残留URL尾巴问题：
```javascript
const bilibiliRegex = /https?:\/\/(www\.)?(bilibili\.com\/video\/BV[0-9A-Za-z]+|b23\.tv\/[0-9A-Za-z]+)(?:\/[\s\S]*?)?(?=\s|$)/g
```

**正则表达式详解**：
- `https?:\/\/` - 匹配http或https协议
- `(www\.)?` - 可选的www前缀
- `(bilibili\.com\/video\/BV[0-9A-Za-z]+|b23\.tv\/[0-9A-Za-z]+)` - 匹配B站视频URL的核心部分
- `(?:\/[\s\S]*?)?` - 可选的斜杠和任意字符，非贪婪匹配，用于匹配所有查询参数
- `(?=\s|$)` - 正向先行断言，匹配空白字符或字符串结尾，确保匹配完整的URL

### 2. 核心URL提取
将URL分割为核心部分和查询参数，只使用核心部分提取BV号：
```javascript
const coreUrl = match.split('?')[0].replace(/\/$/, '')
```

### 3. 标准iframe格式
使用B站推荐的外部嵌入参数，确保播放器在外部网站正常工作：
```javascript
<iframe src="//player.bilibili.com/player.html?isOutside=true&bvid=${bvid}&page=${page}" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="width: 100%; height: 300px;"></iframe>
```

## 测试方法
1. 访问开发服务器：`http://localhost:5175/`
2. 在社区发布包含B站视频URL的帖子
3. 查看帖子，视频应该会自动转换为可播放的iframe播放器

## 案例测试
使用以下B站URL进行测试：
- `https://www.bilibili.com/video/BV1rUzLBVE8t/?spm_id_from=333.1007.tianma.1-1-1.click&vd_source=198e85d3ed770a50521cc89f7ab49e63`
- `https://www.bilibili.com/video/BV1KhrZBkEqx/?spm_id_from=333.1007.tianma.1-2-2.click&vd_source=198e85d3ed770a50521cc89f7ab49e63`
- `https://www.bilibili.com/video/BV1vXv8BwECP/?spm_id_from=333.1007.tianma.1-2-2.click&vd_source=198e85d3ed770a50521cc89f7ab49e63`
- `https://www.bilibili.com/video/BV1ZfVazuEZw?spm_id_from=333.788.recommend_more_video.-1&trackid=web_related_0.router-related-2206146-wx28m.1769056652527.831&vd_source=198e85d3ed770a50521cc89f7ab49e63`

## 注意事项
1. 确保B站播放器的iframe参数符合B站的规范
2. 定期检查B站播放器的API是否有变化
3. 考虑添加视频加载失败的处理机制
4. 优化移动端的播放器显示效果

## 未来优化方向
1. 支持更多视频平台（YouTube、腾讯视频等）
2. 添加视频预览功能
3. 支持视频时间戳跳转
4. 添加视频封面显示
5. 优化视频加载性能

## 文件修改记录
- `communityAPI.js`：修改`formatContent`函数，添加B站视频URL转换逻辑
- `PostList.vue`：添加iframe样式，确保播放器正确显示
- `communityAPI.js`：优化正则表达式，匹配完整URL包括所有查询参数，解决残留URL尾巴问题

## 技术栈
- Vue 3
- JavaScript
- 正则表达式
- CSS