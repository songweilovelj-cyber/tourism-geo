import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { PlatformType } from '@/types/api'

const PLATFORMS: Array<{ platform: PlatformType; name: string; icon: string; isLlmFriendly: boolean }> = [
  { platform: 'ZHIHU_QA', name: '知乎问答', icon: '📝', isLlmFriendly: true },
  { platform: 'ZHIHU_ARTICLE', name: '知乎文章', icon: '📄', isLlmFriendly: true },
  { platform: 'XIAOHONGSHU', name: '小红书', icon: '📕', isLlmFriendly: false },
  { platform: 'WECHAT', name: '微信公众号', icon: '💬', isLlmFriendly: false },
  { platform: 'TOUTIAO', name: '头条号', icon: '📰', isLlmFriendly: false },
  { platform: 'DOUYIN', name: '抖音', icon: '🎵', isLlmFriendly: false },
  { platform: 'LANDING_PAGE', name: '平台落地页', icon: '🏠', isLlmFriendly: true }
]

// 场景类型配置
const SCENARIOS = [
  { id: 'tourist_attraction', name: '景区介绍', description: '适合宣传景区特色和亮点' },
  { id: 'hotel_accommodation', name: '酒店住宿', description: '适合介绍酒店设施和服务' },
  { id: 'travel_experience', name: '游玩体验', description: '适合分享游玩攻略和体验' },
  { id: 'food_dining', name: '美食推荐', description: '适合推荐当地特色美食' },
  { id: 'cultural_creative', name: '文创特产', description: '适合介绍文创产品和特产' },
  { id: 'event_activity', name: '活动推广', description: '适合宣传各类活动和节庆' }
]

function ContentGeneratePage() {
  const navigate = useNavigate()
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>([])
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])
  const [customKeywords, setCustomKeywords] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [articles, setArticles] = useState<Array<{
    id: string
    platform: PlatformType
    title: string
    content: string
    status: string
  }>>([])
  const [error, setError] = useState('')

  const togglePlatform = (platform: PlatformType) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const toggleScenario = (scenarioId: string) => {
    setSelectedScenarios(prev =>
      prev.includes(scenarioId)
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    )
  }

  const handlePublish = async (articleId: string, platform: PlatformType) => {
    setIsPublishing(true)
    try {
      const response = await api.post('/platforms/distribute', {
        articleId,
        platform
      })
      if (response.data.success) {
        alert(response.data.data.message || '发布成功')
        // 刷新文章状态
        setArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, status: '已发布' }
            : article
        ))
      } else {
        alert('发布失败')
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || '发布失败')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleGenerate = async () => {
    if (selectedPlatforms.length === 0) {
      setError('请至少选择一个平台')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const response = await api.post('/content/generate', {
        targetPlatforms: selectedPlatforms,
        scenarios: selectedScenarios,
        customKeywords: customKeywords.split(',').map(k => k.trim()).filter(Boolean)
      })

      if (response.data.success) {
        setArticles(response.data.data.articles.map((a: any) => ({
          id: a.id,
          platform: a.targetPlatform,
          title: a.title,
          content: a.content,
          status: a.status
        })))
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '生成失败')
    } finally {
      setIsGenerating(false)
    }
  }

  const getPlatformName = (platform: PlatformType) => {
    return PLATFORMS.find(p => p.platform === platform)?.name || platform
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600"
          >
            <span>←</span>
            <span>返回</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900">AI 文案生成</h1>
          <div className="w-20" />
        </div>
      </nav>

      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 步骤 1: 选择平台 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">选择分发平台</h2>
          <p className="text-gray-500 mb-6">选择你想要发布内容的平台（可多选）</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.platform}
                onClick={() => togglePlatform(platform.platform)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedPlatforms.includes(platform.platform)
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-2">{platform.icon}</span>
                  <span className="font-medium text-gray-900 text-sm">{platform.name}</span>
                  {platform.isLlmFriendly && (
                    <span className="mt-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                      大模型友好
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 步骤 2: 选择场景类型 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">选择场景类型</h2>
          <p className="text-gray-500 mb-6">选择你想要宣传的内容场景（可多选）</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => toggleScenario(scenario.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedScenarios.includes(scenario.id)
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900 block">{scenario.name}</span>
                    <span className="text-xs text-gray-500">{scenario.description}</span>
                  </div>
                  {selectedScenarios.includes(scenario.id) && (
                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 步骤 3: 自定义关键词 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">自定义关键词（可选）</h2>
          <p className="text-gray-500 mb-4">添加额外的地理位置或业务关键词，用逗号分隔</p>

          <input
            type="text"
            value={customKeywords}
            onChange={(e) => setCustomKeywords(e.target.value)}
            placeholder="如：望京SOHO, 花家地, 阜通"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* 生成按钮 */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              AI 正在生成中...
            </>
          ) : (
            '生成宣传文案'
          )}
        </button>

        {/* 生成结果 */}
        {articles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">生成结果</h2>
            
            <div className="space-y-6">
              {articles.map((article) => (
                <div key={article.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      {getPlatformName(article.platform)}
                    </span>
                    <span className="text-xs text-gray-400">{article.status}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{article.title}</h3>
                  
                  <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed font-sans">
                      {article.content}
                    </pre>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      编辑
                    </button>
                    <button
                      onClick={() => handlePublish(article.id, article.platform)}
                      disabled={isPublishing}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      {isPublishing ? '发布中...' : `发布到 ${getPlatformName(article.platform)}`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentGeneratePage
