import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/api/client'
import {
  ExhibitionPlan,
  ExhibitionZone,
  ExhibitionCoreExhibit,
  ExhibitionAuxiliaryExhibit,
  EXHIBITION_THEMES,
  ThemeKnowledgeBase,
  ThemeArtifact
} from '@/types/exhibition'
import { getThemeKnowledge } from '@/data/themeKnowledgeBase'
import { generateChapterDetailedDesc, getRecommendedLiterature } from '@/data/artifactMatcher'
import { generateCurationContent, CurationContent, CuratedZone } from '@/data/curationContentEngine'
import '@/styles/curation-dark.css'

// 4大阶段配置
const PHASES = [
  { id: 1, name: '策展策划', icon: '📋', desc: '主题定位与知识构建' },
  { id: 2, name: '内容深化', icon: '📚', desc: '展品遴选与大纲深化' },
  { id: 3, name: '空间&展陈设计', icon: '🏛️', desc: '空间布局与展陈设计' },
  { id: 4, name: '数字预览', icon: '✨', desc: '效果预览与导出' }
]

// Phase 1 子标签页
const PHASE1_SUBTABS = [
  { id: 1, name: '策展模式', icon: '🎯' },
  { id: 2, name: '主题与基本信息', icon: '📝' },
  { id: 3, name: '主题维度拆解', icon: '🧩' },
  { id: 4, name: '知识图谱', icon: '🕸️' }
]

// Phase 3 子标签页
const PHASE3_SUBTABS = [
  { id: 1, name: '空间布局', icon: '🗺️' },
  { id: 2, name: '展柜选型', icon: '🪟' },
  { id: 3, name: '灯光设计', icon: '💡' },
  { id: 4, name: 'VI视觉', icon: '🎨' },
  { id: 5, name: '数字互动', icon: '📱' }
]

// 策展模式
const CURATION_MODES = [
  { id: 'theme', name: '主题策展', icon: '🎨', desc: '围绕一个核心主题，构建完整展览叙事体系', badge: '推荐' },
  { id: 'artifact', name: '文物策展', icon: '🏺', desc: '基于特定藏品，策划专题展览', badge: '' },
  { id: 'timeline', name: '通史策展', icon: '📜', desc: '按时间线梳理文明发展脉络', badge: '' }
]

// 受众类型
const AUDIENCE_TYPES = [
  { id: 'family', name: '亲子家庭', desc: '6-12岁儿童及家长', needs: '互动体验、趣味讲解', highlights: ['互动展项', '教育活动'] },
  { id: 'student', name: '学生群体', desc: '中学生及大学生', needs: '知识深度、学术价值', highlights: ['学术资料', '专家讲座'] },
  { id: 'scholar', name: '专业人士', desc: '博物馆从业者、研究者', needs: '学术深度、专业数据', highlights: ['研究文献', '数据溯源'] },
  { id: 'tourist', name: '普通游客', desc: '观光型参观者', needs: '视觉震撼、打卡体验', highlights: ['网红展品', '沉浸体验'] },
  { id: 'senior', name: '银发群体', desc: '55岁以上参观者', needs: '舒适动线、大字说明', highlights: ['无障碍设计', '休息区'] },
  { id: 'international', name: '国际观众', desc: '外国参观者', needs: '多语言、文化背景解读', highlights: ['多语导览', '文化注解'] }
]

// 展陈结构模板
const STRUCTURE_TEMPLATES = [
  { chapter: '序厅', title: '文明的序曲', subtitle: '引入主题，建立期待', duration: '10分钟' },
  { chapter: '第一章', title: '起源与萌芽', subtitle: '事物的最初形态', duration: '15分钟' },
  { chapter: '第二章', title: '发展与演进', subtitle: '逐步走向成熟', duration: '20分钟' },
  { chapter: '第三章', title: '鼎盛与辉煌', subtitle: '巅峰时期的成就', duration: '20分钟' },
  { chapter: '第四章', title: '转型与融合', subtitle: '近现代的变化', duration: '15分钟' },
  { chapter: '尾厅', title: '传承与展望', subtitle: '当代价值与未来', duration: '10分钟' }
]

// 展柜类型
const SHOWCASE_TYPES = [
  { id: 'wall', name: '沿墙展柜', icon: '🪟', spec: '通高300cm', desc: '适合大型文物和场景复原' },
  { id: 'center', name: '中心展柜', icon: '📦', spec: '180×90cm', desc: '四面观赏，突出重点展品' },
  { id: 'table', name: '桌柜', icon: '🪑', spec: '120×60cm', desc: '小件文物近距离观赏' },
  { id: 'hang', name: '悬挂展柜', icon: '🖼️', spec: '定制尺寸', desc: '书画、纺织品等平面文物' },
  { id: 'open', name: '开放展台', icon: '🏛️', spec: '定制', desc: '大型雕塑、复制品等' },
  { id: 'immersive', name: '沉浸展区', icon: '✨', spec: '空间级', desc: '多媒体沉浸式体验' }
]

// 灯光方案
const LIGHTING_SCHEMES = [
  { id: 'warm', name: '暖色调', temp: '2700K', lux: '50-150 lux', desc: '营造历史厚重感', color: '#f5e6d3', forWhat: '青铜器、陶瓷、雕塑' },
  { id: 'neutral', name: '自然中性', temp: '4000K', lux: '100-200 lux', desc: '还原真实色彩', color: '#f0f0e8', forWhat: '书画、织绣、玉石' },
  { id: 'cool', name: '冷色调', temp: '5000K', lux: '150-300 lux', desc: '现代科技感', color: '#e0e8f0', forWhat: '当代艺术、数字展项' },
  { id: 'dramatic', name: '戏剧化', temp: '3000K', lux: '20-80 lux', desc: '聚光突出重点', color: '#d4c4a8', forWhat: '国宝级文物、核心展品' }
]

// VI配色方案
const VI_SCHEMES = [
  { name: '青铜古韵', primary: '#8B6914', secondary: '#D4AF37', accent: '#CD853F' },
  { name: '丹青水墨', primary: '#2F4F4F', secondary: '#708090', accent: '#4682B4' },
  { name: '朱墙宫墙', primary: '#8B0000', secondary: '#CD5C5C', accent: '#DAA520' },
  { name: '青瓷如玉', primary: '#6B8E23', secondary: '#9ACD32', accent: '#2E8B57' },
  { name: '丝路金沙', primary: '#D2691E', secondary: '#F4A460', accent: '#DAA520' },
  { name: '墨玉青花', primary: '#191970', secondary: '#4169E1', accent: '#00CED1' }
]

// 数字展项
const DIGITAL_EXHIBITS = [
  { id: 'ar', name: 'AR导览', icon: '📱', desc: '手机扫码看文物3D模型' },
  { id: 'vr', name: 'VR沉浸', icon: '🥽', desc: '虚拟现实穿越历史场景' },
  { id: 'projection', name: '投影 Mapping', icon: '🎬', desc: '建筑投影秀、文物投影' },
  { id: 'interactive', name: '互动屏幕', icon: '🖥️', desc: '多点触控信息查询' },
  { id: 'hologram', name: '全息投影', icon: '💫', desc: '360度全息展示' },
  { id: 'game', name: '教育游戏', icon: '🎮', desc: '知识问答、拼图游戏' },
  { id: 'audio', name: '智能导览', icon: '🎧', desc: 'AI语音讲解系统' },
  { id: 'social', name: '互动打卡', icon: '📸', desc: 'AR拍照、合影生成' },
  { id: 'data', name: '数据可视化', icon: '📊', desc: '知识图谱、时间线' }
]

// 包容性设计
const INCLUSIVE_DESIGNS = [
  { category: '视障支持', icon: '👁️', items: ['盲文说明牌', '语音导览', '触觉模型', '高对比度文字'] },
  { category: '听障支持', icon: '👂', items: ['字幕系统', '手语视频', '震动提醒', '文字转语音'] },
  { category: '行动障碍', icon: '♿', items: ['无障碍通道', '轮椅展柜高度', '休息座椅', '电梯直达'] },
  { category: '认知友好', icon: '🧠', items: ['简洁信息设计', '多感官体验', '清晰导视系统', '安静空间'] }
]

function getThemeEmoji(themeName: string): string {
  const emojiMap: Record<string, string> = {
    '车马驰骋': '🐎', '秦代文明': '⚔️', '青铜艺术': '🏺',
    '水利文明': '💧', '运河文化': '🚢', '丝绸之路': '🐪',
    '青铜文明': '🫖', '航海文明': '⛵', '城市变迁': '🏙️',
    '道路体系': '🛤️', '交通制度': '🚗', '陶瓷文化': '🏺',
    '礼乐制度': '🎵', '工匠技艺': '🔨', '军事制度': '⚔️'
  }
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (themeName.includes(key)) return emoji
  }
  return '🏛️'
}

