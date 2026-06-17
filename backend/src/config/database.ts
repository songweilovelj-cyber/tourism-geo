// Mock 数据库层（开发环境）
// 当未配置 PostgreSQL 时，使用内存数据存储
// 这样项目可以零配置启动，便于前端开发和演示

import { randomUUID } from 'crypto'

// ========== 内存数据存储 ==========
interface Provider {
  id: string
  phone: string
  nickname: string
  avatar?: string
  bio?: string
  city: string
  district?: string
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED'
  isVerified: boolean
  avgRating: number
  reviewCount: number
  createdAt: Date
  updatedAt: Date
}

interface GeoLocation {
  id: string
  providerId: string
  latitude: number
  longitude: number
  fullAddress: string
  serviceRadiusKm: number
  geoHash: string
}

interface ServiceItem {
  id: string
  providerId: string
  categoryId: string
  title: string
  description: string
  minPrice?: number
  maxPrice?: number
  priceUnit?: string
  tags: string[]
  isActive: boolean
}

interface ContentArticle {
  id: string
  providerId: string
  targetPlatform: string
  title: string
  content: string
  seoKeywords: string[]
  geoKeywords: string[]
  status: 'DRAFT' | 'APPROVED' | 'PUBLISHED' | 'FAILED'
  generatedAt: Date
}

interface DistributionRecord {
  id: string
  articleId: string
  platform: string
  externalUrl?: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'UNDER_REVIEW'
  viewCount: number
  isIndexed: boolean
}

interface PlatformAccount {
  id: string
  providerId: string
  platform: string
  openId?: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: Date
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED'
}

interface Review {
  id: string
  providerId: string
  reviewerName?: string
  rating: number
  comment?: string
  imageUrls: string[]
  createdAt: Date
}

interface ServiceCategory {
  id: string
  name: string
  parentId?: string
  level: number
}

interface SmsCode {
  id: string
  phone: string
  code: string
  purpose: string
  expiresAt: Date
  usedAt?: Date
}

class Store {
  providers: Map<string, Provider> = new Map()
  geoLocations: Map<string, GeoLocation> = new Map()
  services: Map<string, ServiceItem> = new Map()
  categories: Map<string, ServiceCategory> = new Map()
  articles: Map<string, ContentArticle> = new Map()
  distributions: Map<string, DistributionRecord> = new Map()
  platformAccounts: Map<string, PlatformAccount> = new Map()
  reviews: Map<string, Review> = new Map()
  smsCodes: Map<string, SmsCode> = new Map()
}

const store = new Store()

