# 技术架构文档：文旅 GEO 服务平台

> 文档版本：v1.0  
> 对应 PRD 版本：v1.0  
> 撰写日期：2026-06-17

---

## 1. 架构设计

### 1.1 系统架构图

```mermaid
flowchart TB
    subgraph "用户端（前端）"
        A["React 18 SPA<br/>(TypeScript + Tailwind CSS)"]
        A --> B["页面路由<br/>(React Router v6)"]
        A --> C["状态管理<br/>(Zustand + React Query)"]
        A --> D["地图组件<br/>(高德地图 JS API)"]
        A --> E["AI 文案编辑器<br/>(富文本编辑器)"]
    end

    subgraph "BFF 层"
        F["Node.js / Express 4<br/>(API Gateway + 业务逻辑)"]
        F --> G["用户认证中间件<br/>(JWT + 手机号验证)"]
        F --> H["GEO 检索服务<br/>(PostGIS ST_DWithin)"]
        F --> I["大模型服务<br/>(豆包 API 封装)"]
        F --> J["内容分发服务<br/>(平台 API 适配器)"]
        F --> K["Schema.org 生成服务"]
        F --> L["分销追踪服务<br/>(佣金记录)"]
    end

    subgraph "数据与存储层"
        M["PostgreSQL 16<br/>+ PostGIS 3.4"]
        N["Redis 7<br/>(缓存 + Session)"]
        O["阿里云 OSS<br/>(对象存储)"]
    end

    subgraph "外部服务集成"
        P["高德地图 API<br/>(地理编码/逆编码/地图)"]
        Q["豆包大模型 API<br/>(火山引擎)"]
        R["知乎/小红书/公众号 API<br/>(内容分发)"]
        S["预订平台 API<br/>(分销追踪)"]
    end

    subgraph "大模型合作方"
        T["豆包/DeepSeek<br/>GEO 检索 API"]
    end

    A --"HTTP/REST"--> F
    F --> M
    F --> N
    F --> O
    F --> P
    F --> Q
    F --> R
    F --> S
    L --> S
    M --> T
```

### 1.2 Server 架构分层

```mermaid
flowchart LR
    subgraph "Router 层"
        A["api/auth/*"]
        B["api/resources/*"]
        C["api/categories/*"]
        D["api/content/*"]
        E["api/search/*"]
        F["api/geo/query"]
        G["api/distribute/*"]
        H["api/reviews/*"]
        I["api/commission/*"]
        J["api/dashboard/*"]
    end

    subgraph "Service 层"
        K["AuthService<br/>认证/注册/登录"]
        L["ResourceService<br/>文旅资源管理"]
        M["CategoryService<br/>资源分类管理"]
        N["ContentGenerationService<br/>AI 文案生成"]
        O["DistributionService<br/>多平台分发"]
        P["GeoQueryService<br/>GEO 检索（PostGIS）"]
        Q["ReviewService<br/>评价管理"]
        R["CommissionService<br/>分销佣金追踪"]
        S["SchemaOrgService<br/>结构化数据生成"]
    end

    subgraph "Repository 层"
        T["ResourceRepo<br/>PostgreSQL + PostGIS"]
        U["CategoryRepo"]
        V["ContentRepo"]
        V --> W["OssRepo<br/>阿里云 OSS"]
        X["ReviewRepo"]
        Y["CommissionRepo"]
        Z["DistributionRepo"]
    end

    subgraph "数据库"
        AA["PostgreSQL<br/>+ PostGIS"]
    end

    A --> K
    B --> L
    C --> M
    D --> N
    E --> P
    F --> P
    G --> O
    H --> Q
    I --> R
    J --> L

    K --> T
    L --> T
    M --> U
    N --> V
    O --> V
    O --> Z
    P --> T
    Q --> X
    R --> Y
    S --> L

    T --> AA
    U --> AA
    V --> AA
    X --> AA
    Y --> AA
    Z --> AA
    V --> W
```

---

## 2. 数据库设计

