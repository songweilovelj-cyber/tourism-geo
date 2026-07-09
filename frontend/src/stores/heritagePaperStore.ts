import { create } from 'zustand'
import type {
  HeritagePaperState,
  ResearchMode,
  Artifact,
  AuthorInfo,
  ChatMessage,
  PaperData,
  FormatCheckResult,
  ConversationStep,
  ProjectInfo
} from '@/types/heritage'

const generateId = () => Math.random().toString(36).substring(2, 11)

const initialAuthorInfo: AuthorInfo = {
  name: '',
  institution: '',
  department: '',
  address: '',
  postalCode: '',
  email: '',
  researchDirection: ''
}

const initialProjectInfo: ProjectInfo = {
  researchMode: 'single',
  artifacts: [],
  researchPurpose: '',
  researchMethods: [],
  keyFindings: '',
  innovations: '',
  relatedLiterature: '',
  targetJournal: '',
  authorInfo: initialAuthorInfo
}

const welcomeMessage: ChatMessage = {
  id: generateId(),
  role: 'assistant',
  content: `🏛️ 欢迎使用文物期刊论文写作助手

我将通过简单的几步操作，帮助您完成一篇符合期刊发表规范的文物学术论文。

📝 工作流程：
① 选择研究模式（单件/批量/类型）
② 填写文物与研究信息
③ AI 智能生成论文
④ 格式校验与导出

⏱️ 预计用时：3-5 分钟

请选择您想要的研究模式，然后开始填写信息。`,
  type: 'text'
}

export const useHeritagePaperStore = create<HeritagePaperState & {
  setCurrentStep: (step: ConversationStep) => void
  addMessage: (message: Omit<ChatMessage, 'id'>) => void
  setProjectInfo: (info: Partial<ProjectInfo>) => void
  setResearchMode: (mode: ResearchMode) => void
  setArtifacts: (artifacts: Artifact[]) => void
  addArtifact: (artifact: Artifact) => void
  updateArtifact: (id: string, artifact: Partial<Artifact>) => void
  removeArtifact: (id: string) => void
  setResearchPurpose: (purpose: string) => void
  setResearchMethods: (methods: string[]) => void
  setKeyFindings: (findings: string) => void
  setInnovations: (innovations: string) => void
  setRelatedLiterature: (literature: string) => void
  setTargetJournal: (journal: string) => void
  setAuthorInfo: (author: Partial<AuthorInfo>) => void
  setPaperData: (data: PaperData) => void
  setFormatCheckResult: (result: FormatCheckResult) => void
  addRevision: (revision: string) => void
  resetConversation: () => void
}>((set) => ({
  currentStep: 'welcome',
  messages: [welcomeMessage],
  projectInfo: initialProjectInfo,
  paperData: null,
  formatCheckResult: null,
  revisionHistory: [],
  basicInfo: initialProjectInfo.artifacts[0] || {
    id: '',
    name: '',
    type: '',
    era: '',
    origin: '',
    collection: '',
    description: '',
    images: []
  },
  researchInfo: {
    researchPurpose: '',
    researchMethods: [],
    keyFindings: '',
    innovations: '',
    relatedLiterature: '',
    targetJournal: ''
  },
  authorInfo: initialAuthorInfo,

  setCurrentStep: (step) => set({ currentStep: step }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { ...message, id: generateId() }]
  })),

  setProjectInfo: (info) => set((state) => ({
    projectInfo: { ...state.projectInfo, ...info }
  })),

  setResearchMode: (mode) => set((state) => ({
    projectInfo: { ...state.projectInfo, researchMode: mode }
  })),

  setArtifacts: (artifacts) => set((state) => ({
    projectInfo: { ...state.projectInfo, artifacts },
    basicInfo: artifacts[0] || state.basicInfo
  })),

  addArtifact: (artifact) => set((state) => ({
    projectInfo: {
      ...state.projectInfo,
      artifacts: [...state.projectInfo.artifacts, artifact]
    }
  })),

  updateArtifact: (id, updates) => set((state) => ({
    projectInfo: {
      ...state.projectInfo,
      artifacts: state.projectInfo.artifacts.map(a =>
        a.id === id ? { ...a, ...updates } : a
      )
    }
  })),

  removeArtifact: (id) => set((state) => ({
    projectInfo: {
      ...state.projectInfo,
      artifacts: state.projectInfo.artifacts.filter(a => a.id !== id)
    }
  })),

  setResearchPurpose: (purpose) => set((state) => ({
    projectInfo: { ...state.projectInfo, researchPurpose: purpose },
    researchInfo: { ...state.researchInfo, researchPurpose: purpose }
  })),

  setResearchMethods: (methods) => set((state) => ({
    projectInfo: { ...state.projectInfo, researchMethods: methods },
    researchInfo: { ...state.researchInfo, researchMethods: methods }
  })),

  setKeyFindings: (findings) => set((state) => ({
    projectInfo: { ...state.projectInfo, keyFindings: findings },
    researchInfo: { ...state.researchInfo, keyFindings: findings }
  })),

  setInnovations: (innovations) => set((state) => ({
    projectInfo: { ...state.projectInfo, innovations },
    researchInfo: { ...state.researchInfo, innovations }
  })),

  setRelatedLiterature: (literature) => set((state) => ({
    projectInfo: { ...state.projectInfo, relatedLiterature: literature },
    researchInfo: { ...state.researchInfo, relatedLiterature: literature }
  })),

  setTargetJournal: (journal) => set((state) => ({
    projectInfo: { ...state.projectInfo, targetJournal: journal },
    researchInfo: { ...state.researchInfo, targetJournal: journal }
  })),

  setAuthorInfo: (author) => set((state) => ({
    projectInfo: { ...state.projectInfo, authorInfo: { ...state.projectInfo.authorInfo, ...author } },
    authorInfo: { ...state.authorInfo, ...author }
  })),

  setPaperData: (data) => set({ paperData: data }),

  setFormatCheckResult: (result) => set({ formatCheckResult: result }),

  addRevision: (revision) => set((state) => ({
    revisionHistory: [...state.revisionHistory, revision]
  })),

  resetConversation: () => set({
    currentStep: 'welcome',
    messages: [welcomeMessage],
    projectInfo: initialProjectInfo,
    paperData: null,
    formatCheckResult: null,
    revisionHistory: [],
    basicInfo: {
      id: '',
      name: '',
      type: '',
      era: '',
      origin: '',
      collection: '',
      description: '',
      images: []
    },
    researchInfo: {
      researchPurpose: '',
      researchMethods: [],
      keyFindings: '',
      innovations: '',
      relatedLiterature: '',
      targetJournal: ''
    },
    authorInfo: initialAuthorInfo
  })
}))
