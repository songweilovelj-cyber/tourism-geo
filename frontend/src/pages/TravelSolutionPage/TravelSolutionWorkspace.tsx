import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTravelSolutionStore } from '../../stores/travelSolutionStore'
import {
  STEP_CONFIG,
  CATEGORY_TREE,
  PPT_TEMPLATES,
  HTML_TEMPLATES,
} from '../../types/travelSolution'
import type {
  RequirementForm,
  RequirementReport,
  SolutionCategory,
  CategoryFeatures,
  ResearchData,
  ReferenceData,
  ReferenceCase,
  SolutionOutline,
  QualityCheckResult,
  OutputConfig,
  PPTTemplate,
} from '../../types/travelSolution'
import {
  generateRequirementReport,
  autoMatchCategory,
  generateResearchData,
  generateReferenceData,
  generateSolutionOutline,
  generateQualityCheck,
  generateHtmlSolution,
  downloadHtml,
  extractRequirementFromText,
} from '../../data/travelSolutionEngine'
import '../../styles/travel-solution.css'

const TravelSolutionWorkspace: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const {
    solutions,
    currentSolutionId,
    isGenerating,
    generationProgress,
    generationStep,
    createSolution,
    setCurrentSolution,
    getCurrentSolution,
    updateRequirementForm,
    setRequirementReport,
    setCategory,
    setCategoryFeatures,
    setResearchData,
    setReferenceData,
    setOutline,
    setQualityCheck,
    setOutputConfig,
    setHtmlContent,
    addUploadedTemplate,
    uploadedTemplates,
    setGenerating,
    setGenerationProgress,
    markStepComplete,
    setCurrentStep,
  } = useTravelSolutionStore()

  const solution = getCurrentSolution()
  const currentStep = solution?.currentStep ?? 0

  const [showNewModal, setShowNewModal] = useState(!solutions.length)
  const [newSolutionName, setNewSolutionName] = useState('')

  const [quickInputText, setQuickInputText] = useState('')
  const [isQuickParsing, setIsQuickParsing] = useState(false)

  const [editingReport, setEditingReport] = useState('')
  const [showReportEditor, setShowReportEditor] = useState(false)

  const [selectedLevel2, setSelectedLevel2] = useState<string>('')
  const [selectedLevel3, setSelectedLevel3] = useState<string>('')
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)

  const [activeResearchTab, setActiveResearchTab] = useState<'policies' | 'resources' | 'market' | 'competitors' | 'industry'>('policies')

  const [activeRefTab, setActiveRefTab] = useState<'ima' | 'builtin' | 'local' | 'uploaded'>('ima')

  const [outputConfig, setOutputConfigState] = useState<OutputConfig>({
    formats: ['html'],
    pptTemplateId: 'tpl-tech-purple',
    htmlTemplateId: 'html-dark-tech',
    includeQualityReport: true,
    includeAppendix: true,
  })

  const [selectedPptTemplate, setSelectedPptTemplate] = useState<string>('tpl-tech-purple')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const caseInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (id) {
      setCurrentSolution(id)
    }
  }, [id, setCurrentSolution])

  const handleCreateSolution = () => {
    if (!newSolutionName.trim()) return
    const newId = createSolution(newSolutionName.trim())
    setShowNewModal(false)
    setNewSolutionName('')
    navigate(`/travel-solution/${newId}`)
  }

  const handleQuickParse = async () => {
    if (!quickInputText.trim() || isQuickParsing) return
    setIsQuickParsing(true)
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
    const result = extractRequirementFromText(quickInputText)
    setForm(prev => ({ ...prev, ...result.form }))
    setIsQuickParsing(false)
  }

  const handleQuickClear = () => {
    setQuickInputText('')
  }

  // ========== Step 0: 需求采集 ==========
  const [form, setForm] = useState<RequirementForm>({
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
  })

  useEffect(() => {
    if (solution?.requirementForm) {
      setForm(solution.requirementForm)
    }
  }, [solution?.id])

  const handleGenerateReport = async () => {
    if (!form.projectName || !form.clientName || !form.region || !form.coreDemand) return
    updateRequirementForm(form)
    setGenerating(true)
    setGenerationProgress(30, '分析需求中...')
    await new Promise(r => setTimeout(r, 800))
    setGenerationProgress(70, '生成需求分析报告...')
    await new Promise(r => setTimeout(r, 600))
    const report = generateRequirementReport(form)
    setRequirementReport(report)
    setEditingReport(report.content)
    setGenerationProgress(100, '生成完成')
    setTimeout(() => setGenerating(false), 300)
  }

  const handleConfirmStep0 = () => {
    if (editingReport && solution?.requirementReport) {
      setRequirementReport({
        ...solution.requirementReport,
        content: editingReport,
        editedByUser: true,
      })
    }
    markStepComplete(0)
  }

  // ========== Step 1: 分类识别 ==========
  const handleAutoMatch = async () => {
    if (!solution?.requirementForm) return
    setGenerating(true)
    setGenerationProgress(50, '智能匹配分类中...')
    await new Promise(r => setTimeout(r, 1000))
    const { category, features } = autoMatchCategory(solution.requirementForm)
    setCategory(category)
    setCategoryFeatures(features)
    setSelectedLevel2(category.level2Code)
    setSelectedLevel3(category.level3Code)
    setGenerationProgress(100, '匹配完成')
    setTimeout(() => setGenerating(false), 300)
  }

  const handleManualSelectCategory = (l2Code: string, l3Code: string) => {
    const l2 = CATEGORY_TREE.level2.find(l => l.code === l2Code)
    const l3 = l2?.level3.find(l => l.code === l3Code)
    if (!l2 || !l3 || !solution?.requirementForm) return

    const features: CategoryFeatures = {
      focusPoints: ['核心功能规划', '体验升级', '运营提效', '创新应用'],
      policyFocus: ['文旅融合发展', '数字化转型', '高质量发展'],
      structureTemplate: ['项目背景', '现状分析', '方案设计', '实施路径', '效益分析'],
      innovationDirections: ['数字化', '智能化', '场景化', '数据驱动'],
      safetyRedLines: ['数据安全', '服务质量', '合规经营'],
    }

    setCategory({
      level1: '旅游',
      level2: l2.name,
      level2Code: l2.code,
      level3: l3.name,
      level3Code: l3.code,
      matchReason: '用户手动选择',
      confidence: 100,
    })
    setCategoryFeatures(features)
    setSelectedLevel2(l2Code)
    setSelectedLevel3(l3Code)
    setShowCategoryPicker(false)
  }

  const handleConfirmStep1 = () => {
    if (!solution?.category) return
    markStepComplete(1)
  }

  // ========== Step 2: 信息搜集 ==========
  const handleGenerateResearch = async () => {
    if (!solution?.requirementForm || !solution?.category) return
    setGenerating(true)
    const steps = [
      { p: 15, t: '搜集政策法规...' },
      { p: 30, t: '盘点文旅资源...' },
      { p: 50, t: '分析市场数据...' },
      { p: 65, t: '调研竞品案例...' },
      { p: 80, t: '整理产业数据...' },
      { p: 95, t: '生成调研报告...' },
    ]
    for (const s of steps) {
      setGenerationProgress(s.p, s.t)
      await new Promise(r => setTimeout(r, 400))
    }
    const data = generateResearchData(solution.requirementForm, solution.category)
    setResearchData(data)
    setGenerationProgress(100, '信息搜集完成')
    setTimeout(() => setGenerating(false), 300)
  }

  const togglePolicySelect = (policyId: string) => {
    if (!solution?.researchData) return
    const updated = {
      ...solution.researchData,
      policies: solution.researchData.policies.map(p =>
        p.id === policyId ? { ...p, selected: !p.selected } : p
      ),
    }
    setResearchData(updated)
  }

  const toggleResourceSelect = (resId: string) => {
    if (!solution?.researchData) return
    const updated = {
      ...solution.researchData,
      localResources: solution.researchData.localResources.map(r =>
        r.id === resId ? { ...r, selected: !r.selected } : r
      ),
    }
    setResearchData(updated)
  }

  const toggleCompetitorSelect = (caseId: string) => {
    if (!solution?.researchData) return
    const updated = {
      ...solution.researchData,
      competitorCases: solution.researchData.competitorCases.map(c =>
        c.id === caseId ? { ...c, selected: !c.selected } : c
      ),
    }
    setResearchData(updated)
  }

  const handleConfirmStep2 = () => {
    if (!solution?.researchData) return
    markStepComplete(2)
  }

  // ========== Step 3: 参考匹配 ==========
  const handleGenerateReference = async () => {
    if (!solution?.requirementForm || !solution?.category) return
    setGenerating(true)
    const steps = [
      { p: 20, t: '检索IMA知识库...' },
      { p: 45, t: '匹配本地案例...' },
      { p: 70, t: '检索内置方案库...' },
      { p: 90, t: '提取可复用要素...' },
    ]
    for (const s of steps) {
      setGenerationProgress(s.p, s.t)
      await new Promise(r => setTimeout(r, 500))
    }
    const data = generateReferenceData(solution.requirementForm, solution.category)
    setReferenceData(data)
    setGenerationProgress(100, '案例匹配完成')
    setTimeout(() => setGenerating(false), 300)
  }

  const toggleCaseSelect = (caseId: string) => {
    if (!solution?.referenceData) return
    const selected = solution.referenceData.selectedCases.includes(caseId)
      ? solution.referenceData.selectedCases.filter(id => id !== caseId)
      : [...solution.referenceData.selectedCases, caseId]
    setReferenceData({ ...solution.referenceData, selectedCases: selected })
  }

  const handleUploadCase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !solution?.referenceData) return
    const file = files[0]
    const newCase: ReferenceCase = {
      id: `uploaded-${Date.now()}`,
      name: file.name,
      score: 0,
      matchReason: '用户上传案例',
      source: 'uploaded',
      fileType: file.type,
    }
    const updated: ReferenceData = {
      ...solution.referenceData,
      userUploadedCases: [...solution.referenceData.userUploadedCases, newCase],
    }
    setReferenceData(updated)
    e.target.value = ''
  }

  const handleConfirmStep3 = () => {
    if (!solution?.referenceData) return
    markStepComplete(3)
  }

  // ========== Step 4: 方案生成 ==========
  const [showOutlineEditor, setShowOutlineEditor] = useState(false)

  const handleGenerateOutline = async () => {
    if (!solution?.requirementForm || !solution.category || !solution.researchData || !solution.referenceData) return
    setGenerating(true)
    setGenerationProgress(40, '生成方案大纲...')
    await new Promise(r => setTimeout(r, 1000))
    const outline = generateSolutionOutline(
      solution.requirementForm,
      solution.category,
      solution.researchData,
      solution.referenceData
    )
    setOutline(outline)
    setGenerationProgress(100, '大纲生成完成')
    setTimeout(() => setGenerating(false), 300)
  }

  const handleGenerateQuality = async () => {
    if (!solution?.outline || !solution.category) return
    setGenerating(true)
    setGenerationProgress(50, '执行质量自检...')
    await new Promise(r => setTimeout(r, 1200))
    const check = generateQualityCheck(solution.outline, solution.category)
    setQualityCheck(check)
    setGenerationProgress(100, '质量自检完成')
    setTimeout(() => setGenerating(false), 300)
  }

  const handleGenerateFinal = async () => {
    if (!solution?.requirementForm || !solution.category || !solution.researchData
      || !solution.referenceData || !solution.outline || !solution.qualityCheck) return
    setGenerating(true)
    const steps = [
      { p: 20, t: '整合需求内容...' },
      { p: 40, t: '生成方案内容...' },
      { p: 60, t: '排版美化...' },
      { p: 80, t: '质量检查...' },
      { p: 95, t: '输出文件...' },
    ]
    for (const s of steps) {
      setGenerationProgress(s.p, s.t)
      await new Promise(r => setTimeout(r, 500))
    }
    const html = generateHtmlSolution(
      solution.requirementForm,
      solution.category,
      solution.researchData,
      solution.referenceData,
      solution.outline,
      solution.qualityCheck,
      outputConfig.htmlTemplateId
    )
    setHtmlContent(html)
    setOutputConfig(outputConfig)
    setGenerationProgress(100, '方案生成完成！')
    setTimeout(() => setGenerating(false), 500)
  }

  const handleDownloadHtml = () => {
    if (!solution?.htmlContent || !solution?.outline) return
    downloadHtml(solution.htmlContent, solution.outline.title)
  }

  const handleUploadTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    const template: PPTTemplate = {
      id: `uploaded-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      category: '用户上传',
      primaryColor: '#4ECDC4',
      secondaryColor: '#818CF8',
      accentColor: '#4ECDC4',
      bgColor: '#0a0a14',
      textColor: '#e2e8f0',
      description: '用户上传的自定义模板',
      suitableFor: ['all'],
      isBuiltin: false,
      isUploaded: true,
      filePath: file.name,
    }
    addUploadedTemplate(template)
    setSelectedPptTemplate(template.id)
    e.target.value = ''
  }

  const allPptTemplates = [...PPT_TEMPLATES, ...uploadedTemplates]

  const handleStepClick = (step: number) => {
    if (solution && step <= solution.currentStep) {
      setCurrentStep(step)
    }
  }

  if (showNewModal) {
    return (
      <div className="ts-modal-overlay">
        <div className="ts-modal">
          <h2 className="ts-modal-title">创建新方案</h2>
          <p className="ts-modal-desc">输入项目名称，开始生成文旅解决方案</p>
          <input
            className="ts-input"
            placeholder="请输入项目名称，如：XX市智慧文旅平台方案"
            value={newSolutionName}
            onChange={e => setNewSolutionName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateSolution()}
            autoFocus
          />
          <div className="ts-modal-actions">
            <button
              className="ts-secondary-btn"
              onClick={() => solutions.length > 0 ? setShowNewModal(false) : null}
            >
              取消
            </button>
            <button
              className="ts-primary-btn"
              onClick={handleCreateSolution}
              disabled={!newSolutionName.trim()}
            >
              创建方案
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!solution) {
    return (
      <div className="ts-empty-state">
        <div className="ts-empty-icon">📋</div>
        <h2>暂无方案</h2>
        <p>创建你的第一个文旅解决方案</p>
        <button className="ts-primary-btn" onClick={() => setShowNewModal(true)}>
          + 新建方案
        </button>
      </div>
    )
  }

  return (
    <div className="ts-workspace">
      {/* 左侧：步骤导航 */}
      <div className="ts-sidebar">
        <div className="ts-sidebar-header">
          <div className="ts-logo">✨ AI 文旅方案生成</div>
          <button className="ts-new-btn" onClick={() => setShowNewModal(true)}>+ 新建</button>
        </div>

        <div className="ts-solution-info">
          <div className="ts-solution-name">{solution.name}</div>
          <div className="ts-solution-meta">
            版本 v{solution.version}
          </div>
        </div>

        <div className="ts-stepper">
          {STEP_CONFIG.map((step, idx) => {
            const isActive = currentStep === idx
            const isCompleted = currentStep > idx
            const isLocked = currentStep < idx
            return (
              <div
                key={step.id}
                className={`ts-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => handleStepClick(idx)}
              >
                <div className="ts-step-indicator">
                  {isCompleted ? '✓' : step.id + 1}
                </div>
                <div className="ts-step-content">
                  <div className="ts-step-name">{step.icon} {step.name}</div>
                  <div className="ts-step-desc">{step.subTitle}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="ts-sidebar-footer">
          <div className="ts-progress-info">
            进度: {Math.round((currentStep / 5) * 100)}%
          </div>
          <div className="ts-progress-bar">
            <div
              className="ts-progress-fill"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 中间：主内容区 */}
      <div className="ts-main">
        <div className="ts-main-header">
          <div>
            <h1 className="ts-page-title">
              {STEP_CONFIG[currentStep]?.icon} {STEP_CONFIG[currentStep]?.name}
            </h1>
            <p className="ts-page-subtitle">{STEP_CONFIG[currentStep]?.desc}</p>
          </div>
          <div className="ts-header-actions">
            <button className="ts-secondary-btn" onClick={() => setShowNewModal(true)}>
              + 新建方案
            </button>
          </div>
        </div>

        <div className="ts-content-area">
          {/* Step 0: 需求采集 */}
          {currentStep === 0 && (
            <div className="ts-step-content">
              <div className="ts-quick-input-card">
                <div className="ts-quick-input-header">
                  <span className="ts-quick-input-icon">🔍</span>
                  <span className="ts-quick-input-title">快速输入 — 粘贴一段需求描述，AI 自动解析</span>
                </div>
                <textarea
                  className="ts-quick-textarea"
                  placeholder={'示例：山东省文化和旅游厅计划建设全省一机游智慧文旅平台，服务游客和商户，核心诉求是实现全省文旅资源一站式服务、提升游客体验、带动旅游消费。汇报对象是厅领导，用于立项汇报场景。'}
                  value={quickInputText}
                  onChange={e => setQuickInputText(e.target.value)}
                  rows={4}
                />
                <div className="ts-quick-input-footer">
                  <span className="ts-quick-input-hint">
                    💡 支持从 Word/PDF/聊天记录中直接粘贴，AI 将自动提取关键字段
                  </span>
                  <div className="ts-quick-input-actions">
                    <button
                      className="ts-ghost-btn"
                      onClick={handleQuickClear}
                      disabled={!quickInputText}
                    >
                      清空
                    </button>
                    <button
                      className="ts-primary-btn"
                      onClick={handleQuickParse}
                      disabled={!quickInputText.trim() || isQuickParsing}
                    >
                      {isQuickParsing ? '⏳ 解析中...' : '🤖 智能解析填充表单'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="ts-form-divider">
                <span>或手动填写表单</span>
              </div>

              <div className="ts-form-grid">
                <div className="ts-form-group">
                  <label>项目名称 *</label>
                  <input
                    className="ts-input"
                    placeholder="如：XX市智慧文旅综合服务平台"
                    value={form.projectName}
                    onChange={e => setForm({ ...form, projectName: e.target.value })}
                  />
                </div>
                <div className="ts-form-group">
                  <label>甲方单位 *</label>
                  <input
                    className="ts-input"
                    placeholder="如：XX市文化广电旅游局"
                    value={form.clientName}
                    onChange={e => setForm({ ...form, clientName: e.target.value })}
                  />
                </div>
                <div className="ts-form-group">
                  <label>项目地域 *</label>
                  <input
                    className="ts-input"
                    placeholder="如：杭州市"
                    value={form.region}
                    onChange={e => setForm({ ...form, region: e.target.value })}
                  />
                </div>
                <div className="ts-form-group">
                  <label>项目类型</label>
                  <input
                    className="ts-input"
                    placeholder="如：智慧文旅平台建设"
                    value={form.projectType}
                    onChange={e => setForm({ ...form, projectType: e.target.value })}
                  />
                </div>
                <div className="ts-form-group ts-form-full">
                  <label>核心诉求 *</label>
                  <textarea
                    className="ts-textarea"
                    placeholder="详细描述甲方的核心需求和期望解决的问题"
                    value={form.coreDemand}
                    onChange={e => setForm({ ...form, coreDemand: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="ts-form-group">
                  <label>目标受众</label>
                  <input
                    className="ts-input"
                    placeholder="如：文旅主管部门、景区运营、游客"
                    value={form.targetAudience}
                    onChange={e => setForm({ ...form, targetAudience: e.target.value })}
                  />
                </div>
                <div className="ts-form-group">
                  <label>预算范围</label>
                  <input
                    className="ts-input"
                    placeholder="如：500-1000万"
                    value={form.budgetRange}
                    onChange={e => setForm({ ...form, budgetRange: e.target.value })}
                  />
                </div>
                <div className="ts-form-group">
                  <label>时间要求</label>
                  <input
                    className="ts-input"
                    placeholder="如：6个月内完成"
                    value={form.timeline}
                    onChange={e => setForm({ ...form, timeline: e.target.value })}
                  />
                </div>
                <div className="ts-form-group ts-form-full">
                  <label>期望功能</label>
                  <textarea
                    className="ts-textarea"
                    placeholder="列出已明确的功能模块，不确定的可写'待方案规划'"
                    value={form.expectedFeatures}
                    onChange={e => setForm({ ...form, expectedFeatures: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="ts-form-group ts-form-full">
                  <label>参考对标</label>
                  <textarea
                    className="ts-textarea"
                    placeholder="有哪些参考案例或对标项目"
                    value={form.referenceCases}
                    onChange={e => setForm({ ...form, referenceCases: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <div className="ts-action-bar">
                <button
                  className="ts-primary-btn"
                  onClick={handleGenerateReport}
                  disabled={isGenerating || !form.projectName || !form.clientName || !form.region || !form.coreDemand}
                >
                  🤖 AI生成需求分析报告
                </button>
              </div>

              {solution.requirementReport && (
                <div className="ts-result-card">
                  <div className="ts-result-header">
                    <span className="ts-result-title">📄 需求分析报告</span>
                    <button
                      className="ts-text-btn"
                      onClick={() => {
                        setEditingReport(solution.requirementReport!.content)
                        setShowReportEditor(true)
                      }}
                    >
                      ✏️ 编辑报告
                    </button>
                  </div>
                  <div className="ts-markdown-preview">
                    <pre>{solution.requirementReport.content}</pre>
                  </div>
                  <div className="ts-result-footer">
                    <span className="ts-hint">
                      {solution.requirementReport.editedByUser ? '✅ 已由用户编辑确认' : '💡 您可以编辑报告内容，确认后进入下一步'}
                    </span>
                    <button className="ts-primary-btn" onClick={handleConfirmStep0}>
                      确认并进入下一步 →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1: 分类识别 */}
          {currentStep === 1 && (
            <div className="ts-step-content">
              <div className="ts-category-section">
                <h3>🏷️ 方案分类</h3>
                <p className="ts-section-desc">
                  自动识别项目类型，注入行业特征和侧重点。您可以使用AI自动匹配，也可以手动选择。
                </p>

                <div className="ts-category-actions">
                  <button
                    className="ts-primary-btn"
                    onClick={handleAutoMatch}
                    disabled={isGenerating}
                  >
                    🤖 AI智能匹配分类
                  </button>
                  <button
                    className="ts-secondary-btn"
                    onClick={() => setShowCategoryPicker(true)}
                  >
                    手动选择分类
                  </button>
                </div>

                {solution.category && (
                  <div className="ts-category-result">
                    <div className="ts-category-path">
                      <span className="ts-category-tag">{solution.category.level1}</span>
                      <span className="ts-category-arrow">›</span>
                      <span className="ts-category-tag">{solution.category.level2}</span>
                      <span className="ts-category-arrow">›</span>
                      <span className="ts-category-tag active">{solution.category.level3}</span>
                    </div>
                    <div className="ts-category-meta">
                      <span>匹配度: {solution.category.confidence}%</span>
                      <span>匹配理由: {solution.category.matchReason}</span>
                    </div>
                  </div>
                )}

                {solution.categoryFeatures && (
                  <div className="ts-features-grid">
                    <div className="ts-feature-card">
                      <h4>🎯 侧重点</h4>
                      <ul>
                        {solution.categoryFeatures.focusPoints.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="ts-feature-card">
                      <h4>📜 政策关注点</h4>
                      <ul>
                        {solution.categoryFeatures.policyFocus.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="ts-feature-card">
                      <h4>📐 结构模板</h4>
                      <ul>
                        {solution.categoryFeatures.structureTemplate.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="ts-feature-card">
                      <h4>💡 创新方向</h4>
                      <ul>
                        {solution.categoryFeatures.innovationDirections.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {solution.category && (
                <div className="ts-action-bar">
                  <button className="ts-primary-btn" onClick={handleConfirmStep1}>
                    确认分类并进入下一步 →
                  </button>
                </div>
              )}

              {/* 分类选择弹窗 */}
              {showCategoryPicker && (
                <div className="ts-modal-overlay" onClick={() => setShowCategoryPicker(false)}>
                  <div className="ts-modal ts-modal-large" onClick={e => e.stopPropagation()}>
                    <h2 className="ts-modal-title">选择方案分类</h2>
                    <div className="ts-category-picker">
                      {CATEGORY_TREE.level2.map(l2 => (
                        <div key={l2.code} className="ts-category-col">
                          <h4>{l2.name}</h4>
                          <p className="ts-category-col-desc">{l2.description}</p>
                          <div className="ts-category-options">
                            {l2.level3.map(l3 => (
                              <div
                                key={l3.code}
                                className={`ts-category-option ${selectedLevel3 === l3.code ? 'selected' : ''}`}
                                onClick={() => handleManualSelectCategory(l2.code, l3.code)}
                              >
                                <div className="ts-cat-name">{l3.name}</div>
                                <div className="ts-cat-desc">{l3.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="ts-modal-actions">
                      <button className="ts-secondary-btn" onClick={() => setShowCategoryPicker(false)}>
                        取消
                      </button>
                      <button
                        className="ts-primary-btn"
                        onClick={() => setShowCategoryPicker(false)}
                        disabled={!selectedLevel3}
                      >
                        确定
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: 信息搜集 */}
          {currentStep === 2 && (
            <div className="ts-step-content">
              <div className="ts-research-header">
                <p className="ts-section-desc">
                  从政策、资源、市场、竞品、产业五个维度进行信息搜集。
                  您可以勾选/取消勾选条目，也可以手动补充信息。
                </p>
                <button
                  className="ts-primary-btn"
                  onClick={handleGenerateResearch}
                  disabled={isGenerating}
                >
                  🔍 开始信息搜集
                </button>
              </div>

              {solution.researchData && (
                <>
                  <div className="ts-tabs">
                    {[
                      { k: 'policies', n: '📜 政策法规' },
                      { k: 'resources', n: '🏛️ 本地资源' },
                      { k: 'market', n: '📊 市场数据' },
                      { k: 'competitors', n: '🏆 竞品案例' },
                      { k: 'industry', n: '🏭 产业概况' },
                    ].map(tab => (
                      <div
                        key={tab.k}
                        className={`ts-tab ${activeResearchTab === tab.k ? 'active' : ''}`}
                        onClick={() => setActiveResearchTab(tab.k as any)}
                      >
                        {tab.n}
                      </div>
                    ))}
                  </div>

                  <div className="ts-tab-content">
                    {activeResearchTab === 'policies' && (
                      <div className="ts-list">
                        {solution.researchData.policies.map(p => (
                          <div
                            key={p.id}
                            className={`ts-list-item ${p.selected ? 'selected' : ''}`}
                            onClick={() => togglePolicySelect(p.id)}
                          >
                            <div className="ts-list-check">{p.selected ? '✓' : ''}</div>
                            <div className="ts-list-main">
                              <div className="ts-list-title">{p.title}</div>
                              <div className="ts-list-meta">
                                <span className="ts-badge">{p.level === 'national' ? '国家级' : p.level === 'provincial' ? '省级' : p.level === 'municipal' ? '市级' : '区县级'}</span>
                                <span>发布: {p.publishDate}</span>
                                <span>来源: {p.source}</span>
                              </div>
                              <div className="ts-list-desc">
                                {p.keyPoints.map((k, i) => (
                                  <span key={i} className="ts-tag">{k}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeResearchTab === 'resources' && (
                      <div className="ts-list">
                        {solution.researchData.localResources.map(r => (
                          <div
                            key={r.id}
                            className={`ts-list-item ${r.selected ? 'selected' : ''}`}
                            onClick={() => toggleResourceSelect(r.id)}
                          >
                            <div className="ts-list-check">{r.selected ? '✓' : ''}</div>
                            <div className="ts-list-main">
                              <div className="ts-list-title">
                                {r.name}
                                {r.level && <span className="ts-badge-small">{r.level}</span>}
                              </div>
                              <div className="ts-list-meta">
                                <span>类型: {r.type}</span>
                              </div>
                              <div className="ts-list-desc">{r.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeResearchTab === 'market' && (
                      <div className="ts-data-grid">
                        <div className="ts-data-card">
                          <div className="ts-data-label">年接待游客量</div>
                          <div className="ts-data-value">{solution.researchData.marketData.annualVisitors}</div>
                        </div>
                        <div className="ts-data-card">
                          <div className="ts-data-label">旅游总收入</div>
                          <div className="ts-data-value">{solution.researchData.marketData.totalRevenue}</div>
                        </div>
                        <div className="ts-data-card">
                          <div className="ts-data-label">人均消费</div>
                          <div className="ts-data-value">{solution.researchData.marketData.perCapitaSpending}</div>
                        </div>
                        <div className="ts-data-card">
                          <div className="ts-data-label">客源结构</div>
                          <div className="ts-data-value-small">{solution.researchData.marketData.sourceStructure}</div>
                        </div>
                        <div className="ts-data-card ts-data-full">
                          <div className="ts-data-label">消费趋势</div>
                          <div className="ts-data-value-small">{solution.researchData.marketData.consumptionTrend}</div>
                        </div>
                        <div className="ts-data-card ts-data-full">
                          <div className="ts-data-label">目标客群</div>
                          <div className="ts-data-value-small">{solution.researchData.marketData.targetAudience}</div>
                        </div>
                      </div>
                    )}

                    {activeResearchTab === 'competitors' && (
                      <div className="ts-list">
                        {solution.researchData.competitorCases.map(c => (
                          <div
                            key={c.id}
                            className={`ts-list-item ${c.selected ? 'selected' : ''}`}
                            onClick={() => toggleCompetitorSelect(c.id)}
                          >
                            <div className="ts-list-check">{c.selected ? '✓' : ''}</div>
                            <div className="ts-list-main">
                              <div className="ts-list-title">{c.name}</div>
                              <div className="ts-list-meta">
                                <span className="ts-badge">{c.type}</span>
                                <span>来源: {c.source}</span>
                              </div>
                              <div className="ts-list-desc">
                                <strong>亮点：</strong>
                                {c.highlights.map((h, i) => (
                                  <span key={i} className="ts-tag">{h}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeResearchTab === 'industry' && (
                      <div className="ts-data-grid">
                        <div className="ts-data-card ts-data-full">
                          <div className="ts-data-label">GDP概况</div>
                          <div className="ts-data-value-small">{solution.researchData.industryData.gdp}</div>
                        </div>
                        <div className="ts-data-card ts-data-full">
                          <div className="ts-data-label">旅游业占GDP比重</div>
                          <div className="ts-data-value-small">{solution.researchData.industryData.tourismGdpRatio}</div>
                        </div>
                        <div className="ts-data-card ts-data-full">
                          <div className="ts-data-label">交通条件</div>
                          <div className="ts-data-value-small">{solution.researchData.industryData.transportation}</div>
                        </div>
                        <div className="ts-data-card ts-data-full">
                          <div className="ts-data-label">基础设施</div>
                          <div className="ts-data-value-small">{solution.researchData.industryData.infrastructure}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ts-pending-box">
                    <h4>⚠️ 待补充信息</h4>
                    <ul>
                      {solution.researchData.pendingItems.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="ts-action-bar">
                    <button className="ts-primary-btn" onClick={handleConfirmStep2}>
                      确认信息并进入下一步 →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: 参考匹配 */}
          {currentStep === 3 && (
            <div className="ts-step-content">
              <div className="ts-research-header">
                <p className="ts-section-desc">
                  从IMA知识库、内置方案库、本地案例库匹配参考案例。
                  您可以选择参考案例，系统会自动提取可复用要素。
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    className="ts-primary-btn"
                    onClick={handleGenerateReference}
                    disabled={isGenerating}
                  >
                    📚 多库检索匹配
                  </button>
                  <input
                    ref={caseInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    style={{ display: 'none' }}
                    onChange={handleUploadCase}
                  />
                  <button
                    className="ts-secondary-btn"
                    onClick={() => caseInputRef.current?.click()}
                  >
                    📤 上传参考案例
                  </button>
                </div>
              </div>

              {solution.referenceData && (
                <>
                  <div className="ts-tabs">
                    <div
                      className={`ts-tab ${activeRefTab === 'ima' ? 'active' : ''}`}
                      onClick={() => setActiveRefTab('ima')}
                    >
                      🎓 IMA知识库
                    </div>
                    <div
                      className={`ts-tab ${activeRefTab === 'builtin' ? 'active' : ''}`}
                      onClick={() => setActiveRefTab('builtin')}
                    >
                      📦 内置方案库
                    </div>
                    <div
                      className={`ts-tab ${activeRefTab === 'local' ? 'active' : ''}`}
                      onClick={() => setActiveRefTab('local')}
                    >
                      🏠 本地案例
                    </div>
                    <div
                      className={`ts-tab ${activeRefTab === 'uploaded' ? 'active' : ''}`}
                      onClick={() => setActiveRefTab('uploaded')}
                    >
                      📁 我上传的
                    </div>
                  </div>

                  <div className="ts-tab-content">
                    {activeRefTab === 'ima' && (
                      <div className="ts-case-grid">
                        {solution.referenceData.imaCases.map(c => (
                          <div
                            key={c.id}
                            className={`ts-case-card ${solution.referenceData!.selectedCases.includes(c.id) ? 'selected' : ''}`}
                            onClick={() => toggleCaseSelect(c.id)}
                          >
                            <div className="ts-case-score">{c.score}分</div>
                            <h4>{c.name}</h4>
                            <p className="ts-case-reason">{c.matchReason}</p>
                            <div className="ts-case-tags">
                              {c.features?.slice(0, 3).map((f, i) => (
                                <span key={i} className="ts-tag-small">{f}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeRefTab === 'builtin' && (
                      <div className="ts-case-grid">
                        {solution.referenceData.builtinCases.map(c => (
                          <div
                            key={c.id}
                            className={`ts-case-card ${solution.referenceData!.selectedCases.includes(c.id) ? 'selected' : ''}`}
                            onClick={() => toggleCaseSelect(c.id)}
                          >
                            <div className="ts-case-score">{c.score}分</div>
                            <h4>{c.name}</h4>
                            <p className="ts-case-reason">{c.matchReason}</p>
                            <div className="ts-case-tags">
                              {c.highlights?.slice(0, 3).map((h, i) => (
                                <span key={i} className="ts-tag-small">{h}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeRefTab === 'local' && (
                      <div className="ts-case-grid">
                        {solution.referenceData.localCases.map(c => (
                          <div
                            key={c.id}
                            className={`ts-case-card ${solution.referenceData!.selectedCases.includes(c.id) ? 'selected' : ''}`}
                            onClick={() => toggleCaseSelect(c.id)}
                          >
                            <div className="ts-case-score">{c.score}分</div>
                            <h4>{c.name}</h4>
                            <p className="ts-case-reason">{c.matchReason}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeRefTab === 'uploaded' && (
                      <div>
                        {solution.referenceData.userUploadedCases.length === 0 ? (
                          <div className="ts-empty-small">
                            暂无上传案例，点击上方"上传参考案例"添加
                          </div>
                        ) : (
                          <div className="ts-case-grid">
                            {solution.referenceData.userUploadedCases.map(c => (
                              <div
                                key={c.id}
                                className={`ts-case-card ${solution.referenceData!.selectedCases.includes(c.id) ? 'selected' : ''}`}
                                onClick={() => toggleCaseSelect(c.id)}
                              >
                                <h4>{c.name}</h4>
                                <p className="ts-case-reason">{c.matchReason}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ts-reusable-box">
                    <h4>🔧 可复用要素提取</h4>
                    <div className="ts-reusable-grid">
                      <div>
                        <label>架构模式</label>
                        <div className="ts-tag-list">
                          {solution.referenceData.reusableElements.architecture.map((a, i) => (
                            <span key={i} className="ts-tag">{a}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label>功能模块</label>
                        <div className="ts-tag-list">
                          {solution.referenceData.reusableElements.features.map((f, i) => (
                            <span key={i} className="ts-tag">{f}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label>技术栈</label>
                        <div className="ts-tag-list">
                          {solution.referenceData.reusableElements.technology.map((t, i) => (
                            <span key={i} className="ts-tag">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ts-action-bar">
                    <button className="ts-primary-btn" onClick={handleConfirmStep3}>
                      确认参考并进入下一步 →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: 方案生成 */}
          {currentStep === 4 && (
            <div className="ts-step-content">
              {/* 4.1 大纲生成 */}
              {!solution.outline && (
                <div className="ts-gen-section">
                  <h3>📋 第一步：生成方案大纲</h3>
                  <p className="ts-section-desc">
                    基于前面收集的所有信息，智能生成方案大纲结构。
                  </p>
                  <button
                    className="ts-primary-btn"
                    onClick={handleGenerateOutline}
                    disabled={isGenerating}
                  >
                    🤖 生成方案大纲
                  </button>
                </div>
              )}

              {/* 4.2 大纲确认 */}
              {solution.outline && !solution.qualityCheck && (
                <div className="ts-gen-section">
                  <div className="ts-gen-header">
                    <h3>📋 方案大纲</h3>
                    <button className="ts-text-btn" onClick={handleGenerateOutline}>
                      🔄 重新生成
                    </button>
                  </div>
                  <div className="ts-outline">
                    <div className="ts-outline-title">
                      {solution.outline.title}
                      <span className="ts-outline-pages">共{solution.outline.totalPages}页</span>
                    </div>
                    {solution.outline.sections.map(section => (
                      <div key={section.id} className="ts-outline-section">
                        <div className="ts-outline-chapter">
                          {section.chapter} {section.title}
                          <span className="ts-outline-pagecount">
                            {section.pages.length}页
                          </span>
                        </div>
                        <ul className="ts-outline-pages">
                          {section.pages.map(page => (
                            <li key={page.id}>
                              <span className="ts-page-num">P{page.pageNumber}</span>
                              {page.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="ts-action-bar">
                    <button
                      className="ts-primary-btn"
                      onClick={handleGenerateQuality}
                      disabled={isGenerating}
                    >
                      ✅ 确认大纲，开始质量自检
                    </button>
                  </div>
                </div>
              )}

              {/* 4.3 质量自检 */}
              {solution.qualityCheck && !solution.htmlContent && (
                <div className="ts-gen-section">
                  <div className="ts-gen-header">
                    <h3>🔍 质量自检结果</h3>
                    <div className="ts-quality-score">
                      综合评分: <strong>{solution.qualityCheck.overallScore}</strong> 分
                    </div>
                  </div>
                  <div className="ts-quality-grid">
                    {[
                      { name: '完整性', data: solution.qualityCheck.completeness },
                      { name: '一致性', data: solution.qualityCheck.consistency },
                      { name: '准确性', data: solution.qualityCheck.accuracy },
                      { name: '差异化', data: solution.qualityCheck.differentiation },
                      { name: '可行性', data: solution.qualityCheck.feasibility },
                      { name: '创新性', data: solution.qualityCheck.innovation },
                      { name: '合规性', data: solution.qualityCheck.compliance },
                    ].map(item => (
                      <div key={item.name} className="ts-quality-item">
                        <div className="ts-quality-label">
                          <span>{item.name}</span>
                          <span>{item.data.score}分 {item.data.pass ? '✅' : '⚠️'}</span>
                        </div>
                        <div className="ts-quality-bar">
                          <div
                            className="ts-quality-fill"
                            style={{ width: `${item.data.score}%` }}
                          />
                        </div>
                        {item.data.issues.length > 0 && (
                          <div className="ts-quality-issues">
                            {item.data.issues.map((issue, i) => (
                              <div key={i}>⚠️ {issue}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {solution.qualityCheck.pendingItems.length > 0 && (
                    <div className="ts-pending-box">
                      <h4>📝 待确认事项</h4>
                      <ul>
                        {solution.qualityCheck.pendingItems.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 输出配置 */}
                  <div className="ts-output-section">
                    <h3>📤 输出配置</h3>
                    <div className="ts-output-row">
                      <label>输出格式：</label>
                      <div className="ts-format-options">
                        <label className="ts-checkbox">
                          <input
                            type="checkbox"
                            checked={outputConfig.formats.includes('html')}
                            onChange={e => {
                              const fmts = e.target.checked
                                ? [...outputConfig.formats, 'html']
                                : outputConfig.formats.filter(f => f !== 'html')
                              setOutputConfigState({ ...outputConfig, formats: fmts })
                            }}
                          />
                          <span>HTML 汇报版</span>
                        </label>
                        <label className="ts-checkbox">
                          <input
                            type="checkbox"
                            checked={outputConfig.formats.includes('ppt')}
                            onChange={e => {
                              const fmts = e.target.checked
                                ? [...outputConfig.formats, 'ppt']
                                : outputConfig.formats.filter(f => f !== 'ppt')
                              setOutputConfigState({ ...outputConfig, formats: fmts })
                            }}
                          />
                          <span>PPT 演示版</span>
                        </label>
                        <label className="ts-checkbox">
                          <input
                            type="checkbox"
                            checked={outputConfig.formats.includes('word')}
                            onChange={e => {
                              const fmts = e.target.checked
                                ? [...outputConfig.formats, 'word']
                                : outputConfig.formats.filter(f => f !== 'word')
                              setOutputConfigState({ ...outputConfig, formats: fmts })
                            }}
                          />
                          <span>Word 完整版</span>
                        </label>
                      </div>
                    </div>

                    {/* PPT模板选择 */}
                    {outputConfig.formats.includes('ppt') && (
                      <div className="ts-template-section">
                        <div className="ts-template-header">
                          <label>PPT模板：</label>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".ppt,.pptx,.potx"
                            style={{ display: 'none' }}
                            onChange={handleUploadTemplate}
                          />
                          <button
                            className="ts-text-btn"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            📤 上传我的模板
                          </button>
                        </div>
                        <div className="ts-template-grid">
                          {allPptTemplates.map(tpl => (
                            <div
                              key={tpl.id}
                              className={`ts-template-card ${selectedPptTemplate === tpl.id ? 'selected' : ''}`}
                              onClick={() => {
                                setSelectedPptTemplate(tpl.id)
                                setOutputConfigState({ ...outputConfig, pptTemplateId: tpl.id })
                              }}
                            >
                              <div
                                className="ts-template-preview"
                                style={{
                                  background: `linear-gradient(135deg, ${tpl.primaryColor}, ${tpl.secondaryColor})`,
                                }}
                              >
                                <div style={{ color: tpl.textColor, fontSize: '12px' }}>模板预览</div>
                              </div>
                              <div className="ts-template-name">{tpl.name}</div>
                              <div className="ts-template-cat">{tpl.category}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* HTML模板选择 */}
                    {outputConfig.formats.includes('html') && (
                      <div className="ts-template-section">
                        <label>HTML模板：</label>
                        <div className="ts-template-grid">
                          {HTML_TEMPLATES.map(tpl => (
                            <div
                              key={tpl.id}
                              className={`ts-template-card ${outputConfig.htmlTemplateId === tpl.id ? 'selected' : ''}`}
                              onClick={() => setOutputConfigState({ ...outputConfig, htmlTemplateId: tpl.id })}
                            >
                              <div
                                className="ts-template-preview"
                                style={{
                                  background: tpl.preview === 'dark'
                                    ? 'linear-gradient(135deg, #0a0a14, #1a1a2e)'
                                    : tpl.preview === 'light'
                                    ? 'linear-gradient(135deg, #f8fafc, #e2e8f0)'
                                    : tpl.preview === 'gov'
                                    ? 'linear-gradient(135deg, #1E3A5F, #2B6CB0)'
                                    : 'linear-gradient(135deg, #2D6A4F, #40916C)',
                                  color: tpl.preview === 'light' ? '#1e293b' : '#fff',
                                }}
                              >
                                <div style={{ fontSize: '12px' }}>{tpl.name}</div>
                              </div>
                              <div className="ts-template-name">{tpl.name}</div>
                              <div className="ts-template-cat">HTML</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ts-action-bar">
                    <button
                      className="ts-primary-btn ts-full-btn"
                      onClick={handleGenerateFinal}
                      disabled={isGenerating || outputConfig.formats.length === 0}
                    >
                      🚀 生成最终方案
                    </button>
                  </div>
                </div>
              )}

              {/* 4.4 生成完成 */}
              {solution.htmlContent && (
                <div className="ts-gen-section">
                  <div className="ts-success-box">
                    <div className="ts-success-icon">🎉</div>
                    <h2>方案生成完成！</h2>
                    <p>{solution.outline?.title}</p>
                  </div>

                  <div className="ts-output-actions">
                    {solution.htmlContent && (
                      <button className="ts-primary-btn" onClick={handleDownloadHtml}>
                        📥 下载 HTML 方案
                      </button>
                    )}
                    {outputConfig.formats.includes('ppt') && (
                      <button className="ts-secondary-btn" disabled>
                        📥 下载 PPT (开发中)
                      </button>
                    )}
                    <button
                      className="ts-secondary-btn"
                      onClick={() => {
                        setOutline(undefined as any)
                        setQualityCheck(undefined as any)
                        setHtmlContent('')
                      }}
                    >
                      🔄 重新生成
                    </button>
                  </div>

                  <div className="ts-preview-section">
                    <h3>👁️ 方案预览</h3>
                    <iframe
                      className="ts-preview-iframe"
                      srcDoc={solution.htmlContent}
                      title="方案预览"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 右侧：实时预览 */}
      <div className="ts-preview-panel">
        <div className="ts-preview-header">
          <span>📱 实时预览</span>
        </div>
        <div className="ts-preview-body">
          {solution.htmlContent ? (
            <iframe
              className="ts-preview-iframe-small"
              srcDoc={solution.htmlContent}
              title="预览"
            />
          ) : (
            <div className="ts-preview-empty">
              <div className="ts-preview-empty-icon">📄</div>
              <p>方案生成后可在此预览</p>
              <div className="ts-progress-steps">
                <div className={`ts-pstep ${currentStep > 0 ? 'done' : ''} ${currentStep === 0 ? 'active' : ''}`}>
                  需求采集
                </div>
                <div className={`ts-pstep ${currentStep > 1 ? 'done' : ''} ${currentStep === 1 ? 'active' : ''}`}>
                  分类识别
                </div>
                <div className={`ts-pstep ${currentStep > 2 ? 'done' : ''} ${currentStep === 2 ? 'active' : ''}`}>
                  信息搜集
                </div>
                <div className={`ts-pstep ${currentStep > 3 ? 'done' : ''} ${currentStep === 3 ? 'active' : ''}`}>
                  参考匹配
                </div>
                <div className={`ts-pstep ${currentStep > 4 ? 'done' : ''} ${currentStep === 4 ? 'active' : ''}`}>
                  方案生成
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 生成进度遮罩 */}
      {isGenerating && (
        <div className="ts-loading-overlay">
          <div className="ts-loading-box">
            <div className="ts-loading-spinner" />
            <div className="ts-loading-text">{generationStep}</div>
            <div className="ts-loading-bar">
              <div
                className="ts-loading-fill"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <div className="ts-loading-percent">{generationProgress}%</div>
          </div>
        </div>
      )}

      {/* 需求报告编辑弹窗*/}
      {showReportEditor && (
        <div className="ts-modal-overlay" onClick={() => setShowReportEditor(false)}>
          <div className="ts-modal ts-modal-large" onClick={e => e.stopPropagation()}>
            <h2 className="ts-modal-title">编辑需求分析报告</h2>
            <textarea
              className="ts-textarea ts-editor-textarea"
              value={editingReport}
              onChange={e => setEditingReport(e.target.value)}
            />
            <div className="ts-modal-actions">
              <button className="ts-secondary-btn" onClick={() => setShowReportEditor(false)}>
                取消
              </button>
              <button
                className="ts-primary-btn"
                onClick={() => {
                  if (solution?.requirementReport) {
                    setRequirementReport({
                      ...solution.requirementReport,
                      content: editingReport,
                      editedByUser: true,
                    })
                  }
                  setShowReportEditor(false)
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TravelSolutionWorkspace
