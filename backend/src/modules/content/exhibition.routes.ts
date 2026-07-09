import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/config/database'
import { success, error } from '@/utils/response'
import { authenticate } from '@/middleware/auth'
import { doubaoClient } from './llm/doubao.client'
import { generateExhibitionPlanPrompt, ExhibitionPlanInput, exhibitionPlanSystemPrompt } from './llm/exhibition.prompts'
import { getThemeKnowledge, getAllThemes, themeKnowledgeBase } from '@/data/themeKnowledgeBase'

const router = Router()

// ── 获取所有主题列表 ──
router.get('/themes', authenticate, async (req: Request, res: Response) => {
  try {
    const themes = getAllThemes()
    const themeList = themes.map(themeName => {
      const theme = themeKnowledgeBase[themeName]
      return {
        themeId: theme.themeId,
        themeName: theme.themeName,
        coreStory: theme.coreStory,
        mustHaveCount: theme.mustHaveArtifacts.length,
        recommendedCount: theme.recommendedArtifacts.length,
        artifactCount: theme.artifactPool.length
      }
    })
    res.json(success({ themes: themeList }))
  } catch (err) {
    console.error('[Get Themes Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取主题列表失败'))
  }
})

// ── 获取主题知识库详情 ──
router.get('/themes/:themeName', authenticate, async (req: Request, res: Response) => {
  try {
    const { themeName } = req.params
    const theme = getThemeKnowledge(decodeURIComponent(themeName))
    
    if (!theme) {
      res.status(404).json(error('NOT_FOUND', '主题知识库不存在'))
      return
    }
    
    res.json(success(theme))
  } catch (err) {
    console.error('[Get Theme Knowledge Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取主题知识库失败'))
  }
})

// ── 创建策展方案 ──
const createPlanSchema = z.object({
  theme: z.string().min(1, '展览主题不能为空'),
  name: z.string().min(1, '展览名称不能为空'),
  organizer: z.string().optional(),
  venue: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  area: z.number().optional(),
  planType: z.string().min(1, '展览类型不能为空'),
  targetAudience: z.string().min(1, '目标受众不能为空'),
  targetAudienceOther: z.string().optional(),
  educationGoal: z.string().optional()
})

router.post('/plans', authenticate, async (req: Request, res: Response) => {
  try {
    const phone = req.providerId!
    const data = createPlanSchema.parse(req.body)

    // 创建策展方案主记录
    const plan = await prisma.exhibitionPlan.create({
      data: {
        phone,
        status: 'DRAFT',
        basicInfo: {
          create: {
            theme: data.theme,
            name: data.name,
            organizer: data.organizer,
            venue: data.venue,
            startDate: data.startDate,
            endDate: data.endDate,
            area: data.area
          }
        },
        positioning: {
          create: {
            planType: data.planType,
            targetAudience: data.targetAudience,
            targetAudienceOther: data.targetAudienceOther,
            educationGoal: data.educationGoal
          }
        }
      },
      include: {
        basicInfo: true,
        positioning: true,
        zones: true,
        coreExhibits: true,
        auxiliaryExhibits: true,
        displayDesign: true,
        educationPlan: true
      }
    })

    res.json(success({
      id: plan.id,
      theme: plan.basicInfo?.theme,
      name: plan.basicInfo?.name,
      status: plan.status,
      createdAt: plan.createdAt
    }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Create Plan Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '创建策展方案失败'))
  }
})

// ── 更新策展方案基本信息 ──
const updateBasicInfoSchema = z.object({
  theme: z.string().optional(),
  name: z.string().optional(),
  organizer: z.string().optional(),
  venue: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  area: z.number().optional()
})

router.put('/plans/:id/basic-info', authenticate, async (req: Request, res: Response) => {
  try {
    const phone = req.providerId!
    const { id } = req.params
    const data = updateBasicInfoSchema.parse(req.body)

    // 验证所有权
    const existingPlan = await prisma.exhibitionPlan.findFirst({
      where: { id, phone }
    })

    if (!existingPlan) {
      res.status(404).json(error('NOT_FOUND', '策展方案不存在'))
      return
    }

    // 更新基本信息
    await prisma.exhibitionBasicInfo.update({
      where: { planId: id },
      data
    })

    res.json(success({ message: '更新成功' }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Update Basic Info Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '更新失败'))
  }
})

// ── 更新展览定位 ──
const updatePositioningSchema = z.object({
  planType: z.string().optional(),
  targetAudience: z.string().optional(),
  targetAudienceOther: z.string().optional(),
  educationGoal: z.string().optional()
})

