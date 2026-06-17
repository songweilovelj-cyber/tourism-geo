import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'

interface ResourceMedia {
  id: string
  mediaType: 'IMAGE' | 'VIDEO'
  url: string
  thumbnailUrl?: string
  title?: string
  isPrimary: boolean
}

interface ResourceProfile {
  id: string
  name: string
  avatar?: string
  description?: string
  city: string
  district?: string
  scenicArea?: string
  resourceType: string
  category: { id: string; name: string }
  isVerified: boolean
  avgRating: number
  reviewCount: number
  geoLocation?: { latitude: number; longitude: number; fullAddress: string }
  media: ResourceMedia[]
  distributionLinks: Array<{ id: string; linkType: string; linkUrl: string; platform: string; commissionRate: number | null }>
  recentReviews: Array<{ id: string; rating: number; comment?: string; reviewerName: string; createdAt: string }>
  phoneMasked: string
}

const RESOURCE_TYPE_CONFIG: Record<string, { name: string; icon: string; color: string }> = {
  SCENIC_SPOT: { name: '景区景点', icon: '🏔️', color: 'from-blue-100 to-blue-200' },
  HOTEL: { name: '酒店民宿', icon: '🏨', color: 'from-purple-100 to-purple-200' },
  CREATIVE_SHOP: { name: '文创特产', icon: '🎁', color: 'from-pink-100 to-pink-200' },
  PLAY_ITEM: { name: '游玩项目', icon: '🎢', color: 'from-orange-100 to-orange-200' },
  SECOND_CONSUME: { name: '景区二消', icon: '🍜', color: 'from-yellow-100 to-yellow-200' }
}

const MOCK_RESOURCES: Record<string, ResourceProfile> = {
  '1': {
    id: '1',
    name: '黄山风景区',
    description: '黄山，世界文化与自然双重遗产，世界地质公园，国家AAAAA级旅游景区。以奇松、怪石、云海、温泉、冬雪五绝著称于世。主峰莲花峰海拔1864米，是华东地区最高的山峰之一。黄山素有五岳归来不看山，黄山归来不看岳的美誉，吸引着无数中外游客前来观光游览。',
    city: '安徽省黄山市',
    district: '黄山区',
    scenicArea: '黄山风景区',
    resourceType: 'SCENIC_SPOT',
    category: { id: 'cat-scenic', name: '景区景点' },
    isVerified: true,
    avgRating: 4.9,
    reviewCount: 15680,
    geoLocation: { latitude: 30.1332, longitude: 118.1694, fullAddress: '安徽省黄山市黄山区黄山风景区' },
    media: [
      { id: 'm1', mediaType: 'IMAGE', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huangshan%20Mountain%20scenic%20area%20with%20beautiful%20pine%20trees%20and%20cloud%20sea%20landscape%20photography&image_size=landscape_16_9', isPrimary: true },
      { id: 'm2', mediaType: 'IMAGE', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sunrise%20at%20Huangshan%20Mountain%20golden%20light%20beautiful%20scenery&image_size=landscape_16_9', isPrimary: false },
      { id: 'm3', mediaType: 'IMAGE', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=winter%20snow%20covered%20Huangshan%20Mountain%20silver%20world%20beautiful&image_size=landscape_16_9', isPrimary: false }
    ],
    distributionLinks: [
      { id: 'd1', linkType: 'DIRECT_LINK', linkUrl: 'https://www.huangshan.gov.cn', platform: '官方网站', commissionRate: null },
      { id: 'd2', linkType: 'DIRECT_LINK', linkUrl: 'https://ctrip.com', platform: '携程', commissionRate: 5 }
    ],
    recentReviews: [
      { id: 'r1', rating: 5, comment: '黄山太美了！云海壮观，奇松怪石令人叹为观止。建议早上早起看日出，景色绝了！', reviewerName: '游客小王', createdAt: '2024-01-15' },
      { id: 'r2', rating: 5, comment: '冬季的黄山别有一番风味，银装素裹，宛如仙境。温泉也很舒服，值得一去。', reviewerName: '旅行达人', createdAt: '2024-01-10' },
      { id: 'r3', rating: 4, comment: '风景确实很美，但是山上住宿比较贵，建议提前预订。总体体验很好！', reviewerName: '背包客', createdAt: '2024-01-05' }
    ],
    phoneMasked: '400-888-8888'
  },
  '2': {
    id: '2',
    name: '云海民宿',
    description: '坐落于黄山脚下汤口镇的精品民宿，推窗即可欣赏到壮丽的山景和云海。民宿提供舒适的住宿环境、地道的徽州美食，以及专业的登山向导服务。让您在游览黄山的同时，享受家一般的温馨。',
    city: '安徽省黄山市',
    district: '黄山区',
    scenicArea: '黄山风景区',
    resourceType: 'HOTEL',
    category: { id: 'cat-hotel', name: '酒店民宿' },
    isVerified: true,
    avgRating: 4.8,
    reviewCount: 326,
    media: [
      { id: 'm1', mediaType: 'IMAGE', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20mountain%20homestay%20with%20beautiful%20view%20modern%20interior%20design&image_size=landscape_16_9', isPrimary: true },
      { id: 'm2', mediaType: 'IMAGE', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=comfortable%20hotel%20bedroom%20with%20mountain%20view%20window&image_size=landscape_16_9', isPrimary: false }
    ],
    distributionLinks: [
      { id: 'd1', linkType: 'DIRECT_LINK', linkUrl: 'https://www.yunhai-min.com', platform: '官网预订', commissionRate: null },
      { id: 'd2', linkType: 'DIRECT_LINK', linkUrl: 'https://meituan.com', platform: '美团', commissionRate: 8 }
    ],
    recentReviews: [
      { id: 'r1', rating: 5, comment: '老板人很好，服务周到。房间干净整洁，早餐也很丰盛。下次来黄山还住这里！', reviewerName: '游客小李', createdAt: '2024-01-14' },
      { id: 'r2', rating: 5, comment: '山景房视野超级好，早上推开窗户就是云海，太美了！强烈推荐！', reviewerName: '摄影师阿杰', createdAt: '2024-01-12' }
    ],
    phoneMasked: '0559-555-8888'
  },
  '3': {
    id: '3',
    name: '徽州文创馆',
    description: '传承徽州千年木雕技艺的文创精品店，每一件作品都由非遗传承人手工打造。主营徽州木雕、竹雕、砚台等工艺品，是选购伴手礼的绝佳去处。',
    city: '安徽省黄山市',
    district: '屯溪区',
    scenicArea: '黄山老街',
    resourceType: 'CREATIVE_SHOP',
    category: { id: 'cat-creative', name: '文创特产' },
    isVerified: true,
    avgRating: 5.0,
    reviewCount: 156,
    media: [
      { id: 'm1', mediaType: 'IMAGE', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20cultural%20craft%20shop%20with%20wood%20carvings%20and%20handicrafts&image_size=landscape_16_9', isPrimary: true }
    ],
    distributionLinks: [
      { id: 'd1', linkType: 'DIRECT_LINK', linkUrl: 'https://www.huizhou-art.com', platform: '线上商城', commissionRate: 10 }
    ],
    recentReviews: [
      { id: 'r1', rating: 5, comment: '买了几件木雕工艺品，做工精细，送给朋友很有面子。老板很热情，还给我讲了徽州木雕的历史。', reviewerName: '文化爱好者', createdAt: '2024-01-13' }
    ],
    phoneMasked: '0559-222-6666'
  },
  '4': {
    id: '4',
    name: '玉屏索道',
    description: '亚洲最长的高山索道之一，全长2176米，落差750米。乘坐索道可直达玉屏楼景区，俯瞰天都峰、莲花峰等著名景点，节省体力，轻松欣赏绝美山景。',
    city: '安徽省黄山市',
    district: '黄山区',
    scenicArea: '黄山风景区',
    resourceType: 'PLAY_ITEM',
    category: { id: 'cat-play', name: '游玩项目' },
    isVerified: true,
    avgRating: 4.7,
    reviewCount: 892,
    media: [
      { id: 'm1', mediaType: 'IMAGE', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cable%20car%20ropeway%20over%20mountain%20scenery%20tourism%20attraction&image_size=landscape_16_9', isPrimary: true }
    ],
    distributionLinks: [
      { id: 'd1', linkType: 'DIRECT_LINK', linkUrl: 'https://www.huangshan.gov.cn', platform: '官方渠道', commissionRate: null }
    ],
    recentReviews: [
      { id: 'r1', rating: 5, comment: '索道很稳，风景超棒！省去了爬山的辛苦，建议上山坐索道，下山步行。', reviewerName: '带娃出游', createdAt: '2024-01-11' }
    ],
    phoneMasked: '400-888-9999'
  },
  '5': {
    id: '5',
    name: '徽香源餐厅',
    description: '传承百年的徽州老字号，主打正宗徽菜。臭鳜鱼、毛豆腐、黄山烧饼等特色美食一应俱全，让您品尝地道的徽州味道。',
    city: '安徽省黄山市',
    district: '黄山区',
    scenicArea: '黄山风景区',
    resourceType: 'SECOND_CONSUME',
    category: { id: 'cat-second', name: '景区餐饮' },
    isVerified: true,
    avgRating: 4.9,
    reviewCount: 445,
    media: [
      { id: 'm1', mediaType: 'IMAGE', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20Huizhou%20cuisine%20restaurant%20elegant%20interior&image_size=landscape_16_9', isPrimary: true },
      { id: 'm2', mediaType: 'IMAGE', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20Chinese%20traditional%20dishes%20on%20beautiful%20plates&image_size=landscape_16_9', isPrimary: false }
    ],
    distributionLinks: [
      { id: 'd1', linkType: 'DIRECT_LINK', linkUrl: 'https://www.huixiangyuan.com', platform: '到店用餐', commissionRate: null }
    ],
    recentReviews: [
      { id: 'r1', rating: 5, comment: '臭鳜鱼太好吃了！虽然闻起来有点臭，但是吃起来特别香，值得一试。', reviewerName: '美食家', createdAt: '2024-01-14' },
      { id: 'r2', rating: 5, comment: '毛豆腐外酥里嫩，配上特制酱料绝了！服务员推荐的菜都很好吃，没有踩雷。', reviewerName: '吃货小王', createdAt: '2024-01-10' }
    ],
    phoneMasked: '0559-333-7777'
  }
}

function ResourceProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [resource, setResource] = useState<ResourceProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'gallery' | 'info' | 'reviews'>('gallery')

  useEffect(() => {
    const fetchResource = async () => {
      if (!id) return
      const mockResource = MOCK_RESOURCES[id]
      if (mockResource) {
        setResource(mockResource)
        setLoading(false)
        return
      }
      try {
        const response = await api.get(`/resources/${id}`)
        if (response.data.success) {
          setResource(response.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch resource')
      } finally {
        setLoading(false)
      }
    }
    fetchResource()
  }, [id])

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-gray-900 font-medium">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
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

  if (!resource) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">资源不存在</h2>
          <p className="text-gray-500 mb-6">该文旅资源可能已被删除或不存在</p>
          <button onClick={() => navigate('/search')} className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">
            返回搜索
          </button>
        </div>
      </div>
    )
  }

  const typeConfig = RESOURCE_TYPE_CONFIG[resource.resourceType] || { name: '文旅资源', icon: '📍', color: 'from-gray-100 to-gray-200' }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="font-bold text-gray-900">{resource.name}</h1>
                <p className="text-sm text-gray-500">{typeConfig.icon} {resource.category.name}</p>
              </div>
            </div>
            <button onClick={() => navigate('/search')} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm">
              返回搜索
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className={`h-32 bg-gradient-to-br ${typeConfig.color} flex items-center justify-center`}>
            {resource.media.length > 0 ? (
              <img src={resource.media[0].url} alt={resource.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-6xl">{typeConfig.icon}</span>
            )}
          </div>
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">{resource.name}</h2>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {typeConfig.icon} {typeConfig.name}
                  </span>
                  {resource.isVerified && (
                    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">✓ 已认证</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    📍 {resource.city} {resource.district}
                    {resource.scenicArea && `· ${resource.scenicArea}`}
                  </span>
                </div>
              </div>
              <div className="text-right">
                {renderStars(resource.avgRating)}
                <p className="text-sm text-gray-500 mt-1">{resource.reviewCount} 条评价</p>
              </div>
            </div>

            {resource.distributionLinks.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {resource.distributionLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                      link.linkType === 'DIRECT_LINK' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {link.linkType === 'DIRECT_LINK' ? '📱' : '🔗'} {link.platform}预订
                    {link.commissionRate && <span className="ml-1 text-sm opacity-80">· 佣金{link.commissionRate}%</span>}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'gallery', label: '图片/视频', icon: '📷' },
              { key: 'info', label: '详细信息', icon: '📍' },
              { key: 'reviews', label: '用户评价', icon: '⭐' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-4 px-4 text-center transition-colors flex items-center justify-center gap-2 ${
                  activeTab === tab.key ? 'bg-green-50 text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
                {tab.key === 'reviews' && resource.recentReviews.length > 0 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {resource.recentReviews.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'gallery' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">图文展示</h3>
                {resource.media.length > 0 ? (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden">
                      <img
                        src={resource.media[0].url}
                        alt={resource.name}
                        className="w-full h-80 object-cover"
                      />
                      <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                        主图
                      </div>
                    </div>
                    {resource.media.length > 1 && (
                      <div className="flex gap-3">
                        {resource.media.slice(1).map((media) => (
                          <img
                            key={media.id}
                            src={media.url}
                            alt={media.title || '图片'}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-5xl mb-3">📷</div>
                    <p className="text-gray-500">暂无图片或视频</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-6">
                {resource.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">资源介绍</h3>
                    <p className="text-gray-600 leading-relaxed">{resource.description}</p>
                  </div>
                )}

                {resource.geoLocation && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">位置信息</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700 flex items-start gap-2">
                        <span>📍</span>
                        <span>{resource.geoLocation.fullAddress}</span>
                      </p>
                      {resource.scenicArea && (
                        <p className="text-gray-500 mt-2">
                          <span className="text-green-600">🏔️</span> 所属景区：{resource.scenicArea}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {resource.distributionLinks.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">预订方式</h3>
                    <div className="space-y-2">
                      {resource.distributionLinks.map((link) => (
                        <a
                          key={link.id}
                          href={link.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{link.platform}</p>
                            <p className="text-sm text-gray-500">
                              {link.linkType === 'DIRECT_LINK' ? '直联预订' : '分销链接'}
                              {link.commissionRate && ` · 佣金 ${link.commissionRate}%`}
                            </p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">联系方式</h3>
                  <p className="text-gray-600">📞 {resource.phoneMasked}</p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">用户评价</h3>
                  <div className="flex items-center gap-2">
                    {renderStars(resource.avgRating)}
                    <span className="text-gray-500">({resource.reviewCount})</span>
                  </div>
                </div>

                {resource.recentReviews.length > 0 ? (
                  <div className="space-y-4">
                    {resource.recentReviews.map((review) => (
                      <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium">
                              {review.reviewerName.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900">{review.reviewerName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="text-gray-600 mt-2">{review.comment}</p>}
                        <p className="text-sm text-gray-400 mt-2">{formatDate(review.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-5xl mb-3">⭐</div>
                    <p className="text-gray-500">暂无评价</p>
                    <p className="text-sm text-gray-400 mt-1">成为第一个评价的用户吧</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {resource.distributionLinks.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${typeConfig.color} rounded-xl flex items-center justify-center text-2xl`}>
                {typeConfig.icon}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{resource.name}</p>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm text-gray-500">{resource.avgRating}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {resource.distributionLinks.slice(0, 2).map((link) => (
                <a
                  key={link.id}
                  href={link.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                    link.linkType === 'DIRECT_LINK' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  立即预订
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResourceProfilePage