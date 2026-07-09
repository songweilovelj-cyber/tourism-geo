// 研究模式类型
export type ResearchMode = 'single' | 'batch' | 'category'

// 步骤类型（优化后：5步）
export type ConversationStep = 
  | 'welcome'          // 欢迎页
  | 'project_info'      // 项目信息（合并表单）
  | 'generating'        // 生成中
  | 'review'            // 审核校验
  | 'final'             // 完成

// 单个文物信息
export interface Artifact {
  id: string
  name: string
  type: string
  era: string
  origin: string
  collection: string
  description: string
  images: string[]
}

// 作者信息
export interface AuthorInfo {
  name: string
  institution: string
  department: string
  address: string
  postalCode: string
  email: string
  researchDirection: string
}

// 整合后的项目信息
export interface ProjectInfo {
  researchMode: ResearchMode
  artifacts: Artifact[]
  researchPurpose: string
  researchMethods: string[]
  keyFindings: string
  innovations: string
  relatedLiterature: string
  targetJournal: string
  authorInfo: AuthorInfo
}

// 论文数据
export interface PaperData {
  title: string
  abstract: string
  keywords: string[]
  introduction: string
  materialsAndMethods: string
  results: string
  discussion: string
  conclusion: string
  references: Array<{
    type: string
    authors: string
    title: string
    journal?: string
    year?: string
    volume?: string
    pages?: string
    publisher?: string
  }>
}

// 格式校验结果
export interface FormatCheckResult {
  titleFormat: boolean
  abstractFormat: boolean
  keywordCount: boolean
  sectionStructure: boolean
  referenceFormat: boolean
  figureNumbering: boolean
  issues: string[]
}

// 聊天消息
export type ChatRole = 'assistant' | 'user'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  type?: 'text' | 'question' | 'form' | 'preview' | 'checklist'
  data?: any
}

// 状态定义
export interface HeritagePaperState {
  currentStep: ConversationStep
  messages: ChatMessage[]
  projectInfo: ProjectInfo
  paperData: PaperData | null
  formatCheckResult: FormatCheckResult | null
  revisionHistory: string[]
  // 兼容旧版
  basicInfo: Artifact
  researchInfo: {
    researchPurpose: string
    researchMethods: string[]
    keyFindings: string
    innovations: string
    relatedLiterature: string
    targetJournal: string
  }
  authorInfo: AuthorInfo
}
