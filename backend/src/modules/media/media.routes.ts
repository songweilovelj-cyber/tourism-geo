import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/config/database'
import { success, error } from '@/utils/response'
import { authenticate } from '@/middleware/auth'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

// 配置文件上传
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, `media-${uniqueSuffix}${ext}`)
  }
})

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('不支持的文件类型'))
  }
}

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
})

// ── 上传媒体文件 ──
router.post('/', authenticate, upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const resourceId = req.providerId!
    const files = req.files as Express.Multer.File[]
    
    if (!files || files.length === 0) {
      res.status(400).json(error('VALIDATION_ERROR', '请选择要上传的文件'))
      return
    }

    const mediaList = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const isImage = file.mimetype.startsWith('image/')
      
      // 生成访问URL
      const url = `/uploads/${file.filename}`
      
      // 保存到数据库
      const media = await prisma.resourceMedia.create({
        data: {
          resourceId,
          mediaType: isImage ? 'IMAGE' : 'VIDEO',
          url,
          fileName: file.originalname,
          fileSize: file.size,
          sortOrder: i,
          isPrimary: i === 0 // 第一个上传的文件设为主图
        }
      })

      mediaList.push({
        id: media.id,
        mediaType: media.mediaType,
        url,
        fileName: media.fileName,
        fileSize: media.fileSize,
        sortOrder: media.sortOrder,
        isPrimary: media.isPrimary
      })
    }

    res.json(success({
      message: `成功上传 ${mediaList.length} 个文件`,
      files: mediaList
    }))
  } catch (err: any) {
    console.error('[Upload Media Error]', err)
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json(error('FILE_TOO_LARGE', '文件大小超过限制（最大50MB）'))
      return
    }
    res.status(500).json(error('INTERNAL_ERROR', '上传失败'))
  }
})

// ── 获取文旅资源的媒体文件列表 ──
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const resourceId = req.providerId!

    const mediaList = await prisma.resourceMedia.findMany({
      where: { resourceId },
      orderBy: { sortOrder: 'asc' }
    })

    res.json(success(mediaList.map(m => ({
      id: m.id,
      mediaType: m.mediaType,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl,
      fileName: m.fileName,
      fileSize: m.fileSize,
      width: m.width,
      height: m.height,
      duration: m.duration,
      title: m.title,
      sortOrder: m.sortOrder,
      isPrimary: m.isPrimary,
      createdAt: m.createdAt
    }))))
  } catch (err) {
    console.error('[Get Media List Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取媒体文件列表失败'))
  }
})

// ── 获取公开的媒体文件列表（用于资源详情页） ──
router.get('/resource/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const mediaList = await prisma.resourceMedia.findMany({
      where: { resourceId: id },
      orderBy: { sortOrder: 'asc' }
    })

    res.json(success(mediaList.map(m => ({
      id: m.id,
      mediaType: m.mediaType,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl,
      title: m.title,
      isPrimary: m.isPrimary
    }))))
  } catch (err) {
    console.error('[Get Resource Media Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '获取媒体文件失败'))
  }
})

// ── 更新媒体文件信息 ──
const updateMediaSchema = z.object({
  title: z.string().max(100).optional().nullable(),
  sortOrder: z.number().optional(),
  isPrimary: z.boolean().optional()
})

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const resourceId = req.providerId!
    const { id } = req.params
    const data = updateMediaSchema.parse(req.body)

    // 验证归属
    const existing = await prisma.resourceMedia.findFirst({
      where: { id, resourceId }
    })

    if (!existing) {
      res.status(404).json(error('NOT_FOUND', '媒体文件不存在'))
      return
    }

    // 如果设置为主图，需要取消其他主图
    if (data.isPrimary) {
      await prisma.resourceMedia.updateMany({
        where: { resourceId, isPrimary: true },
        data: { isPrimary: false }
      })
    }

    const media = await prisma.resourceMedia.update({
      where: { id },
      data
    })

    res.json(success({
      id: media.id,
      title: media.title,
      sortOrder: media.sortOrder,
      isPrimary: media.isPrimary
    }))
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json(error('VALIDATION_ERROR', err.errors[0].message))
      return
    }
    console.error('[Update Media Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '更新失败'))
  }
})

// ── 删除媒体文件 ──
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const resourceId = req.providerId!
    const { id } = req.params

    const media = await prisma.resourceMedia.findFirst({
      where: { id, resourceId }
    })

    if (!media) {
      res.status(404).json(error('NOT_FOUND', '媒体文件不存在'))
      return
    }

    // 删除文件
    const filePath = path.join(uploadDir, path.basename(media.url))
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // 删除数据库记录
    await prisma.resourceMedia.delete({
      where: { id }
    })

    res.json(success({ message: '删除成功' }))
  } catch (err) {
    console.error('[Delete Media Error]', err)
    res.status(500).json(error('INTERNAL_ERROR', '删除失败'))
  }
})

export default router