import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/config/database'
import { success, error } from '@/utils/response'
import { authenticate } from '@/middleware/auth'
import { doubaoClient } from './llm/doubao.client'
import { platformPrompts, extractGeoKeywords, ResourceInfo } from './llm/prompts'

const router = Router()

// ── 生成宣传文案 ──
const generateContentSchema = z.object({
  targetPlatforms: z.array(z.string()).min(1),
  customKeywords: z.array(z.string()).optional()
})

router.post('/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const resourceId = req.providerId!
    const { targetPlatforms, customKeywords = [] } = generateContentSchema.parse(req.body)

    // 获取文旅资源信息
    const resource = await prisma.tourismResource.findUnique({
      where: { id: resourceId },
      include: { 
        geoLocation: true,
        category: true
      }
    })

    if (!resource) {
      res.status(404).json(error('NOT_FOUND', '文旅资源不存在'))
      return
    }

    // 提取 GEO 关键词
    const geoKeywords = extractGeoKeywords(
      resource.city,
      resource.district || undefined,
      resource.scenicArea || undefined,
      resource.resourceType
    ).concat(customKeywords)

    // 构建资源信息
    const resourceInfo: ResourceInfo = {
      name: resource.name,
      description: resource.description || undefined,
      resourceType: resource.resourceType,
      categoryName: resource.category.name,
      city: resource.city,
      district: resource.district || undefined,
      scenicArea: resource.scenicArea || undefined,
      avgRating: resource.avgRating,
      reviewCount: resource.reviewCount,
      features: []
    }

    // 批量生成各平台内容
    const prompts: Array<{ platform: string; prompt: string; systemPrompt: string }> = []
    
    targetPlatforms.forEach(platform => {
      const config = platformPrompts[platform]
      if (config) {
        prompts.push({
          platform,
          prompt: config.generatePrompt(resourceInfo, geoKeywords),
          systemPrompt: config.systemPrompt
        })
      }
    })

    if (prompts.length === 0) {
      res.status(400).json(error('INVALID_PLATFORM', '未找到支持的平台'))
      return
    }

    // 调用豆包 API 生成内容
    const results = await doubaoClient.generateMultiPlatformContent(prompts)

    // 保存到数据库
    const articles: any[] = []
    for (const result of results) {
      const article = await prisma.contentArticle.create({
        data: {
          resourceId,
          targetPlatform: result.platform,
          title: result.title,
          content: result.content,
          seoKeywords: JSON.stringify(geoKeywords),
          geoKeywords: JSON.stringify(geoKeywords),
          status: 'DRAFT'
        }
      })
      articles.push(article)
    }

    res.json(success({
      articles: articles.map(a => ({
        id: a.id,
        targetPlatform: a.targetPlatform,
        title: a.title,
        content: a.content,
        status: a.status,
        generatedAt: a.generatedAt
      }))
    }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Content Generate Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '生成内容失败'))
  }
})

// ── 获取已生成的文章列表 ──
router.get('/articles', authenticate, async (req: Request, res: Response) => {
  try {
    const resourceId = req.providerId!
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20

    const [articles, total] = await Promise.all([
      prisma.contentArticle.findMany({
        where: { resourceId },
        orderBy: { generatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          distributions: true
        }
      }),
      prisma.contentArticle.count({ where: { resourceId } })
    ])

    res.json(success({
      articles: articles.map(a => ({
        id: a.id,
        targetPlatform: a.targetPlatform,
        title: a.title,
        content: a.content,
        status: a.status,
        generatedAt: a.generatedAt,
        distributions: (a.distributions || []).map(d => ({
          id: d.id,
          platform: d.platform,
          externalUrl: d.externalUrl,
          status: d.status,
          viewCount: d.viewCount,
          isIndexed: d.isIndexed
        }))
      })),
      total,
      page,
      pageSize: limit
    }))
  } catch (err) {
    console.error('[Get Articles Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取文章列表失败'))
  }
})

// ── 获取单篇文章详情 ──
router.get('/articles/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const resourceId = req.providerId!
    const { id } = req.params

    const article = await prisma.contentArticle.findFirst({
      where: { id, resourceId },
      include: { distributions: true }
    })

    if (!article) {
      res.status(404).json(error('NOT_FOUND', '文章不存在'))
      return
    }

    res.json(success({
      id: article.id,
      targetPlatform: article.targetPlatform,
      title: article.title,
      content: article.content,
      seoKeywords: article.seoKeywords,
      geoKeywords: article.geoKeywords,
      status: article.status,
      generatedAt: article.generatedAt,
      distributions: article.distributions.map(d => ({
        id: d.id,
        platform: d.platform,
        externalUrl: d.externalUrl,
        status: d.status,
        viewCount: d.viewCount,
        isIndexed: d.isIndexed,
        distributedAt: d.distributedAt
      }))
    }))
  } catch (err) {
    console.error('[Get Article Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取文章失败'))
  }
})

// ── 更新文章 ──
const updateArticleSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(['DRAFT', 'APPROVED', 'PUBLISHED']).optional()
})

router.put('/articles/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const resourceId = req.providerId!
    const { id } = req.params
    const data = updateArticleSchema.parse(req.body)

    const article = await prisma.contentArticle.findFirst({
      where: { id, resourceId }
    })

    if (!article) {
      res.status(404).json(error('NOT_FOUND', '文章不存在'))
      return
    }

    const updated = await prisma.contentArticle.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.status && { status: data.status })
      }
    })

    res.json(success({
      id: updated.id,
      title: updated.title,
      content: updated.content,
      status: updated.status
    }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Update Article Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '更新文章失败'))
  }
})

// ── 删除文章 ──
router.delete('/articles/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const resourceId = req.providerId!
    const { id } = req.params

    const article = await prisma.contentArticle.findFirst({
      where: { id, resourceId }
    })

    if (!article) {
      res.status(404).json(error('NOT_FOUND', '文章不存在'))
      return
    }

    await prisma.contentArticle.delete({ where: { id } })

    res.json(success({ message: '删除成功' }))
  } catch (err) {
    console.error('[Delete Article Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '删除失败'))
  }
})

// ── 获取支持的平台列表 ──
router.get('/platforms', async (_req: Request, res: Response) => {
  try {
    const platforms = await prisma.platformChannel.findMany()
    
    res.json(success(platforms.map(p => ({
      platform: p.platform,
      displayName: p.displayName,
      isLlmFriendly: p.isLlmFriendly
    }))))
  } catch (err) {
    console.error('[Get Platforms Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取平台列表失败'))
  }
})

export default router