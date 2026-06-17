import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/config/database'
import { success, error } from '@/utils/response'
import { authenticate } from '@/middleware/auth'
import { calculateGeoHash } from '@/utils/geoHash'

const router = Router()

// ── 获取当前服务者信息 ──
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const providerId = req.providerId!

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        geoLocation: true,
        services: {
          include: { category: true },
          where: { isActive: true }
        },
        platformAccounts: {
          where: { status: 'ACTIVE' }
        }
      }
    })

    if (!provider) {
      res.status(404).json(error('NOT_FOUND', '服务者不存在'))
      return
    }

    res.json(success({
      id: provider.id,
      phone: provider.phone,
      nickname: provider.nickname,
      avatar: provider.avatar,
      bio: provider.bio,
      city: provider.city,
      district: provider.district,
      isVerified: provider.isVerified,
      avgRating: provider.avgRating,
      reviewCount: provider.reviewCount,
      status: provider.status,
      isOnboarded: !!provider.city && !!provider.geoLocation,
      geoLocation: provider.geoLocation,
      services: provider.services.map(s => ({
        id: s.id,
        categoryId: s.categoryId,
        categoryName: s.category.name,
        title: s.title,
        description: s.description,
        minPrice: s.minPrice ? Number(s.minPrice) : null,
        maxPrice: s.maxPrice ? Number(s.maxPrice) : null,
        priceUnit: s.priceUnit,
        tags: s.tags,
        isActive: s.isActive
      })),
      platformAccounts: provider.platformAccounts.map(a => ({
        platform: a.platform,
        status: a.status
      }))
    }))
  } catch (err) {
    console.error('[Get Provider Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取服务者信息失败'))
  }
})

// ── 更新服务者信息 ──
const updateProviderSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  avatar: z.string().url().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  city: z.string().min(1).max(50).optional(),
  district: z.string().max(50).optional().nullable()
})

router.put('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const providerId = req.providerId!
    const data = updateProviderSchema.parse(req.body)

    const provider = await prisma.provider.update({
      where: { id: providerId },
      data
    })

    res.json(success({
      id: provider.id,
      nickname: provider.nickname,
      avatar: provider.avatar,
      bio: provider.bio,
      city: provider.city,
      district: provider.district
    }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Update Provider Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '更新失败'))
  }
})

// ── 更新地理位置 ──
const updateGeoSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  fullAddress: z.string().min(1).max(200),
  serviceRadiusKm: z.number().min(1).max(50).optional().default(3)
})

router.put('/me/geo', authenticate, async (req: Request, res: Response) => {
  try {
    const providerId = req.providerId!
    const { latitude, longitude, fullAddress, serviceRadiusKm } = updateGeoSchema.parse(req.body)

    // 计算 GeoHash
    const geoHash = calculateGeoHash(latitude, longitude)

    // 解析城市和区县（简化处理，实际应调用高德 API）
    const city = req.body.city || ''
    const district = req.body.district || ''

    // 更新或创建地理位置
    const geoLocation = await prisma.geoLocation.upsert({
      where: { providerId },
      update: {
        latitude,
        longitude,
        fullAddress,
        serviceRadiusKm,
        geoHash
      },
      create: {
        providerId,
        latitude,
        longitude,
        fullAddress,
        serviceRadiusKm,
        geoHash
      }
    })

    // 更新服务者城市信息
    await prisma.provider.update({
      where: { id: providerId },
      data: {
        city: req.body.city || '',
        district: req.body.district || ''
      }
    })

    res.json(success({ geoLocation }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Update Geo Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '更新地理位置失败'))
  }
})

// ── 获取服务者公开主页 ──
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const provider = await prisma.provider.findUnique({
      where: { id, status: 'ACTIVE' },
      include: {
        geoLocation: true,
        services: {
          include: { category: true },
          where: { isActive: true }
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!provider) {
      res.status(404).json(error('NOT_FOUND', '服务者不存在'))
      return
    }

    // 脱敏处理：隐藏完整手机号
    const phoneMasked = provider.phone.slice(0, 3) + '****' + provider.phone.slice(-4)

    res.json(success({
      id: provider.id,
      nickname: provider.nickname,
      avatar: provider.avatar,
      bio: provider.bio,
      city: provider.city,
      district: provider.district,
      isVerified: provider.isVerified,
      avgRating: provider.avgRating,
      reviewCount: provider.reviewCount,
      geoLocation: provider.geoLocation,
      services: provider.services.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        minPrice: s.minPrice ? Number(s.minPrice) : null,
        maxPrice: s.maxPrice ? Number(s.maxPrice) : null,
        priceUnit: s.priceUnit,
        tags: s.tags,
        category: { id: s.category.id, name: s.category.name }
      })),
      recentReviews: provider.reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        reviewerName: r.reviewerName || '匿名用户',
        createdAt: r.createdAt
      })),
      phoneMasked
    }))
  } catch (err) {
    console.error('[Get Provider Profile Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取服务者信息失败'))
  }
})

// ── 获取服务者评价列表 ──
router.get('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { providerId: id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.review.count({ where: { providerId: id } })
    ])

    res.json(success({
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        reviewerName: r.reviewerName || '匿名用户',
        imageUrls: r.imageUrls,
        createdAt: r.createdAt
      })),
      total,
      page,
      pageSize: limit
    }))
  } catch (err) {
    console.error('[Get Reviews Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取评价列表失败'))
  }
})

export default router
