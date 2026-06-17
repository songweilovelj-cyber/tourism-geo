import { Router, Request, Response } from 'express'
import { prisma } from '@/config/database'
import { success, error } from '@/utils/response'

const router = Router()

// ── 获取文旅资源分类树 ──
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.resourceCategory.findMany({
      where: { level: 1 },
      include: {
        children: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })

    res.json(success(categories.map(c => ({
      id: c.id,
      name: c.name,
      iconKey: c.iconKey,
      resourceType: c.resourceType,
      children: c.children.map(child => ({
        id: child.id,
        name: child.name,
        iconKey: child.iconKey,
        resourceType: child.resourceType
      }))
    }))))
  } catch (err) {
    console.error('[Get Categories Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取分类失败'))
  }
})

// ── 按资源类型获取分类 ──
router.get('/by-type/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params
    
    const categories = await prisma.resourceCategory.findMany({
      where: { 
        resourceType: type as any,
        level: 1 
      },
      include: {
        children: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })

    res.json(success(categories.map(c => ({
      id: c.id,
      name: c.name,
      iconKey: c.iconKey,
      children: c.children.map(child => ({
        id: child.id,
        name: child.name,
        iconKey: child.iconKey
      }))
    }))))
  } catch (err) {
    console.error('[Get Categories By Type Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取分类失败'))
  }
})

export default router