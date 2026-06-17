import dotenv from 'dotenv'
dotenv.config()

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3001'),
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/geoservice'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'geoservice-secret-key-dev',
    accessExpiresIn: '7d',
    refreshExpiresIn: '30d'
  },
  aliyun: {
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || '',
    ossBucket: process.env.ALIYUN_OSS_BUCKET || '',
    ossRegion: process.env.ALIYUN_OSS_REGION || 'cn-beijing',
    smsSignName: process.env.ALIYUN_SMS_SIGN_NAME || '',
    smsTemplateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE || ''
  },
  amap: {
    webApiKey: process.env.AMAP_WEB_API_KEY || '',
    serverApiKey: process.env.AMAP_SERVER_API_KEY || ''
  },
  doubao: {
    apiKey: process.env.DOUBAO_API_KEY || '',
    apiSecret: process.env.DOUBAO_API_SECRET || '',
    model: process.env.DOUBAO_MODEL || 'doubao-pro-32k'
  },
  zhihu: {
    clientId: process.env.ZHIHU_CLIENT_ID || '',
    clientSecret: process.env.ZHIHU_CLIENT_SECRET || '',
    redirectUri: process.env.ZHIHU_REDIRECT_URI || 'http://localhost:3001/api/platforms/callback/zhihu'
  },
  xiaohongshu: {
    clientId: process.env.XIAOHONGSHU_CLIENT_ID || '',
    clientSecret: process.env.XIAOHONGSHU_CLIENT_SECRET || '',
    redirectUri: process.env.XIAOHONGSHU_REDIRECT_URI || 'http://localhost:3001/api/platforms/callback/xiaohongshu'
  },
  wechat: {
    appId: process.env.WECHAT_APP_ID || '',
    appSecret: process.env.WECHAT_APP_SECRET || '',
    redirectUri: process.env.WECHAT_REDIRECT_URI || 'http://localhost:3001/api/platforms/callback/wechat'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  }
}

export default config