function CurationWorkspace() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // 阶段与子标签
  const [currentPhase, setCurrentPhase] = useState(1)
  const [maxPhase, setMaxPhase] = useState(1)
  const [phase1Sub, setPhase1Sub] = useState(1)
  const [phase3Sub, setPhase3Sub] = useState(1)

  // 策展方案ID
  const [planId, setPlanId] = useState<string | null>(id || null)

  // 基本信息
  const [curationMode, setCurationMode] = useState('theme')
  const [selectedTheme, setSelectedTheme] = useState('')
  const [exhibitionName, setExhibitionName] = useState('')
  const [organizer, setOrganizer] = useState('')
  const [venue, setVenue] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [area, setArea] = useState('')
  const [planType, setPlanType] = useState('')
  const [educationGoal, setEducationGoal] = useState('')

  // 受众选择
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(['family', 'student'])

  // 展区规划
  const [zones, setZones] = useState<ExhibitionZone[]>([])
  const [expandedZones, setExpandedZones] = useState<Set<number>>(new Set())

  // 展品
  const [coreExhibits, setCoreExhibits] = useState<ExhibitionCoreExhibit[]>([])
  const [auxiliaryExhibits, setAuxiliaryExhibits] = useState<ExhibitionAuxiliaryExhibit[]>([])
  const [selectedArtifactIds, setSelectedArtifactIds] = useState<Set<string>>(new Set())
  const [artifactFilter, setArtifactFilter] = useState('all')
  const [artifactSearch, setArtifactSearch] = useState('')

  // 空间设计
  const [selectedShowcases, setSelectedShowcases] = useState<string[]>(['wall', 'center'])
  const [selectedLighting, setSelectedLighting] = useState('warm')
  const [selectedVIScheme, setSelectedVIScheme] = useState(0)
  const [selectedDigitals, setSelectedDigitals] = useState<string[]>(['ar', 'projection'])
  const [totalArea, setTotalArea] = useState('')
  const [trafficDesign, setTrafficDesign] = useState('')
  const [lightingDesign, setLightingDesign] = useState('')

  // 主题知识库
  const [currentThemeKnowledge, setCurrentThemeKnowledge] = useState<ThemeKnowledgeBase | null>(null)
  const [showMustHaveWarning, setShowMustHaveWarning] = useState(false)
  const [warningArtifactName, setWarningArtifactName] = useState('')
  const [detailArtifact, setDetailArtifact] = useState<ThemeArtifact | null>(null)

  // 策展深度内容
  const [curationContent, setCurationContent] = useState<CurationContent | null>(null)

  // AI配图生成
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({})
  const [generatingImages, setGeneratingImages] = useState<Set<string>>(new Set())

  // 主题维度
  const [themeDimensions, setThemeDimensions] = useState<Array<{name: string, desc: string, stages: string}>>([])

  // 展陈结构
  const [structureItems, setStructureItems] = useState(STRUCTURE_TEMPLATES.map(s => ({...s, selected: true})))

  // AI对话
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([
    { role: 'ai', content: '欢迎使用策展助手。第一步：选择策展模式和展览主题，或直接描述你的策展想法。' }
  ])
  const [chatInput, setChatInput] = useState('')

  // 状态
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  // 自动保存
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 加载已有方案
  useEffect(() => {
    if (id) {
      loadPlan(id)
    }
  }, [id])

  // 主题改变时加载知识库
  useEffect(() => {
    if (selectedTheme) {
      const themeData = getThemeKnowledge(selectedTheme)
      setCurrentThemeKnowledge(themeData || null)
      if (themeData?.keyDimensions) {
        setThemeDimensions(themeData.keyDimensions.map(d => ({
          name: d,
          desc: getDimensionDesc(d),
          stages: getDimensionStages(d, themeData.themeName)
        })))
      }
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
        if (plan.basicInfo) {
          setSelectedTheme(plan.basicInfo.theme || '')
          setExhibitionName(plan.basicInfo.name || '')
          setOrganizer(plan.basicInfo.organizer || '')
          setVenue(plan.basicInfo.venue || '')
          setStartDate(plan.basicInfo.startDate || '')
          setEndDate(plan.basicInfo.endDate || '')
          setArea(plan.basicInfo.area?.toString() || '')
        }
        if (plan.positioning) {
          setPlanType(plan.positioning.planType || '')
          setEducationGoal(plan.positioning.educationGoal || '')
        }
        if (plan.zones) setZones(plan.zones)
        if (plan.coreExhibits) setCoreExhibits(plan.coreExhibits)
        if (plan.auxiliaryExhibits) setAuxiliaryExhibits(plan.auxiliaryExhibits)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '加载方案失败')
    } finally {
      setIsLoading(false)
    }
  }

  const showToastFn = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  const autoSave = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      if (planId) {
        // save logic
      }
    }, 1500)
  }

  // 生成HTML策展方案
  const generateHTML = (imagesBase64: Record<string, string> = {}) => {
    const themeName = currentThemeKnowledge?.themeName || selectedTheme
    const coreStory = currentThemeKnowledge?.coreStory
    const artifacts = currentThemeKnowledge?.artifactPool?.filter(a => selectedArtifactIds.has(a.id)) || []
    const mustArts = artifacts.filter(a => a.isMustHave)
    const recArts = artifacts.filter(a => a.isRecommended && !a.isMustHave)
    const lit = currentThemeKnowledge?.recommendedLiterature || []

    // 调用新引擎获取深度内容
    const curationContent = generateCurationContent(
      selectedTheme,
      themeName,
      artifacts,
      currentThemeKnowledge?.keyDimensions
    )

    const viScheme = VI_SCHEMES[selectedVIScheme] || VI_SCHEMES[0]
    const lightingObj = LIGHTING_SCHEMES.find(l => l.id === selectedLighting) || LIGHTING_SCHEMES[0]
    const areaNum = parseInt(totalArea || area) || 1800
    const totalDuration = curationContent.zones.reduce((acc, z) => acc + parseInt(z.duration) || 15, 0)

    // ========== 预算估算计算（基于市场行情参考价）==========
    // 1. 场地与基建（参考国内一线城市博物馆特展市场行情）
    const venueRent = areaNum * 350
    const wallBuild = areaNum * 200
    const floorSign = areaNum * 80
    const infraSubtotal = venueRent + wallBuild + floorSign

    // 2. 展品相关（按文物等级差异化定价，参考国内博物馆行业惯例）
    const transportCost = artifacts.reduce((sum, a) => {
      const level = (a.level || '').toLowerCase()
      if (level.includes('一级') || level.includes('禁止') || level.includes('国宝')) return sum + 15000
      if (level.includes('二级') || level.includes('珍贵')) return sum + 8000
      return sum + 3000
    }, 0)
    const insuranceCost = artifacts.reduce((sum, a) => {
      const level = (a.level || '').toLowerCase()
      if (level.includes('一级') || level.includes('禁止') || level.includes('国宝')) return sum + 6000
      if (level.includes('二级') || level.includes('珍贵')) return sum + 3000
      return sum + 1000
    }, 0)
    const showcaseCost = selectedShowcases.length * 80000
    const exhibitSubtotal = transportCost + insuranceCost + showcaseCost

    // 3. 多媒体与灯光（参考展览行业设备租赁/采购行情）
    const digitalCost = selectedDigitals.length * 120000
    const lightingCost = areaNum * 45
    const audioCost = areaNum * 30
    const mediaSubtotal = digitalCost + lightingCost + audioCost

    // 4. 运营与人力
    const designFee = areaNum * 60
    const securityCost = areaNum * 40
    const promoCost = areaNum * 50
    const opsSubtotal = designFee + securityCost + promoCost

    const grandTotal = infraSubtotal + exhibitSubtotal + mediaSubtotal + opsSubtotal

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${exhibitionName || '策展方案'} — 专业策展方案</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font);
      background: transparent;
      color: var(--t1);
      line-height: 1.9;
      -webkit-font-smoothing: antialiased;
    }
    /* === 侧边导航 === */
    .side-nav {
      position: fixed; top: 0; left: 0; width: 220px; height: 100vh;
      background: linear-gradient(180deg, rgba(22, 24, 38, 0.95) 0%, rgba(13, 14, 26, 0.9) 100%);
      backdrop-filter: blur(20px);
      border-right: 1px solid var(--border);
      padding: 32px 0; z-index: 100; overflow-y: auto;
    }
    .side-nav .nav-logo {
      padding: 0 24px 24px; font-size: 14px; color: var(--gold);
      font-weight: 700; letter-spacing: 2px; border-bottom: 1px solid var(--border); margin-bottom: 16px;
      font-family: var(--font-display);
    }
    .side-nav a {
      display: block; padding: 10px 24px; font-size: 13px; color: var(--t3);
      text-decoration: none; transition: all 0.2s; border-left: 3px solid transparent;
    }
    .side-nav a:hover { color: var(--gold); background: var(--gl); border-left-color: var(--gold); }
    .main-content { margin-left: 220px; }

    /* === 封面 === */
    .cover {
      min-height: 100vh; position: relative; display: flex; align-items: center;
      justify-content: center; overflow: hidden;
    }
    .cover-bg {
      position: absolute; inset: 0;
      background: linear-gradient(160deg, var(--bg-page) 0%, #1a1528 30%, #0f1a20 60%, var(--bg-page) 100%);
    }
    .cover-bg::after {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(ellipse at 30% 50%, rgba(201, 169, 98, 0.06) 0%, transparent 60%),
                  radial-gradient(ellipse at 70% 30%, rgba(212, 63, 63, 0.05) 0%, transparent 50%);
    }
    .cover-visual {
      position: absolute; inset: 0; z-index: 1;
      display: flex; align-items: center; justify-content: center;
      pointer-events: none;
    }
    .cv-center-icon {
      font-size: 180px; opacity: 0.12;
      filter: blur(2px);
      animation: cv-float 8s ease-in-out infinite;
    }
    .cv-ring {
      position: absolute;
      border: 1px solid rgba(78,205,196,0.15);
      border-radius: 50%;
    }
    .cv-ring-1 { width: 320px; height: 320px; animation: cv-pulse 4s ease-in-out infinite; }
    .cv-ring-2 { width: 480px; height: 480px; animation: cv-pulse 4s ease-in-out infinite 0.5s; }
    .cv-ring-3 { width: 640px; height: 640px; animation: cv-pulse 4s ease-in-out infinite 1s; }
    .cv-particle {
      position: absolute;
      font-size: 28px;
      opacity: 0.3;
      animation: cv-orbit 12s linear infinite;
    }
    .cv-particle.p1 { top: 15%; left: 20%; animation-duration: 15s; }
    .cv-particle.p2 { top: 25%; right: 18%; animation-duration: 18s; animation-direction: reverse; }
    .cv-particle.p3 { bottom: 20%; left: 25%; animation-duration: 20s; }
    .cv-particle.p4 { bottom: 15%; right: 22%; animation-duration: 16s; animation-direction: reverse; }
    @keyframes cv-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    @keyframes cv-pulse {
      0%, 100% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.05); opacity: 0.5; }
    }
    @keyframes cv-orbit {
      0% { transform: translateY(0) rotate(0deg); }
      100% { transform: translateY(-10px) rotate(5deg); }
    }
    .cover-content {
      position: relative; z-index: 2; text-align: center;
      padding: 60px 40px; max-width: 900px;
    }
    .cover-subtitle-top {
      font-size: 14px; letter-spacing: 8px; color: var(--gold);
      text-transform: uppercase; margin-bottom: 24px; font-weight: 600;
      font-family: var(--font-display);
    }
    .cover-title {
      font-size: 52px; font-weight: 700; line-height: 1.3;
      background: linear-gradient(135deg, var(--gold) 0%, #e8d4a0 40%, var(--t1) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text; margin-bottom: 20px;
      font-family: var(--font-display);
    }
    .cover-meta {
      font-size: 14px; color: var(--t3); line-height: 2.2;
    }
    .cover-meta span { margin: 0 12px; }
    .cover-divider {
      width: 80px; height: 2px; background: linear-gradient(90deg, transparent, var(--gold), transparent);
      margin: 28px auto;
    }
    .cover-statement {
      font-size: 15px; color: var(--t2); max-width: 680px; margin: 0 auto;
      line-height: 2.2; font-style: italic;
    }
    .cover-scroll {
      position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
      z-index: 2; color: var(--gold); font-size: 12px; letter-spacing: 4px;
      animation: pulse 2s ease-in-out infinite;
      font-family: var(--font-display);
    }
    @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }

    /* === 通用section === */
    .section { padding: 60px 48px; max-width: 1100px; margin: 0 auto; }
    .section-anchor { scroll-margin-top: 30px; }
    .section-header {
      font-size: 28px; font-weight: 700; color: var(--gold);
      margin-bottom: 8px; display: flex; align-items: center; gap: 12px;
      font-family: var(--font-display);
    }
    .section-header .num {
      font-size: 13px; color: var(--gold); border: 1px solid var(--gold);
      border-radius: 50%; width: 32px; height: 32px; display: inline-flex;
      align-items: center; justify-content: center;
    }
    .section-sub {
      font-size: 14px; color: var(--t3); margin-bottom: 32px; letter-spacing: 2px;
    }
    .divider {
      height: 1px; background: linear-gradient(90deg, transparent, #2a2a3a, transparent);
      margin: 0 48px;
    }

    /* === 展览概述 === */
    .overview-story {
      background: linear-gradient(135deg, rgba(201, 169, 98, 0.06), rgba(212, 63, 63, 0.04));
      border: 1px solid rgba(201, 169, 98, 0.2); border-radius: 16px;
      padding: 32px 36px; margin-bottom: 28px;
    }
    .overview-story p { font-size: 16px; line-height: 2.2; }
    .overview-highlight {
      background: rgba(212, 165, 90, 0.08); border-left: 3px solid var(--amber);
      padding: 14px 20px; margin-top: 20px; border-radius: 0 8px 8px 0;
      font-size: 15px;
    }
    .overview-highlight strong { color: var(--amber); }
    .highlights-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px; margin-bottom: 28px;
    }
    .highlight-card {
      background: linear-gradient(180deg, rgba(244, 233, 208, 0.025) 0%, rgba(22, 24, 38, 0.6) 100%);
      border: 1px solid var(--border); border-radius: 12px;
      padding: 20px 22px; position: relative; overflow: hidden;
    }
    .highlight-card::before {
      content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
      background: var(--gold);
    }
    .highlight-card .hl-num {
      font-size: 11px; color: var(--gold); font-weight: 700; margin-bottom: 8px;
      font-family: var(--font-display);
    }
    .highlight-card .hl-text { font-size: 14px; color: var(--t1); line-height: 1.8; }
    .dims-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }
    .dim-card {
      background: linear-gradient(180deg, rgba(244, 233, 208, 0.025) 0%, rgba(22, 24, 38, 0.6) 100%);
      border: 1px solid var(--border); border-radius: 10px;
      padding: 16px 18px;
    }
    .dim-name { font-size: 15px; font-weight: 600; color: var(--gold); margin-bottom: 6px; font-family: var(--font-display); }
    .dim-desc { font-size: 13px; color: var(--t1); margin-bottom: 6px; }
    .dim-stages { font-size: 11px; color: var(--t3); }

    /* === 时间轴 === */
    .timeline-container { overflow-x: auto; padding: 20px 0; margin-bottom: 16px; }
    .timeline-svg { min-width: ${Math.max(800, curationContent.timeline.length * 180)}px; width: 100%; }
    .timeline-svg text { font-family: "Noto Serif SC", "PingFang SC", serif; }
    @keyframes fadeInNode { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .tl-node { animation: fadeInNode 0.6s ease-out both; }

    /* === 展区section === */
    .zone-section {
      margin-bottom: 0; border-left: 4px solid var(--zone-color, #4ECDC4);
      background: linear-gradient(135deg, rgba(26,26,38,0.9), rgba(18,18,28,0.9));
      border-radius: 0 16px 16px 0; overflow: hidden;
    }
    .zone-hero {
      position: relative; height: 280px; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
    }
    .zh-bg-pattern {
      position: absolute; inset: 0;
      background: 
        radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(255,255,255,0.03) 0%, transparent 35%);
    }
    .zh-emoji {
      font-size: 120px; opacity: 0.25; filter: blur(1px);
      animation: zh-float 6s ease-in-out infinite;
    }
    @keyframes zh-float {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-10px) scale(1.05); }
    }
    .zone-hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, var(--bg-page) 0%, rgba(13,14,26,0.4) 100%);
    }
    .cover-gen-img {
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; object-position: center; opacity: 0.4;
    }
    .cover-img-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(180deg, rgba(13,14,26,0.3) 0%, rgba(13,14,26,0.6) 50%, rgba(13,14,26,0.95) 100%);
    }
    .zh-gen-img {
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; object-position: center; opacity: 0.5;
    }
    .zone-hero-text {
      position: absolute; bottom: 28px; left: 32px; z-index: 2;
    }
    .zone-hero-text .zh-num {
      font-size: 12px; color: var(--zone-color, var(--gold)); letter-spacing: 4px;
      font-weight: 700; margin-bottom: 8px;
      font-family: var(--font-display);
    }
    .zone-hero-text .zh-title {
      font-size: 32px; font-weight: 700; color: var(--t1); margin-bottom: 6px;
      font-family: var(--font-display);
    }
    .zone-hero-text .zh-sub {
      font-size: 15px; color: var(--t2);
    }
    .zone-hero-text .zh-duration {
      display: inline-block; margin-top: 10px; font-size: 12px;
      background: rgba(201, 169, 98, 0.15); color: var(--gold);
      padding: 4px 14px; border-radius: 20px;
      font-family: var(--font-display);
    }
    .zone-body { padding: 32px; }
    .zone-narrative {
      font-size: 15px; line-height: 2.2; color: var(--t1); margin-bottom: 28px;
      text-indent: 2em; white-space: pre-wrap;
    }
    .zone-artifact-group {
      background: linear-gradient(180deg, rgba(244, 233, 208, 0.025) 0%, rgba(22, 24, 38, 0.6) 100%);
      border: 1px solid var(--border);
      border-radius: 12px; padding: 24px; margin-bottom: 24px;
    }
    .zag-label {
      font-size: 13px; color: var(--gold); font-weight: 600;
      margin-bottom: 12px; letter-spacing: 2px;
      font-family: var(--font-display);
    }
    .zag-narrative {
      font-size: 14px; color: var(--t2); line-height: 2; margin-bottom: 16px;
    }
    .zag-list {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 10px;
    }
    .zag-item {
      background: linear-gradient(180deg, rgba(244, 233, 208, 0.025) 0%, rgba(22, 24, 38, 0.6) 100%);
      border: 1px solid var(--border); border-radius: 8px;
      padding: 12px 16px; font-size: 13px;
    }
    .zag-item-name { font-weight: 600; color: var(--t1); margin-bottom: 4px; }
    .zag-item-reason { color: var(--t3); line-height: 1.6; font-size: 12px; }
    .zone-design-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;
    }
    .zone-design-card {
      background: linear-gradient(180deg, rgba(244, 233, 208, 0.025) 0%, rgba(22, 24, 38, 0.6) 100%);
      border: 1px solid var(--border);
      border-radius: 10px; padding: 18px 20px;
    }
    .zdc-label {
      font-size: 12px; color: var(--gold); font-weight: 600; margin-bottom: 8px;
      letter-spacing: 1px;
      font-family: var(--font-display);
    }
    .zdc-text { font-size: 13px; color: var(--t2); line-height: 1.8; }

    /* === 文物清单 === */
    .artifact-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    .artifact-card {
      background: linear-gradient(180deg, rgba(244, 233, 208, 0.025) 0%, rgba(22, 24, 38, 0.6) 100%);
      border: 1px solid var(--border); border-radius: 12px;
      padding: 20px 22px; position: relative; transition: border-color 0.2s;
    }
    .artifact-card.must-have { border-color: var(--accent); }
    .artifact-card.recommended { border-color: var(--amber); }
    .artifact-card .badge {
      position: absolute; top: -8px; left: -8px;
      font-size: 11px; padding: 3px 12px; border-radius: 10px; font-weight: 700;
    }
    .badge.must-badge { background: var(--accent); color: #f4e9d0; }
    .badge.rec-badge { background: var(--amber); color: #111; }
    .ac-emoji { font-size: 36px; margin-bottom: 10px; }
    .ac-name { font-size: 17px; font-weight: 700; color: var(--t1); margin-bottom: 6px; font-family: var(--font-display); }
    .ac-meta { font-size: 12px; color: var(--t3); margin-bottom: 10px; line-height: 1.6; }
    .ac-desc { font-size: 13px; color: var(--t2); line-height: 1.8; margin-bottom: 8px; }
    .ac-significance { font-size: 13px; color: var(--amber); line-height: 1.7; margin-bottom: 6px; }
    .ac-highlight { font-size: 12px; color: var(--gold); line-height: 1.6; }

    /* === 空间设计 === */
    .spatial-svg { width: 100%; max-width: 900px; margin: 0 auto 24px; display: block; }
    .spatial-svg text { font-family: "Noto Serif SC", "PingFang SC", serif; }
    .showcase-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px; margin-bottom: 24px;
    }
    .showcase-item {
      background: #1a1a26; border: 1px solid #2a2a3a; border-radius: 10px;
      padding: 16px; text-align: center;
    }
    .showcase-item .si-icon { font-size: 28px; margin-bottom: 6px; }
    .showcase-item .si-name { font-size: 14px; font-weight: 600; color: #e8e8ec; }
    .showcase-item .si-spec { font-size: 12px; color: #8888aa; }
    .lighting-card {
      background: #1a1a26; border: 1px solid #2a2a3a; border-radius: 12px;
      padding: 20px; margin-bottom: 16px;
    }
    .lc-header { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
    .lc-swatch { width: 48px; height: 48px; border-radius: 8px; flex-shrink: 0; }
    .lc-name { font-size: 16px; font-weight: 600; }
    .lc-temp { font-size: 12px; color: #8888aa; }
    .lc-desc { font-size: 13px; color: #ccccdd; line-height: 1.8; }
    .vi-colors {
      display: flex; gap: 16px; margin-bottom: 16px;
    }
    .vi-swatch {
      flex: 1; text-align: center; padding: 20px; border-radius: 12px;
      font-size: 13px; font-weight: 600;
    }

    /* === 参考文献 === */
    .lit-item {
      background: #1a1a26; border: 1px solid #2a2a3a; border-radius: 10px;
      padding: 18px 22px; margin-bottom: 12px; display: flex; gap: 16px;
    }
    .lit-num {
      width: 30px; height: 30px; background: #4ECDC4; color: #111;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 13px; flex-shrink: 0;
    }
    .lit-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
    .lit-meta { font-size: 12px; color: #8888aa; margin-bottom: 6px; }
    .lit-desc { font-size: 13px; color: #ccccdd; }
    .tag {
      display: inline-block; font-size: 11px; padding: 2px 8px;
      border-radius: 8px; margin-left: 6px;
    }
    .tag.core { background: rgba(78,205,196,0.15); color: #4ECDC4; }
    .tag.ref { background: #222230; color: #666680; }

    /* === 预算估算 === */
    .budget-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .budget-card {
      background: #1a1a26; border: 1px solid #2a2a3a; border-radius: 12px;
      padding: 22px 24px;
    }
    .budget-card .bc-title {
      font-size: 15px; font-weight: 600; color: #4ECDC4; margin-bottom: 10px;
    }
    .budget-card .bc-row {
      display: flex; justify-content: space-between;
      font-size: 13px; color: #ccccdd; padding: 6px 0;
      border-bottom: 1px solid #1e1e2e;
    }
    .budget-card .bc-total {
      margin-top: 12px; padding-top: 10px; border-top: 1px solid #2a2a3a;
      font-size: 15px; font-weight: 700; color: #F0C060;
      display: flex; justify-content: space-between;
    }

    /* === 页脚 === */
    .footer {
      padding: 40px 48px; text-align: center; color: #555566;
      font-size: 13px; border-top: 1px solid #1e1e2e;
    }
    .footer-line { margin-bottom: 6px; }

    /* === 打印样式 === */
    @media print {
      .side-nav { display: none; }
      .main-content { margin-left: 0; }
      body { background: #fff; color: #222; }
      .cover { min-height: auto; page-break-after: always; padding: 60px; }
      .cover-bg, .cover-img { display: none; }
      .cover-title { -webkit-text-fill-color: #222; background: none; color: #222; }
      .cover-statement, .cover-meta { color: #555; }
      .section { padding: 30px 20px; }
      .zone-section, .zone-artifact-group, .zone-design-card,
      .artifact-card, .highlight-card, .dim-card, .lit-item,
      .budget-card, .showcase-item, .lighting-card, .overview-story {
        background: #f8f8f8; color: #222; border-color: #ddd;
      }
      .section-header, h2, h3 { color: #111; }
      .zone-narrative, .zag-narrative, .zdc-text, .ac-desc { color: #333; }
      .zone-section { page-break-inside: avoid; }
      @page { size: A4; margin: 20mm; }
    }
  </style>
</head>
<body>

<!-- 侧边导航 -->
<nav class="side-nav">
  <div class="nav-logo">策展方案</div>
  <a href="#cover">封面</a>
  <a href="#overview">展览概述</a>
  <a href="#timeline">时间轴</a>
  ${curationContent.zones.map((z, i) => `<a href="#zone-${i + 1}">第${i + 1}展区 · ${z.name}</a>`).join('\n  ')}
  <a href="#artifacts">文物清单</a>
  <a href="#spatial">空间设计</a>
  <a href="#references">参考文献</a>
  <a href="#budget">预算估算</a>
</nav>

<div class="main-content">

<!-- ==================== 封面 ==================== -->
<section class="cover" id="cover">
  <div class="cover-bg"></div>
  ${imagesBase64['cover'] ? `
  <div class="cover-visual">
    <img src="${imagesBase64['cover']}" alt="展览封面" class="cover-gen-img" />
    <div class="cover-img-overlay"></div>
  </div>` : `
  <div class="cover-visual">
    <div class="cv-center-icon">${getThemeEmoji(currentThemeKnowledge?.themeName || '')}</div>
    <div class="cv-ring cv-ring-1"></div>
    <div class="cv-ring cv-ring-2"></div>
    <div class="cv-ring cv-ring-3"></div>
    <div class="cv-particle p1">${getThemeEmoji(currentThemeKnowledge?.themeName || '')}</div>
    <div class="cv-particle p2">${getThemeEmoji(currentThemeKnowledge?.themeName || '')}</div>
    <div class="cv-particle p3">${getThemeEmoji(currentThemeKnowledge?.themeName || '')}</div>
    <div class="cv-particle p4">${getThemeEmoji(currentThemeKnowledge?.themeName || '')}</div>
  </div>`}
  <div class="cover-content">
    <div class="cover-subtitle-top">专业策展方案</div>
    <h1 class="cover-title">${exhibitionName || '策展方案'}</h1>
    <div class="cover-meta">
      ${organizer ? `<span>主办：${organizer}</span>` : ''}
      ${venue ? `<span>地点：${venue}</span>` : ''}
      <br/>
      ${startDate && endDate ? `<span>${startDate} — ${endDate}</span>` : ''}
      ${area ? `<span>面积：${area}㎡</span>` : ''}
      <span>展品：${artifacts.length}件</span>
    </div>
    <div class="cover-divider"></div>
    <div class="cover-statement">${curationContent.curatorStatement}</div>
  </div>
  <div class="cover-scroll">▼ 向下滚动</div>
</section>

<div class="divider"></div>

<!-- ==================== 展览概述 ==================== -->
<section class="section section-anchor" id="overview">
  <div class="section-header"><span class="num">01</span> 展览概述</div>
  <div class="section-sub">EXHIBITION OVERVIEW</div>

  ${coreStory ? `
  <div class="overview-story">
    <p>${coreStory.narrative || ''}</p>
    <div class="overview-highlight">
      <strong>高光时刻：</strong>${coreStory.highlight || ''}
    </div>
  </div>` : ''}

  ${curationContent.exhibitionHighlights.length > 0 ? `
  <div style="margin-bottom: 28px;">
    <div style="font-size: 16px; font-weight: 600; color: #4ECDC4; margin-bottom: 16px;">展览亮点</div>
    <div class="highlights-grid">
      ${curationContent.exhibitionHighlights.map((h, i) => `
        <div class="highlight-card">
          <div class="hl-num">HIGHLIGHT ${String(i + 1).padStart(2, '0')}</div>
          <div class="hl-text">${h}</div>
        </div>
      `).join('')}
    </div>
  </div>` : ''}

  ${themeDimensions && themeDimensions.length > 0 ? `
  <div>
    <div style="font-size: 16px; font-weight: 600; color: #4ECDC4; margin-bottom: 16px;">主题维度</div>
    <div class="dims-grid">
      ${themeDimensions.map(d => `
        <div class="dim-card">
          <div class="dim-name">${d.name}</div>
          <div class="dim-desc">${d.desc || ''}</div>
          <div class="dim-stages">${d.stages || ''}</div>
        </div>
      `).join('')}
    </div>
  </div>` : ''}
</section>

<div class="divider"></div>

<!-- ==================== 时间轴 ==================== -->
<section class="section section-anchor" id="timeline">
  <div class="section-header"><span class="num">02</span> 时间轴</div>
  <div class="section-sub">CHRONOLOGICAL TIMELINE</div>

  <div class="timeline-container">
    <svg class="timeline-svg" viewBox="0 0 ${Math.max(800, curationContent.timeline.length * 180)} 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tlLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#4ECDC4" stop-opacity="0.2"/>
          <stop offset="50%" stop-color="#4ECDC4" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#4ECDC4" stop-opacity="0.2"/>
        </linearGradient>
      </defs>
      <!-- 主轴线 -->
      <line x1="40" y1="80" x2="${Math.max(800, curationContent.timeline.length * 180) - 40}" y2="80"
        stroke="url(#tlLine)" stroke-width="2"/>
      ${curationContent.timeline.map((entry, i) => {
        const x = 80 + i * 170
        const isTop = i % 2 === 0
        return `
        <g class="tl-node" style="animation-delay: ${i * 0.15}s">
          <circle cx="${x}" cy="80" r="6" fill="#4ECDC4" opacity="0.9"/>
          <circle cx="${x}" cy="80" r="3" fill="#0f0f16"/>
          <line x1="${x}" y1="${isTop ? 72 : 88}" x2="${x}" y2="${isTop ? 30 : 130}"
            stroke="#4ECDC4" stroke-width="1" opacity="0.4"/>
          <text x="${x}" y="${isTop ? 20 : 148}" text-anchor="middle"
            fill="#4ECDC4" font-size="11" font-weight="600">${entry.year}</text>
          <text x="${x}" y="${isTop ? 34 : 164}" text-anchor="middle"
            fill="#999aaa" font-size="9">${entry.era}</text>
          <text x="${x}" y="${isTop ? 46 : 180}" text-anchor="middle"
            fill="#ccccdd" font-size="8">${entry.event.substring(0, 20)}${entry.event.length > 20 ? '…' : ''}</text>
        </g>`
      }).join('')}
    </svg>
  </div>
  ${curationContent.timeline.map((entry, i) => `
    <div style="background: #1a1a26; border: 1px solid #2a2a3a; border-radius: 8px; padding: 14px 18px; margin-bottom: 8px; border-left: 3px solid #4ECDC4;">
      <span style="color: #4ECDC4; font-weight: 600; font-size: 13px;">${entry.year}</span>
      <span style="color: #8888aa; font-size: 12px; margin-left: 8px;">${entry.era}</span>
      <div style="color: #ccccdd; font-size: 14px; line-height: 1.8; margin-top: 6px;">${entry.event}</div>
      <div style="color: #666680; font-size: 12px; margin-top: 4px;">相关文物：${entry.artifacts.join('、')}</div>
    </div>
  `).join('')}
</section>

<div class="divider"></div>

<!-- ==================== 展陈大纲 ==================== -->
${curationContent.zones.map((zone, idx) => {
  const imgKey = `zone_${idx}`
  const hasImg = !!imagesBase64[imgKey]
  return `
<section class="section section-anchor" id="zone-${idx + 1}" style="padding-bottom: 0;">
  <div class="zone-section" style="--zone-color: ${zone.accentColor}">
    <div class="zone-hero" style="background: linear-gradient(135deg, ${zone.accentColor}33, ${zone.accentColor}11);">
      ${hasImg ? `<img src="${imagesBase64[imgKey]}" alt="${zone.name}" class="zh-gen-img" />` : '<div class="zh-bg-pattern"></div><div class="zh-emoji">' + (getThemeEmoji(zone.name) || '🏛️') + '</div>'}
      <div class="zone-hero-overlay" style="background: linear-gradient(180deg, transparent 0%, rgba(15,15,22,0.85) 100%);"></div>
      <div class="zone-hero-text">
        <div class="zh-num">第${zone.zoneNumber}展区</div>
        <div class="zh-title">${zone.name}</div>
        <div class="zh-sub">${zone.subtitle} · ${zone.timePeriod}</div>
        <div class="zh-duration">⏱ 参观时长约${zone.duration}</div>
      </div>
    </div>
    <div class="zone-body">
      <div class="zone-narrative">${zone.narrative}</div>

      ${zone.artifactGroup.artifacts.length > 0 ? `
      <div class="zone-artifact-group">
        <div class="zag-label">文物组合 · ARTIFACT GROUP</div>
        <div class="zag-narrative">${zone.artifactGroup.groupNarrative}</div>
        <div class="zag-list">
          ${zone.artifactGroup.artifacts.map(a => `
            <div class="zag-item">
              <div class="zag-item-name">🏺 ${a.name}</div>
              <div class="zag-item-reason">${a.reason}</div>
            </div>
          `).join('')}
        </div>
      </div>` : ''}

      <div class="zone-design-row">
        <div class="zone-design-card">
          <div class="zdc-label">🏛 空间设计建议</div>
          <div class="zdc-text">${zone.spatialHint}</div>
        </div>
        <div class="zone-design-card">
          <div class="zdc-label">💡 灯光氛围</div>
          <div class="zdc-text">${zone.lightingMood}</div>
        </div>
      </div>

      <div class="zone-design-row">
        <div class="zone-design-card">
          <div class="zdc-label">🎯 教育目标</div>
          <div class="zdc-text">${zone.educationGoal}</div>
        </div>
        <div class="zone-design-card">
          <div class="zdc-label">⏱ 参观时长</div>
          <div class="zdc-text">约${zone.duration}，建议观众在此区域停留并仔细阅读展品说明。</div>
        </div>
      </div>
    </div>
  </div>
</section>
<div class="divider"></div>
`
}).join('')}

<!-- ==================== 文物清单 ==================== -->
<section class="section section-anchor" id="artifacts">
  <div class="section-header"><span class="num">03</span> 文物清单</div>
  <div class="section-sub">COMPLETE ARTIFACT CATALOGUE · ${artifacts.length}件</div>

  ${mustArts.length > 0 ? `
  <div style="font-size: 16px; font-weight: 600; color: #E25555; margin-bottom: 16px;">🔴 必选展品（核心展品）</div>
  <div class="artifact-grid" style="margin-bottom: 36px;">
    ${mustArts.map(a => `
      <div class="artifact-card must-have">
        <span class="badge must-badge">MUST</span>
        <div class="ac-emoji">${a.emoji || '🏺'}</div>
        <div class="ac-name">${a.name}</div>
        <div class="ac-meta">
          ${a.era || ''} · ${a.level || a.category || ''}${a.material ? ' · ' + a.material : ''}
          ${a.unearthed ? '<br/>出土地：' + a.unearthed : ''}
          ${a.collection ? '<br/>收藏：' + a.collection : ''}
        </div>
        <div class="ac-desc">${a.description || ''}</div>
        ${a.significance ? `<div class="ac-significance">🏆 ${a.significance}</div>` : ''}
        ${a.highlight ? `<div class="ac-highlight">✨ ${a.highlight}</div>` : ''}
      </div>
    `).join('')}
  </div>` : ''}

  ${recArts.length > 0 ? `
  <div style="font-size: 16px; font-weight: 600; color: #DAA520; margin-bottom: 16px;">🟡 推荐展品</div>
  <div class="artifact-grid">
    ${recArts.map(a => `
      <div class="artifact-card recommended">
        <span class="badge rec-badge">REC</span>
        <div class="ac-emoji">${a.emoji || '🏺'}</div>
        <div class="ac-name">${a.name}</div>
        <div class="ac-meta">
          ${a.era || ''} · ${a.level || a.category || ''}${a.material ? ' · ' + a.material : ''}
          ${a.unearthed ? '<br/>出土地：' + a.unearthed : ''}
          ${a.collection ? '<br/>收藏：' + a.collection : ''}
        </div>
        <div class="ac-desc">${a.description || ''}</div>
        ${a.significance ? `<div class="ac-significance">🏆 ${a.significance}</div>` : ''}
        ${a.highlight ? `<div class="ac-highlight">✨ ${a.highlight}</div>` : ''}
      </div>
    `).join('')}
  </div>` : ''}
</section>

<div class="divider"></div>

<!-- ==================== 空间设计 ==================== -->
<section class="section section-anchor" id="spatial">
  <div class="section-header"><span class="num">04</span> 空间设计</div>
  <div class="section-sub">SPATIAL DESIGN & LAYOUT</div>

  <!-- SVG平面布局 -->
  <svg class="spatial-svg" viewBox="0 0 900 ${120 + curationContent.zones.length * 110}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="spatialBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a1a26"/>
        <stop offset="100%" stop-color="#0f0f16"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="900" height="${120 + curationContent.zones.length * 110}" rx="12" fill="url(#spatialBg)" stroke="#2a2a3a"/>
    <!-- 标题 -->
    <text x="450" y="36" text-anchor="middle" fill="#4ECDC4" font-size="16" font-weight="600">展览平面布局示意图</text>
    <text x="450" y="54" text-anchor="middle" fill="#666680" font-size="11">总面积 ${areaNum}㎡ · ${curationContent.zones.length}个展区 · 预计参观时长约${totalDuration}分钟</text>
    <!-- 展区方块 -->
    ${curationContent.zones.map((z, i) => {
      const y = 70 + i * 105
      const h = 90
      return `
      <rect x="40" y="${y}" width="820" height="${h}" rx="8" fill="${z.accentColor}" fill-opacity="0.08" stroke="${z.accentColor}" stroke-width="1.5" stroke-opacity="0.5"/>
      <rect x="40" y="${y}" width="6" height="${h}" rx="3" fill="${z.accentColor}"/>
      <text x="64" y="${y + 26}" fill="${z.accentColor}" font-size="13" font-weight="600">第${z.zoneNumber}展区 · ${z.name}</text>
      <text x="64" y="${y + 44}" fill="#999aaa" font-size="11">${z.subtitle} · ${z.timePeriod} · 约${z.duration}</text>
      <text x="64" y="${y + 62}" fill="#666680" font-size="10">${z.spatialHint.substring(0, 50)}${z.spatialHint.length > 50 ? '…' : ''}</text>
      <text x="820" y="${y + 30}" fill="${z.accentColor}" font-size="22" text-anchor="end" font-weight="700">${z.zoneNumber}</text>
      <text x="820" y="${y + 48}" fill="#666680" font-size="10" text-anchor="end">${z.artifactGroup.artifacts.length}件展品</text>
      ${i < curationContent.zones.length - 1 ? `<line x1="450" y1="${y + h}" x2="450" y2="${y + h + 15}" stroke="#4ECDC4" stroke-width="1" stroke-dasharray="4 3" opacity="0.3"/>` : ''}
      `
    }).join('')}
  </svg>

  <!-- 展柜选型 -->
  <div style="font-size: 16px; font-weight: 600; color: #4ECDC4; margin-bottom: 16px; margin-top: 24px;">展柜选型</div>
  <div class="showcase-grid">
    ${selectedShowcases.map(id => {
      const sc = SHOWCASE_TYPES.find(s => s.id === id)
      return sc ? `
        <div class="showcase-item">
          <div class="si-icon">${sc.icon}</div>
          <div class="si-name">${sc.name}</div>
          <div class="si-spec">${sc.spec}</div>
          <div style="font-size: 12px; color: #999aaa; margin-top: 6px;">${sc.desc}</div>
        </div>
      ` : ''
    }).join('')}
  </div>

  <!-- 灯光设计 -->
  <div style="font-size: 16px; font-weight: 600; color: #4ECDC4; margin-bottom: 16px;">灯光设计</div>
  <div class="lighting-card">
    <div class="lc-header">
      <div class="lc-swatch" style="background: ${lightingObj.color}"></div>
      <div>
        <div class="lc-name">${lightingObj.name}</div>
        <div class="lc-temp">${lightingObj.temp} · ${lightingObj.lux}</div>
      </div>
    </div>
    <div class="lc-desc">${lightingObj.desc}。适用：${lightingObj.forWhat}。</div>
    ${lightingDesign ? `<div style="margin-top: 10px; font-size: 13px; color: #bbbbcc; line-height: 1.8;">${lightingDesign}</div>` : ''}
  </div>

  <!-- VI配色 -->
  <div style="font-size: 16px; font-weight: 600; color: #4ECDC4; margin-bottom: 16px;">VI配色方案 · ${viScheme.name}</div>
  <div class="vi-colors">
    <div class="vi-swatch" style="background: ${viScheme.primary}; color: #fff;">主色<br/>${viScheme.primary}</div>
    <div class="vi-swatch" style="background: ${viScheme.secondary}; color: #fff;">辅色<br/>${viScheme.secondary}</div>
    <div class="vi-swatch" style="background: ${viScheme.accent}; color: #fff;">强调<br/>${viScheme.accent}</div>
  </div>
</section>

<div class="divider"></div>

<!-- ==================== 参考文献 ==================== -->
<section class="section section-anchor" id="references">
  <div class="section-header"><span class="num">05</span> 学术参考文献</div>
  <div class="section-sub">ACADEMIC REFERENCES</div>
  ${lit.map((b, i) => `
    <div class="lit-item">
      <div class="lit-num">${i + 1}</div>
      <div style="flex: 1;">
        <div class="lit-title">
          ${b.title}
          <span class="tag ${b.type === 'core' ? 'core' : 'ref'}">${b.type === 'core' ? '核心' : '参考'}</span>
        </div>
        <div class="lit-meta">${b.author} · ${b.year} · ${b.publisher}${b.pages ? ' · ' + b.pages : ''}</div>
        <div class="lit-desc">${b.description || ''}</div>
        ${b.importance ? `<div style="margin-top: 6px; color: #F0C060; font-size: 12px;">📌 ${b.importance}</div>` : ''}
      </div>
    </div>
  `).join('')}
</section>

<div class="divider"></div>

<!-- ==================== 预算估算 ==================== -->
<section class="section section-anchor" id="budget">
  <div class="section-header"><span class="num">06</span> 预算估算</div>
  <div class="section-sub">BUDGET ESTIMATION · 参考估算</div>
  <div class="budget-grid">
    <div class="budget-card">
      <div class="bc-title">🏛 场地与基础建设</div>
      <div class="bc-row"><span>展览场地租赁（${areaNum}㎡ × 350元/㎡）</span><span>¥${venueRent.toLocaleString()}</span></div>
      <div class="bc-row"><span>展墙搭建与基础装修（${areaNum}㎡ × 200元/㎡）</span><span>¥${wallBuild.toLocaleString()}</span></div>
      <div class="bc-row"><span>地面处理与标识系统（${areaNum}㎡ × 80元/㎡）</span><span>¥${floorSign.toLocaleString()}</span></div>
      <div class="bc-total"><span>小计</span><span>¥${infraSubtotal.toLocaleString()}</span></div>
    </div>
    <div class="budget-card">
      <div class="bc-title">🏺 展品保险与运输</div>
      <div class="bc-row"><span>文物运输（${artifacts.length}件，按等级差异化）</span><span>¥${transportCost.toLocaleString()}</span></div>
      <div class="bc-row"><span>文物保险（按估值费率0.1%-0.5%估算）</span><span>¥${insuranceCost.toLocaleString()}</span></div>
      <div class="bc-row"><span>恒温恒湿展柜（${selectedShowcases.length}种 × 8万/个）</span><span>¥${showcaseCost.toLocaleString()}</span></div>
      <div class="bc-total"><span>小计</span><span>¥${exhibitSubtotal.toLocaleString()}</span></div>
    </div>
    <div class="budget-card">
      <div class="bc-title">✨ 多媒体与展陈设备</div>
      <div class="bc-row"><span>数字展项（${selectedDigitals.length}项 × 12万/项）</span><span>¥${digitalCost.toLocaleString()}</span></div>
      <div class="bc-row"><span>专业展陈灯光（${areaNum}㎡ × 45元/㎡）</span><span>¥${lightingCost.toLocaleString()}</span></div>
      <div class="bc-row"><span>音响与导览系统（${areaNum}㎡ × 30元/㎡）</span><span>¥${audioCost.toLocaleString()}</span></div>
      <div class="bc-total"><span>小计</span><span>¥${mediaSubtotal.toLocaleString()}</span></div>
    </div>
    <div class="budget-card">
      <div class="bc-title">📋 运营与人力成本</div>
      <div class="bc-row"><span>策展设计费（${areaNum}㎡ × 60元/㎡）</span><span>¥${designFee.toLocaleString()}</span></div>
      <div class="bc-row"><span>安保与看护（${areaNum}㎡ × 40元/㎡）</span><span>¥${securityCost.toLocaleString()}</span></div>
      <div class="bc-row"><span>宣传推广（${areaNum}㎡ × 50元/㎡）</span><span>¥${promoCost.toLocaleString()}</span></div>
      <div class="bc-total"><span>小计</span><span>¥${opsSubtotal.toLocaleString()}</span></div>
    </div>
  </div>
  <div style="margin-top: 24px; background: rgba(78,205,196,0.06); border: 1px solid rgba(78,205,196,0.2); border-radius: 12px; padding: 20px 24px;">
    <div style="font-size: 15px; font-weight: 600; color: #4ECDC4; margin-bottom: 8px;">预算总计（参考估算）</div>
    <div style="font-size: 28px; font-weight: 700; color: #F0C060;">
      ¥${grandTotal.toLocaleString()}
    </div>
    <div style="font-size: 12px; color: #8888aa; margin-top: 6px;">
      以上报价为基于国内博物馆展览行业市场行情的参考估算，实际费用受以下因素影响：城市级别、场馆条件、文物等级与数量、展柜材质与工艺、数字展项技术方案、展期长短、设计复杂度等。建议联系专业展览公司获取详细报价单。
    </div>
  </div>
</section>

<div class="divider"></div>

<!-- ==================== 页脚 ==================== -->
<footer class="footer">
  <div class="footer-line">本方案由策展助手AI辅助生成</div>
  <div class="footer-line">生成日期：${new Date().toLocaleDateString('zh-CN')} · 博物馆策展方案AI辅助生成系统</div>
</footer>

</div><!-- .main-content -->
</body>
</html>`

    return html
  }

  // 下载文件
  const downloadFile = (content: string, filename: string, type: string = 'text/html') => {
    const blob = new Blob([content], { type: type + ';charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // AI配图生成
  const IMAGE_API_URL = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image'

  const isImageApiAvailable = (() => {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1' || host === '') return true
    if (host.endsWith('.github.io')) return false
    if (host.includes('github')) return false
    return true
  })()

  const checkApiReachable = async (): Promise<boolean> => {
    if (!isImageApiAvailable) return false
    try {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 3000)
      const res = await fetch(
        `${IMAGE_API_URL}?prompt=test&image_size=square`,
        { method: 'GET', signal: controller.signal }
      )
      return res.ok || res.status === 400 || res.status === 429
    } catch {
      return false
    }
  }

  const generateImage = async (key: string, prompt: string, retryCount = 0): Promise<boolean> => {
    if (generatingImages.has(key)) return false
    if (!prompt || prompt.trim().length < 3) {
      showToastFn(`⚠️ ${key === 'cover' ? '封面' : '展区'}图片提示词无效，跳过生成`)
      return false
    }

    if (!isImageApiAvailable) {
      showToastFn('⚠️ AI生图功能仅在本地开发环境（TRAE IDE）可用，当前为部署环境')
      return false
    }

    setGeneratingImages(prev => new Set([...prev, key]))
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      const response = await fetch(
        `${IMAGE_API_URL}?prompt=${encodeURIComponent(prompt)}&image_size=landscape_16_9`,
        { signal: controller.signal }
      )
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        console.error(`[图片生成失败] key=${key}, status=${response.status}, detail=${errText}`)
        if (response.status === 403 || response.status === 401) {
          showToastFn('❌ AI生图API无法访问（可能需要在TRAE IDE本地环境中使用）')
          return false
        }
        if (retryCount < 2) {
          showToastFn(`⏳ ${key === 'cover' ? '封面' : '展区'}图片生成失败，第${retryCount + 1}次重试...`)
          await new Promise(r => setTimeout(r, 1500))
          return generateImage(key, prompt, retryCount + 1)
        }
        showToastFn(`❌ ${key === 'cover' ? '封面' : '展区'}图片生成失败（${response.status}），请单独点击重试`)
        return false
      }

      const blob = await response.blob()
      if (blob.size < 1024) {
        throw new Error('返回图片数据过小')
      }
      const imageUrl = URL.createObjectURL(blob)
      setGeneratedImages(prev => ({ ...prev, [key]: imageUrl }))
      return true
    } catch (error: any) {
      console.error(`[图片生成异常] key=${key}:`, error)
      if (error.name === 'AbortError') {
        showToastFn('⏱️ 图片生成超时，请检查网络后重试')
      } else if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        showToastFn('❌ 无法连接到AI生图服务，请在TRAE IDE本地环境中使用')
      } else if (retryCount < 2) {
        showToastFn(`⏳ ${key === 'cover' ? '封面' : '展区'}图片生成异常，第${retryCount + 1}次重试...`)
        await new Promise(r => setTimeout(r, 1500))
        return generateImage(key, prompt, retryCount + 1)
      } else {
        showToastFn(`❌ ${key === 'cover' ? '封面' : '展区'}图片生成失败，请单独点击重试`)
      }
      return false
    } finally {
      setGeneratingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
    }
  }

  const generateAllImages = async () => {
    if (!curationContent) return

    if (!isImageApiAvailable) {
      showToastFn('⚠️ AI生图功能仅在TRAE IDE本地开发环境可用，部署环境暂不支持')
      return
    }

    const tasks: { key: string; prompt: string; label: string }[] = []

    // 封面图
    if (!generatedImages['cover'] && curationContent.coverImagePrompt) {
      tasks.push({ key: 'cover', prompt: curationContent.coverImagePrompt, label: '封面' })
    }

    // 展区图
    curationContent.zones.forEach((zone, idx) => {
      const key = `zone_${idx}`
      if (!generatedImages[key] && zone.imagePrompt) {
        tasks.push({ key, prompt: zone.imagePrompt, label: zone.name })
      }
    })

    if (tasks.length === 0) {
      showToastFn('✅ 所有配图已生成，无需重复生成')
      return
    }

    showToastFn(`🎨 开始生成 ${tasks.length} 张配图，请稍候...`)
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      showToastFn(`🎨 正在生成 ${task.label}... (${i + 1}/${tasks.length})`)
      const ok = await generateImage(task.key, task.prompt)
      if (ok) successCount++
      else failCount++
      if (i < tasks.length - 1) {
        await new Promise(r => setTimeout(r, 800))
      }
    }

    if (failCount === 0) {
      showToastFn(`✅ 全部 ${successCount} 张配图生成成功！`)
    } else {
      showToastFn(`⚠️ ${successCount} 张成功，${failCount} 张失败，可单独点击重试`)
    }
  }
  
  // 将Blob URL转换为base64
  const blobToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch {
      return ''
    }
  }

  // 导出HTML
  const exportHTML = async () => {
    // 将所有生成的图片转换为base64
    const imagesBase64: Record<string, string> = {}
    for (const [key, url] of Object.entries(generatedImages)) {
      imagesBase64[key] = await blobToBase64(url)
    }
    
    const html = generateHTML(imagesBase64)
    const filename = `${exhibitionName || '策展方案'}.html`
    downloadFile(html, filename, 'text/html')
    showToastFn('✅ HTML方案已导出')
  }

  // 导出Markdown
  const exportMarkdown = () => {
    const themeName = currentThemeKnowledge?.themeName || selectedTheme
    const artifacts = currentThemeKnowledge?.artifactPool?.filter(a => selectedArtifactIds.has(a.id)) || []
    const lit = currentThemeKnowledge?.recommendedLiterature || []
    
    let md = `# ${exhibitionName || '策展方案'}\n\n`
    md += `> 由策展助手自动生成 · ${new Date().toLocaleDateString('zh-CN')}\n\n`
    
    md += `## 📋 基本信息\n\n`
    md += `- **展览主题**：${themeName}\n`
    md += `- **主办单位**：${organizer || '—'}\n`
    md += `- **展览地点**：${venue || '—'}\n`
    md += `- **展览时间**：${startDate && endDate ? `${startDate} 至 ${endDate}` : '—'}\n`
    md += `- **展览面积**：${area ? area + ' ㎡' : '—'}\n`
    md += `- **展区数量**：${zones.length} 个\n`
    md += `- **展品数量**：${selectedArtifactIds.size} 件\n\n`
    
    if (currentThemeKnowledge?.coreStory) {
      md += `## 📖 核心故事\n\n`
      md += currentThemeKnowledge.coreStory.narrative + '\n\n'
      md += `**高光时刻**：${currentThemeKnowledge.coreStory.highlight}\n\n`
    }
    
    md += `## 🏛️ 展陈大纲\n\n`
    zones.forEach(zone => {
      md += `### 第${zone.zoneNumber}展区 · ${zone.name}\n\n`
      if (zone.subtitle) md += `> ${zone.subtitle}\n\n`
      md += (zone.narrative || '暂无详细描述') + '\n\n'
    })
    
    md += `## 🏺 展品清单\n\n`
    artifacts.forEach((a, i) => {
      md += `${i + 1}. **${a.name}** — ${a.era || ''} · ${a.level || a.category || ''}\n`
      if (a.isMustHave) md += `   - ⭐ 核心必选展品\n`
      if (a.description) md += `   - ${a.description}\n`
      md += `\n`
    })
    
    if (lit.length > 0) {
      md += `## 📚 参考文献\n\n`
      lit.forEach((b, i) => {
        md += `${i + 1}. 《${b.title}》，${b.author}，${b.year}，${b.publisher}\n`
      })
    }
    
    const filename = `${exhibitionName || '策展方案'}.md`
    downloadFile(md, filename, 'text/markdown')
    showToastFn('✅ Markdown已导出')
  }

  // 导出品清单（CSV）
  const exportArtifactCSV = () => {
    const artifacts = currentThemeKnowledge?.artifactPool?.filter(a => selectedArtifactIds.has(a.id)) || []
    
    let csv = '\uFEFF' // BOM for Excel
    csv += '序号,文物名称,时代,类别,等级,材质,出土地,收藏单位,必选,推荐\n'
    
    artifacts.forEach((a, i) => {
      csv += `${i + 1},"${a.name}","${a.era || ''}","${a.category || ''}","${a.level || ''}","${a.material || ''}","${a.unearthed || ''}","${a.collection || ''}","${a.isMustHave ? '是' : '否'}","${a.isRecommended ? '是' : '否'}"\n`
    })
    
    const filename = `${exhibitionName || '策展方案'}_展品清单.csv`
    downloadFile(csv, filename, 'text/csv')
    showToastFn('✅ 展品清单已导出')
  }

  // 创建方案
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
        organizer, venue, startDate, endDate,
        area: area ? parseInt(area) : undefined,
        planType, educationGoal
      })
      if (response.data.success) {
        setPlanId(response.data.data.id)
        setIsLoading(false)
        return true
      }
      throw new Error('创建失败')
    } catch (err: any) {
      // 任何错误都使用本地模式（策展助手支持完全离线使用）
      const localPlanId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const localPlan = {
        id: localPlanId, theme: selectedTheme, name: exhibitionName,
        organizer, venue, startDate, endDate,
        area: area ? parseInt(area) : undefined,
        planType, educationGoal,
        createdAt: new Date().toISOString(), isLocal: true
      }
      localStorage.setItem(`exhibition_plan_${localPlanId}`, JSON.stringify(localPlan))
      setPlanId(localPlanId)
      setIsLoading(false)
      showToastFn('本地模式：方案已保存')
      return true
    }
  }

  // 进入下一阶段
  const goPhase = async (phase: number) => {
    // 验证：进入第二阶段前必须选择主题
    if (phase === 2 && currentPhase === 1) {
      if (!selectedTheme) {
        showToastFn('⚠️ 请先选择展览主题')
        return
      }
      if (!exhibitionName) {
        showToastFn('⚠️ 请先填写展览名称')
        return
      }
      
      // 创建方案
      if (!planId) {
        setIsLoading(true)
        const success = await createPlan()
        setIsLoading(false)
        if (!success) {
          showToastFn('❌ 创建方案失败，请重试')
          return
        }
      }
      
      // 生成展区和展品
      if (currentThemeKnowledge) {
        autoGenerateZonesFromTheme()
        showToastFn('✨ 已生成展区规划与展品配置')
      } else {
        showToastFn('⚠️ 请先选择有效主题')
        return
      }
    }
    
    setCurrentPhase(phase)
    if (phase > maxPhase) setMaxPhase(phase)
  }

  // 自动生成展区
  const autoGenerateZonesFromTheme = () => {
    if (!currentThemeKnowledge) return
    
    const selectedArts = currentThemeKnowledge.artifactPool.filter(a => selectedArtifactIds.has(a.id))
    
    // 使用新引擎生成深度内容
    const content = generateCurationContent(
      selectedTheme,
      currentThemeKnowledge.themeName,
      selectedArts,
      currentThemeKnowledge.keyDimensions
    )
    setCurationContent(content)
    
    // 将内容映射到zones
    const newZones: ExhibitionZone[] = content.zones.map((zone, index) => ({
      zoneNumber: zone.zoneNumber,
      name: zone.name,
      subtitle: zone.subtitle,
      timePeriod: zone.timePeriod,
      narrative: zone.narrative
    }))
    setZones(newZones)
    
    // 更新核心展品
    const mustHaveArtifacts = currentThemeKnowledge.artifactPool.filter(a => a.isMustHave)
    const newCoreExhibits: ExhibitionCoreExhibit[] = mustHaveArtifacts.slice(0, 5).map((artifact, index) => ({
      exhibitName: artifact.name,
      era: artifact.era,
      artifactLevel: artifact.level,
      significance: artifact.significance,
      description: artifact.description,
      zoneId: newZones[index % newZones.length]?.id
    }))
    setCoreExhibits(newCoreExhibits)
    
    const mustIds = mustHaveArtifacts.map(a => a.id)
    const recIds = currentThemeKnowledge.artifactPool.filter(a => a.isRecommended).map(a => a.id)
    setSelectedArtifactIds(new Set([...mustIds, ...recIds.slice(0, 5)]))
    
    showToastFn('已生成专业策展方案')
  }

  // 辅助函数
  const getDimensionDesc = (dim: string): string => {
    const map: Record<string, string> = {
      '起源发展': '追溯事物的起源与早期发展历程',
      '技术演进': '梳理技术工艺的发展脉络',
      '制度完善': '分析相关制度体系的建立与完善',
      '文化内涵': '挖掘背后的文化价值与精神内核',
      '当代价值': '探讨在当代社会的意义与启示',
      '中外交流': '展现中外文化交流与互鉴'
    }
    return map[dim] || '核心主题维度'
  }

  const getDimensionStages = (dim: string, theme: string): string => {
    const stages: Record<string, string[]> = {
      '起源发展': ['史前', '先秦', '秦汉'],
      '技术演进': ['萌芽', '成熟', '鼎盛'],
      '制度完善': ['草创', '发展', '完备'],
      '文化内涵': ['物质', '精神', '制度'],
      '当代价值': ['传承', '创新', '展望'],
      '中外交流': ['陆上', '海上', '融合']
    }
    return (stages[dim] || ['早期', '中期', '晚期']).join(' → ')
  }

  // 文物筛选
  const filteredArtifacts = () => {
    if (!currentThemeKnowledge) return []
    let arts = [...currentThemeKnowledge.artifactPool]
    
    if (artifactFilter === 'must') {
      arts = arts.filter(a => a.isMustHave)
    } else if (artifactFilter === 'recommended') {
      arts = arts.filter(a => a.isRecommended)
    } else if (artifactFilter === 'selected') {
      arts = arts.filter(a => selectedArtifactIds.has(a.id))
    }
    
    if (artifactSearch) {
      const search = artifactSearch.toLowerCase()
      arts = arts.filter(a => 
        a.name.toLowerCase().includes(search) ||
        a.era.toLowerCase().includes(search) ||
        a.category?.toLowerCase().includes(search)
      )
    }
    
    return arts
  }

  // 切换文物选择
  const toggleArtifact = (artifact: ThemeArtifact) => {
    const newSet = new Set(selectedArtifactIds)
    if (newSet.has(artifact.id)) {
      if (artifact.isMustHave) {
        setWarningArtifactName(artifact.name)
        setShowMustHaveWarning(true)
        return
      }
      newSet.delete(artifact.id)
    } else {
      newSet.add(artifact.id)
    }
    setSelectedArtifactIds(newSet)
    autoSave()
  }

  // 切换展区展开
  const toggleZone = (index: number) => {
    const newSet = new Set(expandedZones)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setExpandedZones(newSet)
  }

  // AI对话
  const handleChat = () => {
    if (!chatInput.trim()) return
    
    const userMsg = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setChatInput('')
    
    setTimeout(() => {
      let response = ''
      const msg = userMsg.toLowerCase()
      
      if (msg.includes('主题') && (msg.includes('推荐') || msg.includes('选择') || msg.includes('建议'))) {
        response = '根据国博馆藏体系，我推荐以下主题方向：\n\n🏛️ **文明溯源系列**\n• 青铜文明 — 礼乐中国\n• 车马驰骋 — 古代交通文明\n\n🌊 **水利交通系列**\n• 运河文化 — 千年水脉\n• 水利文明 — 治水兴邦\n\n🌏 **交流互鉴系列**\n• 丝绸之路 — 东西方文明对话\n• 航海文明 — 海上丝路传奇\n\n🏘️ **社会变迁系列**\n• 城市变迁 — 阅见九州\n\n点击左侧快速主题即可一键启动。'
      } else if (msg.includes('文物') || msg.includes('展品')) {
        const count = currentThemeKnowledge?.artifactPool?.length || 0
        const mustCount = currentThemeKnowledge?.artifactPool?.filter(a => a.isMustHave).length || 0
        response = currentThemeKnowledge 
          ? `当前主题「${currentThemeKnowledge.themeName}」已匹配 ${count} 件文物，其中 ${mustCount} 件为核心必选展品。\n\n🔴 必选展品是展览叙事的关键支撑，不可移除\n🟡 推荐展品可根据空间和主题灵活调整\n\n你可以：\n• 🔍 在第二阶段筛选和搜索文物\n• 📊 按类别、等级筛选\n• ❓ 点击文物右侧的 i 按钮查看详情\n• 💬 告诉我你想要哪种类型的展品，我来推荐`
          : '请先选择展览主题，系统会自动匹配相关文物。'
      } else if (msg.includes('大纲') || msg.includes('展区') || msg.includes('章节')) {
        response = zones.length > 0
          ? `当前方案共 ${zones.length} 个展区：\n\n${zones.map((z, i) => `${i + 1}. ${z.name} ${z.subtitle ? '— ' + z.subtitle : ''}`).join('\n')}\n\n你可以：\n• ✏️ 在第二阶段直接编辑展区内容\n• 🔄 告诉我调整某个展区的主题方向\n• ➕ 要求增加或合并展区`
          : '进入第二阶段后，系统会根据主题自动生成展陈大纲。'
      } else if (msg.includes('空间') || msg.includes('布局') || msg.includes('展厅')) {
        response = '空间设计建议：\n\n📐 **动线规划**：推荐单向流线，避免交叉回流\n💡 **灯光策略**：核心文物采用戏剧化聚光（20-80lux），通史展区暖色中性光\n🎨 **色彩体系**：每个展区用标识色做视觉区分\n♿ **无障碍**：通道宽度≥1.8m，轮椅可360°回转\n\n在第三阶段可以详细配置展柜、灯光和VI方案。'
      } else if (msg.includes('优化') || msg.includes('改进') || msg.includes('建议')) {
        const suggestions = []
        if (!selectedTheme) suggestions.push('选择一个展览主题')
        if (zones.length === 0) suggestions.push('生成展陈大纲')
        if (selectedArtifactIds.size < 5) suggestions.push('增加展品数量（建议至少10件）')
        if (!selectedLighting) suggestions.push('配置灯光方案')
        if (selectedShowcases.length === 0) suggestions.push('选择展柜类型')
        
        response = suggestions.length > 0
          ? `基于当前方案，我建议优先完成以下事项：\n\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n完成后方案完整度将大幅提升。`
          : '当前方案已较为完整！你可以导出HTML方案交付给甲方，或继续细化某个模块。'
      } else if (msg.includes('预算') || msg.includes('费用') || msg.includes('成本')) {
        const areaNum = parseInt(area) || 1800
        const baseCost = areaNum * 3000
        response = `基于 ${areaNum}㎡ 展览面积的初步预算估算：\n\n💰 **场地与基建**：约 ${(baseCost * 0.3 / 10000).toFixed(0)} 万元\n🚚 **文物运输保险**：约 ${(baseCost * 0.15 / 10000).toFixed(0)} 万元\n🏗️ **布展施工**：约 ${(baseCost * 0.25 / 10000).toFixed(0)} 万元\n💡 **灯光音响**：约 ${(baseCost * 0.1 / 10000).toFixed(0)} 万元\n📱 **多媒体互动**：约 ${(baseCost * 0.15 / 10000).toFixed(0)} 万元\n📋 **运营管理**：约 ${(baseCost * 0.05 / 10000).toFixed(0)} 万元\n\n📌 预估总预算：约 ${(baseCost / 10000).toFixed(0)} 万元\n（此为粗略估算，实际费用需根据方案细节调整）`
      } else if (msg.includes('导出') || msg.includes('下载') || msg.includes('交付')) {
        response = '导出功能已就绪：\n\n🌐 **HTML策展方案** — 完整专业方案，可直接在浏览器查看\n📝 **Markdown文档** — 方便编辑和版本管理\n📦 **展品清单CSV** — Excel可打开的表格\n🖨️ **打印/PDF** — A4排版，可交付打印\n\n进入第四阶段即可导出。'
      } else {
        response = `我理解你的需求。作为AI策展助手，我可以帮你：\n\n1. 🎨 **主题策划** — 推荐主题、分析维度\n2. 🏺 **展品遴选** — 智能匹配、多维度筛选\n3. 📝 **大纲深化** — 生成专业策展叙事\n4. 🏛️ **空间设计** — 展区布局、灯光VI\n5. 💰 **预算估算** — 费用框架分析\n6. 📤 **方案导出** — 多格式输出\n\n你可以直接描述需求，比如"帮我推荐一个关于丝绸之路的展览主题"。`
      }
      
      setChatMessages(prev => [...prev, { role: 'ai', content: response }])
    }, 600)
  }

  // 受众切换
  const toggleAudience = (audId: string) => {
    setSelectedAudiences(prev => 
      prev.includes(audId) 
        ? prev.filter(id => id !== audId)
        : [...prev, audId]
    )
  }

  // 展柜切换
  const toggleShowcase = (id: string) => {
    setSelectedShowcases(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  // 数字展项切换
  const toggleDigital = (id: string) => {
    setSelectedDigitals(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  // 快速选择主题
  const selectTheme = (themeId: string) => {
    setSelectedTheme(themeId)
    const theme = EXHIBITION_THEMES.find(t => t.id === themeId)
    if (theme) {
      setExhibitionName(`${theme.name}特展`)
    }
    autoSave()
  }

  // ====== 渲染 ======

  const renderStepper = () => (
    <div className="stepper" id="stepper">
      {PHASES.map((phase, i) => (
        <React.Fragment key={phase.id}>
          <div
            className={`step-item ${currentPhase === phase.id ? 'active' : ''} ${phase.id <= maxPhase ? 'done' : ''} ${phase.id > maxPhase + 1 ? 'locked' : ''}`}
            onClick={() => phase.id <= maxPhase + 1 && goPhase(phase.id)}
          >
            <div className="sn">{phase.id}</div>
            {phase.name}
          </div>
          {i < PHASES.length - 1 && <div className="step-conn"></div>}
        </React.Fragment>
      ))}
    </div>
  )

  const renderChatPanel = () => (
    <div className="panel chat-panel">
      <div className="panel-header">🤖 AI 策展助手</div>
      <div className="chat-msgs">
        {chatMessages.map((msg, i) => (
          <div key={i} className={`msg ${msg.role}`}>
            {msg.content.split('\n').map((line, j) => (
              <React.Fragment key={j}>
                {line}
                {j < msg.content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <div className="chat-row">
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="描述你的策展想法…"
            onKeyDown={e => e.key === 'Enter' && handleChat()}
          />
          <button onClick={handleChat}>发送</button>
        </div>
      </div>
    </div>
  )

  const renderCtxPanel = () => {
    const progress = Math.min(100, (maxPhase / 4) * 60 + (selectedTheme ? 10 : 0) + (zones.length > 0 ? 15 : 0) + (coreExhibits.length > 0 ? 15 : 0))
    
    return (
      <div className="panel ctx-panel">
        <div className="panel-header">📊 策展上下文</div>
        <div className="ctx-body">
          <div className="ctx-card">
            <div className="c-label">完成进度</div>
            <div className="ctx-progress">
              <div className="ctx-bar">
                <div className="ctx-bar-inner" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
            <div className="c-val" style={{ fontSize: '11px', color: 'var(--t3)' }}>{Math.round(progress)}%</div>
          </div>
          
          {selectedTheme && currentThemeKnowledge && (
            <div className="ctx-card">
              <div className="c-label">当前主题</div>
              <div className="c-val">{currentThemeKnowledge.themeName}</div>
            </div>
          )}
          
          {exhibitionName && (
            <div className="ctx-card">
              <div className="c-label">展览名称</div>
              <div className="c-val" style={{ fontSize: '12px' }}>{exhibitionName}</div>
            </div>
          )}
          
          {zones.length > 0 && (
            <div className="ctx-card">
              <div className="c-label">展区规划</div>
              <div className="c-val">{zones.length} 个展区</div>
            </div>
          )}
          
          {coreExhibits.length > 0 && (
            <div className="ctx-card">
              <div className="c-label">灵魂展品</div>
              <div className="c-val">{coreExhibits.length} 件</div>
            </div>
          )}
          
          {selectedArtifactIds.size > 0 && (
            <div className="ctx-card">
              <div className="c-label">已选展品</div>
              <div className="c-val">{selectedArtifactIds.size} 件</div>
            </div>
          )}
          
          {selectedAudiences.length > 0 && (
            <div className="ctx-card">
              <div className="c-label">目标受众</div>
              <div className="c-val" style={{ fontSize: '11px' }}>
                {selectedAudiences.map(a => AUDIENCE_TYPES.find(t => t.id === a)?.name).filter(Boolean).join('、')}
              </div>
            </div>
          )}
          
          {currentThemeKnowledge && currentThemeKnowledge.recommendedLiterature && (
            <div className="ctx-card">
              <div className="c-label">推荐文献</div>
              <div className="c-val" style={{ fontSize: '11px' }}>
                {currentThemeKnowledge.recommendedLiterature.length} 本核心文献
              </div>
            </div>
          )}
          
          <div className="section-divider"></div>
          
          <div className="ctx-card" style={{ background: 'var(--al)', border: '1px solid var(--accent)' }}>
            <div className="c-label" style={{ color: 'var(--accent)' }}>💡 AI 建议</div>
            <div className="c-val" style={{ fontSize: '11px', color: 'var(--t2)' }}>
              {currentPhase === 1 && '选择一个主题，系统将自动为你匹配文物、生成大纲。'}
              {currentPhase === 2 && '左侧调整展陈大纲，右侧遴选文物。必选文物不要移除哦~'}
              {currentPhase === 3 && '根据主题调性选择合适的空间设计方案。'}
              {currentPhase === 4 && '预览展览效果，导出完整策展方案。'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Phase 1 渲染
  const renderPhase1 = () => (
    <div className="canvas-body fade-in">
      <div className="p1-subtabs">
        {PHASE1_SUBTABS.map(tab => (
          <div
            key={tab.id}
            className={`p1-subtab ${phase1Sub === tab.id ? 'active' : ''}`}
            onClick={() => setPhase1Sub(tab.id)}
          >
            <span className="sub-num">{tab.id}</span>
            {tab.icon} {tab.name}
          </div>
        ))}
      </div>
      
      {phase1Sub === 1 && renderPhase1Sub1()}
      {phase1Sub === 2 && renderPhase1Sub2()}
      {phase1Sub === 3 && renderPhase1Sub3()}
      {phase1Sub === 4 && renderPhase1Sub4()}
    </div>
  )

  const renderPhase1Sub1 = () => (
    <div>
      <div className="section-label">选择策展模式</div>
      <div className="mode-grid">
        {CURATION_MODES.map(mode => (
          <div
            key={mode.id}
            className={`mode-card ${curationMode === mode.id ? 'selected' : ''}`}
            onClick={() => { setCurationMode(mode.id); autoSave() }}
          >
            {mode.badge && <span className="mode-badge">{mode.badge}</span>}
            <div className="mode-icon">{mode.icon}</div>
            <div className="mode-title">{mode.name}</div>
            <div className="mode-desc">{mode.desc}</div>
          </div>
        ))}
      </div>
      
      <div className="section-divider"></div>
      
      <div className="section-label">快速选择主题</div>
      <div className="quick-themes">
        {EXHIBITION_THEMES.map(theme => (
          <div
            key={theme.id}
            className={`qt-chip ${selectedTheme === theme.id ? 'active' : ''}`}
            onClick={() => selectTheme(theme.id)}
          >
            {theme.icon} {theme.name}
          </div>
        ))}
      </div>
      
      <div className="btn-row">
        <button className="btn primary" onClick={() => setPhase1Sub(2)}>
          下一步：填写基本信息 →
        </button>
      </div>
    </div>
  )

  const renderPhase1Sub2 = () => (
    <div>
      <div className="input-block">
        <label>展览主题 *</label>
        <div className="quick-themes">
          {EXHIBITION_THEMES.map(theme => (
            <div
              key={theme.id}
              className={`qt-chip ${selectedTheme === theme.id ? 'active' : ''}`}
              onClick={() => selectTheme(theme.id)}
            >
              {theme.icon} {theme.name}
            </div>
          ))}
        </div>
      </div>
      
      <div className="input-block">
        <label>展览名称 *</label>
        <input
          type="text"
          value={exhibitionName}
          onChange={e => { setExhibitionName(e.target.value); autoSave() }}
          placeholder="如：大河上下——中国水利文明特展"
        />
      </div>
      
      <div className="elements-grid">
        <div className="elem-card">
          <div className="elem-label">主办单位</div>
          <input
            className="elem-input"
            value={organizer}
            onChange={e => { setOrganizer(e.target.value); autoSave() }}
            placeholder="如：中国国家博物馆"
          />
        </div>
        <div className="elem-card">
          <div className="elem-label">展览地点</div>
          <input
            className="elem-input"
            value={venue}
            onChange={e => { setVenue(e.target.value); autoSave() }}
            placeholder="如：北京·国家博物馆"
          />
        </div>
        <div className="elem-card">
          <div className="elem-label">开始时间</div>
          <input
            type="date"
            className="elem-input"
            value={startDate}
            onChange={e => { setStartDate(e.target.value); autoSave() }}
          />
        </div>
        <div className="elem-card">
          <div className="elem-label">结束时间</div>
          <input
            type="date"
            className="elem-input"
            value={endDate}
            onChange={e => { setEndDate(e.target.value); autoSave() }}
          />
        </div>
        <div className="elem-card">
          <div className="elem-label">预计面积(㎡)</div>
          <input
            type="number"
            className="elem-input"
            value={area}
            onChange={e => { setArea(e.target.value); autoSave() }}
            placeholder="2800"
          />
        </div>
      </div>
      
      {currentThemeKnowledge && (
        <>
          <div className="section-divider"></div>
          <div className="core-narrative-section">
            <div className="cn-label">
              📖 核心故事线索
              <span className="v12-source">AI 生成</span>
            </div>
            <div className="cn-narrative">{currentThemeKnowledge.coreStory.narrative}</div>
            <div className="cn-highlight">
              <span className="cn-highlight-icon">💡</span>
              <div>
                <div className="cn-highlight-label">高光时刻</div>
                <div className="cn-highlight-text">{currentThemeKnowledge.coreStory.highlight}</div>
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="btn-row">
        <button className="btn secondary" onClick={() => setPhase1Sub(1)}>← 上一步</button>
        <button className="btn primary" onClick={() => setPhase1Sub(3)}>下一步：主题维度拆解 →</button>
      </div>
    </div>
  )

  const renderPhase1Sub3 = () => (
    <div>
      <div className="v12-section-header">
        <span className="section-icon">🧩</span>
        <span style={{ fontSize: '14px', fontWeight: 600 }}>主题维度拆解</span>
        <span className="v12-badge">v1.2</span>
        <span className="v12-hint">AI自动生成，可编辑</span>
      </div>
      
      <div className="dimensions-grid">
        {themeDimensions.map((dim, i) => (
          <div key={i} className="dimension-card">
            <div className="dim-card-header">
              <span className="dimension-icon">{['🌱', '⚙️', '📋', '🎭', '🌟', '🌍'][i % 6]}</span>
              <input
                className="dim-name-input"
                value={dim.name}
                onChange={e => {
                  const newDims = [...themeDimensions]
                  newDims[i].name = e.target.value
                  setThemeDimensions(newDims)
                }}
              />
            </div>
            <textarea
              className="dim-desc-input"
              value={dim.desc}
              onChange={e => {
                const newDims = [...themeDimensions]
                newDims[i].desc = e.target.value
                setThemeDimensions(newDims)
              }}
            />
            <div className="dimension-stages">
              <div className="stages-row">
                <span className="stages-label">发展阶段：</span>
                <span className="stages-text">{dim.stages}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="section-divider"></div>
      
      <div className="v12-section-header">
        <span className="section-icon">👥</span>
        <span style={{ fontSize: '14px', fontWeight: 600 }}>目标受众分层</span>
        <span className="v12-badge">v1.2</span>
      </div>
      
      <div className="audience-grid">
        {AUDIENCE_TYPES.map(aud => (
          <div
            key={aud.id}
            className={`audience-card ${selectedAudiences.includes(aud.id) ? 'selected' : ''}`}
            onClick={() => toggleAudience(aud.id)}
          >
            <div className="audience-name">{aud.name}</div>
            <div className="audience-desc">{aud.desc}</div>
            <div className="audience-needs">需求：{aud.needs}</div>
            <div className="audience-highlights">
              {aud.highlights.map((h, i) => (
                <span key={i} className="highlight-tag">{h}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="section-divider"></div>
      
      <div className="v12-section-header">
        <span className="section-icon">🏗️</span>
        <span style={{ fontSize: '14px', fontWeight: 600 }}>展陈结构建议</span>
        <span className="v12-badge">v1.2</span>
      </div>
      
      <div className="structure-list">
        {structureItems.map((item, i) => (
          <div key={i} className="structure-item">
            <div className={`structure-chapter ${i === structureItems.length - 1 ? 'end-chapter' : ''}`}>
              {item.chapter}
            </div>
            <div className="structure-content">
              <div className="structure-title">{item.title}</div>
              <div className="structure-meta">
                <span>{item.subtitle}</span>
                <span>⏱ {item.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="btn-row" style={{ marginTop: '20px' }}>
        <button className="btn secondary" onClick={() => setPhase1Sub(2)}>← 上一步</button>
        <button className="btn primary" onClick={() => setPhase1Sub(4)}>下一步：知识图谱 →</button>
      </div>
    </div>
  )

  const renderPhase1Sub4 = () => {
    const dims = themeDimensions.length > 0 ? themeDimensions : [
      { name: '起源发展', desc: '' },
      { name: '技术演进', desc: '' },
      { name: '文化内涵', desc: '' },
      { name: '当代价值', desc: '' }
    ]
    
    return (
      <div>
        <div className="v12-section-header">
          <span className="section-icon">🕸️</span>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>主题知识图谱</span>
          <span className="v12-badge">v1.2</span>
          <span className="kg-dims">{dims.length} 个核心维度</span>
        </div>
        
        <div className="kg-container">
          <svg className="kg-svg" viewBox="0 0 800 380">
            {/* 中心节点 */}
            <circle cx="400" cy="190" r="45" fill="var(--accent)" opacity="0.2" />
            <circle cx="400" cy="190" r="35" fill="var(--accent)" opacity="0.4" />
            <text x="400" y="195" textAnchor="middle" fill="var(--t1)" fontSize="14" fontWeight="600">
              {currentThemeKnowledge?.themeName || '展览主题'}
            </text>
            
            {/* 维度节点 */}
            {dims.map((dim, i) => {
              const angle = (i / dims.length) * Math.PI * 2 - Math.PI / 2
              const x = 400 + Math.cos(angle) * 160
              const y = 190 + Math.sin(angle) * 130
              const colors = ['var(--teal)', 'var(--amber)', 'var(--blue)', 'var(--purple)', 'var(--red)', '#9460d8']
              const color = colors[i % colors.length]
              
              return (
                <g key={i} className="kg-node">
                  <line x1="400" y1="190" x2={x} y2={y} stroke="var(--border-s)" strokeWidth="1.5" />
                  <circle cx={x} cy={y} r="32" fill={color} opacity="0.15" />
                  <circle cx={x} cy={y} r="25" fill={color} opacity="0.3" />
                  <text x={x} y={y + 4} textAnchor="middle" fill="var(--t1)" fontSize="11" fontWeight="500">
                    {dim.name}
                  </text>
                </g>
              )
            })}
            
            {/* 外围文物节点 */}
            {currentThemeKnowledge?.artifactPool?.slice(0, 8).map((art, i) => {
              const angle = (i / 8) * Math.PI * 2 + Math.PI / 8
              const x = 400 + Math.cos(angle) * 280
              const y = 190 + Math.sin(angle) * 150
              
              return (
                <g key={`art-${i}`} className="kg-node">
                  <circle cx={x} cy={y} r="18" fill="var(--bg-surface)" stroke="var(--border-s)" strokeWidth="1" />
                  <text x={x} y={y + 4} textAnchor="middle" fontSize="14">
                    {art.emoji || '🏺'}
                  </text>
                </g>
              )
            })}
          </svg>
          
          <div className="kg-legend">
            <span><span className="dot" style={{ background: 'var(--accent)' }}></span>核心主题</span>
            <span><span className="dot" style={{ background: 'var(--teal)' }}></span>主题维度</span>
            <span><span className="dot" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-s)' }}></span>代表文物</span>
          </div>
        </div>
        
        {currentThemeKnowledge?.recommendedLiterature && (
          <div className="recommended-lit">
            <div className="rl-header">
              📚 学术研究参考 · 推荐文献
            </div>
            <div className="rl-list">
              {currentThemeKnowledge.recommendedLiterature.slice(0, 4).map((book, index) => (
                <div key={index} className="rl-item">
                  <div className="rl-num">{index + 1}</div>
                  <div className="rl-content">
                    <div className="rl-title">{book.title}</div>
                    <div className="rl-meta">
                      {book.author} · {book.year} · {book.publisher}
                      {book.pages && ` · ${book.pages}`}
                    </div>
                    <div className="rl-desc">{book.description}</div>
                    {book.importance && <div className="rl-importance">📌 {book.importance}</div>}
                  </div>
                  <div className="rl-right">
                    <span className={`rl-tag ${book.type === 'core' ? 'core' : 'ref'}`}>
                      {book.type === 'core' ? '核心' : '参考'}
                    </span>
                    {book.category && <span className="rl-category">{book.category}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="btn-row" style={{ marginTop: '20px' }}>
          <button className="btn secondary" onClick={() => setPhase1Sub(3)}>← 上一步</button>
          <button className="btn teal" onClick={() => goPhase(2)}>
            ✨ 进入第二阶段：内容深化
          </button>
        </div>
      </div>
    )
  }

  // Phase 2 渲染
  const renderPhase2 = () => (
    <div className="canvas-body fade-in">
      <div className="section-title-row">
        <span className="section-icon">📚</span>
        <span style={{ fontSize: '16px', fontWeight: 600 }}>内容深化</span>
        <span className="match-badge">{zones.length} 个展区</span>
        <span className="match-badge" style={{ background: 'var(--amber)', color: '#111' }}>
          {selectedArtifactIds.size} 件展品
        </span>
      </div>
      
      {currentThemeKnowledge && (
        <div className="curatorial-notes">
          <div className="cn-header">
            <span className="cn-icon">💡</span>
            <span className="cn-title">AI 策展人笔记</span>
            <span className="cn-badge">智能分析</span>
          </div>
          <div className="cn-content">{currentThemeKnowledge.curatorialNotes}</div>
        </div>
      )}
      
      <div className="phase2-layout">
        {/* 左侧：展陈大纲 */}
        <div className="outline-col">
          <div className="section-label">展陈大纲</div>
          
          <div className="outline-overview">
            <div className="oo-stats">
              <div className="oo-stat">
                <div className="oos-num">{zones.length}</div>
                <div className="oos-label">展区数量</div>
              </div>
              <div className="oo-stat">
                <div className="oos-num">{coreExhibits.length}</div>
                <div className="oos-label">灵魂展品</div>
              </div>
              <div className="oo-stat">
                <div className="oos-num">{selectedArtifactIds.size}</div>
                <div className="oos-label">展品总数</div>
              </div>
            </div>
          </div>
          
          <div className="match-info">
            💡 点击展区标题可展开/折叠，编辑叙事内容
          </div>
          
          {zones.length === 0 ? (
            <div className="loader">
              <div className="loader-dots">
                <div className="ld"></div>
                <div className="ld"></div>
              </div>
              <div className="ld-text">正在生成展陈大纲...</div>
            </div>
          ) : (
            zones.map((zone, index) => (
              <div key={index} className="ot-section">
                <div className="ot-header" onClick={() => toggleZone(index)}>
                  <span className="ot-num">{zone.zoneNumber}</span>
                  <div className="ot-title-area">
                    <span className="ot-title">{zone.name}</span>
                    {zone.timePeriod && <span className="ot-range">{zone.timePeriod}</span>}
                  </div>
                  <div className="ot-actions">
                    <span className="ot-act">{expandedZones.has(index) ? '▲' : '▼'}</span>
                  </div>
                </div>
                <div className={`ot-body ${expandedZones.has(index) ? 'open' : ''}`}>
                  {zone.subtitle && (
                    <div style={{ fontSize: '11px', color: 'var(--t3)', marginBottom: '8px' }}>
                      {zone.subtitle}
                    </div>
                  )}
                  <textarea
                    value={zone.narrative || ''}
                    onChange={e => {
                      const newZones = [...zones]
                      newZones[index].narrative = e.target.value
                      setZones(newZones)
                      autoSave()
                    }}
                    rows={6}
                    placeholder="展区叙事..."
                  />
                  {curationContent && curationContent.zones[index] && (
                    <>
                      <div 
                        style={{ 
                          marginBottom: '10px',
                          height: '120px',
                          borderRadius: '8px',
                          background: `linear-gradient(135deg, ${curationContent.zones[index].accentColor || '#4ECDC4'}22, ${curationContent.zones[index].accentColor || '#4ECDC4'}08)`,
                          border: `1px solid ${curationContent.zones[index].accentColor || '#4ECDC4'}33`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          gap: '6px',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ fontSize: '36px', opacity: 0.9 }}>
                          {['🏺', '⚔️', '🚗', '🐎', '🏛️', '🎭', '📜'][index % 7]}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: curationContent.zones[index].accentColor || 'var(--teal)',
                          fontWeight: 600,
                          letterSpacing: '1px'
                        }}>
                          {zone.name}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--t3)' }}>
                          {curationContent.zones[index].subtitle || ''}
                        </div>
                        <div style={{ 
                          position: 'absolute', 
                          top: '-20px', 
                          right: '-20px', 
                          width: '80px', 
                          height: '80px', 
                          borderRadius: '50%',
                          background: `${curationContent.zones[index].accentColor || '#4ECDC4'}15` 
                        }} />
                        <div style={{ 
                          position: 'absolute', 
                          bottom: '-30px', 
                          left: '-10px', 
                          width: '100px', 
                          height: '100px', 
                          borderRadius: '50%',
                          background: `${curationContent.zones[index].accentColor || '#4ECDC4'}10` 
                        }} />
                      </div>
                      {curationContent.zones[index].artifactGroup?.groupNarrative && (
                        <div style={{ fontSize: '11px', color: 'var(--teal)', marginBottom: '8px', padding: '6px 10px', background: 'var(--tl)', borderRadius: '6px' }}>
                          🏺 {curationContent.zones[index].artifactGroup.groupNarrative}
                        </div>
                      )}
                      {curationContent.zones[index].spatialHint && (
                        <div style={{ fontSize: '11px', color: 'var(--t2)', marginBottom: '4px' }}>
                          🏛️ 空间：{curationContent.zones[index].spatialHint}
                        </div>
                      )}
                      {curationContent.zones[index].lightingMood && (
                        <div style={{ fontSize: '11px', color: 'var(--t2)', marginBottom: '4px' }}>
                          💡 灯光：{curationContent.zones[index].lightingMood}
                        </div>
                      )}
                      {curationContent.zones[index].educationGoal && (
                        <div style={{ fontSize: '11px', color: 'var(--t2)', marginBottom: '4px' }}>
                          📚 教育：{curationContent.zones[index].educationGoal}
                        </div>
                      )}
                    </>
                  )}
                  <div className="ot-artifacts">
                    {zone.timePeriod && <span className="ot-art">⏱ {zone.timePeriod}</span>}
                    {coreExhibits.slice(index, index + 1).map((ex, i) => (
                      <span key={i} className="ot-art must-art">⭐ {ex.exhibitName?.substring(0, 8)}...</span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* 右侧：文物遴选 */}
        <div className="artifact-col">
          <div className="section-label">文物遴选</div>
          
          <div className="artifact-filter">
            <span className={`af-tag ${artifactFilter === 'all' ? 'active' : ''}`} onClick={() => setArtifactFilter('all')}>
              全部
            </span>
            <span className={`af-tag ${artifactFilter === 'must' ? 'active' : ''}`} onClick={() => setArtifactFilter('must')}>
              🔴 必选
            </span>
            <span className={`af-tag ${artifactFilter === 'recommended' ? 'active' : ''}`} onClick={() => setArtifactFilter('recommended')}>
              🟡 推荐
            </span>
            <span className={`af-tag ${artifactFilter === 'selected' ? 'active' : ''}`} onClick={() => setArtifactFilter('selected')}>
              已选
            </span>
          </div>
          
          <div className="artifact-chat">
            <input
              value={artifactSearch}
              onChange={e => setArtifactSearch(e.target.value)}
              placeholder="搜索文物名称、时代..."
            />
            <button>🔍 筛选</button>
          </div>
          
          <div className="artifact-grid">
            {filteredArtifacts().map(artifact => (
              <div
                key={artifact.id}
                className={`artifact-row ${selectedArtifactIds.has(artifact.id) ? 'checked' : ''}`}
                onClick={() => toggleArtifact(artifact)}
              >
                {artifact.isMustHave && <span className="artifact-priority must">MUST</span>}
                {!artifact.isMustHave && artifact.isRecommended && <span className="artifact-priority recommended">REC</span>}
                
                <div className="ar-check">{selectedArtifactIds.has(artifact.id) ? '✓' : ''}</div>
                <div className="ar-img">{artifact.emoji || '🏺'}</div>
                <div className="ar-info">
                  <div className="ar-name">{artifact.name}</div>
                  <div className="ar-meta">{artifact.era} · {artifact.level || artifact.category}</div>
                </div>
                <button
                  className="ar-detail-btn"
                  onClick={e => { e.stopPropagation(); setDetailArtifact(artifact) }}
                >
                  i
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="btn-row" style={{ marginTop: '20px' }}>
        <button className="btn secondary" onClick={() => goPhase(1)}>← 返回策划</button>
        <button className="btn teal" onClick={() => goPhase(3)}>
          进入第三阶段：空间设计 →
        </button>
      </div>
    </div>
  )

  // Phase 3 渲染
  const renderPhase3 = () => (
    <div className="canvas-body fade-in">
      <div className="p3-layout">
        <div className="p3-nav">
          {PHASE3_SUBTABS.map(tab => (
            <div
              key={tab.id}
              className={`p3-nav-item ${phase3Sub === tab.id ? 'active' : ''}`}
              onClick={() => setPhase3Sub(tab.id)}
            >
              <span className="ni-icon">{tab.icon}</span>
              {tab.name}
            </div>
          ))}
        </div>
        
        <div className="p3-content">
          {phase3Sub === 1 && renderPhase3Sub1()}
          {phase3Sub === 2 && renderPhase3Sub2()}
          {phase3Sub === 3 && renderPhase3Sub3()}
          {phase3Sub === 4 && renderPhase3Sub4()}
          {phase3Sub === 5 && renderPhase3Sub5()}
        </div>
      </div>
      
      <div className="btn-row" style={{ marginTop: '20px' }}>
        <button className="btn secondary" onClick={() => goPhase(2)}>← 返回内容深化</button>
        <button className="btn teal" onClick={() => goPhase(4)}>
          进入第四阶段：数字预览 →
        </button>
      </div>
    </div>
  )

  const renderPhase3Sub1 = () => (
    <div>
      <div className="section-label">空间布局预览</div>
      
      {currentThemeKnowledge && currentThemeKnowledge.spatialHint && (
        <div className="spatial-hint-banner">
          <span className="sh-icon">💡</span>
          <span className="sh-label">主题空间提示</span>
          <span className="sh-text">{currentThemeKnowledge.spatialHint}</span>
          <button className="btn btn-sm">应用到方案</button>
        </div>
      )}
      
      <div className="cad-preview">
        {/* CAD风格布局图 */}
        {zones.slice(0, 5).map((zone, i) => {
          const positions = [
            { left: '5%', top: '10%', width: '90%', height: '15%' },
            { left: '5%', top: '30%', width: '43%', height: '30%' },
            { left: '52%', top: '30%', width: '43%', height: '30%' },
            { left: '5%', top: '65%', width: '43%', height: '25%' },
            { left: '52%', top: '65%', width: '43%', height: '25%' }
          ]
          const pos = positions[i % positions.length]
          
          return (
            <div
              key={i}
              className="cad-room"
              style={pos}
            >
              <span className="cad-label">{zone.zoneNumber}. {zone.name}</span>
            </div>
          )
        })}
        
        {/* 尺寸标注 */}
        <div className="cad-dim" style={{ top: '50%', left: '1%' }}>↕ 36m</div>
        <div className="cad-dim" style={{ bottom: '1%', left: '45%' }}>↔ 50m</div>
        <div className="cad-dim" style={{ top: '5%', right: '5%' }}>
          总面积: {area || '1800'}㎡
        </div>
      </div>
      
      <div className="input-block">
        <label>动线设计描述</label>
        <textarea
          value={trafficDesign}
          onChange={e => { setTrafficDesign(e.target.value); autoSave() }}
          placeholder="描述展览参观动线，如：采用单线式动线，从序厅开始，按时间线顺序参观，最后从尾厅出口离开..."
          rows={4}
        />
      </div>
      
      <div className="elements-grid">
        <div className="elem-card">
          <div className="elem-label">展览面积(㎡)</div>
          <input
            className="elem-input"
            type="number"
            value={totalArea || area}
            onChange={e => { setTotalArea(e.target.value); autoSave() }}
          />
        </div>
        <div className="elem-card">
          <div className="elem-label">预计参观时长</div>
          <div className="elem-val">约 {zones.length * 15} 分钟</div>
        </div>
        <div className="elem-card">
          <div className="elem-label">展墙长度</div>
          <div className="elem-val">约 {zones.length * 20} m</div>
        </div>
      </div>
    </div>
  )

  const renderPhase3Sub2 = () => (
    <div>
      <div className="section-label">展柜选型</div>
      <div className="showcase-grid">
        {SHOWCASE_TYPES.map(sc => (
          <div
            key={sc.id}
            className={`showcase-card ${selectedShowcases.includes(sc.id) ? 'selected' : ''}`}
            onClick={() => toggleShowcase(sc.id)}
          >
            <div className="sc-icon">{sc.icon}</div>
            <div className="sc-name">{sc.name}</div>
            <div className="sc-spec">{sc.spec}</div>
            <div className="sc-desc">{sc.desc}</div>
          </div>
        ))}
      </div>
      
      <div className="section-divider"></div>
      
      <div className="section-label">包容性设计</div>
      <div className="inclusive-grid">
        {INCLUSIVE_DESIGNS.map((inc, i) => (
          <div key={i} className="inclusive-card">
            <div className="inc-header">
              <span className="inc-icon">{inc.icon}</span>
              <span className="inc-cat">{inc.category}</span>
            </div>
            <div className="inc-items">
              {inc.items.map((item, j) => (
                <span key={j} className="inc-tag">{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPhase3Sub3 = () => (
    <div>
      <div className="section-label">灯光设计方案</div>
      <div className="light-grid">
        {LIGHTING_SCHEMES.map(light => (
          <div
            key={light.id}
            className={`light-card ${selectedLighting === light.id ? 'selected' : ''}`}
            onClick={() => { setSelectedLighting(light.id); autoSave() }}
          >
            <div className="lc-swatch" style={{ background: light.color }}></div>
            <div className="lc-temp">{light.temp}</div>
            <div className="lc-name">{light.name}</div>
            <div className="lc-desc">{light.desc}</div>
            <div className="lc-lux">{light.lux}</div>
          </div>
        ))}
      </div>
      
      <div className="section-divider"></div>
      
      <div className="input-block">
        <label>灯光设计说明</label>
        <textarea
          value={lightingDesign}
          onChange={e => { setLightingDesign(e.target.value); autoSave() }}
          placeholder="详细描述灯光设计理念、分区照明策略、重点展品照明方式等..."
          rows={4}
        />
      </div>
    </div>
  )

  const renderPhase3Sub4 = () => (
    <div>
      <div className="section-label">VI视觉配色方案</div>
      <div className="vi-preview">
        {VI_SCHEMES.map((vi, i) => (
          <div
            key={i}
            className="vi-card"
            style={{ 
              border: selectedVIScheme === i ? '2px solid var(--accent)' : '1px solid var(--border)',
              cursor: 'pointer'
            }}
            onClick={() => { setSelectedVIScheme(i); autoSave() }}
          >
            <div className="vi-swatch" style={{ background: vi.primary }}></div>
            <div className="vi-name">{vi.name}</div>
            <div className="vi-code">{vi.primary.toUpperCase()}</div>
          </div>
        ))}
      </div>
      
      <div className="elements-grid">
        <div className="elem-card">
          <div className="elem-label">主色调</div>
          <div className="elem-val" style={{ color: VI_SCHEMES[selectedVIScheme]?.primary }}>
            {VI_SCHEMES[selectedVIScheme]?.primary}
          </div>
        </div>
        <div className="elem-card">
          <div className="elem-label">辅助色</div>
          <div className="elem-val" style={{ color: VI_SCHEMES[selectedVIScheme]?.secondary }}>
            {VI_SCHEMES[selectedVIScheme]?.secondary}
          </div>
        </div>
        <div className="elem-card">
          <div className="elem-label">强调色</div>
          <div className="elem-val" style={{ color: VI_SCHEMES[selectedVIScheme]?.accent }}>
            {VI_SCHEMES[selectedVIScheme]?.accent}
          </div>
        </div>
      </div>
    </div>
  )

  const renderPhase3Sub5 = () => (
    <div>
      <div className="section-label">数字互动展项</div>
      <div className="digital-grid">
        {DIGITAL_EXHIBITS.map(dig => (
          <div
            key={dig.id}
            className={`digital-card ${selectedDigitals.includes(dig.id) ? 'checked' : ''}`}
            onClick={() => toggleDigital(dig.id)}
          >
            <div className="dig-icon">{dig.icon}</div>
            <div className="dig-name">{dig.name}</div>
            {selectedDigitals.includes(dig.id) ? (
              <div className="dig-check">✓ 已选</div>
            ) : (
              <div className="dig-plus">+ 添加</div>
            )}
          </div>
        ))}
      </div>
      
      <div className="section-divider"></div>
      
      <div className="section-label">已选数字展项 ({selectedDigitals.length})</div>
      <div className="ot-artifacts">
        {selectedDigitals.map(id => {
          const dig = DIGITAL_EXHIBITS.find(d => d.id === id)
          return dig ? (
            <span key={id} className="ot-art">{dig.icon} {dig.name}</span>
          ) : null
        })}
      </div>
    </div>
  )

  // Phase 4 渲染
  const renderPhase4 = () => (
    <div className="canvas-body fade-in">
      <div className="section-title-row">
        <span className="section-icon">✨</span>
        <span style={{ fontSize: '16px', fontWeight: 600 }}>数字预览</span>
      </div>
      
      <div className="meta-preview">
        <div className="meta-label">{exhibitionName || '展览预览'}</div>
        <div className="meta-floor"></div>
        <div className="meta-spot"></div>
        <div className="meta-artifacts">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="meta-art"></div>
          ))}
        </div>
      </div>
      
      <div className="section-label">方案完整性评估</div>
      <div className="feasibility-card" style={{ marginBottom: '12px' }}>
        <div className="fe-icon">📊</div>
        <div className="fe-label">方案完整度</div>
        <div className="fe-value">
          {Math.round(Math.min(100, (maxPhase / 4) * 40 + (selectedTheme ? 10 : 0) + (zones.length > 0 ? 15 : 0) + (coreExhibits.length > 0 ? 15 : 0) + (selectedShowcases.length > 0 ? 10 : 0) + (selectedLighting ? 10 : 0)))}
          <span className="fe-unit">%</span>
        </div>
      </div>
      
      <div className="section-divider"></div>
      
      {/* AI配图生成 */}
      <div className="section-label">🎨 AI配图生成</div>
      <div className="image-gen-panel">
        <div className="igp-header">
          <span>为展览生成专属配图，让方案更生动</span>
          <button 
            className={`btn primary ${generatingImages.size > 0 ? 'loading' : ''}`}
            onClick={generateAllImages}
            disabled={!curationContent || generatingImages.size > 0 || !isImageApiAvailable}
          >
            {generatingImages.size > 0 ? `生成中 (${generatingImages.size})` : '一键生成全部配图'}
          </button>
        </div>
        
        {!isImageApiAvailable && (
          <div className="igp-warn">
            <span>⚠️</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>AI生图功能仅在TRAE IDE本地环境可用</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                当前为部署环境（{window.location.hostname}），无法调用本地AI生图API。
                导出HTML时会自动使用CSS动画装饰作为替代方案。
              </div>
            </div>
          </div>
        )}
        
        {/* 封面配图 */}
        <div className="igp-card">
          <div className="igc-title">封面图</div>
          <div className="igc-preview">
            {generatedImages['cover'] ? (
              <img src={generatedImages['cover']} alt="封面" />
            ) : (
              <div className="igc-placeholder">
                <span>📷</span>
                <span>{isImageApiAvailable ? '点击生成封面图' : '本地环境可用'}</span>
              </div>
            )}
          </div>
          <button 
            className={`btn secondary ${generatingImages.has('cover') ? 'loading' : ''}`}
            onClick={() => curationContent && generateImage('cover', curationContent.coverImagePrompt)}
            disabled={generatingImages.has('cover') || !curationContent || !isImageApiAvailable}
          >
            {generatingImages.has('cover') ? '生成中...' : '生成封面图'}
          </button>
        </div>
        
        {/* 展区配图 */}
        <div className="igp-grid">
          {curationContent?.zones.map((zone, idx) => {
            const key = `zone_${idx}`
            return (
              <div key={idx} className="igp-mini-card">
                <div className="igmc-title">{zone.name}</div>
                <div className="igmc-preview">
                  {generatedImages[key] ? (
                    <img src={generatedImages[key]} alt={zone.name} />
                  ) : (
                    <div className="igmc-placeholder">
                      <span>{getThemeEmoji(zone.name) || '🏛️'}</span>
                    </div>
                  )}
                </div>
                <button 
                  className={`btn tiny ${generatingImages.has(key) ? 'loading' : ''}`}
                  onClick={() => generateImage(key, zone.imagePrompt)}
                  disabled={generatingImages.has(key) || !isImageApiAvailable}
                >
                  {generatingImages.has(key) ? '生成中...' : '生成'}
                </button>
              </div>
            )
          })}
        </div>
        
        <div className="igp-tip">
          💡 提示：生成的图片会自动应用到导出的HTML方案中，支持重新生成直到满意为止
        </div>
      </div>
      
      <div className="section-divider"></div>
      
      <div className="section-label">导出方案</div>
      <div className="export-grid">
        <div className="export-card" onClick={exportHTML}>
          <span className="ec-icon">🌐</span>
          <span>策展方案 HTML</span>
          <span className="ec-arrow">→</span>
        </div>
        <div className="export-card" onClick={exportMarkdown}>
          <span className="ec-icon">📝</span>
          <span>Markdown 文档</span>
          <span className="ec-arrow">→</span>
        </div>
        <div className="export-card" onClick={exportArtifactCSV}>
          <span className="ec-icon">📦</span>
          <span>展品清单 CSV</span>
          <span className="ec-arrow">→</span>
        </div>
        <div className="export-card" onClick={() => {
          const html = generateHTML()
          const printWin = window.open('', '_blank')
          if (printWin) {
            printWin.document.write(html)
            printWin.document.close()
            printWin.onload = () => printWin.print()
          }
          showToastFn('已打开打印预览')
        }}>
          <span className="ec-icon">🖨️</span>
          <span>打印 / 另存为PDF</span>
          <span className="ec-arrow">→</span>
        </div>
      </div>
      
      <div className="btn-row" style={{ marginTop: '20px' }}>
        <button className="btn secondary" onClick={() => goPhase(3)}>← 返回空间设计</button>
        <button className="btn primary" onClick={() => showToastFn('🎉 方案已完成！')}>
          🎉 完成策展方案
        </button>
      </div>
    </div>
  )

  // 渲染画布主体
  const renderCanvas = () => {
    const titles = ['第 1 阶段 · 策展策划', '第 2 阶段 · 内容深化', '第 3 阶段 · 空间&展陈设计', '第 4 阶段 · 数字预览']
    
    return (
      <div className="panel canvas-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="panel-header">{titles[currentPhase - 1]}</div>
        {currentPhase === 1 && renderPhase1()}
        {currentPhase === 2 && renderPhase2()}
        {currentPhase === 3 && renderPhase3()}
        {currentPhase === 4 && renderPhase4()}
      </div>
    )
  }

  return (
    <div className="curation-app">
      {/* 顶部栏 */}
      <div className="topbar">
        <div className="logo">策展助手<span>博物馆策展方案AI辅助生成系统</span></div>
        {renderStepper()}
        <div className="topbar-status">
          <div className="status-item"><span className="status-dot online"></span>知识库</div>
          <div className="status-item"><span className="status-dot online"></span>文物库</div>
          <div className="status-item"><span className="status-dot online"></span>AI模型</div>
        </div>
      </div>
      
      {/* 主体三栏 */}
      <div className="main">
        {renderChatPanel()}
        {renderCanvas()}
        {renderCtxPanel()}
      </div>
      
      {/* Toast */}
      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
      
      {/* 必选展品移除警告 */}
      {showMustHaveWarning && (
        <div className="must-have-warning show" onClick={() => setShowMustHaveWarning(false)}>
          <div className="warning-content" onClick={e => e.stopPropagation()}>
            <div className="warning-icon">⚠️</div>
            <div className="warning-title">确认移除此必选展品？</div>
            <div className="warning-desc">
              「{warningArtifactName}」是本主题的核心必选展品，移除可能会破坏展览的叙事逻辑完整性。
            </div>
            <div className="warning-actions">
              <button className="btn btn-sm" onClick={() => setShowMustHaveWarning(false)}>取消</button>
              <button className="btn btn-sm btn-danger" onClick={() => setShowMustHaveWarning(false)}>
                确认移除
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 文物详情弹窗 */}
      {detailArtifact && (
        <div className="detail-modal show" onClick={() => setDetailArtifact(null)}>
          <div className="detail-modal-content" onClick={e => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div className="detail-title-row">
                <span className="detail-emoji">{detailArtifact.emoji || '🏺'}</span>
                <div className="detail-title-wrap">
                  <h3 className="detail-title">{detailArtifact.name}</h3>
                  <div className="detail-tags">
                    {detailArtifact.level && <span className="detail-tag level-tag">{detailArtifact.level}</span>}
                    {detailArtifact.era && <span className="detail-tag">{detailArtifact.era}</span>}
                    {detailArtifact.category && <span className="detail-tag">{detailArtifact.category}</span>}
                    {detailArtifact.isMustHave && <span className="detail-tag" style={{ background: 'var(--rl)', color: 'var(--red)' }}>必选展品</span>}
                  </div>
                </div>
              </div>
              <button className="detail-close" onClick={() => setDetailArtifact(null)}>×</button>
            </div>
            
            <div className="detail-body">
              <div className="detail-grid">
                {detailArtifact.material && (
                  <div className="detail-item">
                    <span className="detail-item-label">材质：</span>
                    <span className="detail-item-value">{detailArtifact.material}</span>
                  </div>
                )}
                {detailArtifact.unearthed && (
                  <div className="detail-item">
                    <span className="detail-item-label">出土地：</span>
                    <span className="detail-item-value">{detailArtifact.unearthed}</span>
                  </div>
                )}
                {detailArtifact.collection && (
                  <div className="detail-item">
                    <span className="detail-item-label">收藏单位：</span>
                    <span className="detail-item-value">{detailArtifact.collection}</span>
                  </div>
                )}
                {detailArtifact.unearthedYear && (
                  <div className="detail-item">
                    <span className="detail-item-label">出土年代：</span>
                    <span className="detail-item-value">{detailArtifact.unearthedYear}</span>
                  </div>
                )}
              </div>
              
              <div className="detail-section">
                <div className="detail-section-title">📝 文物描述</div>
                <p className="detail-desc">{detailArtifact.description}</p>
              </div>
              
              {detailArtifact.significance && (
                <div className="detail-section">
                  <div className="detail-section-title">🏆 历史意义</div>
                  <p className="detail-desc">{detailArtifact.significance}</p>
                </div>
              )}
              
              {detailArtifact.highlight && (
                <div className="detail-section highlight-section">
                  <div className="detail-section-title">✨ 亮点看点</div>
                  <p className="detail-highlight">{detailArtifact.highlight}</p>
                </div>
              )}
            </div>
            
            <div className="detail-footer">
              <button className="btn btn-secondary" onClick={() => setDetailArtifact(null)}>关闭</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  toggleArtifact(detailArtifact)
                  setDetailArtifact(null)
                }}
              >
                {selectedArtifactIds.has(detailArtifact.id) ? '移出展览' : '加入展览'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CurationWorkspace