// ========== 初始化默认数据 ==========
function initDefaultData() {
  if (store.providers.size > 0) return

  // 默认服务分类
  const categories: ServiceCategory[] = [
    { id: 'cat-1', name: '家政维修', level: 1 },
    { id: 'cat-1-1', name: '水电维修', level: 2, parentId: 'cat-1' },
    { id: 'cat-1-2', name: '家政保洁', level: 2, parentId: 'cat-1' },
    { id: 'cat-1-3', name: '搬家搬运', level: 2, parentId: 'cat-1' },
    { id: 'cat-2', name: '教育培训', level: 1 },
    { id: 'cat-2-1', name: '家教辅导', level: 2, parentId: 'cat-2' },
    { id: 'cat-3', name: '生活服务', level: 1 },
    { id: 'cat-3-1', name: '宠物服务', level: 2, parentId: 'cat-3' },
    { id: 'cat-3-2', name: '摄影摄像', level: 2, parentId: 'cat-3' },
    { id: 'cat-3-3', name: '美容美发', level: 2, parentId: 'cat-3' }
  ]
  categories.forEach(c => store.categories.set(c.id, c))

  // 默认服务者
  const providers: Provider[] = [
    {
      id: 'default-provider-1',
      phone: '13800138000',
      nickname: '张师傅',
      bio: '10年水电维修经验，专业可靠，服务范围覆盖朝阳区周边3公里',
      city: '北京市',
      district: '朝阳区',
      status: 'ACTIVE',
      isVerified: true,
      avgRating: 4.8,
      reviewCount: 156,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    },
    {
      id: 'default-provider-2',
      phone: '13900139000',
      nickname: '李阿姨',
      bio: '资深家政保洁师，擅长深度清洁和收纳整理',
      city: '北京市',
      district: '海淀区',
      status: 'ACTIVE',
      isVerified: true,
      avgRating: 4.9,
      reviewCount: 203,
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date()
    },
    {
      id: 'default-provider-3',
      phone: '13700137000',
      nickname: '王老师',
      bio: '重点中学数学教师，15年教学经验，擅长初高中数学辅导',
      city: '北京市',
      district: '西城区',
      status: 'ACTIVE',
      isVerified: true,
      avgRating: 5.0,
      reviewCount: 89,
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date()
    }
  ]
  providers.forEach(p => store.providers.set(p.id, p))

  // 默认地理位置
  const locations: GeoLocation[] = [
    {
      id: 'geo-1',
      providerId: 'default-provider-1',
      latitude: 39.9042,
      longitude: 116.4074,
      fullAddress: '北京市朝阳区望京街道',
      serviceRadiusKm: 3,
      geoHash: 'wx4g0e'
    },
    {
      id: 'geo-2',
      providerId: 'default-provider-2',
      latitude: 39.9890,
      longitude: 116.3060,
      fullAddress: '北京市海淀区中关村街道',
      serviceRadiusKm: 5,
      geoHash: 'wx4g0f'
    },
    {
      id: 'geo-3',
      providerId: 'default-provider-3',
      latitude: 39.9163,
      longitude: 116.3650,
      fullAddress: '北京市西城区西单',
      serviceRadiusKm: 3,
      geoHash: 'wx4g0g'
    }
  ]
  locations.forEach(l => store.geoLocations.set(l.id, l))

  // 默认服务
  const services: ServiceItem[] = [
    {
      id: 'service-1',
      providerId: 'default-provider-1',
      categoryId: 'cat-1-1',
      title: '专业水电维修',
      description: '专业处理水管漏水、电路故障、灯具安装、开关插座更换等问题。随叫随到，上门服务。',
      minPrice: 100,
      maxPrice: 500,
      priceUnit: '元/次',
      tags: ['水电维修', '上门服务', '24小时'],
      isActive: true
    },
    {
      id: 'service-2',
      providerId: 'default-provider-1',
      categoryId: 'cat-1-1',
      title: '灯具安装与维修',
      description: '各类灯具安装、维修、更换。从吸顶灯到水晶灯，专业安装。',
      minPrice: 80,
      maxPrice: 300,
      priceUnit: '元/次',
      tags: ['灯具安装', '电工服务'],
      isActive: true
    },
    {
      id: 'service-3',
      providerId: 'default-provider-2',
      categoryId: 'cat-1-2',
      title: '深度家政保洁',
      description: '深度清洁服务，包括厨房油污清理、卫生间消毒、地板打蜡等。使用环保清洁用品。',
      minPrice: 150,
      maxPrice: 800,
      priceUnit: '元/次',
      tags: ['家政保洁', '深度清洁', '卫生消毒'],
      isActive: true
    },
    {
      id: 'service-4',
      providerId: 'default-provider-3',
      categoryId: 'cat-2-1',
      title: '初高中数学辅导',
      description: '一对一辅导，针对中考、高考重点难点讲解。注重方法引导，帮助学生建立数学思维。',
      minPrice: 300,
      maxPrice: 600,
      priceUnit: '元/小时',
      tags: ['数学辅导', '中考', '高考', '一对一'],
      isActive: true
    }
  ]
  services.forEach(s => store.services.set(s.id, s))

  // 默认评价
  const reviews: Review[] = [
    {
      id: 'review-1',
      providerId: 'default-provider-1',
      reviewerName: '王先生',
      rating: 5,
      comment: '非常专业，修水管的问题很快就解决了，价格也合理，推荐！',
      imageUrls: [],
      createdAt: new Date('2024-05-10')
    },
    {
      id: 'review-2',
      providerId: 'default-provider-1',
      reviewerName: '李女士',
      rating: 5,
      comment: '师傅很准时，技术也很好，家里的电路问题都解决了。',
      imageUrls: [],
      createdAt: new Date('2024-05-08')
    },
    {
      id: 'review-3',
      providerId: 'default-provider-2',
      reviewerName: '张女士',
      rating: 5,
      comment: '打扫得非常干净，厨房的油污都清理干净了，很满意！',
      imageUrls: [],
      createdAt: new Date('2024-05-12')
    },
    {
      id: 'review-4',
      providerId: 'default-provider-3',
      reviewerName: '匿名用户',
      rating: 5,
      comment: '王老师讲课很清晰，孩子数学成绩进步很大，感谢！',
      imageUrls: [],
      createdAt: new Date('2024-05-09')
    }
  ]
  reviews.forEach(r => store.reviews.set(r.id, r))

  console.log('[MockDB] 初始化完成，默认数据已加载')
}

