import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/config/database'
import { success, error } from '@/utils/response'
import { authenticate } from '@/middleware/auth'
import { PlatformAdapterFactory } from '../distribution/platforms'

const router = Router()

// ── 获取平台授权 URL ──
router.get('/authorize/:platform', authenticate, async (req: Request, res: Response) => {
  try {
    const providerId = req.providerId!
    const { platform } = req.params
    const platformUpper = platform.toUpperCase()

    // 平台落地页是内部平台，不需要外部OAuth授权，直接绑定成功
    if (platformUpper === 'LANDING_PAGE') {
      // 创建或更新平台账号记录
      await prisma.platformAccount.upsert({
        where: {
          providerId_platform: {
            providerId,
            platform: 'LANDING_PAGE'
          }
        },
        update: {
          status: 'ACTIVE',
          accessToken: 'internal_token',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        create: {
          providerId,
          platform: 'LANDING_PAGE',
          openId: `internal_${providerId}`,
          accessToken: 'internal_token',
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }
      })

      res.json(success({ authUrl: '/dashboard?success=平台落地页绑定成功' }))
      return
    }

    const adapter = PlatformAdapterFactory.get(platformUpper)

    if (!adapter) {
      res.status(400).json(error('INVALID_PLATFORM', '不支持的平台'))
      return
    }

    const authUrl = adapter.getAuthorizationUrl(providerId)
    res.json(success({ authUrl }))
  } catch (err) {
    console.error('[Get Auth URL Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取授权链接失败'))
  }
})

// ── 处理平台回调 ──
router.get('/callback/:platform', async (req: Request, res: Response) => {
  try {
    const { platform } = req.params
    const { code, state } = req.query

    if (!code) {
      return res.redirect('/dashboard?error=授权失败')
    }

    const adapter = PlatformAdapterFactory.get(platform.toUpperCase())
    if (!adapter) {
      return res.redirect('/dashboard?error=不支持的平台')
    }

    try {
      const account = await adapter.handleCallback(code as string)

      // 查找服务者（通过 state 传递 providerId，或从数据库查找）
      // 简化处理：假设 state 包含 providerId
      const providerId = state ? (state as string).split(':')[1] : undefined

      if (providerId) {
        // 保存平台账号到数据库
        await prisma.platformAccount.upsert({
          where: {
            providerId_platform: {
              providerId,
              platform: platform.toUpperCase() as any
            }
          },
          update: {
            openId: account.openId,
            accessToken: account.accessToken,
            refreshToken: account.refreshToken,
            expiresAt: account.expiresAt,
            status: 'ACTIVE'
          },
          create: {
            providerId,
            platform: platform.toUpperCase() as any,
            openId: account.openId,
            accessToken: account.accessToken,
            refreshToken: account.refreshToken,
            expiresAt: account.expiresAt,
            status: 'ACTIVE'
          }
        })
      }

      res.redirect('/dashboard?success=授权成功')
    } catch (err) {
      console.error('[Callback Error]', err)
      res.redirect('/dashboard?error=授权失败')
    }
  } catch (err) {
    console.error('[Callback Error]', err)
    res.redirect('/dashboard?error=授权失败')
  }
})

// ── 获取已绑定的平台账号列表 ──
router.get('/accounts', authenticate, async (req: Request, res: Response) => {
  try {
    const providerId = req.providerId!

    const accounts = await prisma.platformAccount.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' }
    })

    res.json(success(accounts.map(a => ({
      id: a.id,
      platform: a.platform,
      status: a.status,
      createdAt: a.createdAt,
      expiresAt: a.expiresAt
    }))))
  } catch (err) {
    console.error('[Get Accounts Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取账号列表失败'))
  }
})

