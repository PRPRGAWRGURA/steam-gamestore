# B站视频获取与显示功能文档

## 1. 功能概述

本功能实现了从B站获取指定UP主的最新视频，并将其显示在网站首页的功能。通过Supabase数据库作为中间层，解决了前端直接调用B站API的跨域问题和API调用频率限制。

## 2. 技术架构

### 2.1 架构图

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  B站API      │     │  Python脚本   │     │  Supabase    │
│  (获取视频)  │────▶│  BvideoDog.py │────▶│  数据库      │
└──────────────┘     └──────────────┘     └──────────────┘
                                               │
                                               ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  前端组件    │◀────│  BvideoAPI.js │◀────│  Supabase    │
│  (显示视频)  │     │  (获取数据)  │     │  API         │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 2.2 核心组件

| 组件 | 位置 | 功能 |
|------|------|------|
| BvideoDog.py | `e:\web集中营\GameStore\BVideoDog\BvideoDog.py` | 每日获取B站最新视频，上传到Supabase |
| .env | `e:\web集中营\GameStore\BVideoDog\.env` | 存储Supabase配置信息 |
| BvideoAPI.js | `e:\web集中营\GameStore\GS_User\src\utils\api\BvideoAPI.js` | 从Supabase获取视频URL |
| HomeGameShowcase.vue | `e:\web集中营\GameStore\GS_User\src\componets\HomeGameShowcase.vue` | 显示B站视频 |

## 3. 实现细节

### 3.1 后端实现

#### 3.1.1 BvideoDog.py脚本

**功能**：
- 每日获取指定UP主的最新视频URL
- 将视频URL上传到Supabase数据库
- 支持每天只更新一次，避免频繁调用API
- 支持强制更新选项

**核心代码**：
```python
# 获取最新视频URL
def get_latest_video_url(mid: str) -> str:
    u = user.User(uid=int(mid))
    videos = sync(u.get_videos(ps=1, pn=1, order=VideoOrder.PUBDATE))
    # 处理视频数据...
    return iframe_url

# 上传到Supabase
def upload_to_supabase(video_url: str) -> bool:
    response = supabase.table('BvideoDogGet').insert({'video_url': video_url}).execute()
    # 处理上传结果...
```

#### 3.1.2 数据库表结构

**表名**：BvideoDogGet

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | UUID | 唯一标识符，自动生成 |
| video_url | TEXT | B站视频iframe URL |
| created_at | TIMESTAMP | 创建时间，自动生成 |

### 3.2 前端实现

#### 3.2.1 BvideoAPI.js

**功能**：
- 提供从Supabase获取视频URL的API
- 支持获取最新单个视频
- 支持获取所有视频列表

**核心方法**：
```javascript
// 获取最新视频URL
async getLatestVideoUrl() {
    const { data, error } = await supabase
        .from('BvideoDogGet')
        .select('video_url')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    // 处理结果...
}
```

#### 3.2.2 HomeGameShowcase.vue

**功能**：
- 组件挂载时自动从Supabase获取视频
- 条件渲染，只在获取到有效URL时显示视频
- 完整的错误处理和日志

**核心代码**：
```javascript
// 获取B站最新视频iframe URL
const loadBilibiliVideo = async () => {
    try {
        const response = await bvideoAPI.getLatestVideoUrl();
        if (response.success) {
            bilibiliIframeUrl.value = response.data.video_url;
        } else {
            bilibiliIframeUrl.value = null; // 获取失败时设为null
        }
    } catch (error) {
        bilibiliIframeUrl.value = null; // 发生异常时设为null
    }
};
```

## 4. 使用说明

### 4.1 运行脚本更新视频

```bash
# 每天自动更新一次（推荐，适合定时任务）
python BvideoDog.py

# 强制更新（适合测试）
python BvideoDog.py --force
```

### 4.2 部署定时任务

#### Windows
1. 打开「任务计划程序」
2. 创建基本任务
3. 设置每天运行一次
4. 程序/脚本：`python.exe`
5. 添加参数：`BvideoDog.py`
6. 起始于：`e:\web集中营\GameStore\BVideoDog`

#### Linux/macOS

```bash
# 编辑crontab
crontab -e

# 添加每日执行任务（每天凌晨2点执行）
0 2 * * * cd /path/to/BVideoDog && python BvideoDog.py
```

### 4.3 前端使用

前端组件会自动从Supabase获取最新视频URL，无需额外配置。组件挂载时自动加载视频，只有在获取到有效URL时才会显示视频容器。

## 5. 部署指南

### 5.1 环境准备

#### Python环境

```bash
# 进入项目目录
cd e:\web集中营\GameStore\BVideoDog

# 激活虚拟环境
venv\Scripts\activate

# 安装依赖
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple/ supabase python-dotenv bilibili-api-python
```

#### 环境变量配置

在`.env`文件中配置Supabase信息：

```
# Supabase 配置
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_KEY=your-supabase-key
```

### 5.2 数据库初始化

1. 登录Supabase控制台
2. 创建名为`BvideoDogGet`的表
3. 添加字段：
   - `id`：UUID类型，主键，自动生成
   - `video_url`：TEXT类型，非空
   - `created_at`：TIMESTAMP类型，自动生成

## 6. 维护说明

### 6.1 日志查看

脚本运行时会输出详细日志，可通过终端查看。主要日志包括：
- 执行时间
- 获取视频结果
- 上传结果
- 错误信息

### 6.2 常见问题排查

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 脚本无法连接Supabase | 环境变量配置错误 | 检查.env文件中的Supabase URL和密钥 |
| 无法获取B站视频 | B站API风控限制 | 检查UP主mid是否正确，或稍后重试 |
| 前端无法显示视频 | 数据库中无数据 | 手动运行脚本更新视频：`python BvideoDog.py --force` |
| 视频显示异常 | iframe URL格式错误 | 检查脚本生成的URL格式，确保包含正确的bvid |

### 6.3 更新UP主

如需更改获取视频的UP主，修改`BvideoDog.py`中的`DEFAULT_MID`变量：

```python
DEFAULT_MID = "123456789"  # 替换为目标UP主的mid
```

## 7. 故障排除

### 7.1 脚本运行失败

**症状**：脚本运行时抛出异常

**解决方案**：
1. 检查Python版本是否兼容（推荐Python 3.8+）
2. 确保所有依赖已正确安装
3. 检查.env文件配置是否正确
4. 查看详细的错误日志，定位问题

### 7.2 前端获取数据失败

**症状**：浏览器控制台显示错误，无法获取视频URL

**解决方案**：
1. 检查Supabase表中是否有数据
2. 确认前端环境变量配置正确
3. 检查网络连接和CORS设置
4. 查看浏览器控制台的详细错误信息

## 8. 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0.0 | 2026-01-22 | 初始版本，实现基本功能 |
| 1.0.1 | 2026-01-22 | 移除默认视频URL，添加条件渲染 |

## 9. 扩展建议

1. **多UP主支持**：扩展脚本支持多个UP主，可配置获取多个UP主的最新视频
2. **视频分类**：在数据库中添加分类字段，支持按分类显示视频
3. **视频播放统计**：添加视频播放量统计功能
4. **自动发布通知**：当有新视频时，自动发送通知给管理员
5. **前端缓存**：添加前端缓存机制，减少对Supabase的请求次数

## 10. 联系方式

如有问题或建议，可联系相关开发人员。

---

**文档更新日期**：2026-01-22
**文档作者**：系统生成
**文档版本**：1.0.1