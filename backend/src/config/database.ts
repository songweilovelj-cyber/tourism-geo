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
  providerId?: string
  resourceId?: string
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

// ========== 文旅资源（TourismResource）模型 ==========
interface TourismResource {
  id: string
  phone: string
  name: string
  avatar?: string
  description?: string
  city: string
  district?: string
  scenicArea?: string
  resourceType: string
  isVerified: boolean
  realName?: string
  avgRating: number
  reviewCount: number
  status: string
  categoryId: string
  createdAt: Date
  updatedAt: Date
}

interface ResourceCategory {
  id: string
  name: string
  parentId?: string
  level: number
  iconKey?: string
  resourceType: string
}

interface ResourceMedia {
  id: string
  resourceId: string
  mediaType: string
  url: string
  thumbnailUrl?: string
  fileName: string
  fileSize: number
  width?: number
  height?: number
  duration?: number
  title?: string
  sortOrder: number
  isPrimary: boolean
  createdAt: Date
  updatedAt: Date
}

interface DistributionLink {
  id: string
  resourceId: string
  linkType: string
  linkUrl: string
  platform?: string
  commissionRate?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
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
  providerId?: string
  resourceId?: string
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

  // 文旅资源相关
  tourismResources: Map<string, TourismResource> = new Map()
  resourceCategories: Map<string, ResourceCategory> = new Map()
  resourceMedia: Map<string, ResourceMedia> = new Map()
  distributionLinks: Map<string, DistributionLink> = new Map()
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

  // ========== 文旅资源分类 ==========
  const resourceCategories: ResourceCategory[] = [
    { id: 'rc-scenic-1', name: '自然景区', level: 1, resourceType: 'SCENIC_SPOT' },
    { id: 'rc-scenic-2', name: '人文景区', level: 1, resourceType: 'SCENIC_SPOT' },
    { id: 'rc-scenic-3', name: '主题公园', level: 1, resourceType: 'SCENIC_SPOT' },
    { id: 'rc-hotel-1', name: '星级酒店', level: 1, resourceType: 'HOTEL' },
    { id: 'rc-hotel-2', name: '精品民宿', level: 1, resourceType: 'HOTEL' },
    { id: 'rc-hotel-3', name: '经济酒店', level: 1, resourceType: 'HOTEL' },
    { id: 'rc-creative-1', name: '文创商店', level: 1, resourceType: 'CREATIVE_SHOP' },
    { id: 'rc-creative-2', name: '特产店', level: 1, resourceType: 'CREATIVE_SHOP' },
    { id: 'rc-play-1', name: '游乐设施', level: 1, resourceType: 'PLAY_ITEM' },
    { id: 'rc-play-2', name: '演出表演', level: 1, resourceType: 'PLAY_ITEM' },
    { id: 'rc-food-1', name: '特色餐饮', level: 1, resourceType: 'SECOND_CONSUME' },
    { id: 'rc-food-2', name: '休闲服务', level: 1, resourceType: 'SECOND_CONSUME' }
  ]
  resourceCategories.forEach(c => store.resourceCategories.set(c.id, c))

  // ========== 文旅资源示例数据 ==========
  const tourismResources: TourismResource[] = [
    {
      id: '1',
      phone: '13900000001',
      name: '黄山风景区',
      description: '黄山，世界文化与自然双重遗产，世界地质公园，国家AAAAA级旅游景区。以奇松、怪石、云海、温泉、冬雪五绝著称于世。主峰莲花峰海拔1864米，是华东地区最高的山峰之一。',
      city: '安徽省黄山市',
      district: '黄山区',
      scenicArea: '黄山风景区',
      resourceType: 'SCENIC_SPOT',
      isVerified: true,
      avgRating: 4.9,
      reviewCount: 15680,
      status: 'ACTIVE',
      categoryId: 'rc-scenic-1',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    },
    {
      id: '2',
      phone: '13900000002',
      name: '云海民宿',
      description: '坐落于黄山脚下汤口镇的精品民宿，推窗即可欣赏到壮丽的山景和云海。民宿提供舒适的住宿环境、地道的徽州美食，以及专业的登山向导服务。',
      city: '安徽省黄山市',
      district: '黄山区',
      scenicArea: '黄山风景区',
      resourceType: 'HOTEL',
      isVerified: true,
      avgRating: 4.8,
      reviewCount: 326,
      status: 'ACTIVE',
      categoryId: 'rc-hotel-2',
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date()
    },
    {
      id: '3',
      phone: '13900000003',
      name: '徽州文创馆',
      description: '传承徽州千年木雕技艺的文创精品店，每一件作品都由非遗传承人手工打造。主营徽州木雕、竹雕、砚台等工艺品，是选购伴手礼的绝佳去处。',
      city: '安徽省黄山市',
      district: '屯溪区',
      scenicArea: '黄山老街',
      resourceType: 'CREATIVE_SHOP',
      isVerified: true,
      avgRating: 5.0,
      reviewCount: 156,
      status: 'ACTIVE',
      categoryId: 'rc-creative-1',
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date()
    },
    {
      id: '4',
      phone: '13900000004',
      name: '玉屏索道',
      description: '亚洲最长的高山索道之一，全长2176米，落差750米。乘坐索道可直达玉屏楼景区，俯瞰天都峰、莲花峰等著名景点，节省体力，轻松欣赏绝美山景。',
      city: '安徽省黄山市',
      district: '黄山区',
      scenicArea: '黄山风景区',
      resourceType: 'PLAY_ITEM',
      isVerified: true,
      avgRating: 4.7,
      reviewCount: 892,
      status: 'ACTIVE',
      categoryId: 'rc-play-1',
      createdAt: new Date('2024-04-05'),
      updatedAt: new Date()
    },
    {
      id: '5',
      phone: '13900000005',
      name: '徽香源餐厅',
      description: '传承百年的徽州老字号，主打正宗徽菜。臭鳜鱼、毛豆腐、黄山烧饼等特色美食一应俱全，让您品尝地道的徽州味道。',
      city: '安徽省黄山市',
      district: '黄山区',
      scenicArea: '黄山风景区',
      resourceType: 'SECOND_CONSUME',
      isVerified: true,
      avgRating: 4.9,
      reviewCount: 445,
      status: 'ACTIVE',
      categoryId: 'rc-food-1',
      createdAt: new Date('2024-05-12'),
      updatedAt: new Date()
    }
  ]
  tourismResources.forEach(r => store.tourismResources.set(r.id, r))

