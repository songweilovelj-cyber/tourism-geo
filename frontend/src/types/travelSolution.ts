// 文旅解决方案类型定义 - 完整分步交互版

export interface StepStatus {
  current: number
  completed: number[]
  locked: number[]
}

// ========== Step 0: 需求采集 ==========
export interface RequirementForm {
  projectName: string
  clientName: string
  region: string
  projectType: string
  coreDemand: string
  targetAudience: string
  expectedFeatures: string
  referenceCases: string
  budgetRange: string
  timeline: string
}

export interface RequirementReport {
  id: string
  content: string
  generatedAt: string
  editedByUser: boolean
}

// ========== Step 1: 分类识别 ==========
export interface SolutionCategory {
  level1: string
  level2: string
  level2Code: string
  level3: string
  level3Code: string
  matchReason: string
  confidence: number
}

export interface CategoryFeatures {
  focusPoints: string[]
  policyFocus: string[]
  structureTemplate: string[]
  innovationDirections: string[]
  safetyRedLines: string[]
}

// ========== Step 2: 信息搜集 ==========
export interface ResearchData {
  id: string
  policies: PolicyItem[]
  localResources: ResourceItem[]
  marketData: MarketDataItem
  competitorCases: CompetitorItem[]
  industryData: IndustryDataItem
  sources: string[]
  pendingItems: string[]
  generatedAt: string
  userEdited: boolean
}

export interface PolicyItem {
  id: string
  title: string
  level: 'national' | 'provincial' | 'municipal' | 'district'
  publishDate: string
  keyPoints: string[]
  source: string
  credibility: number
  selected: boolean
}

export interface ResourceItem {
  id: string
  name: string
  type: 'cultureIP' | 'scenic' | 'heritage' | 'food' | 'brand' | 'museum'
  description: string
  level?: string
  selected: boolean
}

export interface MarketDataItem {
  annualVisitors: string
  totalRevenue: string
  perCapitaSpending: string
  sourceStructure: string
  consumptionTrend: string
  targetAudience: string
}

export interface CompetitorItem {
  id: string
  name: string
  type: string
  highlights: string[]
  reusableElements: string[]
  source: string
  selected: boolean
}

export interface IndustryDataItem {
  gdp: string
  tourismGdpRatio: string
  transportation: string
  infrastructure: string
}

// ========== Step 3: 参考匹配 ==========
export interface ReferenceData {
  id: string
  imaCases: ReferenceCase[]
  localCases: ReferenceCase[]
  builtinCases: ReferenceCase[]
  userUploadedCases: ReferenceCase[]
  selectedCases: string[]
  reusableElements: ReusableElements
  generatedAt: string
}

export interface ReferenceCase {
  id: string
  name: string
  score: number
  matchReason: string
  source: 'ima' | 'local' | 'builtin' | 'uploaded'
  filePath?: string
  fileType?: string
  architecture?: string[]
  features?: string[]
  highlights?: string[]
  technology?: string[]
  metrics?: string[]
}

export interface ReusableElements {
  architecture: string[]
  features: string[]
  highlights: string[]
  technology: string[]
  metrics: string[]
}

// ========== Step 4: 方案生成 ==========
export interface SolutionOutline {
  title: string
  totalPages: number
  sections: OutlineSection[]
  generatedAt: string
  userEdited: boolean
}

export interface OutlineSection {
  id: string
  chapter: string
  title: string
  pages: OutlinePage[]
}

export interface OutlinePage {
  id: string
  pageNumber: number
  title: string
  keyPoints: string[]
  layout: string
  imageSuggestion: string
  chartType?: string
}

export interface QualityCheckResult {
  completeness: { pass: boolean; issues: string[]; score: number }
  consistency: { pass: boolean; issues: string[]; score: number }
  accuracy: { pass: boolean; issues: string[]; score: number }
  differentiation: { pass: boolean; issues: string[]; score: number }
  feasibility: { pass: boolean; issues: string[]; score: number }
  innovation: { pass: boolean; issues: string[]; score: number }
  compliance: { pass: boolean; issues: string[]; score: number }
  pendingItems: string[]
  overallScore: number
}

// ========== PPT模板 ==========
export interface PPTTemplate {
  id: string
  name: string
  category: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  bgColor: string
  textColor: string
  description: string
  suitableFor: string[]
  isBuiltin: boolean
  isUploaded?: boolean
  filePath?: string
  preview?: string
}

// ========== 输出配置 ==========
export interface OutputConfig {
  formats: string[]
  pptTemplateId: string
  htmlTemplateId: string
  includeQualityReport: boolean
  includeAppendix: boolean
}

// ========== 完整方案 ==========
export interface TravelSolution {
  id: string
  name: string
  status: 'draft' | 'step0' | 'step1' | 'step2' | 'step3' | 'step4' | 'completed'
  currentStep: number
  createdAt: string
  updatedAt: string

  requirementForm?: RequirementForm
  requirementReport?: RequirementReport
  category?: SolutionCategory
  categoryFeatures?: CategoryFeatures
  researchData?: ResearchData
  referenceData?: ReferenceData
  outline?: SolutionOutline
  qualityCheck?: QualityCheckResult
  outputConfig?: OutputConfig
  htmlContent?: string
  pptBlobUrl?: string

  version: number
  history: Array<{
    step: number
    timestamp: string
    action: string
  }>
}

// ========== 常量 ==========
export const CATEGORY_TREE = {
  level1: '旅游',
  level2: [
    {
      code: 'T1',
      name: '文旅管理机构',
      description: '政府文旅主管部门',
      level3: [
        { code: 'T1-1', name: '省文旅厅', description: '省级文化和旅游行政主管部门' },
        { code: 'T1-2', name: '市文旅局', description: '地市级文化和旅游行政主管部门' },
        { code: 'T1-3', name: '区县文旅局', description: '区县级文化和旅游行政主管部门' },
      ]
    },
    {
      code: 'T2',
      name: '文旅企业',
      description: '文旅投资运营企业',
      level3: [
        { code: 'T2-1', name: '文旅集团', description: '大型文旅投资运营集团' },
        { code: 'T2-2', name: '文旅投公司', description: '文旅投资开发公司' },
        { code: 'T2-3', name: '私营旅游企业', description: '民营景区运营方、文旅服务商' },
        { code: 'T2-4', name: '旅行社', description: '传统/在线旅行社、地接社' },
      ]
    },
    {
      code: 'T3',
      name: '旅游景点',
      description: '景区、目的地、度假区',
      level3: [
        { code: 'T3-1', name: '自然景观', description: '山岳、湖泊、森林、海洋等' },
        { code: 'T3-2', name: '文化古迹', description: '历史遗址、古建筑、寺庙等' },
        { code: 'T3-3', name: '主题游乐', description: '主题乐园、游乐园、水上乐园等' },
        { code: 'T3-4', name: '乡村度假', description: '乡村旅游、民宿集群、田园综合体' },
        { code: 'T3-5', name: '户外探险', description: '徒步、漂流、攀岩、极限运动' },
        { code: 'T3-6', name: '研学科教', description: '研学基地、科普馆、红色教育' },
        { code: 'T3-7', name: '康养度假', description: '温泉、森林康养、中医养生' },
      ]
    }
  ]
}

export const STEP_CONFIG = [
  {
    id: 0,
    name: '需求采集',
    icon: '📋',
    desc: '收集项目需求，生成需求分析报告',
    subTitle: '明确项目背景与核心诉求',
  },
  {
    id: 1,
    name: '分类识别',
    icon: '🏷️',
    desc: '匹配三级分类，注入行业特征',
    subTitle: '定位方案类型与侧重点',
  },
  {
    id: 2,
    name: '信息搜集',
    icon: '🔍',
    desc: '六维度调研，生成调研报告',
    subTitle: '政策、资源、市场、竞品全掌握',
  },
  {
    id: 3,
    name: '参考匹配',
    icon: '📚',
    desc: '多库案例匹配，提取可复用要素',
    subTitle: '站在标杆案例的肩膀上',
  },
  {
    id: 4,
    name: '方案生成',
    icon: '✨',
    desc: '综合生成方案，7大质量自检',
    subTitle: '输出HTML/PPT专业方案文档',
  },
]

