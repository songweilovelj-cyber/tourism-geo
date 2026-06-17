import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/config/database'
import { success, error } from '@/utils/response'

const router = Router()

// GEO 查询参数 schema
const geoQuerySchema = z.object({
  lat: z.string().transform(Number).pipe(z.number().min(-90).max(90)),
  lng: z.string().transform(Number).pipe(z.number().min(-180).max(180)),
  radius_km: z.string().optional().transform(v => v ? parseFloat(v) : 5),
  resource_type: z.string().optional(), // 文旅资源类型：SCENIC_SPOT, HOTEL, CREATIVE_SHOP, PLAY_ITEM, SECOND_CONSUME
  category_id: z.string().optional(),
  keyword: z.string().optional(),
  scenic_area: z.string().optional(), // 按景区筛选
  min_rating: z.string().optional().transform(v => v ? parseFloat(v) : 0),
  limit: z.string().optional().transform(v => v ? Math.min(parseInt(v), 50) : 10),
  offset: z.string().optional().transform(Number)
})

// ── 大模型检索核心 API：GEO 查询 ──
router.get('/query', async (req: Request, res: Response) => {
  try {
    const params = geoQuerySchema.parse(req.query)
    const { lat, lng, radius_km, resource_type, category_id, keyword, scenic_area, min_rating, limit, offset } = params

    // 使用内存数据进行 GEO 查询模拟
    const resources: any[] = await prisma.tourismResource.findMany()
    const geos: any[] = await prisma.geoLocation.findMany()
    const categories: any[] = await prisma.resourceCategory.findMany()
    const distributionLinks: any[] = await prisma.distributionLink.findMany({
      where: { isActive: true }
    })

    // 构建索引
    const geoMap = new Map(geos.map(g => [g.resourceId, g]))
    const categoryMap = new Map(categories.map(c => [c.id, c]))
    const linksMap = new Map<string, any[]>()
    
    for (const link of distributionLinks) {
      if (!linksMap.has(link.resourceId)) {
        linksMap.set(link.resourceId, [])
      }
      linksMap.get(link.resourceId)!.push(link)
    }

    // 计算每条数据的距离并过滤
    const allResults: any[] = []
    for (const resource of resources) {
      if (resource.status !== 'ACTIVE') continue

      const geo = geoMap.get(resource.id)
      if (!geo) continue

      // 计算两点间距离（简化的 Haversine 公式）
      const R = 6371
      const dLat = (lat - geo.latitude) * Math.PI / 180
      const dLng = (lng - geo.longitude) * Math.PI / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(geo.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distanceKm = R * c

      // 距离过滤
      if (radius_km && distanceKm > radius_km) continue

      // 评分过滤
      if (min_rating && resource.avgRating < min_rating) continue

      // 资源类型过滤
      if (resource_type && resource.resourceType !== resource_type) continue

      // 分类过滤
      if (category_id && resource.categoryId !== category_id) continue

      // 景区过滤
      if (scenic_area && resource.scenicArea !== scenic_area) continue

      // 关键词过滤
      if (keyword) {
        const k = (keyword as string).toLowerCase()
        const nameMatch = resource.name.toLowerCase().includes(k)
        const descMatch = resource.description?.toLowerCase().includes(k)
        const scenicMatch = resource.scenicArea?.toLowerCase().includes(k)
        const cityMatch = resource.city.toLowerCase().includes(k)
        
        if (!nameMatch && !descMatch && !scenicMatch && !cityMatch) continue
      }

      // 获取分销链接
      const links = linksMap.get(resource.id) || []

      allResults.push({
        resourceId: resource.id,
        name: resource.name,
        avatar: resource.avatar,
        resourceType: resource.resourceType,
        categoryName: categoryMap.get(resource.categoryId)?.name || '',
        distanceKm: Math.round(distanceKm * 100) / 100,
        address: geo.fullAddress,
        city: resource.city,
        district: resource.district,
        scenicArea: resource.scenicArea,
        rating: resource.avgRating,
        reviewCount: resource.reviewCount,
        isVerified: resource.isVerified,
        distributionLinks: links.map(l => ({
          linkType: l.linkType,
          linkUrl: l.linkUrl,
          platform: l.platform,
          commissionRate: l.commissionRate ? Number(l.commissionRate) : null
        })),
        landingUrl: `/r/${resource.id}`,
        lastUpdated: resource.updatedAt
      })
    }

    // 按距离排序
    allResults.sort((a, b) => a.distanceKm - b.distanceKm)

    const total = allResults.length
    const resultItems = allResults.slice(offset || 0, (offset || 0) + limit)

    res.json(success({
      query: {
        lat,
        lng,
        radius_km,
        resource_type,
        category_id,
        keyword,
        scenic_area
      },
      results: resultItems,
      total,
      page: Math.floor((offset || 0) / limit) + 1,
      pageSize: limit
    }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[GeoQuery Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '查询失败'))
  }
})

// ── 平台内自然语言搜索 ──
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, lat, lng, radius_km, resource_type, scenic_area } = req.query

    if (!q) {
      res.status(400).json(error('VALIDATION_ERROR', '请输入搜索关键词'))
      return
    }

    // TODO: 调用豆包 API 进行语义理解
    // 目前简化处理：直接作为 keyword + 默认位置查询

    // 转发到 GEO 查询逻辑
    req.query = {
      ...req.query,
      lat: String(lat || 39.9042),
      lng: String(lng || 116.4074),
      radius_km: String(radius_km || 10),
      keyword: String(q),
      limit: '20',
      offset: '0'
    }

    // 内部调用查询处理
    const params = geoQuerySchema.parse(req.query)
    const { lat: qLat, lng: qLng, radius_km: rKm, resource_type: rType, category_id, keyword, scenic_area: sArea, min_rating, limit, offset } = params

    const resources: any[] = await prisma.tourismResource.findMany()
    const geos: any[] = await prisma.geoLocation.findMany()
    const categories: any[] = await prisma.resourceCategory.findMany()
    const distributionLinks: any[] = await prisma.distributionLink.findMany({
      where: { isActive: true }
    })

    const geoMap = new Map(geos.map(g => [g.resourceId, g]))
    const categoryMap = new Map(categories.map(c => [c.id, c]))
    const linksMap = new Map<string, any[]>()
    
    for (const link of distributionLinks) {
      if (!linksMap.has(link.resourceId)) {
        linksMap.set(link.resourceId, [])
      }
      linksMap.get(link.resourceId)!.push(link)
    }

    const allResults: any[] = []
    for (const resource of resources) {
      if (resource.status !== 'ACTIVE') continue
      const geo = geoMap.get(resource.id)
      if (!geo) continue

      const dLat = (qLat - geo.latitude) * Math.PI / 180
      const dLng = (qLng - geo.longitude) * Math.PI / 180
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(geo.latitude * Math.PI / 180) * Math.cos(qLat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const distanceKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      if (rKm && distanceKm > rKm) continue
      if (min_rating && resource.avgRating < min_rating) continue
      if (rType && resource.resourceType !== rType) continue
      if (category_id && resource.categoryId !== category_id) continue
      if (sArea && resource.scenicArea !== sArea) continue

      if (keyword) {
        const k = String(keyword).toLowerCase()
        const nameMatch = resource.name.toLowerCase().includes(k)
        const descMatch = resource.description?.toLowerCase().includes(k)
        const scenicMatch = resource.scenicArea?.toLowerCase().includes(k)
        const cityMatch = resource.city.toLowerCase().includes(k)
        
        if (!nameMatch && !descMatch && !scenicMatch && !cityMatch) continue
      }

      const links = linksMap.get(resource.id) || []

      allResults.push({
        resourceId: resource.id,
        name: resource.name,
        avatar: resource.avatar,
        resourceType: resource.resourceType,
        categoryName: categoryMap.get(resource.categoryId)?.name || '',
        distanceKm: Math.round(distanceKm * 100) / 100,
        address: geo.fullAddress,
        city: resource.city,
        district: resource.district,
        scenicArea: resource.scenicArea,
        rating: resource.avgRating,
        reviewCount: resource.reviewCount,
        isVerified: resource.isVerified,
        distributionLinks: links.map(l => ({
          linkType: l.linkType,
          linkUrl: l.linkUrl,
          platform: l.platform,
          commissionRate: l.commissionRate ? Number(l.commissionRate) : null
        })),
        landingUrl: `/r/${resource.id}`,
        lastUpdated: resource.updatedAt
      })
    }

    allResults.sort((a, b) => a.distanceKm - b.distanceKm)
    const total = allResults.length
    const resultItems = allResults.slice(0, 20)

    res.json(success({
      query: { lat: qLat, lng: qLng, radius_km: rKm, keyword, resource_type: rType },
      results: resultItems,
      total,
      page: 1,
      pageSize: 20
    }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Search Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '搜索失败'))
  }
})

export default router