router.put('/plans/:id/positioning', authenticate, async (req: Request, res: Response) => {
  try {
    const phone = req.providerId!
    const { id } = req.params
    const data = updatePositioningSchema.parse(req.body)

    const existingPlan = await prisma.exhibitionPlan.findFirst({
      where: { id, phone }
    })

    if (!existingPlan) {
      res.status(404).json(error('NOT_FOUND', '策展方案不存在'))
      return
    }

    await prisma.exhibitionPositioning.update({
      where: { planId: id },
      data
    })

    res.json(success({ message: '更新成功' }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Update Positioning Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '更新失败'))
  }
})

// ── 添加/更新展区 ──
const upsertZoneSchema = z.object({
  zones: z.array(z.object({
    id: z.string().optional(),
    zoneNumber: z.number(),
    name: z.string(),
    subtitle: z.string().optional(),
    timePeriod: z.string().optional(),
    narrative: z.string().optional()
  }))
})

router.put('/plans/:id/zones', authenticate, async (req: Request, res: Response) => {
  try {
    const phone = req.providerId!
    const { id } = req.params
    const { zones } = upsertZoneSchema.parse(req.body)

    const existingPlan = await prisma.exhibitionPlan.findFirst({
      where: { id, phone }
    })

    if (!existingPlan) {
      res.status(404).json(error('NOT_FOUND', '策展方案不存在'))
      return
    }

    // 删除现有展区
    await prisma.exhibitionZone.deleteMany({
      where: { planId: id }
    })

    // 创建新展区
    const createdZones = await Promise.all(
      zones.map(zone =>
        prisma.exhibitionZone.create({
          data: {
            planId: id,
            zoneNumber: zone.zoneNumber,
            name: zone.name,
            subtitle: zone.subtitle,
            timePeriod: zone.timePeriod,
            narrative: zone.narrative
          }
        })
      )
    )

    res.json(success({
      zones: createdZones.map(z => ({
        id: z.id,
        zoneNumber: z.zoneNumber,
        name: z.name
      }))
    }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Update Zones Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '更新展区失败'))
  }
})

// ── 添加/更新核心展品 ──
const upsertCoreExhibitSchema = z.object({
  exhibits: z.array(z.object({
    id: z.string().optional(),
    zoneId: z.string().optional(),
    exhibitName: z.string(),
    era: z.string().optional(),
    origin: z.string().optional(),
    material: z.string().optional(),
    artifactLevel: z.string().optional(),
    description: z.string().optional(),
    significance: z.string().optional(),
    displayMethod: z.string().optional(),
    positionDesign: z.string().optional()
  }))
})

router.put('/plans/:id/core-exhibits', authenticate, async (req: Request, res: Response) => {
  try {
    const phone = req.providerId!
    const { id } = req.params
    const { exhibits } = upsertCoreExhibitSchema.parse(req.body)

    const existingPlan = await prisma.exhibitionPlan.findFirst({
      where: { id, phone }
    })

    if (!existingPlan) {
      res.status(404).json(error('NOT_FOUND', '策展方案不存在'))
      return
    }

    // 删除现有核心展品
    await prisma.exhibitionCoreExhibit.deleteMany({
      where: { planId: id }
    })

    // 创建新核心展品
    const createdExhibits = await Promise.all(
      exhibits.map(exhibit =>
        prisma.exhibitionCoreExhibit.create({
          data: {
            planId: id,
            zoneId: exhibit.zoneId,
            exhibitName: exhibit.exhibitName,
            era: exhibit.era,
            origin: exhibit.origin,
            material: exhibit.material,
            artifactLevel: exhibit.artifactLevel,
            description: exhibit.description,
            significance: exhibit.significance,
            displayMethod: exhibit.displayMethod,
            positionDesign: exhibit.positionDesign
          }
        })
      )
    )

    res.json(success({
      exhibits: createdExhibits.map(e => ({
        id: e.id,
        exhibitName: e.exhibitName,
        era: e.era,
        artifactLevel: e.artifactLevel
      }))
    }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Update Core Exhibits Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '更新核心展品失败'))
  }
})

// ── 添加/更新辅助展品 ──
const upsertAuxiliaryExhibitSchema = z.object({
  exhibits: z.array(z.object({
    id: z.string().optional(),
    zoneId: z.string().optional(),
    exhibitName: z.string(),
    era: z.string().optional(),
    origin: z.string().optional(),
    material: z.string().optional(),
    artifactLevel: z.string().optional(),
    description: z.string().optional(),
    isReplica: z.boolean().optional()
  }))
})

