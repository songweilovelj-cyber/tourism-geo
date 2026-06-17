// @ts-nocheck
// 微信公众号平台适配器
// 文档参考：https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html

import { PlatformAdapter, PlatformAccount, ArticleToPublish, PublishResult, TokenResult } from './base'
import { config } from '@/config'

export class WechatAdapter implements PlatformAdapter {
  platform = 'WECHAT'
  displayName = '微信公众号'

  private appId: string
  private appSecret: string
  private redirectUri: string

  constructor() {
    this.appId = config.wechat.appId || ''
    this.appSecret = config.wechat.appSecret || ''
    this.redirectUri = config.wechat.redirectUri || 'http://localhost:3001/api/platforms/callback/wechat'
  }

  getAuthorizationUrl(providerId?: string): string {
    const state = providerId ? `provider:${providerId}` : 'STATE'
    
    const params = new URLSearchParams({
      appid: this.appId || 'demo_app_id',
      redirect_uri: encodeURIComponent(this.redirectUri),
      response_type: 'code',
      scope: 'snsapi_base',
      state: state
    })
    
    // 如果没有配置 appId，返回模拟授权 URL（用于开发测试）
    if (!this.appId) {
      const mockCode = 'mock_wechat_code_' + Math.random().toString(36).substring(2, 10)
      return `${this.redirectUri}?code=${mockCode}&state=${state}`
    }
    
    return `https://open.weixin.qq.com/connect/oauth2/authorize?${params.toString()}&state=${state}#wechat_redirect`
  }

  async handleCallback(code: string): Promise<PlatformAccount> {
    // 模拟授权（开发环境）
    if (!this.appId || !this.appSecret) {
      return {
        platform: this.platform,
        openId: 'mock-wechat-openid-' + Math.random().toString(36).substring(2, 15),
        accessToken: 'mock-wechat-token-' + Math.random().toString(36).substring(2, 20),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    }

    // 实际调用微信 API
    try {
      // 第一步：获取 access_token 和 openid
      const tokenResponse = await fetch(
        `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appId}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`
      )

      const tokenData = await tokenResponse.json()

      return {
        platform: this.platform,
        openId: tokenData.openid,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined
      }
    } catch (error) {
      console.error('[Wechat Callback Error]', error)
      throw new Error('微信授权失败')
    }
  }

  async publishArticle(article: ArticleToPublish, accessToken: string): Promise<PublishResult> {
    // 模拟发布（开发环境）
    if (!this.appId || !this.appSecret) {
      return {
        success: true,
        externalUrl: `https://mp.weixin.qq.com/s/${Math.random().toString(36).substring(2, 12)}`
      }
    }

    // 微信公众号文章发布需要先获取素材接口，这里简化处理
    try {
      // 先获取公众号的 access_token（与 OAuth token 不同）
      const tokenResponse = await fetch(
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`
      )
      const tokenData = await tokenResponse.json()
      const mpToken = tokenData.access_token

      // 发布文章
      const response = await fetch('https://api.weixin.qq.com/cgi-bin/freepublish/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          content_source_url: '',
          thumb_media_id: '',
          need_open_comment: 1,
          only_fans_can_comment: 0
        })
      })

      if (!response.ok) {
        return { success: false, errorMessage: '发布失败' }
      }

      const data = await response.json()
      return {
        success: true,
        externalUrl: `https://mp.weixin.qq.com/s/${data.article_id}`
      }
    } catch (error) {
      console.error('[Wechat Publish Error]', error)
      return { success: false, errorMessage: '发布失败' }
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResult> {
    // 模拟刷新
    return {
      accessToken: 'mock-wechat-token-refreshed-' + Math.random().toString(36).substring(2, 20),
      refreshToken: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  }
}
