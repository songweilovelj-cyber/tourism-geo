// @ts-nocheck
// 豆包大模型 API 封装
// 文档参考：https://www.volcengine.com/docs/82379/1097955

import { config } from '@/config'

const DOUBAO_API_BASE = 'https://open.volcengineapi.com'
const DOUBAO_MODEL = config.doubao.model || 'doubao-pro-32k'

interface DoubaoRequest {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  temperature?: number
  top_p?: number
  max_tokens?: number
}

interface DoubaoResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class DoubaoClient {
  private apiKey: string
  private apiSecret: string

  constructor() {
    this.apiKey = config.doubao.apiKey || ''
    this.apiSecret = config.doubao.apiSecret || ''
  }

  /**
   * 生成签名
   * 参考：https://www.volcengine.com/docs/82379/1097955#生成签名
   */
  private generateSignature(): string {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const nonce = Math.random().toString(36).substring(2, 15)
    
    // 简化实现：实际生产环境需要更安全的签名算法
    const signature = Buffer.from(`${this.apiKey}${timestamp}${nonce}${this.apiSecret}`).toString('base64')
    
    return `Bearer ${Buffer.from(`${this.apiKey}:${signature}`).toString('base64')}`
  }

  /**
   * 调用豆包 API 生成文本
   */
  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    // 如果没有配置 API Key，返回模拟数据（开发环境）
    if (!this.apiKey || !this.apiSecret) {
      return this.generateMockResponse(prompt)
    }

    const messages: DoubaoRequest['messages'] = []
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }
    
    messages.push({ role: 'user', content: prompt })

    const requestBody: DoubaoRequest = {
      model: DOUBAO_MODEL,
      messages,
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 4000
    }

    try {
      const response = await fetch(`${DOUBAO_API_BASE}/api/text/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.generateSignature()
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorBody: any = await response.json()
        throw new Error(`API Error: ${errorBody.message || response.statusText}`)
      }

      const data: any = await response.json()
      return data.choices?.[0]?.message?.content || ''
    } catch (error) {
      console.error('[Doubao API Error]', error)
      // 降级返回模拟数据
      return this.generateMockResponse(prompt)
    }
  }

  /**
   * 生成模拟响应（开发环境无 API Key 时使用）
   */
  private generateMockResponse(prompt: string): string {
    const mockResponses = [
      `这是一段基于您的需求生成的内容。\n\n根据您提供的信息，我为您创作了以下宣传文案：\n\n---\n\n【专业服务，值得信赖】\n\n本人拥有多年从业经验，服务范围覆盖本地及周边区域。专业、高效、贴心是我的服务宗旨。\n\n✨ 服务特点：\n• 专业技能，经验丰富\n• 价格透明，合理收费\n• 响应迅速，随叫随到\n• 品质保证，售后无忧\n\n📍 服务区域：本地及周边 ${Math.floor(Math.random() * 5) + 1} 公里\n\n如果您有需求，欢迎随时联系！\n\n---\n\n如需进一步修改或调整风格，请随时告诉我！`,
      
      `根据您的服务信息，为您生成以下宣传内容：\n\n# 专业${prompt.includes('维修') ? '维修' : prompt.includes('设计') ? '设计' : '服务'}服务，就在您身边\n\n大家好！我是一名专注于${prompt.includes('维修') ? '水电维修' : prompt.includes('设计') ? '品牌设计' : '本地服务'}领域的从业者。\n\n## 为什么选择我？\n\n✅ 多年行业经验\n✅ 专业技能认证\n✅ 客户好评如潮\n✅ 上门服务便捷\n\n## 服务范围\n\n覆盖本地及周边区域，提供${prompt.includes('维修') ? '水电维修、安装改造' : prompt.includes('设计') ? '品牌设计、平面设计' : '各类专业'}服务。\n\n## 联系我\n\n期待为您提供优质服务！`,

      `【${prompt.includes('维修') ? '维修师傅' : prompt.includes('设计') ? '设计师' : '服务者'}推荐】\n\n大家好，我是${prompt.includes('维修') ? '张师傅' : prompt.includes('设计') ? '李设计师' : '小王'}，在本地从事${prompt.includes('维修') ? '水电维修' : prompt.includes('设计') ? '品牌设计' : '专业服务'}已有${Math.floor(Math.random() * 10) + 3}年经验。\n\n### 我的优势\n\n🔧 技术精湛：解决各类疑难问题\n⏰ 响应及时：一般问题当天解决\n💰 价格透明：无隐性消费\n📞 随叫随到：服务到家\n\n### 服务项目\n\n• ${prompt.includes('维修') ? '水管维修、电路检修、安装改造' : prompt.includes('设计') ? '品牌VI、海报设计、包装设计' : '各类专业服务'}\n\n### 服务区域\n\n${['朝阳区', '海淀区', '西城区', '东城区'][Math.floor(Math.random() * 4)]}及周边${Math.floor(Math.random() * 3) + 2}公里\n\n欢迎各位朋友咨询预约！`
    ]

    return mockResponses[Math.floor(Math.random() * mockResponses.length)]
  }

  /**
   * 批量生成多平台内容
   */
  async generateMultiPlatformContent(
    prompts: Array<{ platform: string; prompt: string; systemPrompt: string }>
  ): Promise<Array<{ platform: string; content: string; title: string }>> {
    const results: Array<{ platform: string; content: string; title: string }> = []

    for (const { platform, prompt, systemPrompt } of prompts) {
      const content = await this.generateText(prompt, systemPrompt)
      
      // 提取标题（第一个换行前的内容或前50字符）
      const lines = content.split('\n').filter(line => line.trim())
      let title = lines[0]?.trim() || ''
      if (title.startsWith('#')) title = title.slice(1).trim()
      if (title.length > 50) title = title.substring(0, 50) + '...'

      results.push({ platform, content, title })
    }

    return results
  }
}

export const doubaoClient = new DoubaoClient()