router.put('/plans/:id/auxiliary-exhibits', authenticate, async (req: Request, res: Response) => {
  try {
    const phone = req.providerId!
    const { id } = req.params
    const { exhibits } = upsertAuxiliaryExhibitSchema.parse(req.body)

    const existingPlan = await prisma.exhibitionPlan.findFirst({
      where: { id, phone }
    })

    if (!existingPlan) {
      res.status(404).json(error('NOT_FOUND', '策展方案不存在'))
      return
    }

    // 删除现有辅助展品
    await prisma.exhibitionAuxiliaryExhibit.deleteMany({
      where: { planId: id }
    })

    // 创建新辅助展品
    const createdExhibits = await Promise.all(
      exhibits.map(exhibit =>
        prisma.exhibitionAuxiliaryExhibit.create({
          data: {
            planId: id,
            zoneId: exhibit.zoneId,
            exhibitName: exhibit.exhibitName,
            era: exhibit.era,
            origin: exhibit.origin,
            material: exhibit.material,
            artifactLevel: exhibit.artifactLevel,
            description: exhibit.description,
            isReplica: exhibit.isReplica
          }
        })
      )
    )

    res.json(success({
      exhibits: createdExhibits.map(e => ({
        id: e.id,
        exhibitName: e.exhibitName,
        era: e.era,
        artifactLevel: e.artifactLevel
      }))
    }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Update Auxiliary Exhibits Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '更新辅助展品失败'))
  }
})

// ── 更新展陈设计 ──
const updateDisplayDesignSchema = z.object({
  totalArea: z.number().optional(),
  layoutType: z.string().optional(),
  trafficDesign: z.string().optional(),
  lightingDesign: z.string().optional(),
  multimediaConfig: z.string().optional()
})

router.put('/plans/:id/display-design', authenticate, async (req: Request, res: Response) => {
  try {
    const phone = req.providerId!
    const { id } = req.params
    const data = updateDisplayDesignSchema.parse(req.body)

    const existingPlan = await prisma.exhibitionPlan.findFirst({
      where: { id, phone }
    })

    if (!existingPlan) {
      res.status(404).json(error('NOT_FOUND', '策展方案不存在'))
      return
    }

    await prisma.exhibitionDisplayDesign.upsert({
      where: { planId: id },
      create: { planId: id, ...data },
      update: data
    })

    res.json(success({ message: '更新成功' }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Update Display Design Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '更新失败'))
  }
})

// ── 更新教育推广 ──
const updateEducationPlanSchema = z.object({
  activities: z.string().optional(),
  educationPrograms: z.string().optional(),
  publicityPlan: z.string().optional(),
  publications: z.string().optional()
})

router.put('/plans/:id/education', authenticate, async (req: Request, res: Response) => {
  try {
    const phone = req.providerId!
    const { id } = req.params
    const data = updateEducationPlanSchema.parse(req.body)

    const existingPlan = await prisma.exhibitionPlan.findFirst({
      where: { id, phone }
    })

    if (!existingPlan) {
      res.status(404).json(error('NOT_FOUND', '策展方案不存在'))
      return
    }

    await prisma.exhibitionEducation.upsert({
      where: { planId: id },
      create: { planId: id, ...data },
      update: data
    })

    res.json(success({ message: '更新成功' }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Update Education Plan Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '更新失败'))
  }
})

// ── 生成策展方案 ──
router.post('/plans/:id/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const phone = req.providerId!
    const { id } = req.params

    const plan = await prisma.exhibitionPlan.findFirst({
      where: { id, phone },
      include: {
        basicInfo: true,
        positioning: true,
        zones: {
          orderBy: { zoneNumber: 'asc' }
        },
        coreExhibits: true,
        auxiliaryExhibits: true,
        displayDesign: true,
        educationPlan: true
      }
    })

    if (!plan) {
      res.status(404).json(error('NOT_FOUND', '策展方案不存在'))
      return
    }

    // 更新状态为生成中
    await prisma.exhibitionPlan.update({
      where: { id },
      data: { status: 'GENERATING' }
    })

    // 构建输入数据
    const input: ExhibitionPlanInput = {
      basicInfo: {
        theme: plan.basicInfo?.theme || '',
        name: plan.basicInfo?.name || '',
        organizer: plan.basicInfo?.organizer,
        venue: plan.basicInfo?.venue,
        startDate: plan.basicInfo?.startDate,
        endDate: plan.basicInfo?.endDate,
        area: plan.basicInfo?.area
      },
      positioning: {
        planType: plan.positioning?.planType || '',
        targetAudience: plan.positioning?.targetAudience || '',
        targetAudienceOther: plan.positioning?.targetAudienceOther,
        educationGoal: plan.positioning?.educationGoal
      },
      zones: plan.zones.map(z => ({
        zoneNumber: z.zoneNumber,
        name: z.name,
        subtitle: z.subtitle || undefined,
        timePeriod: z.timePeriod || undefined,
        narrative: z.narrative || undefined
      })),
      coreExhibits: plan.coreExhibits.map(e => ({
        zoneId: e.zoneId || undefined,
        exhibitName: e.exhibitName,
        era: e.era || undefined,
        origin: e.origin || undefined,
        material: e.material || undefined,
        artifactLevel: e.artifactLevel || undefined,
        description: e.description || undefined,
        significance: e.significance || undefined,
        displayMethod: e.displayMethod || undefined,
        positionDesign: e.positionDesign || undefined
      })),
      auxiliaryExhibits: plan.auxiliaryExhibits.map(e => ({
        zoneId: e.zoneId || undefined,
        exhibitName: e.exhibitName,
        era: e.era || undefined,
        origin: e.origin || undefined,
        material: e.material || undefined,
        artifactLevel: e.artifactLevel || undefined,
        description: e.description || undefined,
        isReplica: e.isReplica
      })),
      displayDesign: plan.displayDesign ? {
        totalArea: plan.displayDesign.totalArea || undefined,
        layoutType: plan.displayDesign.layoutType || undefined,
        trafficDesign: plan.displayDesign.trafficDesign || undefined,
        lightingDesign: plan.displayDesign.lightingDesign || undefined,
        multimediaConfig: plan.displayDesign.multimediaConfig || undefined
      } : undefined,
      educationPlan: plan.educationPlan ? {
        activities: plan.educationPlan.activities || undefined,
        educationPrograms: plan.educationPlan.educationPrograms || undefined,
        publicityPlan: plan.educationPlan.publicityPlan || undefined,
        publications: plan.educationPlan.publications || undefined
      } : undefined
    }

    // 调用AI生成
    const prompt = generateExhibitionPlanPrompt(input)
    const result = await doubaoClient.generateText(
      prompt,
      exhibitionPlanSystemPrompt
    )

    // 保存生成的方案
    await prisma.exhibitionPlan.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        generatedContent: result,
        generatedAt: new Date()
      }
    })

    res.json(success({
      id,
      status: 'COMPLETED',
      content: result
    }))
  } catch (err: any) {
    console.error('[Generate Exhibition Plan Error]', err)
    
    // 更新状态为失败
    await prisma.exhibitionPlan.update({
      where: { id: req.params.id },
      data: { status: 'FAILED' }
    }).catch(() => {})

    res.status(500).json(error('INTERNAL_ERROR', '生成策展方案失败'))
  }
})

// ── 获取策展方案详情 ──
router.get('/plans/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const phone = req.providerId!
    const { id } = req.params

    const plan = await prisma.exhibitionPlan.findFirst({
      where: { id, phone },
      include: {
        basicInfo: true,
        positioning: true,
        zones: {
          orderBy: { zoneNumber: 'asc' }
        },
        coreExhibits: true,
        auxiliaryExhibits: true,
        displayDesign: true,
        educationPlan: true,
        parent: true
      }
    })

    if (!plan) {
      res.status(404).json(error('NOT_FOUND', '策展方案不存在'))
      return
    }

    res.json(success(plan))
  } catch (err) {
    console.error('[Get Plan Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取策展方案失败'))
  }
})

// ── 获取策展方案列表 ──
router.get('/plans', authenticate, async (req: Request, res: Response) => {
  try {
    const phone = req.providerId!
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    const [plans, total] = await Promise.all([
      prisma.exhibitionPlan.findMany({
        where: { phone },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          basicInfo: true,
          positioning: true,
          zones: true,
          coreExhibits: true
        }
      }),
      prisma.exhibitionPlan.count({ where: { phone } })
    ])

    res.json(success({
      plans: plans.map(plan => ({
        id: plan.id,
        theme: plan.basicInfo?.theme,
        name: plan.basicInfo?.name,
        planType: plan.positioning?.planType,
        zoneCount: plan.zones.length,
        coreExhibitCount: plan.coreExhibits.length,
        status: plan.status,
        version: plan.version,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
        generatedAt: plan.generatedAt
      })),
      total,
      page,
      pageSize: limit
    }))
  } catch (err) {
    console.error('[Get Plans Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取策展方案列表失败'))
  }
})