export const PPT_TEMPLATES: PPTTemplate[] = [
  {
    id: 'tpl-gov-blue',
    name: '政务深蓝',
    category: '政务类',
    primaryColor: '#1E3A5F',
    secondaryColor: '#2B6CB0',
    accentColor: '#63B3ED',
    bgColor: '#0F1F3D',
    textColor: '#FFFFFF',
    description: '沉稳大气的政务蓝色系，适合政府汇报',
    suitableFor: ['T1-1', 'T1-2', 'T1-3'],
    isBuiltin: true,
  },
  {
    id: 'tpl-gov-red',
    name: '党政红',
    category: '政务类',
    primaryColor: '#8B0000',
    secondaryColor: '#CD5C5C',
    accentColor: '#FFD700',
    bgColor: '#1a0a0a',
    textColor: '#FFFFFF',
    description: '正式庄重的红色系，适合党政机关汇报',
    suitableFor: ['T1-1', 'T1-2', 'T1-3'],
    isBuiltin: true,
  },
  {
    id: 'tpl-tourism-green',
    name: '生态绿',
    category: '文旅类',
    primaryColor: '#2D6A4F',
    secondaryColor: '#40916C',
    accentColor: '#95D5B2',
    bgColor: '#F0FFF4',
    textColor: '#1B4332',
    description: '清新自然的绿色系，适合生态旅游景区',
    suitableFor: ['T3-1', 'T3-4', 'T3-5'],
    isBuiltin: true,
  },
  {
    id: 'tpl-culture-gold',
    name: '古韵金',
    category: '文旅类',
    primaryColor: '#8B6914',
    secondaryColor: '#D4AF37',
    accentColor: '#CD853F',
    bgColor: '#1a1510',
    textColor: '#F5E6D3',
    description: '典雅厚重的金色系，适合文化古迹类',
    suitableFor: ['T3-2', 'T3-6'],
    isBuiltin: true,
  },
  {
    id: 'tpl-tech-purple',
    name: '科技紫蓝',
    category: '科技类',
    primaryColor: '#4C1D95',
    secondaryColor: '#2563EB',
    accentColor: '#818CF8',
    bgColor: '#0D0D1A',
    textColor: '#FFFFFF',
    description: '炫酷科技感，适合智慧旅游/AI+文旅',
    suitableFor: ['T1-1', 'T2-1', 'T3-3'],
    isBuiltin: true,
  },
  {
    id: 'tpl-tech-cyan',
    name: '赛博青',
    category: '科技类',
    primaryColor: '#0891B2',
    secondaryColor: '#06B6D4',
    accentColor: '#22D3EE',
    bgColor: '#0a1628',
    textColor: '#E0F2FE',
    description: '赛博朋克风青色系，适合数字孪生/元宇宙',
    suitableFor: ['T1-1', 'T3-3', 'T2-1'],
    isBuiltin: true,
  },
  {
    id: 'tpl-business-dark',
    name: '商务黑金',
    category: '商务类',
    primaryColor: '#1A1A2E',
    secondaryColor: '#16213E',
    accentColor: '#C9A84C',
    bgColor: '#0F0E17',
    textColor: '#FFFFFE',
    description: '高端商务深色系，适合度假品牌/高端景区',
    suitableFor: ['T2-1', 'T3-7', 'T3-3'],
    isBuiltin: true,
  },
  {
    id: 'tpl-business-blue',
    name: '商务蓝灰',
    category: '商务类',
    primaryColor: '#1E293B',
    secondaryColor: '#334155',
    accentColor: '#3B82F6',
    bgColor: '#F8FAFC',
    textColor: '#1E293B',
    description: '专业简洁的蓝灰色，适合企业方案',
    suitableFor: ['T2-1', 'T2-2', 'T2-3'],
    isBuiltin: true,
  },
  {
    id: 'tpl-youth-orange',
    name: '活力橙',
    category: '年轻向',
    primaryColor: '#C2410C',
    secondaryColor: '#EA580C',
    accentColor: '#FB923C',
    bgColor: '#FFF7ED',
    textColor: '#7C2D12',
    description: '活力四射的橙色系，适合主题乐园/年轻客群',
    suitableFor: ['T3-3', 'T3-5', 'T2-4'],
    isBuiltin: true,
  },
  {
    id: 'tpl-health-green',
    name: '康养绿',
    category: '康养类',
    primaryColor: '#065F46',
    secondaryColor: '#047857',
    accentColor: '#34D399',
    bgColor: '#ECFDF5',
    textColor: '#064E3B',
    description: '舒缓清新的绿色系，适合康养度假类',
    suitableFor: ['T3-7', 'T3-1', 'T3-4'],
    isBuiltin: true,
  },
  {
    id: 'tpl-edu-blue',
    name: '科教蓝',
    category: '教育类',
    primaryColor: '#1E40AF',
    secondaryColor: '#2563EB',
    accentColor: '#60A5FA',
    bgColor: '#EFF6FF',
    textColor: '#1E3A8A',
    description: '专业严谨的蓝色系，适合研学科教类',
    suitableFor: ['T3-6', 'T1-2', 'T1-3'],
    isBuiltin: true,
  },
  {
    id: 'tpl-minimal-white',
    name: '极简白',
    category: '通用类',
    primaryColor: '#18181B',
    secondaryColor: '#3F3F46',
    accentColor: '#71717A',
    bgColor: '#FAFAFA',
    textColor: '#18181B',
    description: '极简白灰风格，通用性强',
    suitableFor: ['all'],
    isBuiltin: true,
  },
]

export const HTML_TEMPLATES = [
  { id: 'html-dark-tech', name: '深色科技风', preview: 'dark' },
  { id: 'html-light-business', name: '浅色商务风', preview: 'light' },
  { id: 'html-gov-blue', name: '政务蓝色风', preview: 'gov' },
  { id: 'html-travel-green', name: '文旅绿色风', preview: 'green' },
]
