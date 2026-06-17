// @ts-nocheck
// 小红书平台适配器
// 文档参考：https://open.xiaohongshu.com/docs/

import { PlatformAdapter, PlatformAccount, ArticleToPublish, PublishResult, TokenResult } from './base'
import { config } from '@/config'

export class XiaohongshuAdapter implements PlatformAdapter {
  platform = 'XIAOHONGSHU'
  displayName = '小红书'

  private clientId: string
  private clientSecret: string
  private redirectUri: string

  constructor() {
    this.clientId = config.xiaohongshu.clientId || ''
    this.clientSecret = config.xiaohongshu.clientSecret || ''
    this.redirectUri = config.xiaohongshu.redirectUri || 'http://localhost:3001/api/platforms/callback/xiaohongshu'
  }

  getAuthorizationUrl(providerId?: string): string {
    const state = providerId ? `provider:${providerId}` : 'STATE'
    
    const params = new URLSearchParams({
      app_id: this.clientId || 'demo_app_id',
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'content.write',
      state: state
    })
    
    // 如果没有配置 client_id，返回模拟授权 URL（用于开发测试）
    if (!this.clientId) {
      const mockCode = 'mock_xhs_code_' + Math.random().toString(36).substring(2, 10)
      return `${this.redirectUri}?code=${mockCode}&state=${state}`
    }
    
    return `https://api.xiaohongshu.com/api/sns/v1/oauth2/authorize?${params.toString()}`
  }

  async handleCallback(code: string): Promise<PlatformAccount> {
    // 模拟授权（开发环境）
    if (!this.clientId || !this.clientSecret) {
      return {
        platform: this.platform,
        openId: 'mock-xhs-openid-' + Math.random().toString(36).substring(2, 15),
        accessToken: 'mock-xhs-token-' + Math.random().toString(36).substring(2, 20),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    }

    // 实际调用小红书 API
    try {
      const response = await fetch('https://api.xiaohongshu.com/api/sns/v1/oauth2/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: this.clientId,
          app_secret: this.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri
        })
      })

      const data = await response.json()

      return {
        platform: this.platform,
        openId: data.openid,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined
      }
    } catch (error) {
      console.error('[Xiaohongshu Callback Error]', error)
      throw new Error('小红书授权失败')
    }
  }

  async publishArticle(article: ArticleToPublish, accessToken: string): Promise<PublishResult> {
    // 模拟发布（开发环境）
    if (!this.clientId || !this.clientSecret) {
      return {
        success: true,
        externalUrl: `https://www.xiaohongshu.com/discovery/item/${Math.random().toString(36).substring(2, 12)}`
      }
    }

    // 实际调用小红书笔记发布 API
    try {
      // 小红书笔记发布需要先上传图片，这里简化处理
      const response = await fetch('https://api.xiaohongshu.com/api/sns/v1/note/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          images: article.images || [],
          tags: article.tags || [],
          note_type: 1 // 图文笔记
        })
      })

      if (!response.ok) {
        return { success: false, errorMessage: '发布失败' }
      }

      const data = await response.json()
      return {
        success: true,
        externalUrl: `https://www.xiaohongshu.com/discovery/item/${data.note_id}`
      }
    } catch (error) {
      console.error('[Xiaohongshu Publish Error]', error)
      return { success: false, errorMessage: '发布失败' }
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResult> {
    // 模拟刷新
    return {
      accessToken: 'mock-xhs-token-refreshed-' + Math.random().toString(36).substring(2, 20),
      refreshToken: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  }
}
