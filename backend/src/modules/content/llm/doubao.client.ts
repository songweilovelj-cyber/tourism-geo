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
      `# 九龙山景区 - 探索自然之美，感受山水魅力\n\n## 🏞️ 景区概况\n\n九龙山景区坐落于安徽省黄山市，是国家AAAA级旅游景区。这里群山环抱，风景秀丽，四季景色各异，是休闲度假、登山探险的理想目的地。\n\n## ✨ 核心景点\n\n🌊 **九龙瀑布** - 九级瀑布飞流直下，水花四溅，气势磅礴\n🏯 **古寺庙群** - 千年古刹，香火旺盛，感受历史文化底蕴\n🌲 **原始森林** - 珍稀动植物资源丰富，天然氧吧\n\n## 📍 地理位置\n\n安徽省黄山市黄山区九龙山风景区\n\n## ⏰ 开放时间\n\n全年开放 8:00 - 17:30\n\n## 💰 门票价格\n\n成人票：¥120 / 人\n儿童票：¥60 / 人（1.2-1.4米）\n\n## 🚗 交通指南\n\n- 自驾：京台高速黄山出口下，导航"九龙山景区"\n- 公共交通：黄山汽车站乘景区专线\n\n## 📝 游玩小贴士\n\n1. 建议游玩时间：3-4小时\n2. 山上气温较低，建议携带外套\n3. 景区内有多处观景台，拍照绝佳\n\n🌟 九龙山景区欢迎您的到来！`,
      
      `【九龙山景区游玩攻略】\n\nHi~ 小伙伴们！今天给大家分享一个超美的宝藏景区——九龙山！\n\n📍 坐标：安徽省黄山市黄山区\n\n🚗 交通：建议自驾，山路风景超美！\n\n🎫 门票：120元/人，提前网上订有优惠\n\n⏰ 游玩时间：建议安排一整天\n\n✨ 必打卡景点：\n\n1. 九龙瀑布\n一定要去看！九级瀑布层层叠叠，拍照巨出片！建议上午去，阳光洒在瀑布上超梦幻~ 🌈\n\n2. 千年古寺\n深山里的古寺庙，香火很旺，可以进去拜拜，感受一下宁静的氛围~\n\n3. 山顶观景台\n一定要爬到山顶！俯瞰整个景区，群山连绵，云海翻腾，美到窒息！\n\n🍜 美食推荐：\n景区门口的农家菜超好吃！推荐臭鳜鱼、毛豆腐，都是当地特色~ 😋\n\n🏠 住宿建议：\n可以住景区附近的民宿，体验田园生活~\n\n💡 小贴士：\n- 穿舒适的运动鞋，山路有些陡\n- 带好防晒和驱蚊用品\n- 山上天气多变，备一件薄外套\n\n🌟 总体评价：⭐⭐⭐⭐⭐\n性价比超高的景区，人不算太多，适合周末放松！强烈推荐给喜欢自然风光的小伙伴们！\n\n#九龙山 #黄山旅游 #安徽美景 #周末去哪儿 #自然风光`,

      `## 九龙山景区深度游指南\n\n### 一、景区简介\n\n九龙山景区位于安徽省黄山市黄山区，距离黄山风景区仅30公里，是黄山旅游圈中一颗璀璨的明珠。景区以"奇、险、秀、幽"著称，拥有丰富的自然景观和人文历史。\n\n### 二、核心景点详解\n\n🔹 **九龙瀑布群**\n景区的标志性景观，九级瀑布从山顶倾泻而下，最大落差达100米。春季水量充沛，气势恢宏；秋季红叶映衬，美不胜收。\n\n🔹 **古松长廊**\n千年古松林立，形态各异，有的挺拔如柱，有的虬曲多姿，是摄影爱好者的天堂。\n\n🔹 **云海观景台**\n海拔1200米的观景台，是观赏云海的绝佳地点。清晨时分，云海翻腾，如入仙境。\n\n🔹 **文化遗迹**\n唐代古寺、宋代摩崖石刻、明清古道，处处彰显着深厚的历史文化底蕴。\n\n### 三、游玩路线推荐\n\n**经典路线（半日游）**\n入口 → 九龙瀑布 → 古松长廊 → 观景台 → 返回\n\n**深度路线（一日游）**\n入口 → 九龙瀑布 → 古寺庙 → 原始森林 → 山顶观景台 → 古道下山\n\n### 四、实用信息\n\n📍 地址：安徽省黄山市黄山区九龙山景区\n⏰ 开放时间：8:00-17:30\n🎫 门票：¥120/人\n📞 咨询电话：0559-XXXXXXX\n\n### 五、周边推荐\n\n🚗 黄山风景区（30分钟车程）\n🏯 西递宏村（1小时车程）\n🍵 祁门红茶产地（1.5小时车程）\n\n### 六、注意事项\n\n1. 景区内山路较多，建议穿防滑运动鞋\n2. 夏季注意防暑降温，冬季注意保暖\n3. 景区内有餐饮服务，但建议自备饮用水和零食\n4. 尊重自然，爱护环境，文明旅游\n\n---\n\n🌄 九龙山景区期待您的光临，祝您旅途愉快！`
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
