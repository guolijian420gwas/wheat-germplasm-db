# 小麦种质资源数据库 🌾

一个基于纯前端技术的小麦种质资源数据库展示网站，用于展示 2,193 份小麦种质资源的表型数据。

## 功能特性

- **种质资源检索**: 支持按品种名称、省份、年代范围进行多维度筛选
- **卡片式展示**: 每份种质资源以卡片形式展示核心指标
- **详细数据弹窗**: 点击卡片查看完整的 18 项表型指标数据
- **分页浏览**: 每页 20 条数据，支持页码跳转
- **响应式设计**: 适配桌面端和移动端

### 数据维度

| 类别 | 指标 |
|------|------|
| 产量性状 | 抽穗期、扬花期、株高、穗长、小穗数、穗粒数、千粒重、粒长、粒宽、粒厚、单株产量 |
| 抗病性状 | 条锈病(1-9级)、白粉病(1-9级) |
| 抗旱性状 | 存活率(%) |
| 抗寒性状 | 叶片黄化率(%) |
| 品质性状 | 蛋白含量(%)、湿面筋含量(%)、沉降值(ml) |

## 如何预览

### 方式一：直接打开（推荐）

1. 确保 `assets/wheat_data.json` 与 `index.html` 在同一目录下
2. 直接用浏览器打开 `index.html`

> ⚠️ 注意：由于浏览器安全策略，直接双击打开时 `fetch` 可能无法加载本地 JSON。建议使用方式二。

### 方式二：本地服务器

```bash
# 使用 Python 内置服务器
cd I:\my-personal-site
python -m http.server 8080
# 浏览器访问 http://localhost:8080
```

或者使用 VS Code 的 Live Server 插件打开。

### 方式三：Node.js 服务器

```bash
npx serve I:\my-personal-site
```

## 项目结构

```
my-personal-site/
├── index.html          # 主页面（导航栏、数据库、联系方式）
├── styles.css          # 样式表（深蓝+青绿科技风格）
├── script.js           # 交互脚本（搜索、筛选、分页、弹窗）
├── README.md           # 项目说明文档
└── assets/
    └── wheat_data.json # 小麦种质资源数据（2,193条）
```

## 如何修改内容

### 修改数据

编辑 `assets/wheat_data.json`，每条数据格式如下：

```json
{
  "name": "品种名称",
  "year": 2005,
  "province": "甘肃",
  "heading_days": 245,
  "flowering_days": 50,
  "plant_height": 90,
  "spike_length": 9.0,
  "spikelet_num": 19,
  "grain_num": 54,
  "tkw": 54.0,
  "grain_length": 6.5,
  "grain_width": 2.8,
  "grain_thick": 3.0,
  "yield_per_plant": 8.5,
  "stripe_rust": 4,
  "powdery_mildew": 4,
  "survival_rate": 50.0,
  "leaf_yellowing": 50.0,
  "protein": 13.99,
  "gluten": 30.35,
  "sedimentation": 22.52
}
```

### 修改样式

- 主色调变量在 `styles.css` 开头的 `:root` 中定义
- `--accent: #00d4aa;` 可改为你喜欢的辅助色
- `--bg-primary: #0a1628;` 可改为主背景色

### 修改联系方式

在 `index.html` 中搜索 `contact-section`，修改其中的邮箱、地址、电话信息。

## 如何部署

### 部署到 GitHub Pages

1. 将项目推送到 GitHub 仓库
2. Settings → Pages → Source 选择 `main` 分支
3. 保存后即可通过 `https://<username>.github.io/<repo>/` 访问

### 部署到静态服务器

将整个 `my-personal-site` 文件夹上传到任意静态文件服务器（Nginx、Apache、OSS 等）即可。

## 技术栈

- HTML5
- CSS3（CSS 变量、Grid、Flexbox、动画）
- 原生 JavaScript（无框架依赖）

## 注意事项

- 本网站数据为模拟数据，仅供科研数据库展示参考
- 不包含任何真实隐私信息
- 无需后端服务，纯静态文件即可运行

## 许可

仅供科研展示使用。