### 2.1 Prisma Schema

```prisma
// schema.prisma - 文旅 GEO 服务平台

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis]
}

// ──────────────────────────────────────────────────────────────
// 文旅资源（核心实体）
// ──────────────────────────────────────────────────────────────

model TourismResource {
  id          String   @id @default(uuid())
  phone       String   @unique
  name        String   // 资源名称，如"黄山云海民宿"
  avatar      String?  // 头像/封面图
  description String?  @db.Text // 资源描述
  
  // 地理位置
  city        String   // 如"黄山市"
  district    String?  // 如"黄山区"
  scenicArea  String?  // 所属景区，如"黄山风景区"
  
  // 资源类型
  resourceType ResourceTypeType
  
  // 认证相关
  isVerified      Boolean @default(false)
  realName        String?
  
  // 评分（冗余字段，由 Review 动态计算）
  avgRating       Float   @default(0)
  reviewCount     Int     @default(0)
  
  // 状态
  status      ResourceStatus @default(ACTIVE)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 关联
  geoLocation       GeoLocation?
  category          ResourceCategory @relation(fields: [categoryId], references: [id])
  categoryId        String
  articles          ContentArticle[]
  certificates      Certificate[]
  reviews           Review[]        @relation("ResourceReviews")
  platformAccounts  PlatformAccount[]
  distributionLinks DistributionLink[]

  @@map("tourism_resources")
}

enum ResourceTypeType {
  SCENIC_SPOT      // 景区景点
  HOTEL            // 酒店民宿
  CREATIVE_SHOP    // 文创特产
  PLAY_ITEM        // 游玩项目
  SECOND_CONSUME   // 景区二消项目
}

enum ResourceStatus {
  ACTIVE      // 正常运营
  INACTIVE    // 停用/暂停
  BANNED      // 被封禁
}

// ──────────────────────────────────────────────────────────────
// 地理位置（PostGIS）
// ──────────────────────────────────────────────────────────────

model GeoLocation {
  id            String  @id @default(uuid())
  resourceId    String  @unique
  resource      TourismResource @relation(fields: [resourceId], references: [id])

  latitude      Float
  longitude     Float
  fullAddress   String  // 完整地址文本

  serviceRadiusKm Int @default(5) // 服务半径（公里）
  geoHash       String  @db.VarChar(12) @index

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("geo_locations")
}

// ──────────────────────────────────────────────────────────────
// 文旅资源分类（两层级树）
// ──────────────────────────────────────────────────────────────

model ResourceCategory {
  id         String  @id @default(uuid())
  name       String
  parentId   String?
  parent     ResourceCategory? @relation("CategoryTree", fields: [parentId], references: [id])
  children   ResourceCategory[] @relation("CategoryTree")

  level      Int     // 1 = 一级，2 = 二级
  iconKey    String?
  resourceType ResourceTypeType // 对应的资源类型

  resources  TourismResource[]

  @@map("resource_categories")
}

// ──────────────────────────────────────────────────────────────
// 分销链接
// ──────────────────────────────────────────────────────────────

model DistributionLink {
  id            String   @id @default(uuid())
  resourceId    String
  resource      TourismResource @relation(fields: [resourceId], references: [id])

  linkType      LinkType
  linkUrl       String   @db.Text // 预订/交易链接
  platform      String?  // 预订平台，如"携程"、"美团"、"自有"
  
  // 佣金设置
  commissionRate Decimal? @db.Decimal(5, 2) // 佣金比例，如 10.00 表示 10%
  
  isActive      Boolean @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  commissionRecords CommissionRecord[]

  @@map("distribution_links")
}

enum LinkType {
  DIRECT_LINK    // 直联预订链接（运营者设置）
  DISTRIBUTION   // 分销链接（分销商推广）
}

// ──────────────────────────────────────────────────────────────
// 佣金记录
// ──────────────────────────────────────────────────────────────

model CommissionRecord {
  id            String   @id @default(uuid())
  linkId        String
  link          DistributionLink @relation(fields: [linkId], references: [id])

  orderId       String?  // 第三方订单ID
  orderAmount   Decimal  @db.Decimal(10, 2) // 订单金额
  commissionAmount Decimal @db.Decimal(10, 2) // 佣金金额
  
  transactionAt DateTime @default(now())
  status        CommissionStatus @default(PENDING)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("commission_records")
}

enum CommissionStatus {
  PENDING    // 待确认
  CONFIRMED  // 已确认
  SETTLED    // 已结算
  CANCELLED  // 已取消
}

// ──────────────────────────────────────────────────────────────
// AI 生成的宣传内容
// ──────────────────────────────────────────────────────────────

model ContentArticle {
  id           String   @id @default(uuid())
  resourceId   String
  resource     TourismResource @relation(fields: [resourceId], references: [id])

  targetPlatform PlatformType
  title         String
  content       String   @db.Text

  seoKeywords  String[]
  geoKeywords  String[]  // 注入的地理位置关键词

  schemaOrgType String  @default("TouristAttraction") // Schema.org 类型

  status       ArticleStatus @default(DRAFT)

  generatedAt  DateTime @default(now())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  distributions DistributionRecord[]

  @@map("content_articles")
}

enum PlatformType {
  ZHIHU_QA
  ZHIHU_ARTICLE
  XIAOHONGSHU
  WECHAT
  TOUTIAO
  DOUYIN
  LANDING_PAGE
}

enum ArticleStatus {
  DRAFT
  APPROVED
  DISTRIBUTING
  PUBLISHED
  FAILED
}

// ──────────────────────────────────────────────────────────────
// 分发记录
// ──────────────────────────────────────────────────────────────

model DistributionRecord {
  id          String   @id @default(uuid())
  articleId   String
  article     ContentArticle @relation(fields: [articleId], references: [id])

  platform    PlatformType

  externalUrl String?
  status      DistributionStatus @default(PENDING)

  viewCount  Int @default(0)
  isIndexed  Boolean @default(false)
  indexedAt  DateTime?
  errorMsg   String?

  distributedAt DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("distribution_records")
}

enum DistributionStatus {
  PENDING
  SUCCESS
  FAILED
  UNDER_REVIEW
}

// ──────────────────────────────────────────────────────────────
// 平台账号绑定
// ──────────────────────────────────────────────────────────────

model PlatformAccount {
  id          String   @id @default(uuid())
  resourceId  String
  resource    TourismResource @relation(fields: [resourceId], references: [id])

  platform    PlatformType
  openId      String?
  accessToken String?  @db.Text
  refreshToken String? @db.Text
  expiresAt   DateTime?
  status      AccountStatus @default(PENDING)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([resourceId, platform])
  @@map("platform_accounts")
}

enum AccountStatus {
  PENDING
  ACTIVE
  EXPIRED
  REVOKED
}

// ──────────────────────────────────────────────────────────────
// 资质证书
// ──────────────────────────────────────────────────────────────

model Certificate {
  id          String   @id @default(uuid())
  resourceId  String
  resource    TourismResource @relation(fields: [resourceId], references: [id])

  certType    CertType
  imageUrl    String
  description String?

  status      CertStatus @default(PENDING)
  verifiedAt  DateTime?
  verifiedBy  String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("certificates")
}

enum CertType {
  IDENTITY
  BUSINESS_LICENSE
  SCENIC_LICENSE    // 景区经营许可证
  HOTEL_LICENSE     // 酒店/民宿经营许可证
  AWARD
  OTHER
}

enum CertStatus {
  PENDING
  APPROVED
  REJECTED
}

// ──────────────────────────────────────────────────────────────
// 评价
// ──────────────────────────────────────────────────────────────

model Review {
  id           String   @id @default(uuid())
  resourceId   String
  resource     TourismResource @relation("ResourceReviews", fields: [resourceId], references: [id])

  reviewerName String?
  rating       Float    // 1-5
  comment      String?  @db.Text
  imageUrls    String[]

  isVerified   Boolean @default(false)
  verifyToken  String?  @unique

  createdAt DateTime @default(now())

  @@map("reviews")
}

// ──────────────────────────────────────────────────────────────
// 短信验证码（临时）
// ──────────────────────────────────────────────────────────────

model SmsCode {
  id        String   @id @default(uuid())
  phone     String
  code      String
  purpose   String
  usedAt    DateTime?
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([phone, purpose])
  @@map("sms_codes")
}

// ──────────────────────────────────────────────────────────────
// 分发渠道配置
// ──────────────────────────────────────────────────────────────

model PlatformChannel {
  id            String  @id @default(uuid())
  platform      PlatformType @unique
  displayName   String
  iconUrl       String?
  isLlmFriendly Boolean @default(false)
  authType      String
  config        Json?

  @@map("platform_channels")
}

// ──────────────────────────────────────────────────────────────
// 文旅行业管理人员（文旅局等）
// ──────────────────────────────────────────────────────────────

model IndustryAdmin {
  id          String   @id @default(uuid())
  phone       String   @unique
  name        String
  role        AdminRole
  region      String   // 管理区域，如"黄山市"
  isVerified  Boolean @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("industry_admins")
}

enum AdminRole {
  REGION_ADMIN    // 区域管理员（文旅局）
  SCENIC_ADMIN    // 景区管理员
  PLATFORM_ADMIN  // 平台管理员
}
```

### 2.2 初始化 SQL

```sql
-- 启用 PostGIS 扩展
CREATE EXTENSION IF NOT EXISTS postgis;

-- 创建 PostGIS geography 列
ALTER TABLE geo_locations
ADD COLUMN IF NOT EXISTS geography_point GEOGRAPHY(Point, 4326);

-- 创建空间索引
CREATE INDEX IF NOT EXISTS idx_geo_locations_point
ON geo_locations USING GIST (geography_point);

-- 初始化平台渠道数据
INSERT INTO platform_channels (platform, display_name, is_llm_friendly, auth_type) VALUES
  ('ZHIHU_QA', '知乎问答', true, 'oauth2'),
  ('ZHIHU_ARTICLE', '知乎文章', true, 'oauth2'),
  ('XIAOHONGSHU', '小红书', false, 'oauth2'),
  ('WECHAT', '微信公众号', false, 'oauth2'),
  ('TOUTIAO', '头条号', false, 'oauth2'),
  ('DOUYIN', '抖音', false, 'oauth2'),
  ('LANDING_PAGE', '平台落地页', true, 'none');

-- 初始化文旅资源分类数据
-- 一级分类
INSERT INTO resource_categories (id, name, parent_id, level, icon_key, resource_type) VALUES
  ('cat-scenic', '景区景点', NULL, 1, 'mountain', 'SCENIC_SPOT'),
  ('cat-hotel', '酒店民宿', NULL, 1, 'hotel', 'HOTEL'),
  ('cat-creative', '文创特产', NULL, 1, 'shop', 'CREATIVE_SHOP'),
  ('cat-play', '游玩项目', NULL, 1, 'ticket', 'PLAY_ITEM'),
  ('cat-second', '景区二消', NULL, 1, 'food', 'SECOND_CONSUME');

-- 二级分类 - 景区景点
INSERT INTO resource_categories (id, name, parent_id, level, icon_key, resource_type) VALUES
  ('cat-scenic-1', '自然景区', 'cat-scenic', 2, 'tree', 'SCENIC_SPOT'),
  ('cat-scenic-2', '人文景区', 'cat-scenic', 2, 'landmark', 'SCENIC_SPOT'),
  ('cat-scenic-3', '主题公园', 'cat-scenic', 2, 'ferris-wheel', 'SCENIC_SPOT');

-- 二级分类 - 酒店民宿
INSERT INTO resource_categories (id, name, parent_id, level, icon_key, resource_type) VALUES
  ('cat-hotel-1', '星级酒店', 'cat-hotel', 2, 'building', 'HOTEL'),
  ('cat-hotel-2', '精品民宿', 'cat-hotel', 2, 'home', 'HOTEL'),
  ('cat-hotel-3', '经济住宿', 'cat-hotel', 2, 'bed', 'HOTEL');

-- 二级分类 - 文创特产
INSERT INTO resource_categories (id, name, parent_id, level, icon_key, resource_type) VALUES
  ('cat-creative-1', '文创商店', 'cat-creative', 2, 'palette', 'CREATIVE_SHOP'),
  ('cat-creative-2', '特产店', 'cat-creative', 2, 'gift', 'CREATIVE_SHOP'),
  ('cat-creative-3', '手工艺品', 'cat-creative', 2, 'hand', 'CREATIVE_SHOP');

-- 二级分类 - 游玩项目
INSERT INTO resource_categories (id, name, parent_id, level, icon_key, resource_type) VALUES
  ('cat-play-1', '游乐设施', 'cat-play', 2, 'game', 'PLAY_ITEM'),
  ('cat-play-2', '演出表演', 'cat-play', 2, 'music', 'PLAY_ITEM'),
  ('cat-play-3', '导览服务', 'cat-play', 2, 'map', 'PLAY_ITEM'),
  ('cat-play-4', '体验项目', 'cat-play', 2, 'activity', 'PLAY_ITEM');

-- 二级分类 - 景区二消
INSERT INTO resource_categories (id, name, parent_id, level, icon_key, resource_type) VALUES
  ('cat-second-1', '餐饮美食', 'cat-second', 2, 'utensils', 'SECOND_CONSUME'),
  ('cat-second-2', '休闲服务', 'cat-second', 2, 'coffee', 'SECOND_CONSUME'),
  ('cat-second-3', '特色体验', 'cat-second', 2, 'sparkles', 'SECOND_CONSUME');
```

