import dotenv from 'dotenv'
dotenv.config()

import { createApp } from './app'
import { connectDatabase } from './config/database'

// 导入平台适配器以自动注册
import '@/modules/distribution/platforms'

const PORT = process.env.PORT || 3001

async function bootstrap() {
  try {
    // 连接数据库
    await connectDatabase()
    console.log('[Database] Connected successfully')

    // 创建并启动 Express 应用
    const app = createApp()

    app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`)
      console.log(`[Environment] ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    console.error('[Bootstrap Error]', error)
    process.exit(1)
  }
}

bootstrap()
