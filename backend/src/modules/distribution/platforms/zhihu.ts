// @ts-nocheck
// 知乎平台适配器
// 文档参考：https://open.zhihu.com/api/v4/

import { PlatformAdapter, PlatformAccount, ArticleToPublish, PublishResult, TokenResult } from './base'
import { config } from '@/config'

export class ZhihuAdapter implements PlatformAdapter {
  platform = 'ZHIHU'
  displayName = '知乎'

  private clientId: string
  private clientSecret: string
  private redirectUri: string

  constructor() {
    this.clientId = config.zhihu.clientId || ''
    this.clientSecret = config.zhihu.clientSecret || ''
    // 回调地址改为前端地址，包含 providerId
    this.redirectUri = config.zhihu.redirectUri || `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/platforms/callback/zhihu`
  }

  /**
   * 获取知乎授权 URL
   * 知乎 OAuth 授权流程：用户访问此 URL -> 登录知乎 -> 授权 -> 回调获取 code
   */
  getAuthorizationUrl(providerId?: string): string {
    const state = providerId ? `provider:${providerId}` : ''
    
    const params = new URLSearchParams({
      client_id: this.clientId || 'demo_client_id',
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'write',
      state: state
    })
    
    // 如果没有配置 client_id，返回模拟授权 URL（用于开发测试）
    if (!this.clientId) {
      const mockCode = 'mock_code_' + Math.random().toString(36).substring(2, 10)
      return `${this.redirectUri}?code=${mockCode}&state=${state}`
    }
    
    return `https://www.zhihu.com/oauth/authorize?${params.toString()}`
  }

  async handleCallback(code: string): Promise<PlatformAccount> {
    // 模拟授权（开发环境）
    if (!this.clientId || !this.clientSecret) {
      return {
        platform: this.platform,
        openId: 'mock-zhihu-openid-' + Math.random().toString(36).substring(2, 15),
        accessToken: 'mock-zhihu-token-' + Math.random().toString(36).substring(2, 20),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    }

    // 实际调用知乎 API
    try {
      const response = await fetch('https://www.zhihu.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
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
        expiresAt: data.expires_at ? new Date(data.expires_at * 1000) : undefined
      }
    } catch (error) {
      console.error('[Zhihu Callback Error]', error)
      throw new Error('知乎授权失败')
    }
  }

  async publishArticle(article: ArticleToPublish, accessToken: string): Promise<PublishResult> {
    // 模拟发布（开发环境）
    if (!this.clientId || !this.clientSecret) {
      return {
        success: true,
        externalUrl: `https://zhuanlan.zhihu.com/p/${Math.random().toString(36).substring(2, 12)}`
      }
    }

    // 实际调用知乎文章发布 API
    try {
      const response = await fetch('https://api.zhihu.com/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          tags: article.tags || []
        })
      })

      if (!response.ok) {
        return { success: false, errorMessage: '发布失败' }
      }

      const data = await response.json()
      return {
        success: true,
        externalUrl: `https://zhuanlan.zhihu.com/p/${data.id}`
      }
    } catch (error) {
      console.error('[Zhihu Publish Error]', error)
      return { success: false, errorMessage: '发布失败' }
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResult> {
    // 模拟刷新
    return {
      accessToken: 'mock-zhihu-token-refreshed-' + Math.random().toString(36).substring(2, 20),
      refreshToken: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  }
}
