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

    // 查找或创建服务者
    let provider = await prisma.provider.findUnique({ where: { phone } })

    if (!provider) {
      // 新用户注册
      provider = await prisma.provider.create({
        data: {
          phone,
          nickname: `用户${phone.slice(-4)}`,
          city: ''
        }
      })
    }

    // 生成 JWT
    const tokens = generateTokens({
      providerId: provider.id,
      phone: provider.phone
    })

    res.json(success({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      provider: {
        id: provider.id,
        nickname: provider.nickname,
        avatar: provider.avatar,
        city: provider.city,
        isVerified: provider.isVerified,
        isOnboarded: !!provider.city // 是否已完成入驻引导
      }
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