// ========== Mock Prisma Client ==========
export const prisma = {
  // Provider
  provider: {
    findUnique: async ({ where, include }: { where: { id: string; phone?: string }; include?: any }) => {
      let provider = null
      if (where.id) {
        provider = store.providers.get(where.id) || null
      } else if (where.phone) {
        provider = Array.from(store.providers.values()).find(p => p.phone === where.phone) || null
      }
      
      if (!provider || !include) return provider
      
      // 处理 include
      const result: any = { ...provider }
      
      if (include.geoLocation) {
        result.geoLocation = Array.from(store.geoLocations.values()).find(g => g.providerId === provider.id) || null
      }
      
      if (include.services) {
        const services = Array.from(store.services.values()).filter(s => s.providerId === provider.id)
        if (include.services.where) {
          if (include.services.where.isActive !== undefined) {
            services.filter(s => s.isActive === include.services.where.isActive)
          }
        }
        if (include.services.include?.category) {
          result.services = services.map(s => ({
            ...s,
            category: store.categories.get(s.categoryId) || null
          }))
        } else {
          result.services = services
        }
      }
      
      if (include.platformAccounts) {
        result.platformAccounts = Array.from(store.platformAccounts.values())
          .filter(a => a.providerId === provider.id)
          .filter(a => include.platformAccounts.where?.status ? a.status === include.platformAccounts.where.status : true)
      }
      
      if (include.reviews) {
        const reviews = Array.from(store.reviews.values()).filter(r => r.providerId === provider.id)
        if (include.reviews.orderBy?.createdAt === 'desc') {
          reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        }
        if (include.reviews.take) {
          result.reviews = reviews.slice(0, include.reviews.take)
        } else {
          result.reviews = reviews
        }
      }
      
      return result
    },
    findMany: async () => Array.from(store.providers.values()),
    create: async ({ data }: { data: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'> }) => {
      const provider: Provider = {
        id: randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      store.providers.set(provider.id, provider)
      return provider
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<Provider> }) => {
      const provider = store.providers.get(where.id)
      if (!provider) return null
      const updated = { ...provider, ...data, updatedAt: new Date() }
      store.providers.set(where.id, updated)
      return updated
    },
    count: async () => store.providers.size
  },

  // GeoLocation
  geoLocation: {
    findMany: async () => Array.from(store.geoLocations.values()),
    findUnique: async ({ where }: { where: { providerId: string } }) => {
      return Array.from(store.geoLocations.values()).find(g => g.providerId === where.providerId) || null
    },
    upsert: async ({ where, create, update }: {
      where: { providerId: string }
      create: Omit<GeoLocation, 'id'>
      update: Partial<GeoLocation>
    }) => {
      const existing = Array.from(store.geoLocations.values()).find(g => g.providerId === where.providerId)
      if (existing) {
        const updated = { ...existing, ...update }
        store.geoLocations.set(existing.id, updated)
        return updated
      }
      const geo: GeoLocation = { id: randomUUID(), ...create }
      store.geoLocations.set(geo.id, geo)
      return geo
    }
  },

  // Service
  service: {
    findMany: async ({ where }: { where?: { providerId?: string; isActive?: boolean; categoryId?: string } } = {}) => {
      let items = Array.from(store.services.values())
      if (where?.providerId) items = items.filter(s => s.providerId === where.providerId)
      if (where?.isActive !== undefined) items = items.filter(s => s.isActive === where.isActive)
      if (where?.categoryId) items = items.filter(s => s.categoryId === where.categoryId)
      return items
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return store.services.get(where.id) || null
    },
    create: async ({ data, include }: { data: Omit<ServiceItem, 'id'>; include?: any }) => {
      const service: ServiceItem = { id: randomUUID(), ...data, tags: data.tags || [] }
      store.services.set(service.id, service)
      
      if (!include) return service
      
      // 处理 include
      const result: any = { ...service }
      if (include.category) {
        result.category = store.categories.get(service.categoryId) || null
      }
      
      return result
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<ServiceItem> }) => {
      const service = store.services.get(where.id)
      if (!service) return null
      const updated = { ...service, ...data }
      store.services.set(where.id, updated)
      return updated
    },
    count: async () => store.services.size
  },

  // ServiceCategory
  serviceCategory: {
    findMany: async () => Array.from(store.categories.values()),
    findUnique: async ({ where }: { where: { id: string } }) => {
      return store.categories.get(where.id) || null
    }
  },

  // ContentArticle
  contentArticle: {
    findMany: async ({ where, orderBy, take, skip, include }: {
      where?: { providerId?: string; targetPlatform?: string }
      orderBy?: { generatedAt?: 'asc' | 'desc' }
      take?: number
      skip?: number
      include?: { distributions?: boolean }
    } = {}) => {
      let items = Array.from(store.articles.values())
      if (where?.providerId) items = items.filter(a => a.providerId === where.providerId)
      if (where?.targetPlatform) items = items.filter(a => a.targetPlatform === where.targetPlatform)
      if (orderBy?.generatedAt === 'desc') items.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
      if (skip) items = items.slice(skip)
      if (take) items = items.slice(0, take)
      
      // 处理 include
      if (include?.distributions) {
        return items.map(article => {
          const dists = Array.from(store.distributions.values()).filter(d => d.articleId === article.id)
          return { ...article, distributions: dists }
        })
      }
      
      return items
    },
    findFirst: async ({ where, include }: { where?: { id?: string; providerId?: string }; include?: { distributions?: boolean } }) => {
      let articles = Array.from(store.articles.values())
      if (where?.id) articles = articles.filter(a => a.id === where.id)
      if (where?.providerId) articles = articles.filter(a => a.providerId === where.providerId)
      const article = articles[0] || null
      if (!article) return null
      if (include?.distributions) {
        const dists = Array.from(store.distributions.values()).filter(d => d.articleId === article.id)
        return { ...article, distributions: dists }
      }
      return article
    },
    findUnique: async ({ where, include }: { where: { id: string }; include?: { distributions?: boolean } }) => {
      const article = store.articles.get(where.id)
      if (!article) return null
      if (include?.distributions) {
        const dists = Array.from(store.distributions.values()).filter(d => d.articleId === article.id)
        return { ...article, distributions: dists }
      }
      return article
    },
    create: async ({ data }: { data: Omit<ContentArticle, 'id' | 'generatedAt'> & { generatedAt?: Date } }) => {
      const article: ContentArticle = {
        id: randomUUID(),
        ...data,
        generatedAt: data.generatedAt || new Date()
      }
      store.articles.set(article.id, article)
      return article
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<ContentArticle> }) => {
      const article = store.articles.get(where.id)
      if (!article) return null
      const updated = { ...article, ...data }
      store.articles.set(where.id, updated)
      return updated
    },
    delete: async ({ where }: { where: { id: string } }) => {
      store.articles.delete(where.id)
      return { id: where.id }
    },
    count: async ({ where }: { where?: { providerId?: string } } = {}) => {
      if (!where?.providerId) return store.articles.size
      return Array.from(store.articles.values()).filter(a => a.providerId === where.providerId).length
    }
  },

  // DistributionRecord
  distributionRecord: {
    findMany: async ({ where }: { where?: { articleId?: string } } = {}) => {
      let items = Array.from(store.distributions.values())
      if (where?.articleId) items = items.filter(d => d.articleId === where.articleId)
      return items
    },
    create: async ({ data }: { data: Omit<DistributionRecord, 'id'> }) => {
      const record: DistributionRecord = { id: randomUUID(), ...data }
      store.distributions.set(record.id, record)
      return record
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<DistributionRecord> }) => {
      const record = store.distributions.get(where.id)
      if (!record) return null
      const updated = { ...record, ...data }
      store.distributions.set(where.id, updated)
      return updated
    }
  },

  // PlatformAccount
  platformAccount: {
    findMany: async ({ where }: { where?: { providerId?: string } } = {}) => {
      let items = Array.from(store.platformAccounts.values())
      if (where?.providerId) items = items.filter(p => p.providerId === where.providerId)
      return items
    },
    findFirst: async ({ where }: { where?: { providerId?: string; platform?: string } }) => {
      let items = Array.from(store.platformAccounts.values())
      if (where?.providerId) items = items.filter(p => p.providerId === where.providerId)
      if (where?.platform) items = items.filter(p => p.platform === where.platform)
      return items[0] || null
    },
    upsert: async ({ where, create, update }: {
      where: { providerId_platform: { providerId: string; platform: string } }
      create: Omit<PlatformAccount, 'id'>
      update: Partial<PlatformAccount>
    }) => {
      const existing = Array.from(store.platformAccounts.values()).find(
        p => p.providerId === where.providerId_platform.providerId && p.platform === where.providerId_platform.platform
      )
      if (existing) {
        const updated = { ...existing, ...update }
        store.platformAccounts.set(existing.id, updated)
        return updated
      }
      const account: PlatformAccount = { id: randomUUID(), ...create }
      store.platformAccounts.set(account.id, account)
      return account
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<PlatformAccount> }) => {
      const account = store.platformAccounts.get(where.id)
      if (!account) return null
      const updated = { ...account, ...data }
      store.platformAccounts.set(where.id, updated)
      return updated
    }
  },

  // Review
  review: {
    findMany: async ({ where, orderBy, take }: {
      where?: { providerId?: string }
      orderBy?: { createdAt?: 'asc' | 'desc' }
      take?: number
    } = {}) => {
      let items = Array.from(store.reviews.values())
      if (where?.providerId) items = items.filter(r => r.providerId === where.providerId)
      if (orderBy?.createdAt === 'desc') items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      if (take) items = items.slice(0, take)
      return items
    },
    count: async ({ where }: { where?: { providerId?: string } } = {}) => {
      if (!where?.providerId) return store.reviews.size
      return Array.from(store.reviews.values()).filter(r => r.providerId === where.providerId).length
    }
  },

  // SMS Code
  smsCode: {
    create: async ({ data }: { data: Omit<SmsCode, 'id'> }) => {
      const code: SmsCode = { id: randomUUID(), ...data }
      store.smsCodes.set(code.id, code)
      return code
    },
    findMany: async () => Array.from(store.smsCodes.values()),
    update: async ({ where, data }: { where: { id: string }; data: Partial<SmsCode> }) => {
      const code = store.smsCodes.get(where.id)
      if (!code) return null
      const updated = { ...code, ...data }
      store.smsCodes.set(where.id, updated)
      return updated
    }
  },

  // 原始 SQL 查询（mock 实现，用于 GEO 搜索）
  $queryRawUnsafe: async (sql: string): Promise<any[]> => {
    const results = Array.from(store.providers.values()).map(provider => {
      const geo = Array.from(store.geoLocations.values()).find(g => g.providerId === provider.id)
      const service = Array.from(store.services.values()).find(s => s.providerId === provider.id)
      const category = service ? store.categories.get(service.categoryId) : null

      return {
        provider_id: provider.id,
        name: provider.nickname,
        avatar: provider.avatar,
        bio: provider.bio,
        city: provider.city,
        district: provider.district,
        is_verified: provider.isVerified,
        avg_rating: provider.avgRating,
        review_count: provider.reviewCount,
        service_id: service?.id || '',
        service_title: service?.title || '',
        service_description: service?.description || '',
        min_price: service?.minPrice,
        max_price: service?.maxPrice,
        price_unit: service?.priceUnit,
        tags: service?.tags || [],
        category_name: category?.name || '',
        address: geo?.fullAddress || '',
        latitude: geo?.latitude || 39.9042,
        longitude: geo?.longitude || 116.4074,
        distance_km: geo ? Math.random() * 5 + 0.5 : 1.0,
        updated_at: provider.updatedAt
      }
    })

    return results
  },

  $connect: async () => {
    console.log('[MockDB] Connected')
  },
  $disconnect: async () => {
    console.log('[MockDB] Disconnected')
  }
} as any

export async function connectDatabase(): Promise<void> {
  initDefaultData()
  console.log('[MockDB] 数据库连接成功（内存模式）')
}

export async function disconnectDatabase(): Promise<void> {
  console.log('[MockDB] 数据库连接已关闭')
}

// 辅助函数：查找 provider + geo + services
export function getProviderWithDetails(providerId: string) {
  const provider = store.providers.get(providerId)
  if (!provider) return null
  const geo = Array.from(store.geoLocations.values()).find(g => g.providerId === providerId)
  const services = Array.from(store.services.values()).filter(s => s.providerId === providerId).map(s => {
    const category = store.categories.get(s.categoryId)
    return { ...s, category: { id: category?.id, name: category?.name } }
  })
  const accounts = Array.from(store.platformAccounts.values()).filter(a => a.providerId === providerId)
  const reviews = Array.from(store.reviews.values()).filter(r => r.providerId === providerId)

  return { provider, geo, services, accounts, reviews }
}

// 暴露 store 给调试
export const __store = store
