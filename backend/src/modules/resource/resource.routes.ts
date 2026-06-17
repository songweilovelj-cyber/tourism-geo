import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/config/database'
import { success, error } from '@/utils/response'
import { authenticate } from '@/middleware/auth'
import { calculateGeoHash } from '@/utils/geoHash'

const router = Router()

// ── 获取当前文旅资源运营者信息 ──
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const resourceId = req.providerId! // 使用原有的 providerId 字段

    const resource = await prisma.tourismResource.findUnique({
      where: { id: resourceId },
      include: {
        geoLocation: true,
        category: true,
        platformAccounts: {
          where: { status: 'ACTIVE' }
        },
        distributionLinks: {
          where: { isActive: true }
        }
      }
    })

    if (!resource) {
      res.status(404).json(error('NOT_FOUND', '文旅资源不存在'))
      return
    }

    res.json(success({
      id: resource.id,
      phone: resource.phone,
      name: resource.name,
      avatar: resource.avatar,
      description: resource.description,
      city: resource.city,
      district: resource.district,
      scenicArea: resource.scenicArea,
      resourceType: resource.resourceType,
      category: {
        id: resource.category.id,
        name: resource.category.name
      },
      isVerified: resource.isVerified,
      avgRating: resource.avgRating,
      reviewCount: resource.reviewCount,
      status: resource.status,
      isOnboarded: !!resource.city && !!resource.geoLocation,
      geoLocation: resource.geoLocation,
      distributionLinks: resource.distributionLinks.map(l => ({
        id: l.id,
        linkType: l.linkType,
        linkUrl: l.linkUrl,
        platform: l.platform,
        commissionRate: l.commissionRate ? Number(l.commissionRate) : null,
        isActive: l.isActive
      })),
      platformAccounts: resource.platformAccounts.map(a => ({
        platform: a.platform,
        status: a.status
      }))
    }))
  } catch (err) {
    console.error('[Get Resource Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取文旅资源信息失败'))
  }
})

// ── 更新文旅资源信息 ──
const updateResourceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  city: z.string().min(1).max(50).optional(),
  district: z.string().max(50).optional().nullable(),
  scenicArea: z.string().max(100).optional().nullable(),
  categoryId: z.string().optional()
})

router.put('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const resourceId = req.providerId!
    const data = updateResourceSchema.parse(req.body)

    const resource = await prisma.tourismResource.update({
      where: { id: resourceId },
      data,
      include: { category: true }
    })

    res.json(success({
      id: resource.id,
      name: resource.name,
      avatar: resource.avatar,
      description: resource.description,
      city: resource.city,
      district: resource.district,
      scenicArea: resource.scenicArea,
      category: {
        id: resource.category.id,
        name: resource.category.name
      }
    }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Update Resource Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '更新失败'))
  }
})

// ── 更新地理位置（经纬度为可选，支持只填写地址信息） ──
const updateGeoSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  fullAddress: z.string().max(200).optional(),
  serviceRadiusKm: z.number().min(1).max(100).optional().default(5),
  city: z.string().optional(),
  district: z.string().optional(),
  scenicArea: z.string().optional()
})

router.put('/me/geo', authenticate, async (req: Request, res: Response) => {
  try {
    const resourceId = req.providerId!
    const { latitude, longitude, fullAddress, serviceRadiusKm } = updateGeoSchema.parse(req.body)

    // 只有当有经纬度时，才创建/更新geoLocation记录
    let geoLocation = null
    if (latitude !== undefined && longitude !== undefined) {
      const geoHash = calculateGeoHash(latitude, longitude)

      geoLocation = await prisma.geoLocation.upsert({
        where: { resourceId },
        update: {
          latitude,
          longitude,
          fullAddress: fullAddress || '',
          serviceRadiusKm,
          geoHash
        },
        create: {
          resourceId,
          latitude,
          longitude,
          fullAddress: fullAddress || '',
          serviceRadiusKm,
          geoHash
        }
      })
    } else if (fullAddress) {
      // 只有地址没有经纬度，也更新 geoLocation，但 geoHash 用默认值
      geoLocation = await prisma.geoLocation.upsert({
        where: { resourceId },
        update: {
          fullAddress
        },
        create: {
          resourceId,
          latitude: 0,
          longitude: 0,
          fullAddress,
          serviceRadiusKm,
          geoHash: 'zzzzz' // 默认占位
        }
      })
    }

    // 更新文旅资源城市信息（始终更新）
    await prisma.tourismResource.update({
      where: { id: resourceId },
      data: {
        city: req.body.city || '',
        district: req.body.district || '',
        scenicArea: req.body.scenicArea || ''
      }
    })

    res.json(success({ geoLocation }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Update Geo Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '更新地址信息失败'))
  }
})

// ── 获取文旅资源公开主页 ──
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const resource = await prisma.tourismResource.findUnique({
      where: { id, status: 'ACTIVE' },
      include: {
        geoLocation: true,
        category: true,
        distributionLinks: {
          where: { isActive: true }
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        resourceMedia: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    })

    if (!resource) {
      res.status(404).json(error('NOT_FOUND', '文旅资源不存在'))
      return
    }

    // 脱敏处理：隐藏完整手机号
    const phoneMasked = resource.phone.slice(0, 3) + '****' + resource.phone.slice(-4)

    res.json(success({
      id: resource.id,
      name: resource.name,
      avatar: resource.avatar,
      description: resource.description,
      city: resource.city,
      district: resource.district,
      scenicArea: resource.scenicArea,
      resourceType: resource.resourceType,
      category: {
        id: resource.category.id,
        name: resource.category.name
      },
      isVerified: resource.isVerified,
      avgRating: resource.avgRating,
      reviewCount: resource.reviewCount,
      geoLocation: resource.geoLocation,
      media: resource.resourceMedia.map(m => ({
        id: m.id,
        mediaType: m.mediaType,
        url: m.url,
        thumbnailUrl: m.thumbnailUrl,
        title: m.title,
        isPrimary: m.isPrimary
      })),
      distributionLinks: resource.distributionLinks.map(l => ({
        id: l.id,
        linkType: l.linkType,
        linkUrl: l.linkUrl,
        platform: l.platform,
        commissionRate: l.commissionRate ? Number(l.commissionRate) : null
      })),
      recentReviews: resource.reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        reviewerName: r.reviewerName || '匿名用户',
        createdAt: r.createdAt
      })),
      phoneMasked
    }))
  } catch (err) {
    console.error('[Get Resource Profile Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取文旅资源信息失败'))
  }
})

// ── 获取文旅资源评价列表 ──
router.get('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { resourceId: id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.review.count({ where: { resourceId: id } })
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