---

## 3. API 设计

### 3.1 API 路由总览

| 路由 | 方法 | 说明 |
|-----|------|-----|
| **认证** | | |
| `/api/auth/send-code` | POST | 发送手机验证码 |
| `/api/auth/verify-code` | POST | 验证验证码并登录/注册 |
| **文旅资源** | | |
| `/api/resources/me` | GET | 获取当前运营者资源信息 |
| `/api/resources/me` | PUT | 更新资源信息 |
| `/api/resources/me/geo` | PUT | 更新地理位置 |
| `/api/resources/:id` | GET | 获取资源公开主页 |
| **分类** | | |
| `/api/categories` | GET | 获取资源分类树 |
| **内容生成** | | |
| `/api/content/generate` | POST | AI 生成宣传文案 |
| `/api/content/articles` | GET | 列出已生成文章 |
| **分销链接** | | |
| `/api/distribution-links` | GET/POST | 列出/创建分销链接 |
| `/api/distribution-links/:id` | PUT/DELETE | 更新/删除分销链接 |
| **佣金记录** | | |
| `/api/commission/records` | GET | 获取佣金记录 |
| `/api/commission/stats` | GET | 获取佣金统计 |
| **GEO 检索** | | |
| `/api/geo/query` | GET | **大模型检索 API** |
| `/api/search` | GET | 平台内自然语言搜索 |
| **评价** | | |
| `/api/resources/:id/reviews` | GET/POST | 获取/提交评价 |

### 3.2 核心 GEO 检索 API

**请求示例**：
```json
// GET /api/geo/query?lat=30.1332&lng=118.1694&radius_km=10&resource_type=HOTEL&keyword=民宿&min_rating=4.5&limit=10

// 响应：
{
  "success": true,
  "data": {
    "query": {
      "lat": 30.1332,
      "lng": 118.1694,
      "radius_km": 10,
      "resource_type": "HOTEL",
      "keyword": "民宿"
    },
    "results": [
      {
        "resourceId": "uuid-xxx",
        "name": "黄山云海民宿",
        "resourceType": "HOTEL",
        "categoryName": "精品民宿",
        "distanceKm": 2.5,
        "address": "黄山市黄山区汤口镇",
        "priceRange": "¥280-580/晚",
        "rating": 4.8,
        "reviewCount": 156,
        "scenicArea": "黄山风景区",
        "tags": ["山景房", "云海景观", "亲子友好"],
        "distributionLinks": [
          {
            "linkType": "DIRECT_LINK",
            "linkUrl": "https://booking.example.com/hotel/xxx",
            "platform": "自有"
          }
        ],
        "landingUrl": "https://travel-geo.com/r/uuid-xxx",
        "isVerified": true,
        "lastUpdated": "2026-06-10"
      }
    ],
    "total": 23
  }
}
```

