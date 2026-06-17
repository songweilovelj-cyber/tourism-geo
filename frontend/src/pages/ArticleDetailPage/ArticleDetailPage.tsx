import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'

interface ArticleDetail {
  id: string
  targetPlatform: string
  title: string
  content: string
  seoKeywords: string[]
  geoKeywords: string[]
  status: string
  generatedAt: string
  provider: {
    id: string
    nickname: string
    avatar?: string
    city: string
    avgRating: number
    reviewCount: number
  }
}

function ArticleDetailPage() {
  const { providerId, articleId } = useParams<{ providerId: string; articleId: string }>()
  const navigate = useNavigate()
  
  const [article, setArticle] = useState<ArticleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchArticle = async () => {
      if (!providerId || !articleId) return
      
      try {
        const response = await api.get(`/content/articles/${articleId}/public`)
        if (response.data.success) {
          setArticle(response.data.data)
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || '获取文章失败')
      } finally {
        setLoading(false)
      }
    }
    
    fetchArticle()
  }, [providerId, articleId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">文章不存在</h2>
          <p className="text-gray-500 mb-6">{error || '该文章可能已删除或不存在'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/p/${providerId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600"
          >
            <span>←</span>
            <span>返回服务者主页</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900">服务详情</h1>
          <div className="w-32"></div>
        </div>
      </nav>

      {/* 文章内容 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 文章头部 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* 服务者信息 */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center text-xl font-bold text-orange-600">
                {article.provider.avatar ? (
                  <img src={article.provider.avatar} alt={article.provider.nickname} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  article.provider.nickname.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-900">{article.provider.nickname}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-gray-500 text-sm">📍 {article.provider.city}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-gray-600 text-sm">{article.provider.avgRating}</span>
                    <span className="text-gray-400 text-sm">({article.provider.reviewCount}条评价)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 文章标题 */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                平台落地页
              </span>
              <span className="text-gray-400 text-sm">{formatDate(article.generatedAt)}</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{article.title}</h1>
            
            {/* 文章内容 */}
            <div className="prose prose-lg max-w-none">
              {article.content.split('\n').map((paragraph, index) => (
                <p key={index} className="text-gray-600 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* 关键词标签 */}
            {article.seoKeywords.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-3">相关标签</h3>
                <div className="flex flex-wrap gap-2">
                  {article.seoKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      #{keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* GEO关键词 */}
            {article.geoKeywords.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">服务区域</h3>
                <div className="flex flex-wrap gap-2">
                  {article.geoKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-50 text-orange-600 text-sm rounded-full"
                    >
                      📍 {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 联系服务者 */}
        <div className="mt-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-2">需要这项服务？</h3>
          <p className="text-orange-100 mb-4">点击下方按钮联系服务者获取更多信息</p>
          <button
            onClick={() => navigate(`/p/${providerId}`)}
            className="px-6 py-3 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition-colors font-semibold"
          >
            联系 {article.provider.nickname}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ArticleDetailPage
