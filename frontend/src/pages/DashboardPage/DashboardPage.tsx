import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { authStore } from '@/stores/authStore'
import { MediaUploader } from '@/components/media/MediaUploader'
import { PlatformType } from '@/types/api'

// 统计数据接口
interface DashboardStats {
  totalArticles: number
  publishedArticles: number
  distributionSuccess: number
  indexedCount: number
  totalViews: number
  avgRating: number
  reviewCount: number
  totalCommission: number
  pendingOrders: number
}

interface Article {
  id: string
  targetPlatform: PlatformType
  title: string
  content: string
  status: string
  generatedAt: string
  distributions: Array<{
    id: string
    platform: string
    externalUrl?: string
    status: string
    viewCount: number
  }>
}

interface DistributionLink {
  id: string
  linkType: string
  linkUrl: string
  platform: string
  commissionRate: number | null
  isActive: boolean
  stats: {
    totalOrders: number
    totalAmount: number
    totalCommission: number
  }
}

// 平台配置
const PLATFORM_CONFIG: Record<string, { name: string; icon: string; requireEnterprise?: boolean }> = {
  ZHIHU_QA: { name: '知乎问答', icon: '📝', requireEnterprise: true },
  ZHIHU_ARTICLE: { name: '知乎文章', icon: '📄', requireEnterprise: true },
  XIAOHONGSHU: { name: '小红书', icon: '📕', requireEnterprise: true },
  WECHAT: { name: '微信公众号', icon: '💬', requireEnterprise: true },
  TOUTIAO: { name: '头条号', icon: '📰', requireEnterprise: true },
  DOUYIN: { name: '抖音', icon: '🎵', requireEnterprise: true },
  LANDING_PAGE: { name: '平台落地页', icon: '🏠' }
}

// 资源类型配置
const RESOURCE_TYPE_CONFIG: Record<string, { name: string; icon: string }> = {
  SCENIC_SPOT: { name: '景区景点', icon: '🏔️' },
  HOTEL: { name: '酒店民宿', icon: '🏨' },
  CREATIVE_SHOP: { name: '文创特产', icon: '🎁' },
  PLAY_ITEM: { name: '游玩项目', icon: '🎢' },
  SECOND_CONSUME: { name: '景区二消', icon: '🍜' }
}

function DashboardPage() {
  const navigate = useNavigate()
  const { provider, setProvider } = authStore()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'resource' | 'media' | 'content' | 'distribution' | 'exhibition'>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [distributionLinks, setDistributionLinks] = useState<DistributionLink[]>([])
  const [platformAccounts, setPlatformAccounts] = useState<any[]>([])
  const [error, setError] = useState('')
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [editContent, setEditContent] = useState('')
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [newLink, setNewLink] = useState({
    linkType: 'DIRECT_LINK',
    linkUrl: '',
    platform: '',
    commissionRate: ''
  })

  // 媒体文件状态
  interface MediaFile {
    id: string
    mediaType: 'IMAGE' | 'VIDEO'
    url: string
    fileName: string
    fileSize: number
    isPrimary: boolean
  }
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])

  // 获取媒体文件
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await api.get('/media')
        if (response.data.success) {
          const files: MediaFile[] = response.data.data.map((f: any) => ({
            id: f.id,
            mediaType: f.mediaType,
            url: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}${f.url}`,
            fileName: f.fileName,
            fileSize: f.fileSize,
            isPrimary: f.isPrimary
          }))
          setMediaFiles(files)
        }
      } catch (err) {
        console.error('Failed to fetch media files')
      }
    }
    fetchMedia()
  }, [])

  // 获取主图
  const primaryImage = mediaFiles.find(f => f.isPrimary)

  // 处理媒体上传完成
  const handleMediaUploadComplete = (files: MediaFile[]) => {
    setMediaFiles(prev => [...prev, ...files])
  }

  // 处理媒体删除
  const handleMediaDelete = (id: string) => {
    setMediaFiles(prev => prev.filter(f => f.id !== id))
  }

  // 保存媒体设置
  const handleSaveMedia = async () => {
    try {
      const response = await api.post('/resources/me', {
        avatar: primaryImage?.url
      })
      if (response.data.success) {
        alert('保存成功')
      }
    } catch (err) {
      console.error('保存失败:', err)
      alert('保存失败')
    }
  }

  // 获取用户信息
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/resources/me')
        if (response.data.success) {
          const data = response.data.data
          setProvider(data)
          setPlatformAccounts(data.platformAccounts || [])
          
          // 获取分销链接
          const linksResponse = await api.get('/distribution-links')
          if (linksResponse.data.success) {
            setDistributionLinks(linksResponse.data.data || [])
          }
        }
      } catch (err) {
        console.error('Failed to fetch resource data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [setProvider])

  // 获取统计数据和文章
  useEffect(() => {
    const fetchStatsAndArticles = async () => {
      try {
        // 获取文章列表
        const articlesResponse = await api.get('/content/articles?limit=10')
        if (articlesResponse.data.success) {
          setArticles(articlesResponse.data.data.articles || [])
          
          // 计算统计数据
          const arts = articlesResponse.data.data.articles || []
          const statsData: DashboardStats = {
            totalArticles: arts.length,
            publishedArticles: arts.filter((a: Article) => a.status === 'PUBLISHED').length,
            distributionSuccess: arts.flatMap((a: Article) => a.distributions || [])
              .filter((d: any) => d.status === 'SUCCESS').length,
            indexedCount: arts.filter((a: Article) => 
              a.distributions?.some((d: any) => d.externalUrl)
            ).length,
            totalViews: arts.flatMap((a: Article) => a.distributions || [])
              .reduce((sum: number, d: any) => sum + (d.viewCount || 0), 0),
            avgRating: provider?.avgRating || 0,
            reviewCount: provider?.reviewCount || 0,
            totalCommission: distributionLinks.reduce((sum, l) => sum + l.stats.totalCommission, 0),
            pendingOrders: distributionLinks.reduce((sum, l) => sum + l.stats.totalOrders, 0)
          }
          setStats(statsData)
        }
      } catch (err) {
        console.error('Failed to fetch articles')
      }
    }
    
    if (provider) {
      fetchStatsAndArticles()
    }
  }, [provider, distributionLinks])

  // 创建分销链接
  const handleCreateLink = async () => {
    if (!newLink.linkUrl) {
      alert('请输入链接地址')
      return
    }
    
    try {
      const response = await api.post('/distribution-links', {
        linkType: newLink.linkType,
        linkUrl: newLink.linkUrl,
        platform: newLink.platform || '自有',
        commissionRate: newLink.commissionRate ? parseFloat(newLink.commissionRate) : null
      })
      
      if (response.data.success) {
        setDistributionLinks(prev => [...prev, response.data.data])
        setShowLinkModal(false)
        setNewLink({ linkType: 'DIRECT_LINK', linkUrl: '', platform: '', commissionRate: '' })
        alert('分销链接创建成功')
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || '创建失败')
    }
  }

  // 删除分销链接
  const handleDeleteLink = async (id: string) => {
    if (!confirm('确定要删除该链接吗？')) return
    
    try {
      await api.delete(`/distribution-links/${id}`)
      setDistributionLinks(prev => prev.filter(l => l.id !== id))
    } catch (err) {
      alert('删除失败')
    }
  }

  // 跳转到平台授权
  const handleAuthorize = async (platform: string) => {
    const config = PLATFORM_CONFIG[platform]
    
    if (config?.requireEnterprise) {
      const confirmed = window.confirm(
        `${config.name}需要企业资质认证才能申请API。\n\n` +
        `个人运营者建议使用「平台落地页」作为主要分发渠道。\n\n` +
        `点击「确定」将直接绑定模拟账号（仅供测试）。`
      )
      
      if (!confirmed) return
    }
    
    try {
      const response = await api.get(`/platforms/authorize/${platform}`)
      if (response.data.success && response.data.data.authUrl) {
        window.location.href = response.data.data.authUrl
      }
    } catch (err) {
      setError(`获取${config?.name || platform}授权链接失败`)
    }
  }

  // 编辑文章
  const handleEdit = (article: Article) => {
    setEditingArticle(article)
    setEditContent(article.content || '')
  }

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingArticle) return
    
    try {
      const response = await api.put(`/content/articles/${editingArticle.id}`, {
        content: editContent
      })
      if (response.data.success) {
        setArticles(prev => prev.map(a => 
          a.id === editingArticle.id 
            ? { ...a, content: editContent }
            : a
        ))
        setEditingArticle(null)
        setEditContent('')
        alert('保存成功')
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || '保存失败')
    }
  }

  // 发布文章到平台
  const handlePublishAndCopy = async (article: Article, platform: string) => {
    const fullContent = `# ${article.title}\n\n${article.content}`
    
    try {
      await navigator.clipboard.writeText(fullContent)
    } catch (err) {
      const textarea = document.createElement('textarea')
      textarea.value = fullContent
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    
    const platformUrls: Record<string, { url: string; successTip: string }> = {
      'ZHIHU_ARTICLE': {
        url: 'https://zhuanlan.zhihu.com/write',
        successTip: '已复制文章内容，请粘贴到知乎创作页面'
      },
      'XIAOHONGSHU': {
        url: 'https://creator.xiaohongshu.com/creator/post',
        successTip: '已复制笔记内容，请粘贴到小红书创作页面'
      },
      'WECHAT': {
        url: 'https://mp.weixin.qq.com/',
        successTip: '已复制文章内容，请粘贴到微信公众号后台'
      }
    }
    
    const target = platformUrls[platform]
    if (target?.url) {
      window.open(target.url, '_blank')
      alert(target.successTip)
    }
  }

  // 发布到落地页
  const handlePublish = async (articleId: string, platform: string) => {
    try {
      const response = await api.post('/platforms/distribute', {
        articleId,
        platform
      })
      if (response.data.success) {
        alert(response.data.data.message || '发布成功')
        window.location.reload()
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || '发布失败')
    }
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // 格式化金额
  const formatMoney = (amount: number) => {
    return `¥${amount.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  const resourceType = RESOURCE_TYPE_CONFIG[provider?.resourceType || ''] || { name: '文旅资源', icon: '📍' }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center text-white text-lg">
                {resourceType.icon}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{provider?.name || '文旅资源'}</div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  {resourceType.icon} {resourceType.name}
                  {provider?.isVerified && <span className="text-green-600">✓ 已认证</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/content/generate')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                AI 生成文案
              </button>
              <a
                href={`/r/${provider?.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm inline-block"
              >
                预览主页
              </a>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 标签页 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { key: 'overview', label: '总览', icon: '📊' },
              { key: 'resource', label: '基本信息', icon: '📍' },
              { key: 'media', label: '图片视频', icon: '📷' },
              { key: 'content', label: '内容管理', icon: '📝' },
              { key: 'distribution', label: '分销链接', icon: '🔗' },
              { key: 'exhibition', label: '策展方案', icon: '🏛️' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 总览 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-green-600">{stats?.totalArticles || 0}</div>
                <div className="text-gray-500 text-sm mt-1">生成文章</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-blue-600">{stats?.publishedArticles || 0}</div>
                <div className="text-gray-500 text-sm mt-1">已发布</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-orange-600">{stats?.avgRating.toFixed(1) || '0.0'}</div>
                <div className="text-gray-500 text-sm mt-1">综合评分</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-purple-600">{stats?.reviewCount || 0}</div>
                <div className="text-gray-500 text-sm mt-1">用户评价</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-red-600">{stats?.pendingOrders || 0}</div>
                <div className="text-gray-500 text-sm mt-1">成交订单</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-yellow-600">{formatMoney(stats?.totalCommission || 0)}</div>
                <div className="text-gray-500 text-sm mt-1">累计佣金</div>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">快捷操作</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <button
                  onClick={() => setActiveTab('resource')}
                  className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">📍</div>
                  <div className="text-sm font-medium text-gray-700">编辑信息</div>
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">📷</div>
                  <div className="text-sm font-medium text-gray-700">上传图片</div>
                </button>
                <button
                  onClick={() => navigate('/content/generate')}
                  className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">✨</div>
                  <div className="text-sm font-medium text-gray-700">AI 文案</div>
                </button>
                <button
                  onClick={() => navigate('/exhibition')}
                  className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">🏛️</div>
                  <div className="text-sm font-medium text-gray-700">策展方案</div>
                </button>
                <button
                  onClick={() => setActiveTab('distribution')}
                  className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">🔗</div>
                  <div className="text-sm font-medium text-gray-700">分销链接</div>
                </button>
                <button
                  onClick={() => setActiveTab('content')}
                  className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-sm font-medium text-gray-700">内容分发</div>
                </button>
                <a
                  href={`/r/${provider?.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors text-center block"
                >
                  <div className="text-2xl mb-2">👁️</div>
                  <div className="text-sm font-medium text-gray-700">预览主页</div>
                </a>
              </div>
            </div>

            {/* 分销链接概览 */}
            {distributionLinks.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">分销链接概览</h3>
                  <button
                    onClick={() => setActiveTab('distribution')}
                    className="text-green-600 text-sm hover:underline"
                  >
                    查看全部
                  </button>
                </div>
                <div className="space-y-3">
                  {distributionLinks.slice(0, 3).map(link => (
                    <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{link.platform}</div>
                        <div className="text-xs text-gray-400">
                          {link.linkType === 'DIRECT_LINK' ? '直联预订' : '分销链接'}
                          {link.commissionRate && ` · 佣金 ${link.commissionRate}%`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">{formatMoney(link.stats.totalCommission)}</div>
                        <div className="text-xs text-gray-400">{link.stats.totalOrders} 笔订单</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 基本信息 */}
        {activeTab === 'resource' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">基本信息</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">资源名称</label>
                  <div className="text-gray-900 mt-1">{provider?.name}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">资源类型</label>
                  <div className="text-gray-900 mt-1 flex items-center gap-2">
                    {resourceType.icon} {resourceType.name}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">所在城市</label>
                  <div className="text-gray-900 mt-1">{provider?.city} {provider?.district}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">所属景区</label>
                  <div className="text-gray-900 mt-1">{provider?.scenicArea || '未设置'}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">分类</label>
                  <div className="text-gray-900 mt-1">{provider?.category?.name}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">认证状态</label>
                  <div className="mt-1">
                    {provider?.isVerified ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">已认证</span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">未认证</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm text-gray-500">资源描述</label>
                <div className="text-gray-900 mt-1">{provider?.description || '暂无描述'}</div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/onboarding')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  编辑基本信息
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 图片视频 */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">图片和视频管理</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    上传精美的图片和视频，让游客更直观地了解您的文旅资源。建议上传景区环境、客房设施、特色项目等图片。
                  </p>
                </div>
                <button
                  onClick={handleSaveMedia}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  保存设置
                </button>
              </div>
              
              {/* 主图展示 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">主图展示</h4>
                <div className="flex gap-4">
                  {primaryImage ? (
                    <div className="relative w-48 h-32 rounded-lg overflow-hidden border-2 border-green-500">
                      <img
                        src={primaryImage.url}
                        alt="主图"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs rounded">主图</div>
                    </div>
                  ) : (
                    <div className="w-48 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">暂无主图</span>
                    </div>
                  )}
                  <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">主图将作为您文旅资源的封面展示</p>
                    <p className="text-xs text-gray-400 mt-2">建议尺寸：1200 x 800 像素</p>
                  </div>
                </div>
              </div>

              <MediaUploader 
                initialFiles={mediaFiles}
                onUploadComplete={handleMediaUploadComplete}
                onFileDelete={handleMediaDelete}
              />
            </div>
          </div>
        )}

        {/* 内容管理 */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">内容管理</h2>
              <button
                onClick={() => navigate('/content/generate')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                生成新内容
              </button>
            </div>

            {articles.length === 0 ? (
              <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">还没有生成任何内容</h3>
                <p className="text-gray-500 mb-6">使用 AI 一键生成多平台宣传文案，让大模型认识你的文旅资源</p>
                <button
                  onClick={() => navigate('/content/generate')}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium"
                >
                  立即生成
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map(article => (
                  <div key={article.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{PLATFORM_CONFIG[article.targetPlatform]?.icon || '📝'}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{article.title}</h3>
                          <p className="text-sm text-gray-500">
                            {PLATFORM_CONFIG[article.targetPlatform]?.name} · {formatDate(article.generatedAt)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        article.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-700' 
                          : article.status === 'APPROVED'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {article.status === 'PUBLISHED' ? '已发布' : article.status === 'APPROVED' ? '已审核' : '草稿'}
                      </span>
                    </div>
                    
                    {editingArticle?.id === article.id ? (
                      <>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full h-40 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 text-sm resize-none"
                        />
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => setEditingArticle(null)}
                            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
                          >
                            取消
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            保存
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{article.content?.slice(0, 200)}...</p>
                        
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEdit(article)}
                            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
                          >
                            编辑
                          </button>
                          <button 
                            onClick={() => handlePublish(article.id, 'LANDING_PAGE')}
                            disabled={article.status === 'PUBLISHED'}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                          >
                            {article.status === 'PUBLISHED' ? '✓ 已发布' : '发布到落地页'}
                          </button>
                          <button
                            onClick={() => handlePublishAndCopy(article, 'ZHIHU_ARTICLE')}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                          >
                            📝 复制到知乎
                          </button>
                          <button
                            onClick={() => handlePublishAndCopy(article, 'XIAOHONGSHU')}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                          >
                            📕 复制到小红书
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 分销链接 */}
        {activeTab === 'distribution' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">分销链接</h2>
                <p className="text-sm text-gray-500 mt-1">设置预订链接或分销链接，让游客直接预订，成交可获得佣金</p>
              </div>
              <button
                onClick={() => setShowLinkModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                添加链接
              </button>
            </div>

            {distributionLinks.length === 0 ? (
              <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
                <div className="text-6xl mb-4">🔗</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">还没有设置分销链接</h3>
                <p className="text-gray-500 mb-6">添加预订链接或分销链接，让游客可以直接预订或购买</p>
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium"
                >
                  添加第一个链接
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {distributionLinks.map(link => (
                  <div key={link.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{link.platform}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            link.linkType === 'DIRECT_LINK' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {link.linkType === 'DIRECT_LINK' ? '直联预订' : '分销链接'}
                          </span>
                          {link.isActive ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">启用</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">停用</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1 truncate max-w-md">{link.linkUrl}</p>
                        {link.commissionRate && (
                          <p className="text-sm text-orange-600 mt-1">佣金比例：{link.commissionRate}%</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{link.stats.totalOrders}</div>
                        <div className="text-sm text-gray-500">成交订单</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{formatMoney(link.stats.totalAmount)}</div>
                        <div className="text-sm text-gray-500">订单金额</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{formatMoney(link.stats.totalCommission)}</div>
                        <div className="text-sm text-gray-500">获得佣金</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 策展方案 */}
        {activeTab === 'exhibition' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">策展方案</h2>
                <p className="text-sm text-gray-500 mt-1">通过AI辅助生成专业的博物馆策展方案</p>
              </div>
              <button
                onClick={() => navigate('/exhibition/new')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                新建方案
              </button>
            </div>
            
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
              <div className="text-6xl mb-4">🏛️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">博物馆策展方案生成器</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                通过步骤式输入，让AI理解你的策展需求，生成专业的博物馆策展方案。
                支持灵魂展品配置、展区规划、展陈设计等完整功能。
              </p>
              <button
                onClick={() => navigate('/exhibition')}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium"
              >
                查看我的方案
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 添加链接弹窗 */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">添加分销链接</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">链接类型</label>
                <select
                  value={newLink.linkType}
                  onChange={(e) => setNewLink(prev => ({ ...prev, linkType: e.target.value }))}
                  className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="DIRECT_LINK">直联预订链接</option>
                  <option value="DISTRIBUTION">分销链接</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500">预订平台</label>
                <input
                  type="text"
                  value={newLink.platform}
                  onChange={(e) => setNewLink(prev => ({ ...prev, platform: e.target.value }))}
                  placeholder="如：携程、美团、自有"
                  className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">链接地址</label>
                <input
                  type="url"
                  value={newLink.linkUrl}
                  onChange={(e) => setNewLink(prev => ({ ...prev, linkUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {newLink.linkType === 'DISTRIBUTION' && (
                <div>
                  <label className="text-sm text-gray-500">佣金比例 (%)</label>
                  <input
                    type="number"
                    value={newLink.commissionRate}
                    onChange={(e) => setNewLink(prev => ({ ...prev, commissionRate: e.target.value }))}
                    placeholder="如：10"
                    min="0"
                    max="100"
                    className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLinkModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCreateLink}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage