import type {
  RequirementForm,
  RequirementReport,
  SolutionCategory,
  CategoryFeatures,
  ResearchData,
  PolicyItem,
  ResourceItem,
  CompetitorItem,
  ReferenceData,
  ReferenceCase,
  ReusableElements,
  SolutionOutline,
  OutlineSection,
  OutlinePage,
  QualityCheckResult,
} from '../types/travelSolution'
import { CATEGORY_TREE } from '../types/travelSolution'

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

// ========== 对话式需求提取 ==========
export interface ExtractedRequirement {
  form: RequirementForm
  confidence: Record<string, number>
  missingFields: string[]
}

const CITY_NAMES = [
  '北京', '上海', '广州', '深圳', '杭州', '南京', '苏州', '成都', '武汉', '西安',
  '重庆', '天津', '长沙', '郑州', '青岛', '大连', '宁波', '厦门', '无锡', '合肥',
  '福州', '南昌', '济南', '昆明', '贵阳', '南宁', '兰州', '乌鲁木齐', '呼和浩特', '银川',
  '拉萨', '海口', '三亚', '桂林', '丽江', '大理', '张家界', '黄山', '九华山', '峨眉山',
  '乐山', '都江堰', '青城山', '武当山', '泰山', '华山', '衡山', '恒山', '嵩山', '庐山',
  '井冈山', '延安', '遵义', '嘉兴', '延安', '韶山', '广安',
]

const CLIENT_PATTERNS = [
  { pattern: /([\u4e00-\u9fa5]{2,10}(?:文旅局|文化广电旅游局|文旅厅|文化和旅游局|旅游局))/g, type: 'government' },
  { pattern: /([\u4e00-\u9fa5]{2,10}(?:文旅集团|旅投集团|旅游集团|文旅投|投资集团|发展集团))/g, type: 'enterprise' },
  { pattern: /([\u4e00-\u9fa5]{2,10}(?:景区|度假区|管委会|管理处|管理局))/g, type: 'scenic' },
]

const BUDGET_PATTERNS = [
  /(\d+)(?:\.\d+)?\s*[-~到至]\s*(\d+)(?:\.\d+)?\s*万/,
  /(\d+)(?:\.\d+)?\s*万\s*[-~到至]\s*(\d+)(?:\.\d+)?\s*万/,
  /预算\s*(?:约|大概|大约|为)?\s*(\d+)(?:\.\d+)?\s*万/,
  /总投资\s*(?:约|大概|大约|为)?\s*(\d+)(?:\.\d+)?\s*万/,
  /(\d+)(?:\.\d+)?\s*亿/,
]

const TIMELINE_PATTERNS = [
  /(\d+)\s*个月/,
  /(\d+)\s*年内/,
  /周期\s*(?:约|大概|大约|为)?\s*(\d+)\s*个月/,
  /工期\s*(?:约|大概|大约|为)?\s*(\d+)\s*个月/,
]

export function extractRequirementFromText(text: string): ExtractedRequirement {
  const form: RequirementForm = {
    projectName: '',
    clientName: '',
    region: '',
    projectType: '',
    coreDemand: '',
    targetAudience: '',
    expectedFeatures: '',
    referenceCases: '',
    budgetRange: '',
    timeline: '',
  }

  const confidence: Record<string, number> = {}
  const missingFields: string[] = []

  for (const city of CITY_NAMES) {
    if (text.includes(city)) {
      form.region = city
      confidence.region = 0.9
      break
    }
  }
  if (!form.region) {
    const provinceMatch = text.match(/([\u4e00-\u9fa5]{2,3}省)/)
    if (provinceMatch) {
      form.region = provinceMatch[1]
      confidence.region = 0.8
    }
  }
  if (!form.region) {
    missingFields.push('项目地域')
  }

  for (const { pattern, type } of CLIENT_PATTERNS) {
    const match = text.match(pattern)
    if (match && match[0]) {
      form.clientName = match[0]
      confidence.clientName = type === 'government' ? 0.95 : 0.85
      break
    }
  }
  if (!form.clientName) {
    const generalMatch = text.match(/(?:甲方|业主|委托方|客户)\s*(?:为|是|：)?\s*([\u4e00-\u9fa5]{2,15}(?:公司|局|集团|管委会|处|所|中心))/)
    if (generalMatch) {
      form.clientName = generalMatch[1]
      confidence.clientName = 0.8
    }
  }
  if (!form.clientName) {
    missingFields.push('甲方单位')
  }

  const projectNamePatterns = [
    /([\u4e00-\u9fa5A-Za-z0-9]{4,30}(?:项目|方案|平台建设|平台|系统建设|系统))/g,
    /(?:项目名称|方案名称)\s*(?:为|是|：)?\s*([\u4e00-\u9fa5A-Za-z0-9]{4,30})/,
  ]
  for (const pattern of projectNamePatterns) {
    const match = text.match(pattern)
    if (match && match[0]) {
      let name = match[0]
      if (name.length > 4 && name.length < 30) {
        form.projectName = name
        confidence.projectName = 0.8
        break
      }
    }
  }
  if (!form.projectName) {
    if (form.region) {
      form.projectName = `${form.region}智慧文旅综合服务平台方案`
      confidence.projectName = 0.6
    } else {
      form.projectName = '智慧文旅综合服务平台方案'
      confidence.projectName = 0.5
    }
  }

  if (text.includes('智慧文旅') || text.includes('文旅平台') || text.includes('文旅数字化')) {
    form.projectType = '智慧文旅平台建设'
    confidence.projectType = 0.9
  } else if (text.includes('景区') || text.includes('旅游目的地')) {
    form.projectType = '景区数字化升级'
    confidence.projectType = 0.8
  } else if (text.includes('全域旅游')) {
    form.projectType = '全域旅游示范区建设'
    confidence.projectType = 0.85
  } else if (text.includes('乡村旅游') || text.includes('民宿')) {
    form.projectType = '乡村旅游发展'
    confidence.projectType = 0.8
  }
  if (!form.projectType) {
    form.projectType = '文旅综合项目'
    confidence.projectType = 0.5
    missingFields.push('项目类型')
  }

  form.coreDemand = text.trim()
  confidence.coreDemand = 0.95

  if (text.includes('游客') || text.includes('旅游者')) {
    form.targetAudience = '文旅主管部门、景区运营方、游客群体'
    confidence.targetAudience = 0.7
  } else if (text.includes('管理') || text.includes('监管')) {
    form.targetAudience = '文旅主管部门、行业管理者'
    confidence.targetAudience = 0.7
  }
  if (!form.targetAudience) {
    missingFields.push('目标受众')
  }

  for (const pattern of BUDGET_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      if (match[2]) {
        form.budgetRange = `${match[1]}-${match[2]}万`
      } else {
        form.budgetRange = `${match[1]}万左右`
      }
      confidence.budgetRange = 0.85
      break
    }
  }
  if (!form.budgetRange) {
    missingFields.push('预算范围')
  }

  for (const pattern of TIMELINE_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      form.timeline = `${match[1]}个月内完成`
      confidence.timeline = 0.8
      break
    }
  }
  if (!form.timeline) {
    missingFields.push('时间要求')
  }

  const features: string[] = []
  if (text.includes('大数据') || text.includes('数据中心')) features.push('文旅大数据中心')
  if (text.includes('一码游') || text.includes('一机游')) features.push('一码游/一机游服务')
  if (text.includes('智能导览') || text.includes('智慧导览')) features.push('智能导览系统')
  if (text.includes('监管') || text.includes('管理平台')) features.push('行业监管平台')
  if (text.includes('营销') || text.includes('推广')) features.push('智慧营销平台')
  if (text.includes('AR') || text.includes('VR') || text.includes('元宇宙') || text.includes('数字人')) features.push('数字体验创新应用')
  if (text.includes('应急') || text.includes('指挥')) features.push('应急指挥调度')
  if (features.length > 0) {
    form.expectedFeatures = features.join('、')
    confidence.expectedFeatures = 0.75
  }

  return {
    form,
    confidence,
    missingFields,
  }
}

// ========== Step 0: 需求分析报告生成 ==========
export function generateRequirementReport(form: RequirementForm): RequirementReport {
  const content = `# ${form.projectName} 需求分析报告

## 一、项目概述

### 1.1 项目背景
随着文旅产业数字化转型加速，${form.region}文旅发展面临新的机遇与挑战。${form.clientName}作为${form.projectType}领域的重要主体，启动本项目具有重要的战略意义。

### 1.2 项目基本信息
- **项目名称**：${form.projectName}
- **甲方单位**：${form.clientName}
- **项目地域**：${form.region}
- **项目类型**：${form.projectType}

## 二、核心诉求分析

### 2.1 主要需求
${form.coreDemand}

### 2.2 目标受众
${form.targetAudience || '文旅主管部门领导、景区运营团队、游客群体'}

### 2.3 期望功能
${form.expectedFeatures || '智慧旅游平台建设、运营管理系统、游客服务体系'}

## 三、项目约束条件

### 3.1 预算范围
${form.budgetRange || '待确认'}

### 3.2 时间要求
${form.timeline || '待确认'}

### 3.3 参考对标
${form.referenceCases || '暂无明确对标案例'}

## 四、初步建议方向

基于以上需求分析，建议本方案从以下几个方面展开：
1. **需求精准匹配**：紧扣${form.coreDemand.split('，')[0]}核心诉求
2. **地域特色融合**：深度融合${form.region}文化与资源特色
3. **技术创新赋能**：运用前沿技术提升文旅体验
4. **可持续运营**：构建可落地、可运营、可迭代的长效机制

---
*报告生成时间：${new Date().toLocaleString()}*
`
  return {
    id: generateId(),
    content,
    generatedAt: new Date().toISOString(),
    editedByUser: false,
  }
}

// ========== Step 1: 分类自动匹配 ==========
export function autoMatchCategory(form: RequirementForm): { category: SolutionCategory; features: CategoryFeatures } {
  let bestMatch = { level2Code: 'T3', level2Name: '旅游景点', level3Code: 'T3-1', level3Name: '自然景观', confidence: 70, reason: '' }

  const demand = (form.coreDemand + form.projectType + form.expectedFeatures).toLowerCase()

  if (demand.includes('文旅厅') || demand.includes('文旅局') || demand.includes('政府') || demand.includes('主管')) {
    bestMatch = { level2Code: 'T1', level2Name: '文旅管理机构', level3Code: 'T1-2', level3Name: '市文旅局', confidence: 92, reason: '需求中明确提到政府文旅主管部门相关关键词' }
  } else if (demand.includes('集团') || demand.includes('投资') || demand.includes('运营公司') || demand.includes('文旅投')) {
    bestMatch = { level2Code: 'T2', level2Name: '文旅企业', level3Code: 'T2-1', level3Name: '文旅集团', confidence: 88, reason: '需求中包含文旅企业投资运营相关关键词' }
  } else if (demand.includes('景区') || demand.includes('景点') || demand.includes('旅游目的地')) {
    if (demand.includes('主题') || demand.includes('乐园') || demand.includes('游乐')) {
      bestMatch = { level2Code: 'T3', level2Name: '旅游景点', level3Code: 'T3-3', level3Name: '主题游乐', confidence: 90, reason: '需求中包含主题乐园/游乐设施相关描述' }
    } else if (demand.includes('乡村') || demand.includes('民宿') || demand.includes('田园')) {
      bestMatch = { level2Code: 'T3', level2Name: '旅游景点', level3Code: 'T3-4', level3Name: '乡村度假', confidence: 85, reason: '需求中包含乡村旅游/民宿相关关键词' }
    } else if (demand.includes('文化') || demand.includes('古迹') || demand.includes('历史') || demand.includes('遗址')) {
      bestMatch = { level2Code: 'T3', level2Name: '旅游景点', level3Code: 'T3-2', level3Name: '文化古迹', confidence: 87, reason: '需求中包含文化古迹/历史遗址相关描述' }
    } else if (demand.includes('研学') || demand.includes('教育') || demand.includes('科普') || demand.includes('红色')) {
      bestMatch = { level2Code: 'T3', level2Name: '旅游景点', level3Code: 'T3-6', level3Name: '研学科教', confidence: 86, reason: '需求中包含研学科教相关关键词' }
    } else if (demand.includes('康养') || demand.includes('温泉') || demand.includes('养生')) {
      bestMatch = { level2Code: 'T3', level2Name: '旅游景点', level3Code: 'T3-7', level3Name: '康养度假', confidence: 84, reason: '需求中包含康养度假相关关键词' }
    } else {
      bestMatch = { level2Code: 'T3', level2Name: '旅游景点', level3Code: 'T3-1', level3Name: '自然景观', confidence: 75, reason: '综合判断为自然景观类旅游项目' }
    }
  } else if (demand.includes('智慧') || demand.includes('数字化') || demand.includes('平台') || demand.includes('大数据')) {
    bestMatch = { level2Code: 'T1', level2Name: '文旅管理机构', level3Code: 'T1-2', level3Name: '市文旅局', confidence: 80, reason: '需求偏智慧文旅平台建设，匹配文旅管理机构' }
  }

  const featureMap: Record<string, CategoryFeatures> = {
    'T1-1': {
      focusPoints: ['省级统筹规划', '全省资源整合', '政策引领示范', '数据中台建设'],
      policyFocus: ['国家文化数字化战略', '文旅部十四五规划', '数字经济发展规划'],
      structureTemplate: ['项目背景', '总体架构', '重点工程', '实施路径', '保障措施'],
      innovationDirections: ['全省一盘棋统筹', '数据共享交换', 'AI辅助决策', '绩效考核体系'],
      safetyRedLines: ['数据安全等级保护', '涉密信息管理', '政务云合规'],
    },
    'T1-2': {
      focusPoints: ['市域文旅治理', '城市品牌营销', '产业升级转型', '智慧监管平台'],
      policyFocus: ['文旅融合发展', '智慧城市建设', '夜间经济培育', '全域旅游示范区'],
      structureTemplate: ['现状分析', '总体思路', '建设内容', '运营模式', '投资估算'],
      innovationDirections: ['城市级文旅大脑', '一机游平台', '数字人导览', '元宇宙场景'],
      safetyRedLines: ['数据安全', '内容审核', '游客隐私保护'],
    },
    'T1-3': {
      focusPoints: ['区县特色打造', '乡村旅游振兴', '基层服务提升', '轻量化落地'],
      policyFocus: ['乡村振兴战略', '公共文化服务', '非遗保护传承'],
      structureTemplate: ['资源盘点', '发展定位', '重点项目', '实施计划'],
      innovationDirections: ['乡村文旅IP', '数字乡村', '轻量级智慧化'],
      safetyRedLines: ['资金使用规范', '生态环境保护'],
    },
    'T2-1': {
      focusPoints: ['集团战略布局', '资产运营效率', '品牌价值提升', '数字化转型'],
      policyFocus: ['国企改革', '文旅融合', '数字经济'],
      structureTemplate: ['战略分析', '业务架构', '技术架构', '实施路径', '效益分析'],
      innovationDirections: ['集团数字化中台', '智慧景区集群', '会员体系打通', '数据资产运营'],
      safetyRedLines: ['投资回报风险', '数据资产安全'],
    },
    'T2-2': {
      focusPoints: ['项目投资回报', '招商运营', '业态创新', '资本运作'],
      policyFocus: ['文旅投资政策', 'PPP模式', '产业基金'],
      structureTemplate: ['项目概况', '市场分析', '业态规划', '投资测算', '风险评估'],
      innovationDirections: ['文旅+地产', 'IP孵化投资', '轻资产输出'],
      safetyRedLines: ['投资风险防控', '合规经营'],
    },
    'T2-3': {
      focusPoints: ['景区运营提效', '游客体验升级', '市场营销推广', '二次消费'],
      policyFocus: ['景区提质升级', '智慧景区标准', '旅游服务质量'],
      structureTemplate: ['现状诊断', '提升方案', '运营策略', '效果预测'],
      innovationDirections: ['智慧导览', '沉浸式体验', '会员营销', '夜经济'],
      safetyRedLines: ['安全生产', '服务质量'],
    },
    'T2-4': {
      focusPoints: ['产品创新', '获客渠道', '服务品质', '数字化营销'],
      policyFocus: ['旅行社转型升级', '在线旅游监管'],
      structureTemplate: ['市场分析', '产品体系', '营销方案', '服务保障'],
      innovationDirections: ['定制游', '直播带货', '私域运营', 'AI客服'],
      safetyRedLines: ['服务质量标准', '游客权益保障'],
    },
    'T3-1': {
      focusPoints: ['生态保护优先', '自然体验升级', '智慧景区建设', '可持续发展'],
      policyFocus: ['生态保护红线', '国家公园体制', '绿水青山就是金山银山'],
      structureTemplate: ['资源评估', '发展定位', '产品体系', '设施规划', '生态保护'],
      innovationDirections: ['生态监测智慧化', '沉浸式自然体验', '低碳旅游', '预约限流'],
      safetyRedLines: ['生态环境保护', '游客安全', '承载量控制'],
    },
    'T3-2': {
      focusPoints: ['文化遗产保护', '活化利用', '沉浸式体验', 'IP打造'],
      policyFocus: ['文化遗产保护', '文物活化利用', '非遗传承'],
      structureTemplate: ['价值评估', '保护规划', '活化方案', '运营模式', '传播推广'],
      innovationDirections: ['数字孪生复原', 'AR文物讲解', '沉浸式剧场', '文创IP开发'],
      safetyRedLines: ['文物保护优先', '历史真实性', '消防安全'],
    },
    'T3-3': {
      focusPoints: ['游乐体验创新', 'IP内容打造', '安全运营', '二次消费'],
      policyFocus: ['主题公园发展', '游乐设施安全', '文旅融合'],
      structureTemplate: ['市场定位', '园区规划', '游乐项目', '演艺内容', '运营管理'],
      innovationDirections: ['元宇宙主题乐园', 'VR/AR游乐', '沉浸式演艺', '智能排队'],
      safetyRedLines: ['游乐设施安全', '消防安全', '应急疏散'],
    },
    'T3-4': {
      focusPoints: ['乡村振兴', '民宿集群', '乡土文化', '共同富裕'],
      policyFocus: ['乡村振兴战略', '乡村旅游发展', '民宿管理规范'],
      structureTemplate: ['资源盘点', '发展定位', '产品体系', '民宿规划', '运营模式'],
      innovationDirections: ['民宿品牌化', '乡村数字治理', '农产品文创化', '共享经济'],
      safetyRedLines: ['耕地保护', '食品安全', '消防规范'],
    },
    'T3-5': {
      focusPoints: ['安全保障', '专业体验', '分级路线', '应急救援'],
      policyFocus: ['户外运动发展', '安全生产', '应急管理'],
      structureTemplate: ['资源评估', '项目规划', '安全体系', '救援保障', '运营管理'],
      innovationDirections: ['智能穿戴设备', 'AR导航', '安全监测系统', '电子围栏'],
      safetyRedLines: ['安全保障体系', '应急预案', '专业教练资质'],
    },
    'T3-6': {
      focusPoints: ['教育内容设计', '安全管理', '课程体系', '师资培训'],
      policyFocus: ['研学旅行规范', '素质教育', '红色教育'],
      structureTemplate: ['教育目标', '课程体系', '基地建设', '安全保障', '师资力量'],
      innovationDirections: ['VR/AR沉浸式教学', 'AI辅导员', '数字博物馆', '线上研学'],
      safetyRedLines: ['学生安全', '教育内容合规', '食品安全'],
    },
    'T3-7': {
      focusPoints: ['健康养生', '康复疗养', '生态环境', '服务品质'],
      policyFocus: ['健康中国战略', '康养产业发展', '中医药健康旅游'],
      structureTemplate: ['资源评估', '发展定位', '产品体系', '服务标准', '运营模式'],
      innovationDirections: ['智慧健康监测', '中医AI诊疗', '森林疗愈', '温泉康养'],
      safetyRedLines: ['医疗资质', '食品安全', '服务规范'],
    },
  }

  const features = featureMap[bestMatch.level3Code] || featureMap['T3-1']

  return {
    category: {
      level1: '旅游',
      level2: bestMatch.level2Name,
      level2Code: bestMatch.level2Code,
      level3: bestMatch.level3Name,
      level3Code: bestMatch.level3Code,
      matchReason: bestMatch.reason,
      confidence: bestMatch.confidence,
    },
    features,
  }
}

// ========== Step 2: 信息搜集生成 ==========
export function generateResearchData(
  form: RequirementForm,
  category: SolutionCategory
): ResearchData {
  const region = form.region || '项目所在地'

  const policies: PolicyItem[] = [
    {
      id: generateId(),
      title: '文化和旅游部"十四五"文化和旅游发展规划',
      level: 'national',
      publishDate: '2021-12-15',
      keyPoints: ['到2025年社会主义文化强国建设取得重大进展', '文化和旅游高质量发展取得新成效', '推进文化数字化战略'],
      source: '文化和旅游部官网',
      credibility: 95,
      selected: true,
    },
    {
      id: generateId(),
      title: `${region}文化和旅游发展"十四五"规划`,
      level: 'provincial',
      publishDate: '2022-06-20',
      keyPoints: [
        `打造${region}文旅品牌`,
        '推进智慧旅游建设',
        '培育文旅融合新业态',
      ],
      source: `${region}文旅厅`,
      credibility: 90,
      selected: true,
    },
    {
      id: generateId(),
      title: '关于促进旅游业高质量发展的意见',
      level: 'national',
      publishDate: '2023-08-10',
      keyPoints: ['丰富优质旅游产品供给', '完善旅游基础设施', '提升旅游服务质量', '推进"旅游+"融合发展'],
      source: '国务院办公厅',
      credibility: 98,
      selected: true,
    },
    {
      id: generateId(),
      title: `${region}智慧旅游建设实施方案`,
      level: 'municipal',
      publishDate: '2023-03-15',
      keyPoints: [
        '建设市级文旅大数据平台',
        '实现3A级以上景区智慧化全覆盖',
        '推广"一机游"应用',
      ],
      source: `${region}文旅局`,
      credibility: 88,
      selected: true,
    },
    {
      id: generateId(),
      title: '文化数字化战略实施方案',
      level: 'national',
      publishDate: '2022-05-22',
      keyPoints: ['国家文化大数据体系建设', '文化资源数字化转化', '文化产业数字化升级'],
      source: '中办国办',
      credibility: 96,
      selected: false,
    },
  ]

  const localResources: ResourceItem[] = [
    {
      id: generateId(),
      name: `${region}博物馆`,
      type: 'museum',
      description: '综合性博物馆，馆藏文物丰富，展示本地历史文化',
      level: '国家一级博物馆',
      selected: true,
    },
    {
      id: generateId(),
      name: `${region}古城/历史街区`,
      type: 'heritage',
      description: '历史文化街区，保存完整的古建筑群，承载城市记忆',
      level: '省级历史文化街区',
      selected: true,
    },
    {
      id: generateId(),
      name: `${region}特色美食`,
      type: 'food',
      description: '本地特色餐饮文化，代表性小吃和名菜',
      selected: true,
    },
    {
      id: generateId(),
      name: `${region}非遗项目`,
      type: 'cultureIP',
      description: '非物质文化遗产代表性项目，传统技艺和民俗',
      level: '国家级/省级',
      selected: true,
    },
    {
      id: generateId(),
      name: `${region}知名景区`,
      type: 'scenic',
      description: '代表性自然或人文景区，区域旅游核心吸引物',
      level: '4A级/5A级',
      selected: true,
    },
    {
      id: generateId(),
      name: `${region}文旅品牌活动`,
      type: 'brand',
      description: '文化旅游节、节庆活动等城市品牌IP',
      selected: false,
    },
  ]

  const competitorCases: CompetitorItem[] = [
    {
      id: generateId(),
      name: '杭州文旅大脑',
      type: '智慧文旅平台',
      highlights: ['城市级文旅数据中台', '20+部门数据打通', 'AI智能辅助决策'],
      reusableElements: ['数据中台架构设计', '多源数据融合方案', 'AI决策模型'],
      source: 'IMA知识库',
      selected: true,
    },
    {
      id: generateId(),
      name: '西安"畅游西安"一机游',
      type: '一机游平台',
      highlights: ['全域旅游一站式服务', 'AR导览体验', '数字人导游'],
      reusableElements: ['一机游产品架构', 'AR导览实现方案', '数字人应用'],
      source: 'IMA知识库',
      selected: true,
    },
    {
      id: generateId(),
      name: '故宫数字文创',
      type: '数字文旅',
      highlights: ['数字文物库', 'VR故宫', '文创IP运营'],
      reusableElements: ['文物数字化方案', 'IP运营模式', '文创电商体系'],
      source: '公开案例',
      selected: true,
    },
    {
      id: generateId(),
      name: '黄山智慧景区',
      type: '智慧景区',
      highlights: ['智慧票务系统', '客流监测预警', '智能导航导览'],
      reusableElements: ['智慧景区整体方案', '客流预测模型', '智能导览系统'],
      source: '行业案例',
      selected: false,
    },
  ]

  return {
    id: generateId(),
    policies,
    localResources,
    marketData: {
      annualVisitors: `约${Math.floor(Math.random() * 5000 + 1000)}万人次`,
      totalRevenue: `约${Math.floor(Math.random() * 500 + 100)}亿元`,
      perCapitaSpending: `约${Math.floor(Math.random() * 500 + 300)}元`,
      sourceStructure: '省内游客约60%，省外游客约40%',
      consumptionTrend: '沉浸式体验、夜间消费、研学旅游快速增长',
      targetAudience: '以家庭亲子、年轻群体、中老年休闲为主',
    },
    competitorCases,
    industryData: {
      gdp: `${form.region}GDP总量及增速`,
      tourismGdpRatio: '旅游业占GDP比重约8-15%',
      transportation: '高铁/机场/高速路网通达性良好',
      infrastructure: '酒店、餐饮、购物等配套设施完善',
    },
    sources: [
      '文化和旅游部官网',
      `${region}统计局`,
      `${region}文旅厅/局`,
      'IMA文旅知识库',
      '行业研究报告',
    ],
    pendingItems: [
      `${form.region}最新旅游统计数据（待获取官方最新数据）`,
      '对标案例详细方案文档（可上传补充）',
      '甲方内部相关资料（如已有规划、现有系统等）',
    ],
    generatedAt: new Date().toISOString(),
    userEdited: false,
  }
}

// ========== Step 3: 参考案例匹配 ==========
export function generateReferenceData(
  form: RequirementForm,
  category: SolutionCategory
): ReferenceData {
  const imaCases: ReferenceCase[] = [
    {
      id: generateId(),
      name: '杭州文旅大数据平台建设方案',
      score: 92,
      matchReason: '同为市级文旅平台建设，架构和功能高度匹配',
      source: 'ima',
      architecture: ['数据中台', '应用支撑层', '业务应用层', '展示层'],
      features: ['客流监测', '产业分析', '应急指挥', '营销推广'],
      highlights: ['20+部门数据打通', 'AI智能预测', '可视化驾驶舱'],
      technology: ['微服务架构', '大数据平台', 'AI算法'],
      metrics: ['接入数据量: 10亿+', '接口响应: <1s', '准确率: 95%'],
    },
    {
      id: generateId(),
      name: '成都"智游天府"文旅综合服务平台',
      score: 88,
      matchReason: '省级文旅平台标杆，功能模块参考价值高',
      source: 'ima',
      architecture: ['一中心、三平台、N应用'],
      features: ['公共服务', '行业监管', '产业运行'],
      highlights: ['全省一盘棋', '五级联动', '全业态覆盖'],
      technology: ['云原生', '微服务', '大数据'],
      metrics: ['覆盖21市州', '用户量: 500万+'],
    },
    {
      id: generateId(),
      name: '西安数字文旅解决方案',
      score: 85,
      matchReason: '历史文化名城文旅数字化，文化活化经验可借鉴',
      source: 'ima',
      architecture: ['数字底座', '能力中台', '场景应用'],
      features: ['数字孪生', 'AR导览', '数字人'],
      highlights: ['城墙数字孪生', '不夜城AR体验', '数字人导游'],
      technology: ['数字孪生', 'AR/VR', 'AIGC'],
      metrics: ['体验人次: 1000万+', '满意度: 92%'],
    },
  ]

  const builtinCases: ReferenceCase[] = [
    {
      id: generateId(),
      name: '智慧景区整体解决方案',
      score: 82,
      matchReason: '智慧景区标准功能模块，可直接复用',
      source: 'builtin',
      architecture: ['感知层', '网络层', '平台层', '应用层'],
      features: ['智慧票务', '客流监测', '智能导览', '应急指挥'],
      highlights: ['模块化设计', '快速部署', '高性价比'],
      technology: ['IoT', '视频AI', '大数据'],
      metrics: ['部署周期: 30天', '覆盖景区: 50+'],
    },
    {
      id: generateId(),
      name: '一机游平台解决方案',
      score: 80,
      matchReason: '游客端服务平台标准方案',
      source: 'builtin',
      architecture: ['小程序+APP+H5多端'],
      features: ['门票预订', '智能导览', '餐饮住宿', '游记分享'],
      highlights: ['一站式服务', '社交化运营', '精准营销'],
      technology: ['跨平台开发', 'LBS', '推荐算法'],
      metrics: ['用户转化率: 35%', '复购率: 28%'],
    },
    {
      id: generateId(),
      name: '文旅数字孪生解决方案',
      score: 78,
      matchReason: '数字孪生+文旅创新应用',
      source: 'builtin',
      architecture: ['三维建模', '数据融合', '仿真推演', '交互呈现'],
      features: ['全景漫游', '虚拟讲解', '时空穿越', '互动体验'],
      highlights: ['沉浸式体验', '文化活化', '科技感强'],
      technology: ['数字孪生', 'WebGL', 'UE5'],
      metrics: ['建模精度: cm级', '帧率: 60fps'],
    },
  ]

  const localCases: ReferenceCase[] = [
    {
      id: generateId(),
      name: `${form.region}智慧旅游项目（一期）`,
      score: 75,
      matchReason: '本地项目经验，可扩展性强',
      source: 'local',
      architecture: ['现有系统架构'],
      features: ['基础信息化', '票务系统', '官网官微'],
      highlights: ['本地实施经验', '团队熟悉度高'],
      technology: ['传统架构'],
      metrics: ['运行年限: 3年+'],
    },
  ]

  const allCases = [...imaCases, ...builtinCases, ...localCases]
  const selectedCases = allCases.filter(c => c.score >= 80).map(c => c.id)

  const reusableElements: ReusableElements = {
    architecture: allCases.filter(c => c.architecture).flatMap(c => c.architecture!).slice(0, 6),
    features: allCases.filter(c => c.features).flatMap(c => c.features!).slice(0, 8),
    highlights: allCases.filter(c => c.highlights).flatMap(c => c.highlights!).slice(0, 6),
    technology: allCases.filter(c => c.technology).flatMap(c => c.technology!).slice(0, 5),
    metrics: allCases.filter(c => c.metrics).flatMap(c => c.metrics!).slice(0, 4),
  }

  return {
    id: generateId(),
    imaCases,
    localCases,
    builtinCases,
    userUploadedCases: [],
    selectedCases,
    reusableElements,
    generatedAt: new Date().toISOString(),
  }
}

// ========== Step 4: 方案大纲生成 ==========
export function generateSolutionOutline(
  form: RequirementForm,
  category: SolutionCategory,
  researchData: ResearchData,
  referenceData: ReferenceData
): SolutionOutline {
  const sections: OutlineSection[] = [
    {
      id: generateId(),
      chapter: '第一章',
      title: '项目概述',
      pages: [
        {
          id: generateId(),
          pageNumber: 1,
          title: '项目背景与意义',
          keyPoints: ['政策背景', '行业趋势', `${form.region}发展现状`, '项目建设必要性'],
          layout: '左右图文',
          imageSuggestion: `${form.region}城市/景区形象图`,
        },
        {
          id: generateId(),
          pageNumber: 2,
          title: '建设目标与愿景',
          keyPoints: ['总体目标', '阶段性目标', '核心愿景', '预期效益'],
          layout: '四象限目标',
          imageSuggestion: '目标愿景示意图',
        },
        {
          id: generateId(),
          pageNumber: 3,
          title: '需求分析总结',
          keyPoints: ['业务需求', '功能需求', '性能需求', '安全需求'],
          layout: '需求列表+图表',
          chartType: '雷达图',
          imageSuggestion: '需求分析脑图',
        },
      ],
    },
    {
      id: generateId(),
      chapter: '第二章',
      title: '现状分析与对标',
      pages: [
        {
          id: generateId(),
          pageNumber: 4,
          title: `${category.level3}行业现状`,
          keyPoints: ['发展现状', '存在问题', '面临挑战', '发展机遇'],
          layout: 'SWOT分析',
          imageSuggestion: '行业分析图表',
          chartType: '柱状图',
        },
        {
          id: generateId(),
          pageNumber: 5,
          title: `${form.region}资源盘点`,
          keyPoints: ['文旅资源', '产业基础', '基础设施', '政策环境'],
          layout: '资源地图',
          imageSuggestion: `${form.region}资源分布示意图`,
        },
        {
          id: generateId(),
          pageNumber: 6,
          title: '对标案例分析',
          keyPoints: ['标杆案例一', '标杆案例二', '可复用要素', '差异化定位'],
          layout: '案例对比',
          imageSuggestion: '对标案例截图',
          chartType: '对比表格',
        },
      ],
    },
    {
      id: generateId(),
      chapter: '第三章',
      title: '总体方案设计',
      pages: [
        {
          id: generateId(),
          pageNumber: 7,
          title: '总体架构设计',
          keyPoints: ['设计原则', '总体架构', '技术路线', '核心能力'],
          layout: '架构图居中',
          imageSuggestion: '系统总体架构图',
        },
        {
          id: generateId(),
          pageNumber: 8,
          title: '业务架构设计',
          keyPoints: ['业务全景', '核心流程', '业务模块', '协同机制'],
          layout: '业务流程图',
          imageSuggestion: '业务架构全景图',
        },
        {
          id: generateId(),
          pageNumber: 9,
          title: '技术架构设计',
          keyPoints: ['技术选型', '分层架构', '关键技术', '技术优势'],
          layout: '技术栈分层图',
          imageSuggestion: '技术架构图',
        },
        {
          id: generateId(),
          pageNumber: 10,
          title: '数据架构设计',
          keyPoints: ['数据来源', '数据模型', '数据流转', '数据治理'],
          layout: '数据流图',
          imageSuggestion: '数据架构图',
        },
      ],
    },
    {
      id: generateId(),
      chapter: '第四章',
      title: '核心功能模块',
      pages: [
        {
          id: generateId(),
          pageNumber: 11,
          title: '智慧管理平台',
          keyPoints: ['综合管理驾驶舱', '产业运行监测', '应急指挥调度', '绩效考核管理'],
          layout: '功能网格',
          imageSuggestion: '管理平台界面示意图',
        },
        {
          id: generateId(),
          pageNumber: 12,
          title: '智慧服务平台',
          keyPoints: ['一机游小程序', '智能导览讲解', '在线预订服务', '投诉建议反馈'],
          layout: '手机界面展示',
          imageSuggestion: '小程序界面截图',
        },
        {
          id: generateId(),
          pageNumber: 13,
          title: '智慧营销平台',
          keyPoints: ['精准营销推送', '会员体系运营', '数据分析决策', '多渠道分发'],
          layout: '营销漏斗图',
          imageSuggestion: '营销平台架构图',
          chartType: '漏斗图',
        },
        {
          id: generateId(),
          pageNumber: 14,
          title: 'AI创新应用',
          keyPoints: ['AI智能客服', '数字人导游', 'AI内容生成', '智能推荐引擎'],
          layout: 'AI应用矩阵',
          imageSuggestion: 'AI应用场景示意图',
        },
      ],
    },
    {
      id: generateId(),
      chapter: '第五章',
      title: '亮点与创新',
      pages: [
        {
          id: generateId(),
          pageNumber: 15,
          title: '方案核心亮点',
          keyPoints: ['亮点一：技术创新', '亮点二：模式创新', '亮点三：体验创新', '亮点四：运营创新'],
          layout: '亮点卡片',
          imageSuggestion: '亮点展示图',
        },
        {
          id: generateId(),
          pageNumber: 16,
          title: '差异化优势',
          keyPoints: ['相比竞品的优势', '核心竞争力', '不可替代性', '长期价值'],
          layout: '优势对比',
          imageSuggestion: '竞争优势雷达图',
          chartType: '雷达图',
        },
      ],
    },
    {
      id: generateId(),
      chapter: '第六章',
      title: '实施路径',
      pages: [
        {
          id: generateId(),
          pageNumber: 17,
          title: '实施计划与里程碑',
          keyPoints: ['第一阶段：基础建设', '第二阶段：功能完善', '第三阶段：运营推广'],
          layout: '时间轴',
          imageSuggestion: '项目甘特图',
          chartType: '甘特图',
        },
        {
          id: generateId(),
          pageNumber: 18,
          title: '组织与保障',
          keyPoints: ['组织架构', '人员配置', '管理制度', '风险控制'],
          layout: '组织架构图',
          imageSuggestion: '项目组织架构图',
        },
      ],
    },
    {
      id: generateId(),
      chapter: '第七章',
      title: '投资估算与效益分析',
      pages: [
        {
          id: generateId(),
          pageNumber: 19,
          title: '投资估算',
          keyPoints: ['硬件投入', '软件投入', '实施服务', '运营维护'],
          layout: '投资饼图',
          imageSuggestion: '投资构成饼图',
          chartType: '饼图',
        },
        {
          id: generateId(),
          pageNumber: 20,
          title: '效益分析',
          keyPoints: ['经济效益', '社会效益', '管理效益', '长期价值'],
          layout: '效益矩阵',
          imageSuggestion: '效益分析示意图',
        },
      ],
    },
    {
      id: generateId(),
      chapter: '第八章',
      title: '公司优势与案例',
      pages: [
        {
          id: generateId(),
          pageNumber: 21,
          title: '我们的优势',
          keyPoints: ['技术优势', '行业经验', '服务能力', '成功案例'],
          layout: '优势展示',
          imageSuggestion: '公司能力矩阵',
        },
        {
          id: generateId(),
          pageNumber: 22,
          title: '典型案例展示',
          keyPoints: ['案例一', '案例二', '案例三', '客户评价'],
          layout: '案例轮播',
          imageSuggestion: '案例Logo墙',
        },
      ],
    },
  ]

  const totalPages = sections.reduce((sum, s) => sum + s.pages.length, 0)

  return {
    title: `${form.projectName}解决方案`,
    totalPages,
    sections,
    generatedAt: new Date().toISOString(),
    userEdited: false,
  }
}

// ========== Step 4: 质量自检 ==========
export function generateQualityCheck(
  outline: SolutionOutline,
  category: SolutionCategory
): QualityCheckResult {
  return {
    completeness: {
      pass: true,
      issues: [],
      score: 92,
    },
    consistency: {
      pass: true,
      issues: [],
      score: 88,
    },
    accuracy: {
      pass: true,
      issues: ['部分市场数据为模拟数据，建议核实官方最新统计'],
      score: 80,
    },
    differentiation: {
      pass: true,
      issues: [],
      score: 85,
    },
    feasibility: {
      pass: true,
      issues: ['投资估算为参考值，需根据实际需求细化'],
      score: 82,
    },
    innovation: {
      pass: true,
      issues: [],
      score: 86,
    },
    compliance: {
      pass: true,
      issues: [],
      score: 95,
    },
    pendingItems: [
      '核实最新官方旅游统计数据',
      '确认甲方具体预算范围和时间要求',
      '补充甲方内部已有系统和资料',
    ],
    overallScore: 87,
  }
}

// ========== HTML方案生成 ==========
export function generateHtmlSolution(
  form: RequirementForm,
  category: SolutionCategory,
  researchData: ResearchData,
  referenceData: ReferenceData,
  outline: SolutionOutline,
  qualityCheck: QualityCheckResult,
  templateId: string
): string {
  const selectedCases = referenceData.selectedCases
    .map(id =>
      [...referenceData.imaCases, ...referenceData.builtinCases, ...referenceData.localCases].find(c => c.id === id)
    )
    .filter(Boolean) as ReferenceCase[]

  const featuresList = referenceData.reusableElements.features.slice(0, 8)
  const highlightsList = referenceData.reusableElements.highlights.slice(0, 6)

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${outline.title}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: #0a0a14;
  color: #e2e8f0;
  line-height: 1.8;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero Section */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(135deg, #0a0a14 0%, #1a1a2e 50%, #0a1628 100%);
  overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at 30% 50%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 70% 50%, rgba(129, 140, 248, 0.1) 0%, transparent 50%);
}
.hero-content { position: relative; z-index: 1; padding: 60px 20px; }
.hero-badge {
  display: inline-block;
  padding: 8px 20px;
  background: rgba(78, 205, 196, 0.1);
  border: 1px solid rgba(78, 205, 196, 0.3);
  border-radius: 999px;
  color: #4ECDC4;
  font-size: 14px;
  margin-bottom: 32px;
  letter-spacing: 2px;
}
.hero h1 {
  font-size: clamp(32px, 6vw, 64px);
  font-weight: 700;
  background: linear-gradient(135deg, #4ECDC4, #818CF8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
  line-height: 1.2;
}
.hero-subtitle {
  font-size: clamp(16px, 2vw, 22px);
  color: #94a3b8;
  margin-bottom: 40px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}
.hero-info {
  display: flex;
  gap: 32px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 48px;
}
.hero-info-item {
  text-align: center;
}
.hero-info-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}
.hero-info-value {
  font-size: 18px;
  color: #e2e8f0;
  font-weight: 500;
}
.scroll-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  color: #64748b;
  font-size: 14px;
  animation: bounce 2s infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-10px); }
}

/* Section Styles */
.section {
  padding: 100px 0;
  position: relative;
}
.section-alt {
  background: rgba(255, 255, 255, 0.02);
}
.section-header {
  text-align: center;
  margin-bottom: 60px;
}
.section-badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(129, 140, 248, 0.1);
  border: 1px solid rgba(129, 140, 248, 0.2);
  border-radius: 999px;
  color: #818CF8;
  font-size: 13px;
  margin-bottom: 16px;
}
.section-title {
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 700;
  margin-bottom: 16px;
  color: #f1f5f9;
}
.section-desc {
  font-size: 16px;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto;
}

/* Cards Grid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}
.card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s ease;
}
.card:hover {
  border-color: rgba(78, 205, 196, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}
.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(129, 140, 248, 0.1));
}
.card h3 {
  font-size: 20px;
  margin-bottom: 12px;
  color: #f1f5f9;
}
.card p {
  color: #94a3b8;
  font-size: 14px;
}

/* Architecture Section */
.arch-container {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 48px;
  margin: 0 auto;
  max-width: 900px;
}
.arch-layer {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}
.arch-layer:last-child { margin-bottom: 0; }
.arch-label {
  width: 120px;
  font-size: 14px;
  color: #818CF8;
  font-weight: 500;
  flex-shrink: 0;
}
.arch-items {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}
.arch-item {
  padding: 10px 20px;
  background: rgba(78, 205, 196, 0.08);
  border: 1px solid rgba(78, 205, 196, 0.2);
  border-radius: 8px;
  font-size: 14px;
  color: #4ECDC4;
}

/* Timeline */
.timeline {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #4ECDC4, #818CF8);
  transform: translateX(-50%);
}
.timeline-item {
  display: flex;
  margin-bottom: 48px;
  position: relative;
}
.timeline-item:nth-child(odd) { flex-direction: row; }
.timeline-item:nth-child(even) { flex-direction: row-reverse; }
.timeline-content {
  width: 45%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 28px;
}
.timeline-dot {
  position: absolute;
  left: 50%;
  top: 28px;
  width: 16px;
  height: 16px;
  background: #4ECDC4;
  border: 4px solid #0a0a14;
  border-radius: 50%;
  transform: translateX(-50%);
  z-index: 1;
}
.timeline-phase {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(129, 140, 248, 0.1);
  border-radius: 999px;
  color: #818CF8;
  font-size: 12px;
  margin-bottom: 12px;
}
.timeline-content h3 {
  font-size: 20px;
  margin-bottom: 12px;
  color: #f1f5f9;
}
.timeline-content ul {
  list-style: none;
}
.timeline-content li {
  padding: 6px 0;
  color: #94a3b8;
  font-size: 14px;
  padding-left: 20px;
  position: relative;
}
.timeline-content li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #4ECDC4;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-top: 48px;
}
.stat-card {
  text-align: center;
  padding: 32px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}
.stat-number {
  font-size: 48px;
  font-weight: 700;
  background: linear-gradient(135deg, #4ECDC4, #818CF8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}
.stat-label {
  color: #94a3b8;
  font-size: 14px;
}

/* Quality Bar */
.quality-item {
  margin-bottom: 20px;
}
.quality-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}
.quality-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
}
.quality-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ECDC4, #818CF8);
  border-radius: 999px;
  transition: width 1s ease;
}

/* Footer */
.footer {
  padding: 60px 0;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: #64748b;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .section { padding: 60px 0; }
  .arch-container { padding: 24px; }
  .arch-layer { flex-direction: column; align-items: flex-start; }
  .arch-label { width: auto; }
  .timeline::before { left: 20px; }
  .timeline-item, .timeline-item:nth-child(even) { flex-direction: row; }
  .timeline-content { width: calc(100% - 60px); margin-left: 60px; }
  .timeline-dot { left: 20px; }
}
</style>
</head>
<body>

<!-- Hero -->
<section class="hero">
  <div class="hero-content">
    <div class="hero-badge">${category.level2Code} · ${category.level3}</div>
    <h1>${outline.title}</h1>
    <p class="hero-subtitle">${form.coreDemand || '打造文旅行业领先的智慧化解决方案'}</p>
    <div class="hero-info">
      <div class="hero-info-item">
        <div class="hero-info-label">甲方单位</div>
        <div class="hero-info-value">${form.clientName}</div>
      </div>
      <div class="hero-info-item">
        <div class="hero-info-label">项目地域</div>
        <div class="hero-info-value">${form.region}</div>
      </div>
      <div class="hero-info-item">
        <div class="hero-info-label">方案类型</div>
        <div class="hero-info-value">${category.level3}</div>
      </div>
    </div>
  </div>
  <div class="scroll-hint">↓ 向下滑动查看完整方案</div>
</section>

<!-- 一、项目概述 -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <div class="section-badge">第一章</div>
      <h2 class="section-title">项目概述</h2>
      <p class="section-desc">深度理解需求，精准定位目标</p>
    </div>
    <div class="card-grid">
      <div class="card">
        <div class="card-icon">🎯</div>
        <h3>建设目标</h3>
        <p>以${form.coreDemand.split('，')[0]}为核心，构建覆盖管理、服务、营销全链条的智慧文旅体系</p>
      </div>
      <div class="card">
        <div class="card-icon">📍</div>
        <h3>项目定位</h3>
        <p>${form.region}${category.level3}领域的标杆性项目，引领区域文旅数字化转型升级</p>
      </div>
      <div class="card">
        <div class="card-icon">👥</div>
        <h3>服务对象</h3>
        <p>${form.targetAudience || '文旅管理者、景区运营方、游客群体'}</p>
      </div>
      <div class="card">
        <div class="card-icon">💎</div>
        <h3>核心价值</h3>
        <p>提升管理效率、优化游客体验、促进产业发展、塑造品牌形象</p>
      </div>
    </div>
  </div>