  // ========== 文旅资源媒体（示例图片） ==========
  const resourceMedia: ResourceMedia[] = [
    { id: 'rm-1', resourceId: '1', mediaType: 'IMAGE', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huangshan%20Mountain%20scenic%20area%20beautiful%20landscape&image_size=landscape_16_9', fileName: 'huangshan.jpg', fileSize: 1024000, sortOrder: 0, isPrimary: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'rm-2', resourceId: '2', mediaType: 'IMAGE', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20mountain%20homestay%20hotel%20interior&image_size=landscape_16_9', fileName: 'yunhai.jpg', fileSize: 1024000, sortOrder: 0, isPrimary: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'rm-3', resourceId: '3', mediaType: 'IMAGE', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20cultural%20craft%20shop&image_size=landscape_16_9', fileName: 'huizhou.jpg', fileSize: 1024000, sortOrder: 0, isPrimary: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'rm-4', resourceId: '4', mediaType: 'IMAGE', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cable%20car%20ropeway%20mountain%20scenery&image_size=landscape_16_9', fileName: 'yuping.jpg', fileSize: 1024000, sortOrder: 0, isPrimary: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'rm-5', resourceId: '5', mediaType: 'IMAGE', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20Huizhou%20cuisine%20restaurant&image_size=landscape_16_9', fileName: 'huixiang.jpg', fileSize: 1024000, sortOrder: 0, isPrimary: true, createdAt: new Date(), updatedAt: new Date() }
  ]
  resourceMedia.forEach(m => store.resourceMedia.set(m.id, m))

  // ========== 文旅资源地理位置 ==========
  const resourceLocations: GeoLocation[] = [
    { id: 'rl-1', resourceId: '1', latitude: 30.1332, longitude: 118.1694, fullAddress: '安徽省黄山市黄山区黄山风景区', serviceRadiusKm: 10, geoHash: 'wt3y3v' },
    { id: 'rl-2', resourceId: '2', latitude: 30.0832, longitude: 118.1934, fullAddress: '安徽省黄山市黄山区汤口镇', serviceRadiusKm: 5, geoHash: 'wt3y3w' },
    { id: 'rl-3', resourceId: '3', latitude: 29.7117, longitude: 118.3175, fullAddress: '安徽省黄山市屯溪区黄山老街', serviceRadiusKm: 3, geoHash: 'wt3v4n' },
    { id: 'rl-4', resourceId: '4', latitude: 30.1350, longitude: 118.1700, fullAddress: '安徽省黄山市黄山区玉屏索道', serviceRadiusKm: 5, geoHash: 'wt3y3v' },
    { id: 'rl-5', resourceId: '5', latitude: 30.1000, longitude: 118.1800, fullAddress: '安徽省黄山市黄山区徽香源餐厅', serviceRadiusKm: 3, geoHash: 'wt3y3w' }
  ]
  resourceLocations.forEach(l => store.geoLocations.set(l.id, l))

  // ========== 分销链接示例 ==========
  const distributionLinks: DistributionLink[] = [
    { id: 'dl-1', resourceId: '1', linkType: 'DIRECT_LINK', linkUrl: 'https://www.huangshan.gov.cn', platform: '官方网站', commissionRate: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'dl-2', resourceId: '1', linkType: 'DISTRIBUTION', linkUrl: 'https://ctrip.com/huangshan', platform: '携程', commissionRate: 5, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'dl-3', resourceId: '2', linkType: 'DIRECT_LINK', linkUrl: 'https://www.yunhai-min.com', platform: '官网预订', commissionRate: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'dl-4', resourceId: '4', linkType: 'DIRECT_LINK', linkUrl: 'https://www.huangshan.gov.cn', platform: '官方渠道', commissionRate: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'dl-5', resourceId: '5', linkType: 'DIRECT_LINK', linkUrl: 'https://www.huixiangyuan.com', platform: '到店用餐', commissionRate: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ]
  distributionLinks.forEach(l => store.distributionLinks.set(l.id, l))

  // ========== 文旅资源评价 ==========
  const resourceReviews: Review[] = [
    { id: 'rr-1', resourceId: '1', reviewerName: '游客小王', rating: 5, comment: '黄山太美了！云海壮观，奇松怪石令人叹为观止。', imageUrls: [], createdAt: new Date('2024-01-15') },
    { id: 'rr-2', resourceId: '1', reviewerName: '旅行达人', rating: 5, comment: '冬季的黄山别有一番风味，银装素裹，宛如仙境。', imageUrls: [], createdAt: new Date('2024-01-10') },
    { id: 'rr-3', resourceId: '2', reviewerName: '游客小李', rating: 5, comment: '老板人很好，服务周到。房间干净整洁，早餐也很丰盛。', imageUrls: [], createdAt: new Date('2024-01-14') },
    { id: 'rr-4', resourceId: '4', reviewerName: '带娃出游', rating: 5, comment: '索道很稳，风景超棒！省去了爬山的辛苦。', imageUrls: [], createdAt: new Date('2024-01-11') },
    { id: 'rr-5', resourceId: '5', reviewerName: '美食家', rating: 5, comment: '臭鳜鱼太好吃了！虽然闻起来有点臭，但是吃起来特别香。', imageUrls: [], createdAt: new Date('2024-01-14') }
  ]
  resourceReviews.forEach(r => store.reviews.set(r.id, r))

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
    findUnique: async ({ where }: { where: { providerId?: string; resourceId?: string; id?: string } }) => {
      if (where.providerId) {
        return Array.from(store.geoLocations.values()).find(g => g.providerId === where.providerId) || null
      }
      if (where.resourceId) {
        return Array.from(store.geoLocations.values()).find(g => g.resourceId === where.resourceId) || null
      }
      if (where.id) {
        return store.geoLocations.get(where.id) || null
      }
      return null
    },
    upsert: async ({ where, create, update }: {
      where: { providerId?: string; resourceId?: string }
      create: Omit<GeoLocation, 'id'>
      update: Partial<GeoLocation>
    }) => {
      const existing = Array.from(store.geoLocations.values()).find(g => {
        if (where.providerId) return g.providerId === where.providerId
        if (where.resourceId) return g.resourceId === where.resourceId
        return false
      })
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

  // ========== TourismResource（文旅资源）==========
  tourismResource: {
    findUnique: async ({ where, include }: { where: { id?: string; phone?: string; status?: string }; include?: any }) => {
      let resource: TourismResource | null = null
      if (where.id) {
        resource = store.tourismResources.get(where.id) || null
      } else if (where.phone) {
        resource = Array.from(store.tourismResources.values()).find(r => r.phone === where.phone) || null
      }
      if (!resource) return null
      // 如果指定了 status 但资源状态不匹配
      if (where.status && resource.status !== where.status) return null

      if (!include) return resource

      const result: any = { ...resource }

      if (include.geoLocation) {
        result.geoLocation = Array.from(store.geoLocations.values()).find(g => g.resourceId === resource!.id) || null
      }

      if (include.category) {
        result.category = store.resourceCategories.get(resource.categoryId) || null
      }

      if (include.platformAccounts) {
        result.platformAccounts = Array.from(store.platformAccounts.values())
          .filter(a => a.providerId === resource!.id)
          .filter(a => include.platformAccounts.where?.status ? a.status === include.platformAccounts.where.status : true)
      }

      if (include.distributionLinks) {
        let links = Array.from(store.distributionLinks.values()).filter(l => l.resourceId === resource!.id)
        if (include.distributionLinks.where?.isActive !== undefined) {
          links = links.filter(l => l.isActive === include.distributionLinks.where.isActive)
        }
        result.distributionLinks = links
      }

      if (include.reviews) {
        const reviews = Array.from(store.reviews.values()).filter(r => r.resourceId === resource!.id)
        if (include.reviews.orderBy?.createdAt === 'desc') {
          reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        }
        if (include.reviews.take) {
          result.reviews = reviews.slice(0, include.reviews.take)
        } else {
          result.reviews = reviews
        }
      }

      if (include.resourceMedia) {
        let media = Array.from(store.resourceMedia.values()).filter(m => m.resourceId === resource!.id)
        if (include.resourceMedia.orderBy?.sortOrder === 'asc') {
          media.sort((a, b) => a.sortOrder - b.sortOrder)
        }
        result.resourceMedia = media
      }

      return result
    },
    findMany: async ({ where, take, orderBy, include }: {
      where?: { status?: string; resourceType?: string; categoryId?: string }
      take?: number
      orderBy?: { createdAt?: 'asc' | 'desc'; avgRating?: 'asc' | 'desc' }
      include?: any
    } = {}) => {
      let items = Array.from(store.tourismResources.values())
      if (where?.status) items = items.filter(r => r.status === where.status)
      if (where?.resourceType) items = items.filter(r => r.resourceType === where.resourceType)
      if (where?.categoryId) items = items.filter(r => r.categoryId === where.categoryId)
      if (orderBy?.createdAt === 'desc') items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      if (orderBy?.avgRating === 'desc') items.sort((a, b) => b.avgRating - a.avgRating)
      if (take) items = items.slice(0, take)

      if (!include) return items

      return items.map(resource => {
        const result: any = { ...resource }
        if (include.geoLocation) {
          result.geoLocation = Array.from(store.geoLocations.values()).find(g => g.resourceId === resource.id) || null
        }
        if (include.category) {
          result.category = store.resourceCategories.get(resource.categoryId) || null
        }
        if (include.resourceMedia) {
          let media = Array.from(store.resourceMedia.values()).filter(m => m.resourceId === resource.id)
          if (include.resourceMedia.orderBy?.sortOrder === 'asc') {
            media.sort((a, b) => a.sortOrder - b.sortOrder)
          }
          result.resourceMedia = media
        }
        if (include.distributionLinks) {
          result.distributionLinks = Array.from(store.distributionLinks.values()).filter(l => l.resourceId === resource.id)
        }
        return result
      })
    },
    create: async ({ data, include }: { data: Omit<TourismResource, 'id' | 'createdAt' | 'updatedAt'>; include?: any }) => {
      const resource: TourismResource = {
        id: randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      store.tourismResources.set(resource.id, resource)

      if (!include) return resource

      const result: any = { ...resource }
      if (include.category) {
        result.category = store.resourceCategories.get(resource.categoryId) || null
      }
      if (include.geoLocation) {
        result.geoLocation = Array.from(store.geoLocations.values()).find(g => g.resourceId === resource.id) || null
      }
      return result
    },
    update: async ({ where, data, include }: { where: { id: string }; data: Partial<TourismResource>; include?: any }) => {
      const resource = store.tourismResources.get(where.id)
      if (!resource) return null
      const updated = { ...resource, ...data, updatedAt: new Date() }
      store.tourismResources.set(where.id, updated)

      if (!include) return updated

      const result: any = { ...updated }
      if (include.category) {
        result.category = store.resourceCategories.get(updated.categoryId) || null
      }
      if (include.geoLocation) {
        result.geoLocation = Array.from(store.geoLocations.values()).find(g => g.resourceId === updated.id) || null
      }
      return result
    },
    upsert: async ({ where, create, update, include }: {
      where: { id: string }
      create: any
      update: Partial<TourismResource>
      include?: any
    }) => {
      const existing = store.tourismResources.get(where.id)
      if (existing) {
        // 更新现有记录
        const updated = { ...existing, ...update, updatedAt: new Date() }
        store.tourismResources.set(where.id, updated)

        if (!include) return updated

        const result: any = { ...updated }
        if (include.category) {
          result.category = store.resourceCategories.get(updated.categoryId) || null
        }
        return result
      } else {
        // 创建新记录
        const resource: TourismResource = {
          id: create.id || randomUUID(),
          phone: create.phone || 'unknown',
          name: create.name || '',
          avatar: create.avatar,
          description: create.description,
          city: create.city || '',
          district: create.district,
          scenicArea: create.scenicArea,
          resourceType: create.resourceType || 'SCENIC_SPOT',
          isVerified: create.isVerified || false,
          avgRating: create.avgRating || 0,
          reviewCount: create.reviewCount || 0,
          status: create.status || 'ACTIVE',
          categoryId: create.categoryId || '',
          createdAt: new Date(),
          updatedAt: new Date()
        }
        store.tourismResources.set(resource.id, resource)

        if (!include) return resource

        const result: any = { ...resource }
        if (include.category) {
          result.category = store.resourceCategories.get(resource.categoryId) || null
        }
        return result
      }
    },
    count: async ({ where }: { where?: { status?: string } } = {}) => {
      if (!where?.status) return store.tourismResources.size
      return Array.from(store.tourismResources.values()).filter(r => r.status === where.status).length
    }
  },

  // ========== ResourceCategory（文旅资源分类）==========
  resourceCategory: {
    findMany: async ({ where, include }: { where?: { resourceType?: string; parentId?: string }; include?: any } = {}) => {
      let items = Array.from(store.resourceCategories.values())
      if (where?.resourceType) items = items.filter(c => c.resourceType === where.resourceType)
      if (where?.parentId !== undefined) {
        items = items.filter(c => c.parentId === where.parentId)
      }

      if (!include) return items

      return items.map(cat => {
        const result: any = { ...cat }
        if (include.children) {
          result.children = Array.from(store.resourceCategories.values()).filter(c => c.parentId === cat.id)
        }
        return result
      })
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return store.resourceCategories.get(where.id) || null
    }
  },

  // ========== ResourceMedia（文旅资源媒体）==========
  resourceMedia: {
    findMany: async ({ where, orderBy }: { where?: { resourceId?: string }; orderBy?: { sortOrder?: 'asc' | 'desc' } } = {}) => {
      let items = Array.from(store.resourceMedia.values())
      if (where?.resourceId) items = items.filter(m => m.resourceId === where.resourceId)
      if (orderBy?.sortOrder === 'asc') items.sort((a, b) => a.sortOrder - b.sortOrder)
      return items
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return store.resourceMedia.get(where.id) || null
    },
    create: async ({ data }: { data: Omit<ResourceMedia, 'id' | 'createdAt' | 'updatedAt'> }) => {
      const media: ResourceMedia = {
        id: randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      store.resourceMedia.set(media.id, media)
      return media
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<ResourceMedia> }) => {
      const media = store.resourceMedia.get(where.id)
      if (!media) return null
      const updated = { ...media, ...data, updatedAt: new Date() }
      store.resourceMedia.set(where.id, updated)
      return updated
    },
    delete: async ({ where }: { where: { id: string } }) => {
      store.resourceMedia.delete(where.id)
      return { id: where.id }
    }
  },

  // ========== DistributionLink（分销链接）==========
  distributionLink: {
    findMany: async ({ where }: { where?: { resourceId?: string; isActive?: boolean } } = {}) => {
      let items = Array.from(store.distributionLinks.values())
      if (where?.resourceId) items = items.filter(l => l.resourceId === where.resourceId)
      if (where?.isActive !== undefined) items = items.filter(l => l.isActive === where.isActive)
      return items
    },
    findUnique: async ({ where }: { where: { id: string } }) => {
      return store.distributionLinks.get(where.id) || null
    },
    create: async ({ data }: { data: Omit<DistributionLink, 'id' | 'createdAt' | 'updatedAt'> }) => {
      const link: DistributionLink = {
        id: randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      store.distributionLinks.set(link.id, link)
      return link
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<DistributionLink> }) => {
      const link = store.distributionLinks.get(where.id)
      if (!link) return null
      const updated = { ...link, ...data, updatedAt: new Date() }
      store.distributionLinks.set(where.id, updated)
      return updated
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