// ── 删除策展方案 ──
router.delete('/plans/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const phone = req.providerId!
    const { id } = req.params

    const plan = await prisma.exhibitionPlan.findFirst({
      where: { id, phone }
    })

    if (!plan) {
      res.status(404).json(error('NOT_FOUND', '策展方案不存在'))
      return
    }

    await prisma.exhibitionPlan.delete({ where: { id } })

    res.json(success({ message: '删除成功' }))
  } catch (err) {
    console.error('[Delete Plan Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '删除失败'))
  }
})

// ── 创建新版本 ──
router.post('/plans/:id/clone', authenticate, async (req: Request, res: Response) => {
  try {
    const phone = req.providerId!
    const { id } = req.params

    const originalPlan = await prisma.exhibitionPlan.findFirst({
      where: { id, phone },
      include: {
        basicInfo: true,
        positioning: true,
        zones: true,
        coreExhibits: true,
        auxiliaryExhibits: true,
        displayDesign: true,
        educationPlan: true
      }
    })

    if (!originalPlan) {
      res.status(404).json(error('NOT_FOUND', '策展方案不存在'))
      return
    }

    // 创建新版本
    const newVersion = originalPlan.version + 1
    
    const newPlan = await prisma.exhibitionPlan.create({
      data: {
        phone,
        status: 'DRAFT',
        version: newVersion,
        parentId: originalPlan.parentId || id,
        basicInfo: originalPlan.basicInfo ? {
          create: {
            theme: originalPlan.basicInfo.theme,
            name: originalPlan.basicInfo.name + ` (v${newVersion})`,
            organizer: originalPlan.basicInfo.organizer,
            venue: originalPlan.basicInfo.venue,
            startDate: originalPlan.basicInfo.startDate,
            endDate: originalPlan.basicInfo.endDate,
            area: originalPlan.basicInfo.area
          }
        } : undefined,
        positioning: originalPlan.positioning ? {
          create: {
            planType: originalPlan.positioning.planType,
            targetAudience: originalPlan.positioning.targetAudience,
            targetAudienceOther: originalPlan.positioning.targetAudienceOther,
            educationGoal: originalPlan.positioning.educationGoal
          }
        } : undefined,
        zones: {
          create: originalPlan.zones.map(z => ({
            zoneNumber: z.zoneNumber,
            name: z.name,
            subtitle: z.subtitle,
            timePeriod: z.timePeriod,
            narrative: z.narrative
          }))
        },
        coreExhibits: {
          create: originalPlan.coreExhibits.map(e => ({
            zoneId: e.zoneId,
            exhibitName: e.exhibitName,
            era: e.era,
            origin: e.origin,
            material: e.material,
            artifactLevel: e.artifactLevel,
            description: e.description,
            significance: e.significance,
            displayMethod: e.displayMethod,
            positionDesign: e.positionDesign
          }))
        },
        auxiliaryExhibits: {
          create: originalPlan.auxiliaryExhibits.map(e => ({
            zoneId: e.zoneId,
            exhibitName: e.exhibitName,
            era: e.era,
            origin: e.origin,
            material: e.material,
            artifactLevel: e.artifactLevel,
            description: e.description,
            isReplica: e.isReplica
          }))
        },
        displayDesign: originalPlan.displayDesign ? {
          create: {
            totalArea: originalPlan.displayDesign.totalArea,
            layoutType: originalPlan.displayDesign.layoutType,
            trafficDesign: originalPlan.displayDesign.trafficDesign,
            lightingDesign: originalPlan.displayDesign.lightingDesign,
            multimediaConfig: originalPlan.displayDesign.multimediaConfig
          }
        } : undefined,
        educationPlan: originalPlan.educationPlan ? {
          create: {
            activities: originalPlan.educationPlan.activities,
            educationPrograms: originalPlan.educationPlan.educationPrograms,
            publicityPlan: originalPlan.educationPlan.publicityPlan,
            publications: originalPlan.educationPlan.publications
          }
        } : undefined
      }
    })

    res.json(success({
      id: newPlan.id,
      version: newPlan.version,
      message: `已创建版本 ${newVersion}`
    }))
  } catch (err) {
    console.error('[Clone Plan Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '创建新版本失败'))
  }
})

export default router