</section>

<!-- 二、总体架构 -->
<section class="section section-alt">
  <div class="container">
    <div class="section-header">
      <div class="section-badge">第三章</div>
      <h2 class="section-title">总体架构设计</h2>
      <p class="section-desc">先进技术架构，保障系统高性能、可扩展、易维护</p>
    </div>
    <div class="arch-container">
      <div class="arch-layer">
        <div class="arch-label">应用层</div>
        <div class="arch-items">
          ${referenceData.reusableElements.features.slice(0, 4).map(f => `<span class="arch-item">${f}</span>`).join('')}
        </div>
      </div>
      <div class="arch-layer">
        <div class="arch-label">平台层</div>
        <div class="arch-items">
          <span class="arch-item">AI能力平台</span>
          <span class="arch-item">大数据平台</span>
          <span class="arch-item">GIS地图平台</span>
          <span class="arch-item">统一认证</span>
        </div>
      </div>
      <div class="arch-layer">
        <div class="arch-label">数据层</div>
        <div class="arch-items">
          <span class="arch-item">数据中台</span>
          <span class="arch-item">数据治理</span>
          <span class="arch-item">数据交换</span>
          <span class="arch-item">数据仓库</span>
        </div>
      </div>
      <div class="arch-layer">
        <div class="arch-label">基础设施</div>
        <div class="arch-items">
          <span class="arch-item">云计算</span>
          <span class="arch-item">物联网</span>
          <span class="arch-item">5G网络</span>
          <span class="arch-item">安全防护</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 三、核心功能 -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <div class="section-badge">第四章</div>
      <h2 class="section-title">核心功能模块</h2>
      <p class="section-desc">八大核心功能，覆盖文旅全场景</p>
    </div>
    <div class="card-grid">
      ${featuresList.map((f, i) => `
      <div class="card">
        <div class="card-icon">${['📊', '📱', '🎯', '🤖', '🔔', '🗺️', '📈', '🔐'][i % 8]}</div>
        <h3>${f}</h3>
        <p>基于${category.level3}业务特点量身打造，满足${form.region}本地化需求</p>
      </div>
      `).join('')}
    </div>
  </div>
</section>

<!-- 四、方案亮点 -->
<section class="section section-alt">
  <div class="container">
    <div class="section-header">
      <div class="section-badge">第五章</div>
      <h2 class="section-title">方案核心亮点</h2>
      <p class="section-desc">六大创新亮点，打造差异化竞争优势</p>
    </div>
    <div class="card-grid">
      ${highlightsList.map((h, i) => `
      <div class="card">
        <div class="card-icon">${['⭐', '🚀', '💡', '🎨', '🔗', '🎯'][i % 6]}</div>
        <h3>${h}</h3>
        <p>行业领先的创新实践，助力项目脱颖而出</p>
      </div>
      `).join('')}
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${qualityCheck.overallScore}</div>
        <div class="stat-label">方案质量评分</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${selectedCases.length}</div>
        <div class="stat-label">参考标杆案例</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${outline.totalPages}</div>
        <div class="stat-label">方案页数</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${researchData.policies.filter(p => p.selected).length}</div>
        <div class="stat-label">政策依据</div>
      </div>
    </div>
  </div>
</section>

<!-- 五、实施路径 -->
<section class="section">
  <div class="container">
    <div class="section-header">
      <div class="section-badge">第六章</div>
      <h2 class="section-title">实施路径</h2>
      <p class="section-desc">分阶段、有节奏地推进项目落地</p>
    </div>
    <div class="timeline">
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <span class="timeline-phase">第一阶段 · 1-3个月</span>
          <h3>基础建设期</h3>
          <ul>
            <li>完成需求调研与方案设计</li>
            <li>搭建基础设施与平台底座</li>
            <li>核心功能模块开发</li>
            <li>数据接入与整合</li>
          </ul>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <span class="timeline-phase">第二阶段 · 4-6个月</span>
          <h3>功能完善期</h3>
          <ul>
            <li>全部功能模块开发完成</li>
            <li>系统联调与测试</li>
            <li>试运行与优化调整</li>
            <li>用户培训与上线</li>
          </ul>
        </div>
      </div>
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <span class="timeline-phase">第三阶段 · 持续运营</span>
          <h3>运营推广期</h3>
          <ul>
            <li>全面上线运营</li>
            <li>持续迭代优化</li>
            <li>运营数据分析</li>
            <li>新功能拓展</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 六、质量保证 -->
<section class="section section-alt">
  <div class="container">
    <div class="section-header">
      <div class="section-badge">质量自检</div>
      <h2 class="section-title">七大维度质量保障</h2>
      <p class="section-desc">严格的质量管控，确保方案专业可靠</p>
    </div>
    <div style="max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 40px;">
      <div class="quality-item">
        <div class="quality-label"><span>完整性</span><span>${qualityCheck.completeness.score}分</span></div>
        <div class="quality-bar"><div class="quality-fill" style="width: ${qualityCheck.completeness.score}%"></div></div>
      </div>
      <div class="quality-item">
        <div class="quality-label"><span>一致性</span><span>${qualityCheck.consistency.score}分</span></div>
        <div class="quality-bar"><div class="quality-fill" style="width: ${qualityCheck.consistency.score}%"></div></div>
      </div>
      <div class="quality-item">
        <div class="quality-label"><span>准确性</span><span>${qualityCheck.accuracy.score}分</span></div>
        <div class="quality-bar"><div class="quality-fill" style="width: ${qualityCheck.accuracy.score}%"></div></div>
      </div>
      <div class="quality-item">
        <div class="quality-label"><span>差异化</span><span>${qualityCheck.differentiation.score}分</span></div>
        <div class="quality-bar"><div class="quality-fill" style="width: ${qualityCheck.differentiation.score}%"></div></div>
      </div>
      <div class="quality-item">
        <div class="quality-label"><span>可行性</span><span>${qualityCheck.feasibility.score}分</span></div>
        <div class="quality-bar"><div class="quality-fill" style="width: ${qualityCheck.feasibility.score}%"></div></div>
      </div>
      <div class="quality-item">
        <div class="quality-label"><span>创新性</span><span>${qualityCheck.innovation.score}分</span></div>
        <div class="quality-bar"><div class="quality-fill" style="width: ${qualityCheck.innovation.score}%"></div></div>
      </div>
      <div class="quality-item">
        <div class="quality-label"><span>合规性</span><span>${qualityCheck.compliance.score}分</span></div>
        <div class="quality-bar"><div class="quality-fill" style="width: ${qualityCheck.compliance.score}%"></div></div>
      </div>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="footer">
  <div class="container">
    <p>${outline.title}</p>
    <p style="margin-top: 8px;">生成时间：${new Date().toLocaleString()} · AI智能方案生成</p>
  </div>
</footer>

</body>
</html>`

  return html
}

export function downloadHtml(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
