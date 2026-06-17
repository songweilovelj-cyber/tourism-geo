import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '@/utils/jwt'

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      providerId?: string
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '请先登录'
      }
    })
    return
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader

  const decoded = verifyAccessToken(token)

  if (!decoded) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token 无效或已过期'
      }
    })
    return
  }

  req.providerId = decoded.providerId
  next()
}

// 可选认证（不强制登录）
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (authHeader) {
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader

    const decoded = verifyAccessToken(token)
    if (decoded) {
      req.providerId = decoded.providerId
    }
  }

  next()
}
