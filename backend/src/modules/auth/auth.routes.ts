import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/config/database'
import { generateTokens, verifyRefreshToken } from '@/utils/jwt'
import { success, error } from '@/utils/response'
import { generateCode, maskPhone } from '@/utils/common'

const router = Router()

// ── 发送验证码 ──
const sendCodeSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  purpose: z.enum(['REGISTER', 'LOGIN'])
})

router.post('/send-code', async (req: Request, res: Response) => {
  try {
    const { phone, purpose } = sendCodeSchema.parse(req.body)

    // 检查频率限制（Redis 缓存）
    // TODO: 实现 Redis 限流

    // 生成 6 位验证码
    const code = generateCode()

    // 保存到数据库（1小时内有效）
    await prisma.smsCode.create({
      data: {
        phone,
        code,
        purpose,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
      }
    })

    // TODO: 调用阿里云短信 API 发送真实验证码
    // 目前仅在开发环境输出到日志
    console.log(`[SMS] ${phone} - ${code}`)

    res.json(success({ message: '验证码已发送', maskedPhone: maskPhone(phone) }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[SendCode Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '发送验证码失败'))
  }
})

// ── 验证验证码并登录/注册 ──
const verifyCodeSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/),
  code: z.string().length(6, '验证码为6位数字')
})

router.post('/verify-code', async (req: Request, res: Response) => {
  try {
    const { phone, code } = verifyCodeSchema.parse(req.body)

    // 测试模式：允许使用固定验证码 123456 进行登录（开发环境）
    const isTestMode = process.env.NODE_ENV === 'development' || process.env.TEST_MODE === 'true'
    const isTestCode = code === '123456'
    
    // 查找最新未使用的验证码
    let smsCode = null
    if (!isTestMode || !isTestCode) {
      smsCode = await prisma.smsCode.findFirst({
        where: {
          phone,
          code,
          usedAt: null,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    if (!smsCode && !(isTestMode && isTestCode)) {
      res.status(401).json(error('INVALID_CODE', '验证码错误或已过期'))
      return
    }

    // 标记验证码已使用（测试模式跳过）
    if (smsCode) {
      await prisma.smsCode.update({
        where: { id: smsCode.id },
        data: { usedAt: new Date() }
      })
    }

    // 先查找文旅资源（优先）
    let resource = await prisma.tourismResource.findUnique({ where: { phone } })
    
    // 如果没有找到文旅资源，查找普通服务者
    let provider = resource ? null : await prisma.provider.findUnique({ where: { phone } })

    // 如果都没有，创建新的服务者（用于新用户注册）
    if (!resource && !provider) {
      provider = await prisma.provider.create({
        data: {
          phone,
          nickname: `用户${phone.slice(-4)}`,
          city: ''
        }
      })
    }

    // 确定使用哪个ID（文旅资源优先）
    const targetId = resource?.id || provider!.id
    const isResource = !!resource

    // 生成 JWT
    const tokens = generateTokens({
      providerId: targetId,
      phone: phone,
      isResource: isResource
    })

    // 返回用户信息（优先返回文旅资源）
    const userData = resource ? {
      id: resource.id,
      name: resource.name,
      nickname: resource.name,
      avatar: resource.avatar,
      city: resource.city,
      district: resource.district,
      isVerified: resource.isVerified,
      isOnboarded: !!resource.city,
      resourceType: resource.resourceType,
      categoryId: resource.categoryId
    } : {
      id: provider!.id,
      nickname: provider!.nickname,
      avatar: provider!.avatar,
      city: provider!.city,
      isVerified: provider!.isVerified,
      isOnboarded: !!provider!.city
    }

    res.json(success({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      provider: userData,
      isResource: isResource
    }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[VerifyCode Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '验证失败'))
  }
})

// ── 刷新 Token ──
const refreshSchema = z.object({
  refreshToken: z.string()
})

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body)

    const decoded = verifyRefreshToken(refreshToken)
    if (!decoded) {
      res.status(401).json(error('INVALID_TOKEN', 'Token 无效或已过期'))
      return
    }

    // 重新生成 Token
    const tokens = generateTokens({
      providerId: decoded.providerId,
      phone: decoded.phone
    })

    res.json(success({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }))
  } catch (err: any) {
    res.status(401).json(error('INVALID_TOKEN', 'Token 无效或已过期'))
  }
})

// ── 登出 ──
router.post('/logout', async (req: Request, res: Response) => {
  // TODO: 将 refreshToken 加入 Redis 黑名单
  res.json(success({ message: '已退出登录' }))
})

export default router
