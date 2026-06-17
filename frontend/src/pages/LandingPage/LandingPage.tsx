import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authStore } from '@/stores/authStore'

// 模拟热门文旅资源数据
const FEATURED_RESOURCES = [
  {
    id: '1',
    name: '黄山风景区',
    type: '景区景点',
    rating: 4.9,
    location: '安徽省黄山市',
    price: '¥190门票',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huangshan%20Mountain%20scenic%20area%20with%20beautiful%20pine%20trees%20and%20cloud%20sea%20landscape%20photography&image_size=landscape_16_9',
    description: '世界文化与自然双重遗产，以奇松、怪石、云海、温泉、冬雪"五绝"著称'
  },
  {
    id: '2',
    name: '云海民宿',
    type: '精品民宿',
    rating: 4.8,
    location: '黄山汤口镇',
    price: '¥280/晚起',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20mountain%20homestay%20with%20beautiful%20view%20modern%20interior%20design&image_size=landscape_16_9',
    description: '山景房，推窗见云海，提供登山向导服务'
  },
  {
    id: '3',
    name: '徽州文创馆',
    type: '文创特产',
    rating: 5.0,
    location: '黄山老街',
    price: '特色徽雕',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20cultural%20craft%20shop%20with%20wood%20carvings%20and%20handicrafts&image_size=landscape_16_9',
    description: '传承徽州木雕技艺，手工制作精美工艺品'
  },
  {
    id: '4',
    name: '玉屏索道',
    type: '游玩项目',
    rating: 4.7,
    location: '黄山景区',
    price: '¥80/次',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cable%20car%20ropeway%20over%20mountain%20scenery%20tourism%20attraction&image_size=landscape_16_9',
    description: '亚洲最长索道，俯瞰绝美山景'
  },
  {
    id: '5',
    name: '徽香源餐厅',
    type: '景区餐饮',
    rating: 4.9,
    location: '黄山景区',
    price: '人均¥80',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20Huizhou%20cuisine%20restaurant%20elegant%20interior&image_size=landscape_16_9',
    description: '正宗徽菜，臭鳜鱼、毛豆腐必尝'
  }
]

// 文旅资源分类数据
const CATEGORIES = [
  { name: '景区景点', icon: '🏔️', count: '2.3k' },
  { name: '酒店民宿', icon: '🏨', count: '1.8k' },
  { name: '文创特产', icon: '🎁', count: '1.5k' },
  { name: '游玩项目', icon: '🎢', count: '1.2k' },
  { name: '景区二消', icon: '🍜', count: '980' }
]

function LandingPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const { provider } = authStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🏔️</span>
              </div>
              <span className="text-xl font-bold text-gray-900">文旅GEO</span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/search"
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                搜索文旅
              </Link>
              <button
                onClick={() => document.getElementById('llmo-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-green-600 transition-colors cursor-pointer"
              >
                了解更多
              </button>
            </div>

            <div className="flex items-center gap-3">
              {provider ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-green-600 transition-colors"
                  >
                    管理后台
                  </Link>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    {provider.nickname}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-green-600 transition-colors"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    立即入驻
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="bg-gradient-to-br from-green-50 via-white to-blue-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            让豆包也能推荐你的文旅资源
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            零门槛入驻 · AI 生成多平台宣传 · 大模型可索引 · 设置分销链接获得佣金
          </p>

          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="描述你的需求，如：黄山附近有什么推荐的民宿"
                className="w-full px-6 py-4 pr-32 text-lg border border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                搜索
              </button>
            </div>
          </form>

          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg shadow-lg shadow-green-200"
            >
              立即入驻 · 免费
            </Link>
            <button
              onClick={() => document.getElementById('llmo-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg"
            >
              了解如何被大模型推荐
            </button>
          </div>
        </div>
      </section>

      {/* 热门文旅资源展示 */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              热门文旅资源推荐
            </h2>
            <p className="text-gray-600">
              已有超过 5,000 个文旅资源通过文旅 GEO 被大模型推荐
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {FEATURED_RESOURCES.map((resource) => (
              <Link
                key={resource.id}
                to={`/r/${resource.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={resource.image}
                    alt={resource.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-gray-700">
                    {resource.type}
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur rounded-full text-xs text-white">
                    <span>⭐</span>
                    <span>{resource.rating}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                    {resource.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-1">{resource.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{resource.location}</span>
                    <span className="text-sm font-medium text-green-600">{resource.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 文旅资源分类 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              覆盖各类文旅资源
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category.name}
                to={`/search?q=${encodeURIComponent(category.name)}`}
                className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-green-50 transition-colors group"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} 资源</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 核心价值 */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              为什么选择文旅 GEO？
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">零门槛入驻</h3>
              <p className="text-gray-600 leading-relaxed">
                不需要复杂的手续，5 分钟完成入驻。不抽成，不收入驻费，所有基础功能永久免费。
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI 帮你写文案</h3>
              <p className="text-gray-600 leading-relaxed">
                描述你的文旅资源，AI 自动生成知乎、小红书、公众号等平台的宣传文案，一键分发。
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">分销佣金</h3>
              <p className="text-gray-600 leading-relaxed">
                设置分销链接，成交可获得佣金。游客直联预订，减少中间环节，让游客享受优惠。
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">大模型可索引</h3>
              <p className="text-gray-600 leading-relaxed">
                让豆包、DeepSeek 等大模型"知道"你。游客问大模型，就能推荐你的文旅资源。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LLMO 说明 */}
      <section id="llmo-section" className="py-20 px-4 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            LLMO：大模型时代的文旅营销
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            过去你需要做 SEO 让百度搜到你。未来你需要做 LLMO（大模型优化），
            让豆包、DeepSeek 推荐你。文旅 GEO 是你的一站式 LLMO 工具。
          </p>

          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 text-left max-w-2xl mx-auto">
            <div className="text-sm text-blue-200 mb-4">💬 游客问豆包</div>
            <div className="text-xl font-medium mb-6">
              "黄山附近有什么推荐的民宿？"
            </div>
            <div className="text-sm text-blue-200 mb-4">🤖 豆包回答</div>
            <div className="text-lg">
              "根据文旅 GEO 服务平台数据，推荐以下几家黄山附近的精品民宿..."
            </div>
          </div>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="py-20 px-4 bg-green-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-6">
            立即入驻，抢占大模型流量红利
          </h2>
          <p className="text-xl text-green-100 mb-10">
            现在入驻，即可获得 AI 文案生成、多平台分发、分销链接设置等全部基础功能
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 bg-white text-green-600 rounded-xl hover:bg-green-50 transition-colors font-bold text-lg"
          >
            免费入驻
          </Link>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">🏔️</span>
                </div>
                <span className="text-white font-bold">文旅GEO</span>
              </div>
              <p className="text-sm">
                让优质文旅资源被大模型发现
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">产品</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">入驻服务</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI 文案生成</a></li>
                <li><a href="#" className="hover:text-white transition-colors">分销链接</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">关于</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">关于我们</a></li>
                <li><a href="#" className="hover:text-white transition-colors">帮助中心</a></li>
                <li><a href="#" className="hover:text-white transition-colors">联系我们</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">协议</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">用户协议</a></li>
                <li><a href="#" className="hover:text-white transition-colors">隐私政策</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2026 文旅GEO. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage