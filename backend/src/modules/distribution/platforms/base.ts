// 平台分发适配器基类

export interface PlatformAdapter {
  platform: string
  displayName: string
  
  /**
   * 获取授权 URL
   * @param providerId 可选的服务者ID，用于在回调时关联用户
   */
  getAuthorizationUrl(providerId?: string): string
  
  /**
   * 处理授权回调
   */
  handleCallback(code: string): Promise<PlatformAccount>
  
  /**
   * 发布文章
   */
  publishArticle(article: ArticleToPublish, accessToken: string): Promise<PublishResult>
  
  /**
   * 刷新 Token
   */
  refreshToken(refreshToken: string): Promise<TokenResult>
}

export interface PlatformAccount {
  platform: string
  openId: string
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
}

export interface ArticleToPublish {
  title: string
  content: string
  images?: string[]
  tags?: string[]
}

export interface PublishResult {
  success: boolean
  externalUrl?: string
  errorMessage?: string
}

export interface TokenResult {
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
}

// 平台适配器工厂
export class PlatformAdapterFactory {
  private static adapters: Record<string, PlatformAdapter> = {}

  static register(adapter: PlatformAdapter): void {
    this.adapters[adapter.platform] = adapter
  }

  static get(platform: string): PlatformAdapter | undefined {
    return this.adapters[platform]
  }

  static getAll(): PlatformAdapter[] {
    return Object.values(this.adapters)
  }
}
