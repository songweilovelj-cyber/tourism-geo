import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { GeoLocationDto, ServiceDto, ReviewDto } from '@/types/api'

interface ProviderProfile {
  id: string
  nickname: string
  avatar?: string
  bio?: string
  city: string
  district?: string
  isVerified: boolean
  avgRating: number
  reviewCount: number
  geoLocation?: GeoLocationDto
  services: Array<ServiceDto & { category: { id: string; name: string } }>
  recentReviews: ReviewDto[]
  phoneMasked: string
}

function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [provider, setProvider] = useState<ProviderProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeService, setActiveService] = useState<string | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)

  useEffect(() => {
    const fetchProvider = async () => {
      if (!id) return
      
      try {
        const response = await api.get(`/providers/${id}`)
        if (response.data.success) {
          setProvider(response.data.data)
          if (response.data.data.services?.length > 0) {
            setActiveService(response.data.data.services[0].id)
          }
        }
      } catch (err) {
        setError('服务者不存在或已下架')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProvider()
  }, [id])

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 渲染星星评分
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-gray-600 font-medium">{rating.toFixed(1)}</span>
      </div>
    )
  }

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

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">服务者不存在</h2>
          <p className="text-gray-500 mb-6">该服务者可能已下架或不存在</p>
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

  const currentService = provider.services.find(s => s.id === activeService)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600"
          >
            <span>←</span>
            <span>返回</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900">服务者主页</h1>
          <button
            onClick={() => navigate('/')}
            className="text-orange-500 text-sm font-medium"
          >
            首页
          </button>
        </div>
      </nav>

      {/* 头部信息 */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-3xl font-bold text-orange-500">
              {provider.avatar ? (
                <img src={provider.avatar} alt={provider.nickname} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                provider.nickname.charAt(0)
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{provider.nickname}</h1>
                {provider.isVerified && (
                  <span className="px-2 py-0.5 bg-white text-orange-600 text-xs rounded-full font-medium">
                    已认证
                  </span>
                )}
              </div>
              <p className="text-orange-100 mt-1">
                📍 {provider.city}{provider.district && ` · ${provider.district}`}
              </p>
              {provider.bio && (
                <p className="text-orange-100 mt-2 text-sm">{provider.bio}</p>
              )}
            </div>
          </div>
          
          {/* 评分和评价 */}
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(provider.avgRating) ? 'text-yellow-300' : 'text-orange-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="font-semibold">{provider.avgRating.toFixed(1)}</span>
            </div>
            <div className="text-orange-100">
              <span className="font-semibold text-white">{provider.reviewCount}</span> 条评价
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 服务列表 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">提供的服务</h2>
          </div>
          
          {/* 服务标签 */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2">
            {provider.services.map(service => (
              <button
                key={service.id}
                onClick={() => setActiveService(service.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeService === service.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {service.title}
              </button>
            ))}
          </div>
          
          {/* 服务详情 */}
          {currentService && (
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{currentService.title}</h3>
                  <p className="text-sm text-orange-500 mt-1">
                    分类：{currentService.category?.name}
                  </p>
                </div>
                {currentService.minPrice && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-500">
                      ¥{currentService.minPrice}
                      {currentService.maxPrice && ` - ${currentService.maxPrice}`}
                    </div>
                    {currentService.priceUnit && (
                      <div className="text-sm text-gray-500">{currentService.priceUnit}</div>
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 leading-relaxed">{currentService.description}</p>
              
              {/* 标签 */}
              {currentService.tags && currentService.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {currentService.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* 联系方式 */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold text-lg"
                >
                  获取联系方式
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 位置信息 */}
        {provider.geoLocation && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">位置信息</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 flex items-start gap-2">
                <span className="text-orange-500">📍</span>
                {provider.geoLocation.fullAddress}
              </p>
              {provider.geoLocation.serviceRadiusKm && (
                <p className="text-gray-500 text-sm mt-2">
                  服务范围：周边 {provider.geoLocation.serviceRadiusKm} 公里
                </p>
              )}
              {/* 地图预览 */}
              <div className="mt-4 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-2xl mb-1">🗺️</div>
                  <p className="text-sm">地图加载中...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 用户评价 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">用户评价</h2>
            <span className="text-gray-500 text-sm">
              共 {provider.reviewCount} 条评价
            </span>
          </div>
          
          {provider.recentReviews && provider.recentReviews.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {provider.recentReviews.map(review => (
                <div key={review.id} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                        {review.reviewerName?.charAt(0) || '匿名'}
                      </div>
                      <span className="font-medium text-gray-900">
                        {review.reviewerName || '匿名用户'}
                      </span>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 text-sm mt-2">{review.comment}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-2">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-gray-500">暂无评价</p>
            </div>
          )}
        </div>
      </div>

      {/* 联系弹窗 */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              获取联系方式
            </h3>
            <div className="text-center mb-6">
              <p className="text-gray-500 text-sm mb-2">服务者联系方式</p>
              <p className="text-2xl font-bold text-orange-500">{provider.phoneMasked}</p>
              <p className="text-xs text-gray-400 mt-2">（完整号码仅在预约后可见）</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium"
              >
                我知道了
              </button>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProviderProfilePage
