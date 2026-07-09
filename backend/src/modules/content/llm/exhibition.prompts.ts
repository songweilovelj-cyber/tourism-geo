// Prompt 模板 - 博物馆策展方案生成

export interface ExhibitionPlanInput {
  // 步骤1: 基本信息
  basicInfo: {
    theme: string           // 展览主题
    name: string            // 展览名称
    organizer?: string      // 主办单位
    venue?: string         // 展览地点
    startDate?: string     // 开始时间
    endDate?: string       // 结束时间
    area?: number          // 预计面积
  }
  
  // 步骤2: 展览定位
  positioning: {
    planType: string       // 常设展/临时展/专题展
    targetAudience: string // 目标受众
    targetAudienceOther?: string
    educationGoal?: string
  }
  
  // 步骤3: 展区规划
  zones: Array<{
    zoneNumber: number
    name: string
    subtitle?: string
    timePeriod?: string
    narrative?: string
  }>
  
  // 步骤4: 核心展品（灵魂展品）
  coreExhibits: Array<{
    zoneId?: string
    exhibitName: string
    era?: string
    origin?: string
    material?: string
    artifactLevel?: string
    description?: string
    significance?: string
    displayMethod?: string
    positionDesign?: string
  }>
  
  // 步骤5: 辅助展品
  auxiliaryExhibits: Array<{
    zoneId?: string
    exhibitName: string
    era?: string
    origin?: string
    material?: string
    artifactLevel?: string
    description?: string
    isReplica?: boolean
  }>
  
  // 步骤6: 展陈设计
  displayDesign?: {
    totalArea?: number
    layoutType?: string
    trafficDesign?: string
    lightingDesign?: string
    multimediaConfig?: string
  }
  
  // 步骤7: 教育推广
  educationPlan?: {
    activities?: string
    educationPrograms?: string
    publicityPlan?: string
    publications?: string
  }
}

// 策展方案生成配置
export interface ExhibitionPlanConfig {
  museumLevel: string  // 国家级/省级/市级
  budget?: string
  includeLayout?: boolean  // 是否包含平面布局
  language?: string  // 输出语言
}

/**
 * 生成策展方案的完整Prompt
 */
export function generateExhibitionPlanPrompt(
  input: ExhibitionPlanInput,
  config?: Partial<ExhibitionPlanConfig>
): string {
  const {
    basicInfo,
    positioning,
    zones,
    coreExhibits,
    auxiliaryExhibits,
    displayDesign,
    educationPlan
  } = input

  // 按展区组织核心展品
  const coreByZone = new Map<number, typeof coreExhibits>()
  const auxByZone = new Map<number, typeof auxiliaryExhibits>()
  
  zones.forEach((zone, idx) => {
    coreByZone.set(idx, [])
    auxByZone.set(idx, [])
  })
  
  coreExhibits.forEach(exhibit => {
    const zoneIdx = zones.findIndex(z => z.zoneNumber === Number(exhibit.zoneId)) || 0
    const zoneCore = coreByZone.get(zoneIdx) || []
    zoneCore.push(exhibit)
    coreByZone.set(zoneIdx, zoneCore)
  })
  
  auxiliaryExhibits.forEach(exhibit => {
    const zoneIdx = zones.findIndex(z => z.zoneNumber === Number(exhibit.zoneId)) || 0
    const zoneAux = auxByZone.get(zoneIdx) || []
    zoneAux.push(exhibit)
    auxByZone.set(zoneIdx, zoneAux)
  })

  return `
# 博物馆策展方案生成任务

你是国家博物馆的专业策展人，擅长设计高质量的博物馆策展方案。

## 展览基本信息

- **展览主题**: ${basicInfo.theme}
- **展览名称**: ${basicInfo.name}
- **主办单位**: ${basicInfo.organizer || '待定'}
- **展览地点**: ${basicInfo.venue || '待定'}
- **展览时间**: ${basicInfo.startDate || '待定'} 至 ${basicInfo.endDate || '待定'}
- **预计面积**: ${basicInfo.area ? basicInfo.area + '平方米' : '待定'}
- **展览类型**: ${positioning.planType}
- **目标受众**: ${positioning.targetAudience}${positioning.targetAudienceOther ? '（' + positioning.targetAudienceOther + '）' : ''}
- **教育目的**: ${positioning.educationGoal || '无特殊要求'}

## 展区规划

本展览共设 ${zones.length} 个展区：

${zones.map((zone, idx) => `
### ${zone.name}${zone.subtitle ? ' — ' + zone.subtitle : ''}
- 序号: ${zone.zoneNumber}
- 时代/主题: ${zone.timePeriod || '待定'}
- 核心叙事: ${zone.narrative || '待策划'}
`).join('\n')}

## 灵魂展品配置

${coreExhibits.length > 0 ? coreExhibits.map(exhibit => `
### ${exhibit.exhibitName}
- 时代: ${exhibit.era || '待定'}
- 来源: ${exhibit.origin || '待定'}
- 材质: ${exhibit.material || '待定'}
- 文物等级: ${exhibit.artifactLevel || '待定'}
- 描述: ${exhibit.description || '待补充'}
- 重要性: ${exhibit.significance || '待说明'}
- 展示方式: ${exhibit.displayMethod || '待设计'}
- 位置设计: ${exhibit.positionDesign || '待设计'}
`).join('\n') : '暂无灵魂展品配置，请AI推荐'}
${coreExhibits.length === 0 ? '\n【注意】请根据展览主题推荐8-10件具有代表性的灵魂展品，包括名称、时代、来源等基本信息，并说明其为何适合作为灵魂展品。' : ''}

## 辅助展品清单

${auxiliaryExhibits.length > 0 ? auxiliaryExhibits.map(exhibit => `
- ${exhibit.exhibitName}（${exhibit.era || '年代待定'}，${exhibit.artifactLevel || '等级待定'}）${exhibit.isReplica ? '【复制品】' : ''}
`).join('\n') : '暂无辅助展品，请AI推荐'}
${auxiliaryExhibits.length === 0 ? '\n【注意】请根据展区规划和灵魂展品，推荐30-50件辅助展品，形成完整的展品体系。' : ''}

## 展陈设计要求

${displayDesign ? `
- 布局类型: ${displayDesign.layoutType || '待定'}
- 动线设计: ${displayDesign.trafficDesign || '待设计'}
- 灯光设计: ${displayDesign.lightingDesign || '待设计'}
- 多媒体配置: ${displayDesign.multimediaConfig || '待配置'}
- 总面积: ${displayDesign.totalArea ? displayDesign.totalArea + '平方米' : '待定'}
` : '请根据展览内容设计展陈方案'}

## 教育推广计划

${educationPlan ? `
- 配套活动: ${educationPlan.activities || '待策划'}
- 社教项目: ${educationPlan.educationPrograms || '待设计'}
- 宣传方案: ${educationPlan.publicityPlan || '待策划'}
- 出版物: ${educationPlan.publications || '待规划'}
` : '请设计配套的教育推广方案'}

---

## 输出要求

请生成完整的策展方案，必须包含以下模块：

### 1. 展览概述
简要说明展览的背景、目的和意义（200字以内）

### 2. 展区详细规划
对每个展区进行详细的内容策划，包括：
- 展区叙事结构
- 核心展品解读（围绕灵魂展品展开）
- 辅助展品配置
- 展陈亮点设计

### 3. 灵魂展品深度解读
对每个灵魂展品进行深度解读，包括：
- 历史背景与文化价值
- 学术研究意义
- 展陈设计建议（包括位置、灯光、说明牌等）
- 与其他展品的关联性

### 4. 完整展品清单
按展区分类的完整展品清单，包含：
- 展品编号
- 展品名称
- 时代/年代
- 来源/出土地
- 文物等级
- 是否复制品

### 5. 展陈布局设计
详细的展陈设计说明：
- 空间布局方案（文字描述）
- 参观动线设计
- 重点照明方案
- 多媒体配置清单

### 6. 平面布局示意图
使用ASCII字符绘制展厅平面布局图，标注：
- 各展区位置
- 核心展品位置（用★标记）
- 辅助展品位置（用●标记）
- 参观动线（用箭头→标记）
- 入口/出口位置

### 7. 教育推广方案
详细的配套活动策划

### 8. 策展说明
包括：
- 核心展品遴选标准
- 展陈设计原则
- 学术支撑体系
- 版本说明

---

请用JSON格式输出策展方案，结构如下：

\`\`\`json
{
  "exhibition": {
    "name": "展览名称",
    "theme": "展览主题",
    "overview": "展览概述",
    "totalArea": 总面积,
    "totalExhibits": 展品总数,
    "coreExhibits": 灵魂展品数量,
    "firstLevelExhibits": 一级文物数量
  },
  "zones": [
    {
      "number": 展区序号,
      "name": "展区名称",
      "subtitle": "副标题",
      "narrative": "核心叙事",
      "exhibitCount": 展品数量,
      "coreExhibits": [
        {
          "name": "展品名称",
          "era": "时代",
          "origin": "来源",
          "level": "文物等级",
          "significance": "重要性说明",
          "positionDesign": "位置设计"
        }
      ],
      "auxiliaryExhibits": [
        {
          "name": "展品名称",
          "era": "时代",
          "origin": "来源",
          "level": "文物等级",
          "isReplica": false
        }
      ]
    }
  ],
  "floorPlan": "ASCII平面布局图",
  "coreExhibitDetails": [
    {
      "name": "展品名称",
      "era": "时代",
      "origin": "来源",
      "description": "详细描述",
      "historicalValue": "历史价值",
      "academicSignificance": "学术价值",
      "displayRecommendation": "展示建议",
      "positionRecommendation": "位置建议"
    }
  ],
  "educationPlan": {
    "activities": "配套活动",
    "programs": "社教项目",
    "publicity": "宣传方案"
  },
  "curatorialNotes": {
    "selectionCriteria": "遴选标准",
    "designPrinciples": "设计原则",
    "academicSupport": "学术支撑"
  }
}
\`\`\`

重要提示：
1. 所有展品信息请根据展览主题合理生成，确保历史准确性
2. 灵魂展品必须放在各展区的视觉中心位置
3. 展品数量要与展区规划相匹配
4. 平面布局要体现核心展品的C位设计
5. 输出必须是有效的JSON格式
`.trim()
}

/**
 * 系统提示词
 */
export const exhibitionPlanSystemPrompt = `你是一位资深的国家博物馆策展人，具有丰富的博物馆策展经验。

专业背景：
- 精通博物馆学、文物学、历史学
- 熟悉博物馆展陈设计原则
- 了解不同类型展览的策划方法
- 擅长文物价值解读与叙事设计

策展理念：
- 坚持"以展品为中心"的策展原则
- 重视"灵魂展品"的提炼与深度解读
- 注重展品之间的内在关联与叙事逻辑
- 追求学术性与可读性的平衡

输出要求：
- 语言专业但易懂
- 展品信息真实准确
- 方案具有可操作性
- 结构清晰完整

请严格按照用户输入的信息和格式要求生成策展方案。`
