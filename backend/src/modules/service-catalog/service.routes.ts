import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/config/database'
import { success, error } from '@/utils/response'
import { authenticate } from '@/middleware/auth'

const router = Router()

// ── 获取服务分类树 ──
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { level: 1 },
      include: {
        children: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })

    res.json(success(categories))
  } catch (err) {
    console.error('[Get Categories Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取分类失败'))
  }
})

// ── 获取服务项列表（当前用户） ──
router.get('/my', authenticate, async (req: Request, res: Response) => {
  try {
    const providerId = req.providerId!

    const services = await prisma.service.findMany({
      where: { providerId },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    })

    res.json(success(services))
  } catch (err) {
    console.error('[Get Services Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取服务项失败'))
  }
})

// ── 创建服务项 ──
const createServiceSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  minPrice: z.number().min(0).optional().nullable(),
  maxPrice: z.number().min(0).optional().nullable(),
  priceUnit: z.string().max(20).optional().nullable(),
  tags: z.array(z.string()).max(10).optional().default([])
})

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const providerId = req.providerId!
    const data = createServiceSchema.parse(req.body)

    // 验证分类存在
    const category = await prisma.serviceCategory.findUnique({
      where: { id: data.categoryId }
    })

    if (!category) {
      res.status(400).json(error('INVALID_CATEGORY', '服务分类不存在'))
      return
    }

    const service = await prisma.service.create({
      data: {
        providerId,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        minPrice: data.minPrice ? data.minPrice : null,
        maxPrice: data.maxPrice ? data.maxPrice : null,
        priceUnit: data.priceUnit || null,
        tags: data.tags
      },
      include: { category: true }
    })

    res.json(success({
      id: service.id,
      categoryId: service.categoryId,
      categoryName: service.category.name,
      title: service.title,
      description: service.description,
      minPrice: service.minPrice ? Number(service.minPrice) : null,
      maxPrice: service.maxPrice ? Number(service.maxPrice) : null,
      priceUnit: service.priceUnit,
      tags: service.tags,
      isActive: service.isActive
    }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Create Service Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '创建服务项失败'))
  }
})

// ── 更新服务项 ──
const updateServiceSchema = createServiceSchema.partial().extend({
  isActive: z.boolean().optional()
})

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const providerId = req.providerId!
    const { id } = req.params
    const data = updateServiceSchema.parse(req.body)

    // 验证归属
    const existing = await prisma.service.findFirst({
      where: { id, providerId }
    })

    if (!existing) {
      res.status(404).json(error('NOT_FOUND', '服务项不存在'))
      return
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.minPrice !== undefined && { minPrice: data.minPrice }),
        ...(data.maxPrice !== undefined && { maxPrice: data.maxPrice }),
        ...(data.priceUnit !== undefined && { priceUnit: data.priceUnit }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.isActive !== undefined && { isActive: data.isActive })
      },
      include: { category: true }
    })

    res.json(success({
      id: service.id,
      categoryId: service.categoryId,
      categoryName: service.category.name,
      title: service.title,
      description: service.description,
      minPrice: service.minPrice ? Number(service.minPrice) : null,
      maxPrice: service.maxPrice ? Number(service.maxPrice) : null,
      priceUnit: service.priceUnit,
      tags: service.tags,
      isActive: service.isActive
    }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Update Service Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '更新失败'))
  }
})

// ── 删除服务项 ──
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const providerId = req.providerId!
    const { id } = req.params

    const existing = await prisma.service.findFirst({
      where: { id, providerId }
    })

    if (!existing) {
      res.status(404).json(error('NOT_FOUND', '服务项不存在'))
      return
    }

    // 软删除（标记为 inactive）
    await prisma.service.update({
      where: { id },
      data: { isActive: false }
    })

    res.json(success({ message: '删除成功' }))
  } catch (err) {
    console.error('[Delete Service Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '删除失败'))
  }
})

export default router
