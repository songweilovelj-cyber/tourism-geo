import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  TravelSolution,
  RequirementForm,
  RequirementReport,
  SolutionCategory,
  CategoryFeatures,
  ResearchData,
  ReferenceData,
  SolutionOutline,
  QualityCheckResult,
  OutputConfig,
  PPTTemplate,
} from '../types/travelSolution'

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

interface TravelSolutionState {
  solutions: TravelSolution[]
  currentSolutionId: string | null
  isGenerating: boolean
  generationProgress: number
  generationStep: string

  createSolution: (name: string) => string
  deleteSolution: (id: string) => void
  setCurrentSolution: (id: string) => void
  getCurrentSolution: () => TravelSolution | undefined

  updateRequirementForm: (form: RequirementForm) => void
  setRequirementReport: (report: RequirementReport) => void
  setCategory: (category: SolutionCategory) => void
  setCategoryFeatures: (features: CategoryFeatures) => void
  setResearchData: (data: ResearchData) => void
  setReferenceData: (data: ReferenceData) => void
  setOutline: (outline: SolutionOutline) => void
  setQualityCheck: (check: QualityCheckResult) => void
  setOutputConfig: (config: OutputConfig) => void
  setHtmlContent: (content: string) => void
  addUploadedTemplate: (template: PPTTemplate) => void

  setCurrentStep: (step: number) => void
  setGenerating: (val: boolean) => void
  setGenerationProgress: (progress: number, step: string) => void
  markStepComplete: (step: number) => void

  uploadedTemplates: PPTTemplate[]
}

export const useTravelSolutionStore = create<TravelSolutionState>()(
  persist(
    (set, get) => ({
      solutions: [],
      currentSolutionId: null,
      isGenerating: false,
      generationProgress: 0,
      generationStep: '',
      uploadedTemplates: [],

      createSolution: (name: string) => {
        const id = generateId()
        const now = new Date().toISOString()
        const newSolution: TravelSolution = {
          id,
          name,
          status: 'step0',
          currentStep: 0,
          createdAt: now,
          updatedAt: now,
          version: 1,
          history: [{ step: 0, timestamp: now, action: '创建方案' }],
        }
        set(state => ({
          solutions: [...state.solutions, newSolution],
          currentSolutionId: id,
        }))
        return id
      },

      deleteSolution: (id: string) => {
        set(state => {
          const solutions = state.solutions.filter(s => s.id !== id)
          const currentSolutionId = state.currentSolutionId === id
            ? (solutions.length > 0 ? solutions[0].id : null)
            : state.currentSolutionId
          return { solutions, currentSolutionId }
        })
      },

      setCurrentSolution: (id: string) => {
        set({ currentSolutionId: id })
      },

      getCurrentSolution: () => {
        const state = get()
        return state.solutions.find(s => s.id === state.currentSolutionId)
      },

      updateRequirementForm: (form: RequirementForm) => {
        const state = get()
        if (!state.currentSolutionId) return
        const id = state.currentSolutionId
        set(state => ({
          solutions: state.solutions.map(s =>
            s.id === id
              ? {
                  ...s,
                  requirementForm: form,
                  updatedAt: new Date().toISOString(),
                }
              : s
          ),
        }))
      },

      setRequirementReport: (report: RequirementReport) => {
        const state = get()
        if (!state.currentSolutionId) return
        const id = state.currentSolutionId
        set(state => ({
          solutions: state.solutions.map(s =>
            s.id === id
              ? {
                  ...s,
                  requirementReport: report,
                  updatedAt: new Date().toISOString(),
                }
              : s
          ),
        }))
      },

      setCategory: (category: SolutionCategory) => {
        const state = get()
        if (!state.currentSolutionId) return
        const id = state.currentSolutionId
        set(state => ({
          solutions: state.solutions.map(s =>
            s.id === id
              ? {
                  ...s,
                  category,
                  updatedAt: new Date().toISOString(),
                }
              : s
          ),
        }))
      },

      setCategoryFeatures: (features: CategoryFeatures) => {
        const state = get()
        if (!state.currentSolutionId) return
        const id = state.currentSolutionId
        set(state => ({
          solutions: state.solutions.map(s =>
            s.id === id
              ? {
                  ...s,
                  categoryFeatures: features,
                  updatedAt: new Date().toISOString(),
                }
              : s
          ),
        }))
      },

      setResearchData: (data: ResearchData) => {
        const state = get()
        if (!state.currentSolutionId) return
        const id = state.currentSolutionId
        set(state => ({
          solutions: state.solutions.map(s =>
            s.id === id
              ? {
                  ...s,
                  researchData: data,
                  updatedAt: new Date().toISOString(),
                }
              : s
          ),
        }))
      },

      setReferenceData: (data: ReferenceData) => {
        const state = get()
        if (!state.currentSolutionId) return
        const id = state.currentSolutionId
        set(state => ({
          solutions: state.solutions.map(s =>
            s.id === id
              ? {
                  ...s,
                  referenceData: data,
                  updatedAt: new Date().toISOString(),
                }
              : s
          ),
        }))
      },

      setOutline: (outline: SolutionOutline) => {
        const state = get()
        if (!state.currentSolutionId) return
        const id = state.currentSolutionId
        set(state => ({
          solutions: state.solutions.map(s =>
            s.id === id
              ? {
                  ...s,
                  outline,
                  updatedAt: new Date().toISOString(),
                }
              : s
          ),
        }))
      },

      setQualityCheck: (check: QualityCheckResult) => {
        const state = get()
        if (!state.currentSolutionId) return
        const id = state.currentSolutionId
        set(state => ({
          solutions: state.solutions.map(s =>
            s.id === id
              ? {
                  ...s,
                  qualityCheck: check,
                  updatedAt: new Date().toISOString(),
                }
              : s
          ),
        }))
      },

      setOutputConfig: (config: OutputConfig) => {
        const state = get()
        if (!state.currentSolutionId) return
        const id = state.currentSolutionId
        set(state => ({
          solutions: state.solutions.map(s =>
            s.id === id
              ? {
                  ...s,
                  outputConfig: config,
                  updatedAt: new Date().toISOString(),
                }
              : s
          ),
        }))
      },

      setHtmlContent: (content: string) => {
        const state = get()
        if (!state.currentSolutionId) return
        const id = state.currentSolutionId
        set(state => ({
          solutions: state.solutions.map(s =>
            s.id === id
              ? {
                  ...s,
                  htmlContent: content,
                  status: 'completed',
                  updatedAt: new Date().toISOString(),
                  history: [
                    ...s.history,
                    { step: 4, timestamp: new Date().toISOString(), action: '方案生成完成' },
                  ],
                }
              : s
          ),
        }))
      },

      addUploadedTemplate: (template: PPTTemplate) => {
        set(state => ({
          uploadedTemplates: [...state.uploadedTemplates, template],
        }))
      },

      setCurrentStep: (step: number) => {
        const state = get()
        if (!state.currentSolutionId) return
        const id = state.currentSolutionId
        const statusMap: Record<number, TravelSolution['status']> = {
          0: 'step0',
          1: 'step1',
          2: 'step2',
          3: 'step3',
          4: 'step4',
        }
        set(state => ({
          solutions: state.solutions.map(s =>
            s.id === id
              ? {
                  ...s,
                  currentStep: step,
                  status: statusMap[step] || 'step0',
                  updatedAt: new Date().toISOString(),
                }
              : s
          ),
        }))
      },

      setGenerating: (val: boolean) => {
        set({ isGenerating: val })
        if (!val) {
          set({ generationProgress: 0, generationStep: '' })
        }
      },

      setGenerationProgress: (progress: number, step: string) => {
        set({ generationProgress: progress, generationStep: step })
      },

      markStepComplete: (step: number) => {
        const state = get()
        if (!state.currentSolutionId) return
        const id = state.currentSolutionId
        const nextStep = step + 1
        const statusMap: Record<number, TravelSolution['status']> = {
          0: 'step0',
          1: 'step1',
          2: 'step2',
          3: 'step3',
          4: 'step4',
        }
        set(state => ({
          solutions: state.solutions.map(s =>
            s.id === id
              ? {
                  ...s,
                  currentStep: nextStep,
                  status: statusMap[nextStep] || 'completed',
                  version: s.version + 1,
                  updatedAt: new Date().toISOString(),
                  history: [
                    ...s.history,
                    { step, timestamp: new Date().toISOString(), action: `完成步骤 ${step + 1}` },
                  ],
                }
              : s
          ),
        }))
      },
    }),
    {
      name: 'travel-solution-storage-v2',
    }
  )
)
