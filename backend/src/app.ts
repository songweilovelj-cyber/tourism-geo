import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { errorHandler } from '@/middleware/errorHandler'
import path from 'path'

// 导入路由
import authRoutes from '@/modules/auth/auth.routes'
import resourceRoutes from '@/modules/resource/resource.routes'  // 文旅资源路由
import categoryRoutes from '@/modules/category/category.routes'  // 分类路由
import geoRoutes from '@/modules/geo/geo.routes'
import contentRoutes from '@/modules/content/content.routes'
import platformRoutes from '@/modules/platform/platform.routes'
import distributionLinkRoutes from '@/modules/distribution-link/distribution.routes'  // 分销链接路由
import mediaRoutes from '@/modules/media/media.routes'  // 媒体文件路由

export function createApp(): Express {
  const app = express()

  // ── 中间件 ──
  app.use(helmet())
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  }))
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))

  // 请求日志（开发环境）
  if (process.env.NODE_ENV === 'development') {
    app.use((req: Request, _res: Response, next: NextFunction) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
      next()
    })
  }

  // ── 静态文件服务（上传的媒体文件） ──
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

  // ── API 路由 ──
  app.use('/api/auth', authRoutes)
  app.use('/api/resources', resourceRoutes)       // 文旅资源
  app.use('/api/categories', categoryRoutes)      // 分类
  app.use('/api/geo', geoRoutes)
  app.use('/api/content', contentRoutes)
  app.use('/api/platforms', platformRoutes)
  app.use('/api/distribution-links', distributionLinkRoutes)  // 分销链接
  app.use('/api/media', mediaRoutes)              // 媒体文件上传管理

  // ── 健康检查 ──
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), app: '文旅GEO服务平台' })
  })

  // ── 404 处理 ──
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '接口不存在'
      }
    })
  })

  // ── 全局错误处理 ──
  app.use(errorHandler)

  return app
}