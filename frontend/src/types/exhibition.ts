// 策展方案相关类型定义

export interface ExhibitionBasicInfo {
  theme: string
  name: string
  organizer?: string
  venue?: string
  startDate?: string
  endDate?: string
  area?: number
}

export interface ExhibitionPositioning {
  planType: string
  targetAudience: string
  targetAudienceOther?: string
  educationGoal?: string
}

export interface ExhibitionZone {
  id?: string
  zoneNumber: number
  name: string
  subtitle?: string
  timePeriod?: string
  narrative?: string
}

export interface ExhibitionCoreExhibit {
  id?: string
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
}

export interface ExhibitionAuxiliaryExhibit {
  id?: string
  zoneId?: string
  exhibitName: string
  era?: string
  origin?: string
  material?: string
  artifactLevel?: string
  description?: string
  isReplica?: boolean
}

export interface ExhibitionDisplayDesign {
  totalArea?: number
  layoutType?: string
  trafficDesign?: string
  lightingDesign?: string
  multimediaConfig?: string
}

export interface ExhibitionEducation {
  activities?: string
  educationPrograms?: string
  publicityPlan?: string
  publications?: string
}

export interface ExhibitionPlan {
  id: string
  theme?: string
  name?: string
  planType?: string
  zoneCount?: number
  coreExhibitCount?: number
  status: string
  version?: number
  createdAt: string
  updatedAt: string
  generatedAt?: string
  basicInfo?: ExhibitionBasicInfo
  positioning?: ExhibitionPositioning
  zones?: ExhibitionZone[]
  coreExhibits?: ExhibitionCoreExhibit[]
  auxiliaryExhibits?: ExhibitionAuxiliaryExhibit[]
  displayDesign?: ExhibitionDisplayDesign
  educationPlan?: ExhibitionEducation
  generatedContent?: string
  parent?: ExhibitionPlan
}

export interface ExhibitionPlanListItem {
  id: string
  theme?: string
  name?: string
  planType?: string
  zoneCount: number
  coreExhibitCount: number
  status: string
  version: number
  createdAt: string
  updatedAt: string
  generatedAt?: string
}

// 展览主题选项
export const EXHIBITION_THEMES = [
  { id: '水利文明', name: '水利文明', icon: '💧', description: '与大江大河、治水工程相关' },
  { id: '丝绸之路', name: '丝绸之路', icon: '🐫', description: '与古代商贸、东西交流相关' },
  { id: '青铜文明', name: '青铜文明', icon: '⚱️', description: '与青铜器、礼乐文化相关' },
  { id: '陶瓷艺术', name: '陶瓷艺术', icon: '🏺', description: '与瓷器、窑口文化相关' },
  { id: '玉器文化', name: '玉器文化', icon: '💎', description: '与玉器、礼仪制度相关' },
  { id: '佛教艺术', name: '佛教艺术', icon: '🪷', description: '与佛教造像、艺术相关' },
  { id: '书画艺术', name: '书画艺术', icon: '🖌️', description: '与书法、绘画艺术相关' },
  { id: '建筑园林', name: '建筑园林', icon: '🏯', description: '与传统建筑、园林艺术相关' },
  { id: '服饰文化', name: '服饰文化', icon: '👘', description: '与传统服饰、织绣工艺相关' },
  { id: '茶文化', name: '茶文化', icon: '🍵', description: '与茶道、茶文化相关' },
  { id: '运河文化', name: '运河文化', icon: '🚢', description: '与大运河、盐运文化相关' },
  { id: '其他', name: '其他主题', icon: '📚', description: '其他类型的展览主题' }
]

// 展览类型选项
export const PLAN_TYPES = [
  { id: 'permanent', name: '常设展', description: '长期对外开放的展览' },
  { id: 'temporary', name: '临时展', description: '短期或季节性展览' },
  { id: 'special', name: '专题展', description: '围绕特定主题的专题展览' }
]

// 目标受众选项
export const TARGET_AUDIENCES = [
  { id: 'general', name: '普通观众', description: '面向社会大众' },
  { id: 'professional', name: '专业观众', description: '面向研究人员、专业人士' },
  { id: 'youth', name: '青少年', description: '面向中小学生群体' },
  { id: 'family', name: '亲子家庭', description: '面向家庭亲子群体' },
  { id: 'international', name: '国际观众', description: '面向海外游客' }
]

// 布局类型选项
export const LAYOUT_TYPES = [
  { id: 'linear', name: '线性布局', description: '按时间或逻辑顺序单线展开' },
  { id: 'circular', name: '环形布局', description: '从中心向四周辐射，适合主题式展览' },
  { id: 'hybrid', name: '混合布局', description: '结合线性和环形特点' }
]

// 文物等级选项
export const ARTIFACT_LEVELS = [
  { id: 'level1', name: '一级文物', description: '禁止出境展览' },
  { id: 'level2', name: '二级文物', description: '限制出境' },
  { id: 'level3', name: '三级文物', description: '一般文物' },
  { id: 'replica', name: '复制品', description: '文物复制或仿制品' }
]

// 主题知识库类型
export interface ThemeCoreStory {
  narrative: string
  highlight: string
}

export interface ThemeKnowledgeBase {
  themeId: string
  themeName: string
  coreStory: ThemeCoreStory
  mustHaveArtifacts: string[]
  recommendedArtifacts: string[]
  spatialHint: string
  curatorialNotes: string
  artifactPool: ThemeArtifact[]
  recommendedLiterature?: ThemeLiterature[]
  researchContext?: string
  keyDimensions?: string[]
}

export interface ThemeLiterature {
  id: string
  title: string
  author: string
  year: string
  publisher: string
  description: string
  type: 'core' | 'reference'
  category?: string
  importance?: string
  pages?: string
}

export interface ThemeArtifact {
  id: string
  name: string
  era: string
  category: string
  level?: string
  origin?: string
  material?: string
  unearthed?: string
  unearthedYear?: string
  collection?: string
  description?: string
  significance?: string
  highlight?: string
  themes?: string[]
  isMustHave?: boolean
  isRecommended?: boolean
  image?: string
  emoji?: string
}

// 展品推荐级别
export enum ArtifactPriority {
  MUST_HAVE = 'must',
  RECOMMENDED = 'recommended',
  OPTIONAL = 'optional'
}