// ── 解绑平台账号 ──
router.delete('/accounts/:platform', authenticate, async (req: Request, res: Response) => {
  try {
    const providerId = req.providerId!
    const { platform } = req.params

    const account = await prisma.platformAccount.findFirst({
      where: { providerId, platform: platform.toUpperCase() as any }
    })

    if (!account) {
      res.status(404).json(error('NOT_FOUND', '账号不存在'))
      return
    }

    // 软删除（标记为 REVOKED）
    await prisma.platformAccount.update({
      where: { id: account.id },
      data: { status: 'REVOKED' }
    })

    res.json(success({ message: '解绑成功' }))
  } catch (err) {
    console.error('[Delete Account Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '解绑失败'))
  }
})

// ── 分发文章到平台 ──
const distributeSchema = z.object({
  articleId: z.string(),
  platform: z.string()
})

router.post('/distribute', authenticate, async (req: Request, res: Response) => {
  try {
    const providerId = req.providerId!
    const { articleId, platform } = distributeSchema.parse(req.body)

    // 获取文章
    const article = await prisma.contentArticle.findFirst({
      where: { id: articleId, resourceId: providerId }
    })

    if (!article) {
      res.status(404).json(error('NOT_FOUND', '文章不存在'))
      return
    }

    // 平台落地页（LANDING_PAGE）不需要绑定外部账号，直接发布到内部落地页
    const platformUpper = platform.toUpperCase()
    const isLandingPage = platformUpper === 'LANDING_PAGE'

    if (!isLandingPage) {
      // 获取平台账号
      const account = await prisma.platformAccount.findFirst({
        where: { providerId, platform: platformUpper as any, status: 'ACTIVE' }
      })

      if (!account) {
        res.status(400).json(error('NO_ACCOUNT', '未绑定该平台账号'))
        return
      }

      // 获取平台适配器
      const adapter = PlatformAdapterFactory.get(platformUpper)
      if (!adapter) {
        res.status(400).json(error('INVALID_PLATFORM', '不支持的平台'))
        return
      }

      // 检查 Token 是否过期，需要刷新
      let accessToken = account.accessToken
      if (account.expiresAt && new Date(account.expiresAt) < new Date()) {
        if (account.refreshToken) {
          const refreshed = await adapter.refreshToken(account.refreshToken)
          accessToken = refreshed.accessToken
          
          // 更新数据库中的 Token
          await prisma.platformAccount.update({
            where: { id: account.id },
            data: {
              accessToken: refreshed.accessToken,
              refreshToken: refreshed.refreshToken,
              expiresAt: refreshed.expiresAt
            }
          })
        } else {
          res.status(401).json(error('TOKEN_EXPIRED', 'Token 已过期，请重新授权'))
          return
        }
      }

      // 发布文章
      const result = await adapter.publishArticle({
        title: article.title,
        content: article.content,
        tags: article.seoKeywords
      }, accessToken)

      // 创建分发记录
      await prisma.distributionRecord.create({
        data: {
          articleId: article.id,
          platform: platformUpper as any,
          externalUrl: result.externalUrl,
          status: result.success ? 'SUCCESS' : 'FAILED',
          errorMsg: result.errorMessage
        }
      })

      // 更新文章状态
      if (result.success) {
        await prisma.contentArticle.update({
          where: { id: article.id },
          data: { status: 'PUBLISHED' }
        })
      }

      res.json(success({
        success: result.success,
        externalUrl: result.externalUrl,
        message: result.success ? '分发成功' : result.errorMessage
      }))
    } else {
      // 平台落地页：直接创建分发记录，标记为已发布
      // 落地页 URL 格式：/p/{providerId}/article/{articleId}
      const landingUrl = `/p/${providerId}/article/${articleId}`

      // 创建分发记录
      await prisma.distributionRecord.create({
        data: {
          articleId: article.id,
          platform: platformUpper as any,
          externalUrl: landingUrl,
          status: 'SUCCESS',
          isIndexed: true,
          viewCount: 0
        }
      })

      // 更新文章状态
      await prisma.contentArticle.update({
        where: { id: article.id },
        data: { status: 'PUBLISHED' }
      })

      res.json(success({
        success: true,
        externalUrl: landingUrl,
        message: '已发布到平台落地页',
        previewUrl: `${process.env.CORS_ORIGIN || 'http://localhost:5173'}${landingUrl}`
      }))
    }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Distribute Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '分发失败'))
  }
})

// ── 获取分发状态 ──
router.get('/distribute/status/:recordId', authenticate, async (req: Request, res: Response) => {
  try {
    const providerId = req.providerId!
    const { recordId } = req.params

    const record = await prisma.distributionRecord.findFirst({
      where: { id: recordId },
      include: { article: true }
    })

    if (!record) {
      res.status(404).json(error('NOT_FOUND', '分发记录不存在'))
      return
    }

    // 检查权限（简化处理）
    if (record.article.providerId !== providerId) {
      res.status(403).json(error('FORBIDDEN', '无权限访问'))
      return
    }

    res.json(success({
      id: record.id,
      platform: record.platform,
      externalUrl: record.externalUrl,
      status: record.status,
      viewCount: record.viewCount,
      isIndexed: record.isIndexed,
      distributedAt: record.distributedAt,
      articleTitle: record.article.title
    }))
  } catch (err) {
    console.error('[Get Distribution Status Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取分发状态失败'))
  }
})

export default router
