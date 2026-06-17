import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/config/database'
import { success, error } from '@/utils/response'
import { authenticate } from '@/middleware/auth'

const router = Router()

// ── 获取分销链接列表（当前用户） ──
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const resourceId = req.providerId!

    const links = await prisma.distributionLink.findMany({
      where: { resourceId },
      include: {
        commissionRecords: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // 计算每个链接的统计数据
    const linksWithStats = await Promise.all(links.map(async (link) => {
      const stats = await prisma.commissionRecord.aggregate({
        where: { 
          linkId: link.id,
          status: { in: ['CONFIRMED', 'SETTLED'] }
        },
        _sum: { 
          orderAmount: true,
          commissionAmount: true 
        },
        _count: true
      })

      return {
        id: link.id,
        linkType: link.linkType,
        linkUrl: link.linkUrl,
        platform: link.platform,
        commissionRate: link.commissionRate ? Number(link.commissionRate) : null,
        isActive: link.isActive,
        createdAt: link.createdAt,
        stats: {
          totalOrders: stats._count,
          totalAmount: stats._sum.orderAmount ? Number(stats._sum.orderAmount) : 0,
          totalCommission: stats._sum.commissionAmount ? Number(stats._sum.commissionAmount) : 0
        },
        recentRecords: link.commissionRecords.map(r => ({
          id: r.id,
          orderId: r.orderId,
          orderAmount: Number(r.orderAmount),
          commissionAmount: Number(r.commissionAmount),
          status: r.status,
          transactionAt: r.transactionAt
        }))
      }
    }))

    res.json(success(linksWithStats))
  } catch (err) {
    console.error('[Get Distribution Links Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取分销链接失败'))
  }
})

// ── 创建分销链接 ──
const createLinkSchema = z.object({
  linkType: z.enum(['DIRECT_LINK', 'DISTRIBUTION']),
  linkUrl: z.string().url(),
  platform: z.string().max(50).optional(),
  commissionRate: z.number().min(0).max(100).optional()
})

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const resourceId = req.providerId!
    const data = createLinkSchema.parse(req.body)

    const link = await prisma.distributionLink.create({
      data: {
        resourceId,
        linkType: data.linkType,
        linkUrl: data.linkUrl,
        platform: data.platform || '自有',
        commissionRate: data.commissionRate ? data.commissionRate : null,
        isActive: true
      }
    })

    res.json(success({
      id: link.id,
      linkType: link.linkType,
      linkUrl: link.linkUrl,
      platform: link.platform,
      commissionRate: link.commissionRate ? Number(link.commissionRate) : null,
      isActive: link.isActive
    }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Create Distribution Link Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '创建分销链接失败'))
  }
})

// ── 更新分销链接 ──
const updateLinkSchema = createLinkSchema.partial().extend({
  isActive: z.boolean().optional()
})

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const resourceId = req.providerId!
    const { id } = req.params
    const data = updateLinkSchema.parse(req.body)

    // 验证归属
    const existing = await prisma.distributionLink.findFirst({
      where: { id, resourceId }
    })

    if (!existing) {
      res.status(404).json(error('NOT_FOUND', '分销链接不存在'))
      return
    }

    const link = await prisma.distributionLink.update({
      where: { id },
      data: {
        ...(data.linkType && { linkType: data.linkType }),
        ...(data.linkUrl && { linkUrl: data.linkUrl }),
        ...(data.platform && { platform: data.platform }),
        ...(data.commissionRate !== undefined && { commissionRate: data.commissionRate }),
        ...(data.isActive !== undefined && { isActive: data.isActive })
      }
    })

    res.json(success({
      id: link.id,
      linkType: link.linkType,
      linkUrl: link.linkUrl,
      platform: link.platform,
      commissionRate: link.commissionRate ? Number(link.commissionRate) : null,
      isActive: link.isActive
    }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Update Distribution Link Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '更新失败'))
  }
})

// ── 删除分销链接 ──
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const resourceId = req.providerId!
    const { id } = req.params

    const existing = await prisma.distributionLink.findFirst({
      where: { id, resourceId }
    })

    if (!existing) {
      res.status(404).json(error('NOT_FOUND', '分销链接不存在'))
      return
    }

    // 软删除（标记为 inactive）
    await prisma.distributionLink.update({
      where: { id },
      data: { isActive: false }
    })

    res.json(success({ message: '删除成功' }))
  } catch (err) {
    console.error('[Delete Distribution Link Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '删除失败'))
  }
})

export default router