---

## 4. 前端项目结构

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── resources.ts      # 文旅资源 API
│   │   ├── categories.ts     # 分类 API
│   │   ├── content.ts
│   │   ├── geo.ts
│   │   ├── distribution.ts   # 分销链接 API
│   │   └── commission.ts     # 佣金 API
│   │
│   ├── components/
│   │   ├── map/
│   │   │   ├── MapPicker.tsx
│   │   │   ├── MapView.tsx
│   │   │   └── ResourceMarker.tsx
│   │   ├── resource/
│   │   │   ├── ResourceCard.tsx
│   │   │   ├── ResourceProfile.tsx
│   │   │   ├── ResourceForm.tsx
│   │   │   └── DistributionLinkForm.tsx
│   │   ├── search/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   └── FilterPanel.tsx
│   │   └── content/
│   │       ├── PlatformSelector.tsx
│   │       └── ArticlePreview.tsx
│   │
│   ├── pages/
│   │   ├── LandingPage/
│   │   │   └── LandingPage.tsx
│   │   ├── RegisterPage/
│   │   │   └── RegisterPage.tsx
│   │   ├── OnboardingPage/
│   │   │   └── OnboardingPage.tsx
│   │   ├── SearchResultsPage/
│   │   │   └── SearchResultsPage.tsx
│   │   ├── ResourceProfilePage/
│   │   │   └── ResourceProfilePage.tsx
│   │   ├── DashboardPage/
│   │   │   └── DashboardPage.tsx
│   │   ├── ContentGeneratePage/
│   │   │   └── ContentGeneratePage.tsx
│   │   └── LoginPage/
│   │   │   └── LoginPage.tsx
│   │
│   ├── stores/
│   │   └── authStore.ts
│   │
│   ├── types/
│   │   └── api.ts
│   │
│   └── App.tsx
```

---

## 5. 后端项目结构

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   └── auth.routes.ts
│   │   ├── resource/
│   │   │   └── resource.routes.ts    # 文旅资源路由
│   │   ├── category/
│   │   │   └── category.routes.ts    # 分类路由
│   │   ├── content/
│   │   │   ├── content.routes.ts
│   │   │   └── llm/
│   │   │       ├── doubao.client.ts
│   │   │       └── prompts.ts        # 文旅文案 Prompt
│   │   ├── distribution/
│   │   │   └── distribution.routes.ts
│   │   ├── commission/
│   │   │   └── commission.routes.ts  # 佣金路由
│   │   ├── geo/
│   │   │   └── geo.routes.ts
│   │   ├── platform/
│   │   │   └── platform.routes.ts
│   │   └── service-catalog/
│   │   │   └── service.routes.ts     # 可删除或保留
│   │
│   └── app.ts
│
└── prisma/
    └── schema.prisma
```

---

## 6. 环境变量配置

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/travel_geo?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# 高德地图
AMAP_WEB_API_KEY="your-amap-web-key"

# 豆包大模型
VOLC_ACCESS_KEY="your-volc-access-key"
VOLC_SECRET_KEY="your-volc-secret-key"
DOUBAO_MODEL="doubao-pro-32k"

# 服务器
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

---

> 本文档为技术架构 v1.0，对应 PRD v1.0。