// 文旅资源相关类型定义

// 资源类型
export type ResourceType = 'SCENIC_SPOT' | 'HOTEL' | 'CREATIVE_SHOP' | 'PLAY_ITEM' | 'SECOND_CONSUME'

// 平台类型
export type PlatformType = 'ZHIHU_QA' | 'ZHIHU_ARTICLE' | 'XIAOHONGSHU' | 'WECHAT' | 'TOUTIAO' | 'DOUYIN' | 'LANDING_PAGE'

// 资源状态
export type ResourceStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED'

// 文章状态
export type ArticleStatus = 'DRAFT' | 'APPROVED' | 'DISTRIBUTING' | 'PUBLISHED' | 'FAILED'

// 分发状态
export type DistributionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'UNDER_REVIEW'

// 链接类型
export type LinkType = 'DIRECT_LINK' | 'DISTRIBUTION'

// 媒体类型
export type MediaType = 'IMAGE' | 'VIDEO'

// 佣金状态
export type CommissionStatus = 'PENDING' | 'CONFIRMED' | 'SETTLED' | 'CANCELLED'

// 地理坐标
export interface GeoCoordinate {
  latitude: number
  longitude: number
  fullAddress: string
  serviceRadiusKm?: number
  geoHash?: string
}

// 地理查询参数
export interface GeoQueryParams {
  lat: number
  lng: number
  radius_km?: number
  resource_type?: ResourceType
  category_id?: string
  keyword?: string
  scenic_area?: string
  min_rating?: number
  limit?: number
  offset?: number
}

// 地理查询结果
export interface GeoQueryResult {
  resourceId: string
  name: string
  avatar?: string
  resourceType: ResourceType
  categoryName: string
  distanceKm: number
  address: string
  city: string
  district?: string
  scenicArea?: string
  rating: number
  reviewCount: number
  isVerified: boolean
  distributionLinks: DistributionLink[]
  landingUrl: string
  lastUpdated: string
}

// 分类
export interface ResourceCategory {
  id: string
  name: string
  iconKey?: string
  resourceType: ResourceType
  children?: ResourceCategory[]
}

// 分销链接
export interface DistributionLink {
  id: string
  linkType: LinkType
  linkUrl: string
  platform?: string
  commissionRate?: number
  isActive?: boolean
  createdAt?: string
  stats?: {
    totalOrders: number
    totalAmount: number
    totalCommission: number
  }
}

// 佣金记录
export interface CommissionRecord {
  id: string
  linkId: string
  orderId?: string
  orderAmount: number
  commissionAmount: number
  transactionAt: string
  status: CommissionStatus
}

// 媒体文件
export interface ResourceMedia {
  id: string
  mediaType: MediaType
  url: string
  thumbnailUrl?: string
  fileName?: string
  fileSize?: number
  width?: number
  height?: number
  duration?: number
  title?: string
  sortOrder?: number
  isPrimary: boolean
  createdAt?: string
}

// 评价
export interface Review {
  id: string
  rating: number
  comment?: string
  reviewerName: string
  imageUrls?: string[]
  isVerified?: boolean
  createdAt: string
}

// 文章/内容
export interface ContentArticle {
  id: string
  resourceId: string
  targetPlatform: PlatformType
  title: string
  content: string
  seoKeywords?: string[]
  geoKeywords?: string[]
  status: ArticleStatus
  generatedAt: string
  distributions?: DistributionRecord[]
}

// 分发记录
export interface DistributionRecord {
  id: string
  articleId: string
  platform: PlatformType
  externalUrl?: string
  status: DistributionStatus
  viewCount?: number
  isIndexed?: boolean
  indexedAt?: string
  errorMsg?: string
  distributedAt?: string
}

// 资质证书
export interface Certificate {
  id: string
  certType: string
  imageUrl: string
  description?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  verifiedAt?: string
}

// 统计数据
export interface DashboardStats {
  totalArticles: number
  publishedArticles: number
  distributionSuccess: number
  indexedCount: number
  totalViews: number
  avgRating: number
  reviewCount: number
  totalCommission: number
  pendingOrders: number
}

// 搜索结果
export interface SearchResponse {
  success: boolean
  data: {
    query: GeoQueryParams
    results: GeoQueryResult[]
    total: number
    page: number
    pageSize: number
  }
}

// API 响应
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}
