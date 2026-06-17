import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '@/api/client'
import MapPicker from '@/components/map/MapPicker'

// 搜索结果接口
interface SearchResult {
  resourceId: string
  name: string
  avatar?: string
  resourceType: string
  categoryName: string
  distanceKm: number
  address: string
  city: string
  district?: string
  scenicArea?: string
  priceRange?: string
  rating: number
  reviewCount: number
  isVerified: boolean
  landingUrl: string
}

// 资源类型配置
const RESOURCE_TYPE_CONFIG: Record<string, { name: string; icon: string; color: string }> = {
  SCENIC_SPOT: { name: '景区景点', icon: '🏔️', color: 'from-blue-100 to-blue-200' },
  HOTEL: { name: '酒店民宿', icon: '🏨', color: 'from-purple-100 to-purple-200' },
  CREATIVE_SHOP: { name: '文创特产', icon: '🎁', color: 'from-pink-100 to-pink-200' },
  PLAY_ITEM: { name: '游玩项目', icon: '🎢', color: 'from-orange-100 to-orange-200' },
  SECOND_CONSUME: { name: '景区二消', icon: '🍜', color: 'from-yellow-100 to-yellow-200' }
}

// 文旅资源分类
const CATEGORIES = [
  { id: 'all', name: '全部', icon: '📍' },
  { id: 'SCENIC_SPOT', name: '景区景点', icon: '🏔️' },
  { id: 'HOTEL', name: '酒店民宿', icon: '🏨' },
  { id: 'CREATIVE_SHOP', name: '文创特产', icon: '🎁' },
  { id: 'PLAY_ITEM', name: '游玩项目', icon: '🎢' },
  { id: 'SECOND_CONSUME', name: '景区二消', icon: '🍜' }
]

function SearchResultsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showMap, setShowMap] = useState(false)
  
  // 搜索状态
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('q') || '')
  const [radius, setRadius] = useState(10)

  // 初始化位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          // 默认黄山
          setUserLocation({ lat: 30.1332, lng: 118.1694 })
        }
      )
    } else {
      setUserLocation({ lat: 30.1332, lng: 118.1694 })
    }
  }, [])

  // 搜索
  const handleSearch = async () => {
    if (!userLocation) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams({
        lat: String(userLocation.lat),
        lng: String(userLocation.lng),
        radius_km: String(radius),
        limit: '20',
        offset: String((page - 1) * 20)
      })
      
      if (searchKeyword) {
        params.set('keyword', searchKeyword)
        setSearchParams({ q: searchKeyword })
      }
      
      if (selectedCategory !== 'all') {
        params.set('resource_type', selectedCategory)
      }
      
      const response = await api.get(`/geo/search?${params.toString()}`)
      
      if (response.data.success) {
        setResults(response.data.data.results || [])
        setTotal(response.data.data.total || 0)
      }
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }

  // 监听位置和筛选条件变化
  useEffect(() => {
    if (userLocation) {
      handleSearch()
    }
  }, [userLocation, page, selectedCategory, radius])

  // 渲染星星评分
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-gray-600 text-sm">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部搜索栏 */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索文旅资源，如：黄山民宿、黄山文创"
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium"
            >
              搜索
            </button>
          </div>
          
          {/* 筛选栏 */}
          <div className="flex items-center gap-4 mt-4 overflow-x-auto pb-2">
            {/* 分类筛选 */}
            <div className="flex gap-2 flex-shrink-0">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    selectedCategory === cat.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
            
            {/* 距离筛选 */}
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none"
            >
              <option value={5}>5公里内</option>
              <option value={10}>10公里内</option>
              <option value={20}>20公里内</option>
              <option value={50}>50公里内</option>
            </select>
            
            {/* 地图切换 */}
            <button
              onClick={() => setShowMap(!showMap)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
                showMap
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🗺️ {showMap ? '列表' : '地图'}
            </button>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* 结果统计 */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-500">
            找到 <span className="font-semibold text-gray-900">{total}</span> 个文旅资源
          </p>
          {userLocation && (
            <p className="text-sm text-gray-400">
              📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">搜索中...</p>
          </div>
        )}

        {/* 结果列表 */}
        {!loading && (
          <>
            {showMap ? (
              /* 地图视图 */
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-96 relative">
                  <MapPicker
                    onChange={(location) => {
                      setUserLocation({ lat: location.lat, lng: location.lng })
                    }}
                  />
                </div>
              </div>
            ) : (
              /* 列表视图 */
              <div className="space-y-4">
                {results.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <div className="text-6xl mb-4">🏔️</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">没有找到相关文旅资源</h3>
                    <p className="text-gray-500 mb-6">试试其他关键词或扩大搜索范围</p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setRadius(50)}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        扩大范围
                      </button>
                      <button
                        onClick={() => {
                          setSearchKeyword('')
                          handleSearch()
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        清除筛选
                      </button>
                    </div>
                  </div>
                ) : (
                  results.map((result) => {
                    const typeConfig = RESOURCE_TYPE_CONFIG[result.resourceType] || { name: '文旅资源', icon: '📍', color: 'from-gray-100 to-gray-200' }
                    return (
                      <div
                        key={result.resourceId}
                        onClick={() => navigate(`/r/${result.resourceId}`)}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-200 transition-all cursor-pointer"
                      >
                        <div className="flex gap-4">
                          {/* 头像/封面 */}
                          <div className={`w-20 h-20 bg-gradient-to-br ${typeConfig.color} rounded-xl flex items-center justify-center text-3xl flex-shrink-0`}>
                            {result.avatar ? (
                              <img src={result.avatar} alt={result.name} className="w-full h-full rounded-xl object-cover" />
                            ) : (
                              typeConfig.icon
                            )}
                          </div>
                          
                          {/* 信息 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-gray-900">{result.name}</h3>
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    {typeConfig.icon} {typeConfig.name}
                                  </span>
                                  {result.isVerified && (
                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                                      ✓ 已认证
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                                  <span>📍</span>
                                  {result.city} {result.district}
                                  {result.scenicArea && <span>· {result.scenicArea}</span>}
                                </p>
                              </div>
                              {result.priceRange && (
                                <div className="text-green-600 font-semibold">
                                  {result.priceRange}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-3">
                                {renderStars(result.rating)}
                                <span className="text-sm text-gray-400">
                                  {result.reviewCount}条评价
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                <span>📍</span>
                                <span>距离 {result.distanceKm.toFixed(1)}km</span>
                              </div>
                            </div>
                            
                            {/* 分类标签 */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                                {result.categoryName}
                              </span>
                              <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full">
                                {result.address}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* 分页 */}
            {total > 20 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  上一页
                </button>
                <span className="px-4 py-2 text-gray-600">
                  第 {page} / {Math.ceil(total / 20)} 页
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 20)}
                  className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SearchResultsPage