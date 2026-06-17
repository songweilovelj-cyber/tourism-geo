# 🎯 文旅GEO - TourismGEO Platform

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18+-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/React-v18-blue.svg" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-v5-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
  <img src="https://img.shields.io/github/stars/tourism-geo?color=brightgreen" alt="Stars">
  <img src="https://img.shields.io/github/forks/tourism-geo?color=blue" alt="Forks">
</p>

> 🚀 让每一个优质的文旅目的地都能被AI大模型发现

文旅GEO是一个面向文旅行业的智能地理信息服务平台，旨在帮助景区、酒店、民宿、文创店、餐饮等文旅企业/个体经营者便捷地展示和推广他们的文旅资源，让豆包、DeepSeek等AI大模型能够检索到他们，让更多优质游玩目的地被发现。

## ✨ 特性

### 🌟 核心功能
- **智能资源管理**：支持景区景点、酒店民宿、文创特产、游玩项目、景区餐饮等多种文旅资源类型的录入和管理
- **AI内容生成**：集成豆包等大语言模型，自动生成高质量的文旅介绍内容
- **多渠道分发**：支持微信公众号、小红书、知乎等平台的智能内容分发
- **直连预订**：支持直联预订方式，减少中间环节，让游客享受优惠
- **地理信息展示**：基于GeoHash的地理位置服务，支持地图展示
- **AI友好**：专为AI大模型设计的结构化数据，便于检索和推荐

### 🎨 技术亮点
- **前后端分离**：采用现代化的前后端分离架构
- **TypeScript**：全栈TypeScript开发，类型安全
- **响应式设计**：移动端优先，适配各种设备
- **媒体支持**：支持图片、视频等多种媒体格式上传和展示
- **实时预览**：所见即所得的内容编辑体验

## 🏗️ 技术栈

### 前端
- **框架**：React 18 + TypeScript
- **路由**：React Router v6
- **状态管理**：Zustand
- **样式**：Tailwind CSS
- **构建工具**：Vite
- **HTTP客户端**：Axios

### 后端
- **运行环境**：Node.js 18+
- **框架**：Express.js
- **ORM**：Prisma
- **数据库**：SQLite（开发）/ PostgreSQL（生产）
- **认证**：JWT
- **文件上传**：Multer

### AI集成
- **豆包大模型**：AI内容生成
- **高德地图**：地理位置服务

## 📦 项目结构

```
tourism-geo/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── api/              # API客户端
│   │   ├── components/       # 可复用组件
│   │   ├── hooks/           # 自定义Hooks
│   │   ├── pages/           # 页面组件
│   │   ├── stores/          # 状态管理
│   │   └── types/           # TypeScript类型定义
│   └── public/              # 静态资源
│
├── backend/                  # 后端应用
│   ├── prisma/              # 数据库Schema
│   ├── src/
│   │   ├── config/          # 配置文件
│   │   ├── middleware/      # 中间件
│   │   ├── modules/         # 功能模块
│   │   │   ├── auth/        # 认证模块
│   │   │   ├── category/    # 分类模块
│   │   │   ├── content/     # 内容生成模块
│   │   │   ├── distribution/# 分发模块
│   │   │   ├── geo/         # 地理信息模块
│   │   │   ├── media/       # 媒体管理模块
│   │   │   ├── provider/    # 服务者模块
│   │   │   └── resource/    # 资源管理模块
│   │   ├── types/           # 类型定义
│   │   └── utils/           # 工具函数
│   └── uploads/             # 上传文件存储
│
└── docs/                    # 文档目录
    ├── README.md
    ├── CONTRIBUTING.md
    ├── CODE_OF_CONDUCT.md
    └── CHANGELOG.md
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn >= 1.22.0

### 克隆项目
```bash
git clone https://github.com/your-username/tourism-geo.git
cd tourism-geo
```

### 安装依赖

**后端**
```bash
cd backend
npm install
```

**前端**
```bash
cd frontend
npm install
```

### 环境配置

**后端配置**
```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件：
```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# AI服务（豆包）
DOUBAO_API_KEY=your-doubao-api-key
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3

# 高德地图
AMAP_KEY=your-amap-key

# 文件上传
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

**前端配置**
```bash
cd frontend
cp .env.example .env
```

编辑 `.env` 文件：
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_TITLE=文旅GEO
```

### 启动开发服务器

**后端**
```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run dev
```

**前端**
```bash
cd frontend
npm run dev
```

访问 http://localhost:5173 即可看到应用。

### 构建生产版本

```bash
cd frontend
npm run build
```

构建产物将在 `frontend/dist` 目录生成。

## 📖 使用文档

详细的开发文档和使用指南请参考：

- [项目文档](docs/)
- [API文档](docs/API.md)
- [部署指南](docs/DEPLOYMENT.md)

## 🤝 贡献指南

我们欢迎任何形式的贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与项目贡献。

### 如何贡献
1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 开源协议

本项目基于 MIT 开源协议开源，详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [React](https://react.dev/) - 声明式UI库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [Express](https://expressjs.com/) - 灵活的Node.js Web应用框架
- [Prisma](https://www.prisma.io/) - 现代数据库工具
- [豆包大模型](https://www.volcengine.com/product/doubao) - 字节跳动大语言模型

## 📊 项目统计

![Star History](https://api.star-history.com/svg?repos=tourism-geo&type=Timeline)

## 📬 联系方式

- 项目主页：https://github.com/tourism-geo/tourism-geo
- 问题反馈：https://github.com/tourism-geo/tourism-geo/issues
- 邮箱：contact@tourism-geo.example.com

## 📋 路线图

查看我们的 [项目路线图](docs/ROADMAP.md) 了解未来的开发计划。

---

<p align="center">
  用 ❤️ 和 ☕ 构建 · 让文旅更美好
</p>

<p align="center">
  <a href="https://github.com/tourism-geo/tourism-geo">GitHub</a> ·
  <a href="https://gitee.com/tourism-geo/tourism-geo">Gitee</a> ·
  <a href="docs">文档</a>
</p>
