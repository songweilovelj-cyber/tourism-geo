import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/api/client'
import { 
  ExhibitionPlan, 
  ExhibitionZone, 
  ExhibitionCoreExhibit, 
  ExhibitionAuxiliaryExhibit,
  EXHIBITION_THEMES,
  PLAN_TYPES,
  TARGET_AUDIENCES,
  LAYOUT_TYPES,
  ARTIFACT_LEVELS,
  ThemeKnowledgeBase,
  ThemeArtifact
} from '@/types/exhibition'
import { getThemeKnowledge } from '@/data/themeKnowledgeBase'
import { generateChapterDetailedDesc, getRecommendedLiterature } from '@/data/artifactMatcher'

// 步骤配置
const STEPS = [
  { 
    id: 1, 
    name: '基本信息', 
    icon: '📋',
    desc: '展览主题、名称、时间',
    required: ['theme', 'name']
  },
  { 
    id: 2, 
    name: '展览定位', 
    icon: '🎯',
    desc: '类型、受众、教育目的',
    required: ['planType', 'targetAudience']
  },
  { 
    id: 3, 
    name: '展区规划', 
    icon: '🗺️',
    desc: '展区结构与叙事',
    required: ['zones']
  },
  { 
    id: 4, 
    name: '灵魂展品', 
    icon: '⭐',
    desc: '核心展品配置',
    required: ['coreExhibits']
  },
  { 
    id: 5, 
    name: '辅助展品', 
    icon: '📦',
    desc: '展品矩阵补充',
    required: []
  },
  { 
    id: 6, 
    name: '展陈设计', 
    icon: '🎨',
    desc: '布局、动线、灯光',
    required: []
  },
  { 
    id: 7, 
    name: '教育推广', 
    icon: '📢',
    desc: '活动与宣传',
    required: []
  }
]

function ExhibitionPlanPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const previewRef = useRef<HTMLDivElement>(null)
  
  // 当前步骤
  const [currentStep, setCurrentStep] = useState(1)
  
  // 策展方案ID
  const [planId, setPlanId] = useState<string | null>(id || null)
  
  // 基本信息
  const [selectedTheme, setSelectedTheme] = useState('')
  const [exhibitionName, setExhibitionName] = useState('')
  const [organizer, setOrganizer] = useState('')
  const [venue, setVenue] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [area, setArea] = useState('')
  
  // 展览定位
  const [planType, setPlanType] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [targetAudienceOther, setTargetAudienceOther] = useState('')
  const [educationGoal, setEducationGoal] = useState('')
  
  // 展区规划
  const [zones, setZones] = useState<ExhibitionZone[]>([])
  const [newZoneName, setNewZoneName] = useState('')
  const [newZoneSubtitle, setNewZoneSubtitle] = useState('')
  const [newZoneTimePeriod, setNewZoneTimePeriod] = useState('')
  const [newZoneNarrative, setNewZoneNarrative] = useState('')
  
  // 核心展品
  const [coreExhibits, setCoreExhibits] = useState<ExhibitionCoreExhibit[]>([])
  const [editingCoreExhibit, setEditingCoreExhibit] = useState<Partial<ExhibitionCoreExhibit>>({})
  
  // 辅助展品
  const [auxiliaryExhibits, setAuxiliaryExhibits] = useState<ExhibitionAuxiliaryExhibit[]>([])
  const [editingAuxExhibit, setEditingAuxExhibit] = useState<Partial<ExhibitionAuxiliaryExhibit>>({})
  
  // 展陈设计
  const [totalArea, setTotalArea] = useState('')
  const [layoutType, setLayoutType] = useState('')
  const [trafficDesign, setTrafficDesign] = useState('')
  const [lightingDesign, setLightingDesign] = useState('')
  const [multimediaConfig, setMultimediaConfig] = useState('')
  
  // 教育推广
  const [activities, setActivities] = useState('')
  const [educationPrograms, setEducationPrograms] = useState('')
  const [publicityPlan, setPublicityPlan] = useState('')
  const [publications, setPublications] = useState('')
  
  // 状态
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  
  // 主题知识库相关状态
  const [currentThemeKnowledge, setCurrentThemeKnowledge] = useState<ThemeKnowledgeBase | null>(null)
  const [showMustHaveWarning, setShowMustHaveWarning] = useState(false)
  const [warningArtifactName, setWarningArtifactName] = useState('')
  
  // 加载已有方案
  useEffect(() => {
    if (id) {
      loadPlan(id)
    }
  }, [id])
  
  // 主题改变时，加载对应的主题知识库
  useEffect(() => {
    if (selectedTheme) {
      const themeData = getThemeKnowledge(selectedTheme)
      setCurrentThemeKnowledge(themeData || null)
    } else {
      setCurrentThemeKnowledge(null)
    }
  }, [selectedTheme])
  
  const loadPlan = async (planId: string) => {
    setIsLoading(true)
    try {
      const response = await api.get(`/exhibition/plans/${planId}`)
      if (response.data.success) {
        const plan: ExhibitionPlan = response.data.data
        
        // 填充基本信息
        if (plan.basicInfo) {
          setSelectedTheme(plan.basicInfo.theme || '')
          setExhibitionName(plan.basicInfo.name || '')
          setOrganizer(plan.basicInfo.organizer || '')
          setVenue(plan.basicInfo.venue || '')
          setStartDate(plan.basicInfo.startDate || '')
          setEndDate(plan.basicInfo.endDate || '')
          setArea(plan.basicInfo.area?.toString() || '')
        }
        
        // 填充展览定位
        if (plan.positioning) {
          setPlanType(plan.positioning.planType || '')
          setTargetAudience(plan.positioning.targetAudience || '')
          setTargetAudienceOther(plan.positioning.targetAudienceOther || '')
          setEducationGoal(plan.positioning.educationGoal || '')
        }
        
        // 填充展区
        if (plan.zones) {
          setZones(plan.zones)
        }
        
        // 填充核心展品
        if (plan.coreExhibits) {
          setCoreExhibits(plan.coreExhibits)
        }
        
        // 填充辅助展品
        if (plan.auxiliaryExhibits) {
          setAuxiliaryExhibits(plan.auxiliaryExhibits)
        }
        
        // 填充展陈设计
        if (plan.displayDesign) {
          setTotalArea(plan.displayDesign.totalArea?.toString() || '')
          setLayoutType(plan.displayDesign.layoutType || '')
          setTrafficDesign(plan.displayDesign.trafficDesign || '')
          setLightingDesign(plan.displayDesign.lightingDesign || '')
          setMultimediaConfig(plan.displayDesign.multimediaConfig || '')
        }
        
        // 填充教育推广
        if (plan.educationPlan) {
          setActivities(plan.educationPlan.activities || '')
          setEducationPrograms(plan.educationPlan.educationPrograms || '')
          setPublicityPlan(plan.educationPlan.publicityPlan || '')
          setPublications(plan.educationPlan.publications || '')
        }
        
        // 填充生成内容
        if (plan.generatedContent) {
          setGeneratedContent(plan.generatedContent)
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '加载方案失败')
    } finally {
      setIsLoading(false)
    }
  }
  
  // 自动保存（防抖）
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  const autoSave = () => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }
    setSaveStatus('saving')
    autoSaveTimer.current = setTimeout(async () => {
      if (planId) {
        await saveCurrentStep()
      }
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1500)
  }
  
  // 创建新方案
  const createPlan = async () => {
    if (!selectedTheme || !exhibitionName) {
      setError('请填写展览主题和展览名称')
      return false
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await api.post('/exhibition/plans', {
        theme: selectedTheme,
        name: exhibitionName,
        organizer,
        venue,
        startDate,
        endDate,
        area: area ? parseInt(area) : undefined,
        planType,
        targetAudience,
        targetAudienceOther,
        educationGoal
      })
      
      if (response.data.success) {
        setPlanId(response.data.data.id)
        return true
      }
    } catch (err: any) {
      // API失败时使用本地模式
      const errorMsg = err.response?.data?.error?.message || ''
      if (err.response?.status === 401 || errorMsg.includes('登录')) {
        // 使用本地存储创建本地方案
        const localPlanId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const localPlan = {
          id: localPlanId,
          theme: selectedTheme,
          name: exhibitionName,
          organizer,
          venue,
          startDate,
          endDate,
          area: area ? parseInt(area) : undefined,
          planType,
          targetAudience,
          targetAudienceOther,
          educationGoal,
          createdAt: new Date().toISOString(),
          isLocal: true
        }
        localStorage.setItem(`exhibition_plan_${localPlanId}`, JSON.stringify(localPlan))
        setPlanId(localPlanId)
        setError('本地模式：方案已保存到本地')
        setTimeout(() => setError(''), 3000)
        return true
      }
      setError(err.response?.data?.error?.message || '创建方案失败')
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  // 保存当前步骤数据
  const saveCurrentStep = async () => {
    if (!planId) return false
    
    try {
      switch (currentStep) {
        case 1:
          await api.put(`/exhibition/plans/${planId}/basic-info`, {
            theme: selectedTheme,
            name: exhibitionName,
            organizer,
            venue,
            startDate,
            endDate,
            area: area ? parseInt(area) : undefined
          })
          break
        case 2:
          await api.put(`/exhibition/plans/${planId}/positioning`, {
            planType,
            targetAudience,
            targetAudienceOther,
            educationGoal
          })
          break
        case 3:
          await api.put(`/exhibition/plans/${planId}/zones`, { zones })
          break
        case 4:
          await api.put(`/exhibition/plans/${planId}/core-exhibits`, { exhibits: coreExhibits })
          break
        case 5:
          await api.put(`/exhibition/plans/${planId}/auxiliary-exhibits`, { exhibits: auxiliaryExhibits })
          break
        case 6:
          await api.put(`/exhibition/plans/${planId}/display-design`, {
            totalArea: totalArea ? parseInt(totalArea) : undefined,
            layoutType,
            trafficDesign,
            lightingDesign,
            multimediaConfig
          })
          break
        case 7:
          await api.put(`/exhibition/plans/${planId}/education`, {
            activities,
            educationPrograms,
            publicityPlan,
            publications
          })
          break
      }
      return true
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '保存失败')
      return false
    }
  }
  
  // 下一步
  const handleNext = async () => {
    if (currentStep === 1 && !planId) {
      const success = await createPlan()
      if (success) {
        setCurrentStep(2)
      }
    } else {
      const success = await saveCurrentStep()
      if (success && currentStep < 7) {
        setCurrentStep(currentStep + 1)
      }
    }
  }
  
  // 上一步
  const handlePrev = () => {
    if (currentStep > 1) {
      saveCurrentStep()
      setCurrentStep(currentStep - 1)
    }
  }
  
  // 跳转到指定步骤
  const goToStep = (step: number) => {
    if (planId) {
      saveCurrentStep()
      setCurrentStep(step)
    }
  }
  
  // 生成策展方案
  const handleGenerate = async () => {
    if (!planId) {
      setError('请先保存方案')
      return
    }
    
    // 先保存当前步骤
    await saveCurrentStep()
    
    setIsGenerating(true)
    setError('')
    
    try {
      const response = await api.post(`/exhibition/plans/${planId}/generate`)
      if (response.data.success) {
        setGeneratedContent(response.data.data.content)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '生成失败')
    } finally {
      setIsGenerating(false)
    }
  }
  
  // 克隆方案
  const handleClone = async () => {
    if (!planId) return
    try {
      const response = await api.post(`/exhibition/plans/${planId}/clone`)
      if (response.data.success) {
        navigate(`/exhibition/${response.data.data.id}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '克隆失败')
    }
  }
  
  // 展区操作
  const addZone = () => {
    if (!newZoneName) return
    const newZone: ExhibitionZone = {
      zoneNumber: zones.length + 1,
      name: newZoneName,
      subtitle: newZoneSubtitle,
      timePeriod: newZoneTimePeriod,
      narrative: newZoneNarrative
    }
    setZones([...zones, newZone])
    setNewZoneName('')
    setNewZoneSubtitle('')
    setNewZoneTimePeriod('')
    setNewZoneNarrative('')
    autoSave()
  }
  
  const removeZone = (index: number) => {
    const newZones = zones.filter((_, i) => i !== index)
    setZones(newZones.map((z, i) => ({ ...z, zoneNumber: i + 1 })))
    autoSave()
  }
  
  // 核心展品操作
  const addCoreExhibit = () => {
    if (!editingCoreExhibit.exhibitName) return
    const newExhibit: ExhibitionCoreExhibit = {
      ...editingCoreExhibit,
      zoneId: editingCoreExhibit.zoneId || zones[0]?.id
    } as ExhibitionCoreExhibit
    setCoreExhibits([...coreExhibits, newExhibit])
    setEditingCoreExhibit({})
    autoSave()
  }
  
  const removeCoreExhibit = (index: number) => {
    setCoreExhibits(coreExhibits.filter((_, i) => i !== index))
    autoSave()
  }
  
  // 辅助展品操作
  const addAuxExhibit = () => {
    if (!editingAuxExhibit.exhibitName) return
    const newExhibit: ExhibitionAuxiliaryExhibit = {
      ...editingAuxExhibit,
      zoneId: editingAuxExhibit.zoneId || zones[0]?.id
    } as ExhibitionAuxiliaryExhibit
    setAuxiliaryExhibits([...auxiliaryExhibits, newExhibit])
    setEditingAuxExhibit({})
    autoSave()
  }
  
  // 基于主题知识库一键生成展区规划（深化版）
  const autoGenerateZonesFromTheme = () => {
    if (!currentThemeKnowledge) return
    
    const themeArtifacts = currentThemeKnowledge.artifactPool
    const mustHaveArtifacts = themeArtifacts.filter(a => a.isMustHave)
    const recommendedArtifacts = themeArtifacts.filter(a => a.isRecommended)
    const keyDimensions = currentThemeKnowledge.keyDimensions || ['起源发展', '技术演进', '制度完善', '文化内涵', '当代价值']
    
    const chapterTitles = [
      { name: '序厅', subtitle: '文明的序曲', timePeriod: '引子', dimIndex: 0 },
      { name: '起源与发展', subtitle: '从萌芽到成熟', timePeriod: '先秦 ~ 汉唐', dimIndex: 1 },
      { name: '鼎盛时期', subtitle: '制度与文化的巅峰', timePeriod: '唐宋 ~ 明清', dimIndex: 2 },
      { name: '近代转型', subtitle: '古今之变', timePeriod: '近代 ~ 当代', dimIndex: 3 },
      { name: '尾厅', subtitle: '传承与展望', timePeriod: '展望', dimIndex: 4 }
    ]
    
    // 根据主题生成默认展区结构（深化版）
    const defaultZones: ExhibitionZone[] = chapterTitles.map((ch, index) => {
      const chapterArtifacts = themeArtifacts.slice(index * 2, index * 2 + 3)
      const dimName = keyDimensions[ch.dimIndex % keyDimensions.length] || '核心主题'
      
      const detail = generateChapterDetailedDesc(
        currentThemeKnowledge.themeName,
        ch.name,
        index,
        chapterTitles.length,
        dimName,
        chapterArtifacts
      )
      
      return {
        zoneNumber: index + 1,
        name: ch.name,
        subtitle: ch.subtitle,
        timePeriod: ch.timePeriod,
        narrative: `【叙事线索】\n${detail.narrative}\n\n【展品体系】\n${detail.artifactAnalysis}\n\n【空间设计】\n${detail.spaceSuggestions.map(s => '• ' + s).join('\n')}\n\n【教育目标】\n${detail.educationGoals.map(g => '• ' + g).join('\n')}\n\n【参观时长】约${detail.duration}`
      }
    })
    
    setZones(defaultZones)
    
    // 自动添加必选文物作为灵魂展品
    const newCoreExhibits: ExhibitionCoreExhibit[] = mustHaveArtifacts.map((artifact, index) => ({
      exhibitName: artifact.name,
      era: artifact.era,
      origin: artifact.origin,
      artifactLevel: artifact.level,
      significance: artifact.significance,
      description: artifact.description,
      material: (artifact as any).material,
      zoneId: defaultZones[index % defaultZones.length]?.id
    }))
    
    setCoreExhibits(newCoreExhibits)
    autoSave()
  }
  
  // 检查是否为必选展品
  const isMustHaveArtifact = (name: string): boolean => {
    if (!currentThemeKnowledge) return false
    return currentThemeKnowledge.artifactPool.some(
      a => a.name === name && a.isMustHave
    )
  }
  
  // 检查是否为推荐展品
  const isRecommendedArtifact = (name: string): boolean => {
    if (!currentThemeKnowledge) return false
    return currentThemeKnowledge.artifactPool.some(
      a => a.name === name && a.isRecommended
    )
  }
  
  // 获取展品优先级标签
  const getArtifactPriorityLabel = (name: string): { type: 'must' | 'recommended' | 'none', label: string } => {
    if (isMustHaveArtifact(name)) {
      return { type: 'must', label: '必选' }
    }
    if (isRecommendedArtifact(name)) {
      return { type: 'recommended', label: '推荐' }
    }
    return { type: 'none', label: '' }
  }
  
  // 从主题文物池快速添加灵魂展品
  const addCoreExhibitFromTheme = (artifact: ThemeArtifact) => {
    if (coreExhibits.some(e => e.exhibitName === artifact.name)) return
    
    const newExhibit: ExhibitionCoreExhibit = {
      exhibitName: artifact.name,
      era: artifact.era,
      origin: artifact.origin,
      artifactLevel: artifact.level,
      description: artifact.description,
      significance: artifact.significance,
      zoneId: zones[0]?.id
    }
    setCoreExhibits([...coreExhibits, newExhibit])
    autoSave()
  }
  
  // 应用空间设计提示
  const applySpatialHint = () => {
    if (!currentThemeKnowledge) return
    
    // 将空间提示应用到灯光设计和动线设计
    setLightingDesign(prev => {
      const hint = currentThemeKnowledge.spatialHint
      return prev ? prev + '\n\n' + '主题空间设计提示：' + hint : '主题空间设计提示：' + hint
    })
    
    setTrafficDesign(prev => {
      const hint = currentThemeKnowledge.spatialHint
      return prev ? prev + '\n\n' + '主题空间设计参考：' + hint : '主题空间设计参考：' + hint
    })
    
    autoSave()
  }
  
  const removeAuxExhibit = (index: number) => {
    setAuxiliaryExhibits(auxiliaryExhibits.filter((_, i) => i !== index))
    autoSave()
  }
  
  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-800 text-sm">
                <strong>💡 提示：</strong>选择展览主题后，AI将基于该主题的专业知识辅助策展。展览名称建议采用"主标题——副标题"的格式。
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                展览主题 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EXHIBITION_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => { setSelectedTheme(theme.id); autoSave() }}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedTheme === theme.id
                        ? 'border-red-700 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{theme.icon}</span>
                      <span className="font-medium text-gray-900 text-sm">{theme.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                展览名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={exhibitionName}
                onChange={(e) => { setExhibitionName(e.target.value); autoSave() }}
                placeholder="如：大河上下——中国水利文明特展"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-base"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">主办单位</label>
                <input
                  type="text"
                  value={organizer}
                  onChange={(e) => { setOrganizer(e.target.value); autoSave() }}
                  placeholder="如：中国国家博物馆"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">展览地点</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => { setVenue(e.target.value); autoSave() }}
                  placeholder="如：北京·国家博物馆"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">开始时间</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); autoSave() }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">结束时间</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); autoSave() }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">预计面积(㎡)</label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => { setArea(e.target.value); autoSave() }}
                  placeholder="2800"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>
          </div>
        )
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-800 text-sm">
                <strong>💡 提示：</strong>准确定位展览类型和目标受众，有助于AI生成更有针对性的策展方案。
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                展览类型 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {PLAN_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => { setPlanType(type.id); autoSave() }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      planType === type.id
                        ? 'border-red-700 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <span className="font-medium text-gray-900 block text-sm">{type.name}</span>
                    <span className="text-xs text-gray-500">{type.description}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                目标受众 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TARGET_AUDIENCES.map((audience) => (
                  <button
                    key={audience.id}
                    onClick={() => { setTargetAudience(audience.id); autoSave() }}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      targetAudience === audience.id
                        ? 'border-red-700 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <span className="font-medium text-gray-900 block text-sm">{audience.name}</span>
                    <span className="text-xs text-gray-500">{audience.description}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">教育目的</label>
              <textarea
                value={educationGoal}
                onChange={(e) => { setEducationGoal(e.target.value); autoSave() }}
                placeholder="请描述展览的教育目的，如：传播水利知识、弘扬中华文化、增强文化自信等"
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
              />
            </div>
          </div>
        )
        
      case 3:
        return (
          <div className="space-y-6">
            {/* 核心故事线索 - FR-02 */}
            {currentThemeKnowledge && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">📖</span>
                  <h3 className="text-sm font-bold text-amber-800">核心故事线索</h3>
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">AI 生成</span>
                </div>
                <p className="text-sm text-amber-900 leading-relaxed mb-3">
                  {currentThemeKnowledge.coreStory.narrative}
                </p>
                <div className="bg-white/60 rounded-lg p-3 border border-amber-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-600">💡</span>
                    <span className="text-xs font-semibold text-amber-700">高光时刻</span>
                  </div>
                  <p className="text-sm text-amber-800">
                    {currentThemeKnowledge.coreStory.highlight}
                  </p>
                </div>
                <button
                  onClick={() => autoGenerateZonesFromTheme()}
                  className="mt-4 text-xs text-amber-700 hover:text-amber-900 underline font-medium"
                >
                  ✨ 基于核心叙事一键生成展区规划
                </button>
              </div>
            )}
            
            {/* 学术研究推荐文献 - 深化版 */}
            {currentThemeKnowledge && currentThemeKnowledge.recommendedLiterature && currentThemeKnowledge.recommendedLiterature.length > 0 && (
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📚</span>
                  <h3 className="text-sm font-bold text-teal-800">学术研究参考</h3>
                  <span className="text-xs bg-teal-200 text-teal-800 px-2 py-0.5 rounded-full">策展必备</span>
                </div>
                <div className="space-y-3">
                  {currentThemeKnowledge.recommendedLiterature.map((book, index) => (
                    <div key={index} className="bg-white/70 rounded-lg p-3 border border-teal-100">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="text-sm font-semibold text-teal-900">{book.title}</span>
                          </div>
                          <div className="text-xs text-teal-700 ml-7 mb-1">
                            {book.author} · {book.year} · {book.publisher}
                            {book.pages && ` · ${book.pages}`}
                          </div>
                          <p className="text-xs text-teal-600 ml-7">{book.description}</p>
                          {book.importance && (
                            <div className="text-xs text-amber-600 ml-7 mt-1 font-medium">
                              📌 {book.importance}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            book.type === 'core' 
                              ? 'bg-teal-200 text-teal-800 font-semibold' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {book.type === 'core' ? '核心文献' : '参考'}
                          </span>
                          {book.category && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {book.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 text-sm">
                <strong>💡 提示：</strong>建议设置3-7个展区，按时间线或主题逻辑排列。每个展区都应有明确的叙事主题。
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">已规划的展区 ({zones.length})</h3>
              {zones.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg">
                  暂无展区，请添加
                </div>
              ) : (
                <div className="space-y-2">
                  {zones.map((zone, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 bg-red-700 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {zone.zoneNumber}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {zone.name}
                            {zone.subtitle && (
                              <span className="text-gray-500 font-normal"> — {zone.subtitle}</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {zone.timePeriod && <span>时代：{zone.timePeriod}</span>}
                          </div>
                          {zone.narrative && (
                            <p className="text-xs text-gray-600 mt-2 line-clamp-2">{zone.narrative}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeZone(index)}
                        className="text-gray-400 hover:text-red-500 text-sm flex-shrink-0"
                      >
                        移除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="border-t pt-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">添加新展区</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">展区名称 *</label>
                  <input
                    type="text"
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    placeholder="如：洪荒肇始"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">副标题</label>
                  <input
                    type="text"
                    value={newZoneSubtitle}
                    onChange={(e) => setNewZoneSubtitle(e.target.value)}
                    placeholder="如：远古至先秦水利"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">时代/时期</label>
                  <input
                    type="text"
                    value={newZoneTimePeriod}
                    onChange={(e) => setNewZoneTimePeriod(e.target.value)}
                    placeholder="如：远古 ~ 先秦"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">核心叙事</label>
                <textarea
                  value={newZoneNarrative}
                  onChange={(e) => setNewZoneNarrative(e.target.value)}
                  placeholder="一句话描述本展区的核心叙事"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none text-sm"
                />
              </div>
              <button
                onClick={addZone}
                disabled={!newZoneName}
                className="mt-3 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + 添加展区
              </button>
            </div>
          </div>
        )
        
      case 4:
        return (
          <div className="space-y-6">
            {/* AI策展人笔记 - FR-03 */}
            {currentThemeKnowledge && (
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🤖</span>
                  <h3 className="text-sm font-bold text-teal-800">AI 策展人笔记</h3>
                  <span className="text-xs bg-teal-200 text-teal-800 px-2 py-0.5 rounded-full">智能推荐</span>
                </div>
                <p className="text-sm text-teal-900 leading-relaxed">
                  {currentThemeKnowledge.curatorialNotes}
                </p>
              </div>
            )}
            
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-800 text-sm">
                <strong>⭐ 灵魂展品说明：</strong>每个展区应设置1-2件灵魂展品（核心展品），作为该单元的叙事核心与视觉焦点。灵魂展品是整个展览的"骨"，其余展品围绕其展开。
              </p>
            </div>
            
            {/* 主题文物池快速添加 */}
            {currentThemeKnowledge && currentThemeKnowledge.artifactPool.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    📦 主题文物池（点击快速添加为灵魂展品）
                  </h3>
                  <span className="text-xs text-gray-500">
                    共 {currentThemeKnowledge.artifactPool.length} 件
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                  {currentThemeKnowledge.artifactPool.map((artifact) => {
                    const priority = getArtifactPriorityLabel(artifact.name)
                    const isAdded = coreExhibits.some(e => e.exhibitName === artifact.name)
                    return (
                      <div
                        key={artifact.id}
                        className={`relative flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-white border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                        }`}
                        onClick={() => {
                          if (!isAdded) {
                            setEditingCoreExhibit({
                              exhibitName: artifact.name,
                              era: artifact.era,
                              origin: artifact.origin,
                              artifactLevel: artifact.level,
                              description: artifact.description,
                              significance: artifact.significance
                            })
                            addCoreExhibitFromTheme(artifact)
                          }
                        }}
                      >
                        {/* 优先级角标 - FR-01 */}
                        {priority.type !== 'none' && (
                          <div className="absolute -top-2 -left-2 z-10">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                priority.type === 'must'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-amber-500 text-white'
                              }`}
                              title={priority.type === 'must' ? '核心支撑展品，建议保留' : '推荐展品，建议考虑'}
                            >
                              {priority.type === 'must' ? '必选' : '推荐'}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 pl-2">
                          <span className="text-2xl">{artifact.emoji || '🏺'}</span>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {artifact.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {artifact.era} · {artifact.category}
                              {artifact.level && ` · ${artifact.level}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm">
                          {isAdded ? (
                            <span className="text-amber-600 font-medium">✓ 已添加</span>
                          ) : (
                            <span className="text-gray-400">＋ 添加</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                已配置的灵魂展品 ({coreExhibits.length}件)
              </h3>
              {coreExhibits.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg">
                  暂无灵魂展品配置
                </div>
              ) : (
                <div className="space-y-2">
                  {coreExhibits.map((exhibit, index) => {
                    const priority = getArtifactPriorityLabel(exhibit.exhibitName)
                    return (
                      <div
                        key={index}
                        className="relative bg-gradient-to-r from-amber-50 to-white rounded-lg p-3 border border-amber-200 flex items-start justify-between"
                      >
                        {/* 优先级角标 - FR-01 */}
                        {priority.type !== 'none' && (
                          <div className="absolute -top-2 -left-2 z-10">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                priority.type === 'must'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-amber-500 text-white'
                              }`}
                              title={priority.type === 'must' ? '核心支撑展品，建议保留' : '推荐展品，建议考虑'}
                            >
                              {priority.type === 'must' ? '必选' : '推荐'}
                            </span>
                          </div>
                        )}
                        <div className="flex items-start gap-3 pl-2">
                          <span className="text-xl">⭐</span>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{exhibit.exhibitName}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {exhibit.era && exhibit.era}
                              {exhibit.artifactLevel && ` · ${exhibit.artifactLevel}`}
                              {exhibit.origin && ` · ${exhibit.origin}`}
                            </div>
                            {exhibit.significance && (
                              <p className="text-xs text-gray-600 mt-2 line-clamp-2">{exhibit.significance}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (priority.type === 'must') {
                              setWarningArtifactName(exhibit.exhibitName)
                              setShowMustHaveWarning(true)
                            }
                            removeCoreExhibit(index)
                          }}
                          className="text-gray-400 hover:text-red-500 text-sm flex-shrink-0"
                        >
                          移除
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
            <div className="border-t pt-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">添加灵魂展品</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">展品名称 *</label>
                  <input
                    type="text"
                    value={editingCoreExhibit.exhibitName || ''}
                    onChange={(e) => setEditingCoreExhibit({ ...editingCoreExhibit, exhibitName: e.target.value })}
                    placeholder="如：李冰石像"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">时代</label>
                  <input
                    type="text"
                    value={editingCoreExhibit.era || ''}
                    onChange={(e) => setEditingCoreExhibit({ ...editingCoreExhibit, era: e.target.value })}
                    placeholder="如：东汉"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">来源/出土地</label>
                  <input
                    type="text"
                    value={editingCoreExhibit.origin || ''}
                    onChange={(e) => setEditingCoreExhibit({ ...editingCoreExhibit, origin: e.target.value })}
                    placeholder="如：四川都江堰"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">文物等级</label>
                  <select
                    value={editingCoreExhibit.artifactLevel || ''}
                    onChange={(e) => setEditingCoreExhibit({ ...editingCoreExhibit, artifactLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                  >
                    <option value="">请选择</option>
                    {ARTIFACT_LEVELS.map((level) => (
                      <option key={level.id} value={level.name}>{level.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">为何是灵魂展品？（重要性说明）</label>
                <textarea
                  value={editingCoreExhibit.significance || ''}
                  onChange={(e) => setEditingCoreExhibit({ ...editingCoreExhibit, significance: e.target.value })}
                  placeholder="说明这件展品为什么能成为灵魂展品"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none text-sm"
                />
              </div>
              <button
                onClick={addCoreExhibit}
                disabled={!editingCoreExhibit.exhibitName}
                className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + 添加灵魂展品
              </button>
            </div>
          </div>
        )
        
      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 text-sm">
                <strong>💡 提示：</strong>辅助展品围绕灵魂展品展开，充实展区内容。建议每个灵魂展品配置3-5件辅助展品。
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                已配置的辅助展品 ({auxiliaryExhibits.length}件)
              </h3>
              {auxiliaryExhibits.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg">
                  暂无辅助展品
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {auxiliaryExhibits.map((exhibit, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{exhibit.exhibitName}</div>
                        <div className="text-xs text-gray-500">
                          {exhibit.era && exhibit.era}
                          {exhibit.artifactLevel && ` · ${exhibit.artifactLevel}`}
                          {exhibit.isReplica && ' · 【复制品】'}
                        </div>
                      </div>
                      <button
                        onClick={() => removeAuxExhibit(index)}
                        className="text-gray-400 hover:text-red-500 text-xs flex-shrink-0"
                      >
                        移除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="border-t pt-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">添加辅助展品</h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">展品名称 *</label>
                  <input
                    type="text"
                    value={editingAuxExhibit.exhibitName || ''}
                    onChange={(e) => setEditingAuxExhibit({ ...editingAuxExhibit, exhibitName: e.target.value })}
                    placeholder="展品名称"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">时代</label>
                  <input
                    type="text"
                    value={editingAuxExhibit.era || ''}
                    onChange={(e) => setEditingAuxExhibit({ ...editingAuxExhibit, era: e.target.value })}
                    placeholder="时代"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">文物等级</label>
                  <select
                    value={editingAuxExhibit.artifactLevel || ''}
                    onChange={(e) => setEditingAuxExhibit({ ...editingAuxExhibit, artifactLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                  >
                    <option value="">请选择</option>
                    {ARTIFACT_LEVELS.map((level) => (
                      <option key={level.id} value={level.name}>{level.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={addAuxExhibit}
                disabled={!editingAuxExhibit.exhibitName}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + 添加辅助展品
              </button>
            </div>
          </div>
        )
        
      case 6:
        return (
          <div className="space-y-6">
            {/* 空间设计叙事联动 - FR-04 */}
            {currentThemeKnowledge && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">💡</span>
                  <h3 className="text-sm font-bold text-purple-800">空间设计提示</h3>
                  <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">主题联动</span>
                </div>
                <p className="text-sm text-purple-900 leading-relaxed">
                  {currentThemeKnowledge.spatialHint}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => applySpatialHint()}
                    className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    ✨ 应用到设计方案
                  </button>
                </div>
              </div>
            )}
            
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-purple-800 text-sm">
                <strong>💡 提示：</strong>展陈设计是策展方案的重要组成部分。好的布局和动线设计能提升观众的参观体验。
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">总面积(㎡)</label>
                <input
                  type="number"
                  value={totalArea}
                  onChange={(e) => { setTotalArea(e.target.value); autoSave() }}
                  placeholder="如：2800"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">布局类型</label>
                <select
                  value={layoutType}
                  onChange={(e) => { setLayoutType(e.target.value); autoSave() }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="">请选择</option>
                  {LAYOUT_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">参观动线设计</label>
              <textarea
                value={trafficDesign}
                onChange={(e) => { setTrafficDesign(e.target.value); autoSave() }}
                placeholder="描述参观动线设计，如：按历史时序从右向左展开，入口→序厅→第一单元→...→尾厅→出口..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">灯光设计</label>
              <textarea
                value={lightingDesign}
                onChange={(e) => { setLightingDesign(e.target.value); autoSave() }}
                placeholder="描述灯光设计方案，如：重点照明突出核心展品，环境光营造氛围..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">多媒体配置</label>
              <textarea
                value={multimediaConfig}
                onChange={(e) => { setMultimediaConfig(e.target.value); autoSave() }}
                placeholder="描述需要配置的多媒体设备，如：交互式数字沙盘、投影装置、AR导览..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
              />
            </div>
          </div>
        )
        
      case 7:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-800 text-sm">
                <strong>💡 提示：</strong>教育推广方案让展览的影响力延伸到展厅之外，是策展工作的重要组成部分。
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">配套活动</label>
              <textarea
                value={activities}
                onChange={(e) => { setActivities(e.target.value); autoSave() }}
                placeholder="如：定时讲解、专家讲座、互动工作坊、文化体验活动..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">社教项目</label>
              <textarea
                value={educationPrograms}
                onChange={(e) => { setEducationPrograms(e.target.value); autoSave() }}
                placeholder="如：青少年研学课程、志愿者讲解培训、校园巡展..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">宣传方案</label>
              <textarea
                value={publicityPlan}
                onChange={(e) => { setPublicityPlan(e.target.value); autoSave() }}
                placeholder="如：社交媒体推广、媒体报道计划、KOL合作..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">出版物</label>
              <textarea
                value={publications}
                onChange={(e) => { setPublications(e.target.value); autoSave() }}
                placeholder="如：展览图录、学术论文集、教育手册、导览册..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
              />
            </div>
          </div>
        )
        
      default:
        return null
    }
  }
  
  // 渲染预览面板
  const renderPreview = () => (
    <div ref={previewRef} className="h-full overflow-y-auto">
      <div className="bg-gradient-to-br from-stone-100 to-amber-50 rounded-xl p-6 border border-stone-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📋 方案预览</h3>
        
        {/* 展览名称 */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">展览名称</div>
          <div className="font-bold text-gray-900 text-lg">
            {exhibitionName || '未命名展览'}
          </div>
          {selectedTheme && (
            <div className="text-sm text-red-700 mt-1">主题：{selectedTheme}</div>
          )}
        </div>
        
        {/* 基本信息 */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-2">基本信息</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">主办：</span>
              <span className="text-gray-900">{organizer || '待定'}</span>
            </div>
            <div>
              <span className="text-gray-500">地点：</span>
              <span className="text-gray-900">{venue || '待定'}</span>
            </div>
            <div>
              <span className="text-gray-500">面积：</span>
              <span className="text-gray-900">{area ? area + '㎡' : '待定'}</span>
            </div>
            <div>
              <span className="text-gray-500">类型：</span>
              <span className="text-gray-900">{planType || '待定'}</span>
            </div>
          </div>
        </div>
        
        {/* 展区概览 */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-2">展区规划</div>
          {zones.length > 0 ? (
            <div className="space-y-2">
              {zones.map((zone, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-red-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {zone.zoneNumber}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{zone.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">暂未规划展区</div>
          )}
        </div>
        
        {/* 展品统计 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-2">展品统计</div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-amber-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-amber-700">{coreExhibits.length}</div>
              <div className="text-xs text-gray-500 mt-1">⭐ 灵魂展品</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-700">{auxiliaryExhibits.length}</div>
              <div className="text-xs text-gray-500 mt-1">📦 辅助展品</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 生成结果 */}
      {generatedContent && (
        <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">✨ 生成结果</h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {generatedContent}
            </pre>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(generatedContent)}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              复制内容
            </button>
          </div>
        </div>
      )}
    </div>
  )
  
  if (isLoading && id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-red-700 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* 左侧：步骤导航 */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        {/* Logo区域 */}
        <div className="p-5 border-b border-gray-100">
          <button
            onClick={() => navigate('/exhibition')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-red-700 to-red-800 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🏛️</span>
            </div>
            <span className="font-bold text-gray-900">策展助手</span>
          </button>
        </div>
        
        {/* 保存状态 */}
        {planId && (
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {saveStatus === 'saving' && '保存中...'}
              {saveStatus === 'saved' && '已保存 ✓'}
              {saveStatus === 'idle' && '已保存'}
            </div>
            <button
              onClick={handleClone}
              className="text-xs text-red-700 hover:underline"
            >
              复制版本
            </button>
          </div>
        )}
        
        {/* 步骤列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                disabled={!planId && step.id > 1}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left ${
                  currentStep === step.id
                    ? 'bg-red-50 text-red-700'
                    : 'text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  currentStep === step.id
                    ? 'bg-red-700 text-white'
                    : currentStep > step.id
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {currentStep > step.id ? '✓' : step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{step.name}</div>
                  <div className="text-xs opacity-70 truncate">{step.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* 底部操作 */}
        <div className="p-4 border-t border-gray-100">
          {currentStep < 7 ? (
            <button
              onClick={handleNext}
              disabled={isLoading || isSaving}
              className="w-full py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {isLoading ? '保存中...' : `下一步：${STEPS[currentStep]?.name || ''}`}
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !planId}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  AI 生成中...
                </>
              ) : (
                '✨ 生成策展方案'
              )}
            </button>
          )}
          
          {currentStep > 1 && (
            <button
              onClick={handlePrev}
              className="w-full mt-2 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              ← 上一步
            </button>
          )}
        </div>
      </div>
      
      {/* 中间：表单内容 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部标题栏 */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {STEPS[currentStep - 1]?.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {STEPS[currentStep - 1]?.desc}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                步骤 {currentStep} / {STEPS.length}
              </span>
            </div>
          </div>
        </div>
        
        {/* 错误提示 */}
        {error && (
          <div className="mx-8 mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}
        
        {/* 表单内容区 */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl">
            {renderStepContent()}
          </div>
        </div>
      </div>
      
      {/* 右侧：实时预览 */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 flex-shrink-0 p-4 hidden xl:block">
        {renderPreview()}
      </div>
      
      {/* 必选展品移除警告 Toast */}
      {showMustHaveWarning && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="font-semibold text-sm">警告：该文物为核心支撑展品</div>
              <div className="text-xs text-red-100">
                移除「{warningArtifactName}」可能导致叙事逻辑断裂
              </div>
            </div>
            <button
              onClick={() => setShowMustHaveWarning(false)}
              className="ml-4 text-white/80 hover:text-white text-sm"
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExhibitionPlanPage
