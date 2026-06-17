import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '@/api/client'
import { authStore } from '@/stores/authStore'
import MapPicker from '@/components/map/MapPicker'
import { ResourceType } from '@/types/api'

// 入驻步骤
const STEPS = [
  { id: 1, title: '基本信息', description: '资源名称和简介' },
  { id: 2, title: '地址信息', description: '填写地址和可选的经纬度' },
  { id: 3, title: '资源分类', description: '选择资源类型' },
  { id: 4, title: '完成入驻', description: '开始推广' }
]

// 资源类型配置
const RESOURCE_TYPES: Array<{ type: ResourceType; name: string; icon: string; description: string }> = [
  { type: 'SCENIC_SPOT', name: '景区景点', icon: '🏔️', description: '自然景区、人文景区、主题公园等' },
  { type: 'HOTEL', name: '酒店民宿', icon: '🏨', description: '星级酒店、精品民宿、经济住宿等' },
  { type: 'CREATIVE_SHOP', name: '文创特产', icon: '🎁', description: '文创商店、特产店、手工艺品店等' },
  { type: 'PLAY_ITEM', name: '游玩项目', icon: '🎢', description: '游乐设施、演出表演、导览服务等' },
  { type: 'SECOND_CONSUME', name: '景区二消', icon: '🍜', description: '餐饮美食、休闲服务、特色体验等' }
]

function OnboardingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { provider, setProvider } = authStore()

  // 获取当前步骤
  const getCurrentStep = () => {
    const searchParams = new URLSearchParams(location.search)
    return parseInt(searchParams.get('step') || '1')
  }

  const [currentStep, setCurrentStep] = useState(getCurrentStep)

  useEffect(() => {
    const step = getCurrentStep()
    setCurrentStep(step)
  }, [location.search])

  // 基本信息表单
  const [resourceName, setResourceName] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [scenicArea, setScenicArea] = useState('')

  // 位置信息 - 支持手动输入和地图选择（地图为可选增强）
  const [locationData, setLocationData] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [manualAddress, setManualAddress] = useState('')
  const [manualLat, setManualLat] = useState('')
  const [manualLng, setManualLng] = useState('')
  const [useMap, setUseMap] = useState(false) // 是否启用地图精确定位（需要地图API）

  // 资源类型
  const [selectedType, setSelectedType] = useState<ResourceType | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState<any[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const goToStep = (step: number) => {
    navigate(`/onboarding?step=${step}`)
  }

  // 加载分类数据
  useEffect(() => {
    if (currentStep === 3 && selectedType) {
      const fetchCategories = async () => {
        try {
          const response = await api.get(`/categories/by-type/${selectedType}`)
          if (response.data.success) {
            setCategories(response.data.data || [])
          }
        } catch (err) {
          console.error('Failed to fetch categories')
        }
      }
      fetchCategories()
    }
  }, [currentStep, selectedType])

  // 步骤1：基本信息
  const handleBasicInfo = () => {
    if (!resourceName.trim()) {
      setError('请输入资源名称')
      return
    }
    if (!city.trim()) {
      setError('请输入所在城市')
      return
    }

    setError('')
    goToStep(2)
  }

  // 步骤2：地址信息（地图定位为可选增强，不强制）
  const handleLocation = () => {
    setLoading(true)
    setError('')

    // 优先级：地图定位 > 手动经纬度 > 仅地址
    let latitude: number | null = null
    let longitude: number | null = null
    let fullAddress = ''

    // 1. 如果有地图定位数据
    if (locationData) {
      latitude = locationData.lat
      longitude = locationData.lng
      fullAddress = locationData.address
    }
    // 2. 如果手动输入了经纬度
    else if (manualLat && manualLng) {
      latitude = parseFloat(manualLat)
      longitude = parseFloat(manualLng)
      if (isNaN(latitude) || isNaN(longitude)) {
        setError('经纬度格式不正确')
        setLoading(false)
        return
      }
    }

    // 3. 手动输入的详细地址（始终使用）
    if (manualAddress.trim()) {
      fullAddress = manualAddress.trim()
    }

    // 如果既没有地图定位也没有经纬度，但有地址信息，也可以继续
    // 地理定位是可选的增强功能，不强制要求

    // 构建请求数据
    const requestData: any = {
      city: city.trim(),
      district: district.trim() || undefined,
      scenicArea: scenicArea.trim() || undefined
    }

    if (latitude !== null && longitude !== null) {
      requestData.latitude = latitude
      requestData.longitude = longitude
    }

    if (fullAddress) {
      requestData.fullAddress = fullAddress
    }

    // 即使没有经纬度，也可以保存地址信息
    api.put('/resources/me/geo', requestData).then(() => {
      goToStep(3)
    }).catch((err: any) => {
      setError(err.response?.data?.error?.message || '保存失败')
    }).finally(() => {
      setLoading(false)
    })
  }

  // 步骤3：资源分类
  const handleCategory = () => {
    if (!selectedType) {
      setError('请选择资源类型')
      return
    }

    setLoading(true)
    setError('')

    api.put('/resources/me', {
      name: resourceName.trim(),
      description: description.trim(),
      city: city.trim(),
      district: district.trim() || undefined,
      scenicArea: scenicArea.trim() || undefined,
      categoryId: selectedCategory || undefined
    }).then(() => {
      goToStep(4)
    }).catch((err: any) => {
      setError(err.response?.data?.error?.message || '保存失败')
    }).finally(() => {
      setLoading(false)
    })
  }

  // 完成
  const handleComplete = () => {
    navigate('/dashboard')
  }

  // 返回修改
  const handleBack = () => {
    goToStep(currentStep - 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部进度 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep >= step.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-500'}
                  `}>
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <div className="hidden sm:block ml-2">
                    <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 步骤1：基本信息 */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">文旅资源基本信息</h2>
              <p className="text-gray-500">告诉游客你的文旅资源是什么</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  资源名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                  placeholder="如：黄山云海民宿、徽州文创店"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  maxLength={50}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    所在城市 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="如：黄山市"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    区县
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="如：黄山区"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所属景区
                </label>
                <input
                  type="text"
                  value={scenicArea}
                  onChange={(e) => setScenicArea(e.target.value)}
                  placeholder="如：黄山风景区、西递宏村"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  资源描述
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="介绍一下你的文旅资源特色、优势、游玩亮点等，让游客更好地了解"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  maxLength={1000}
                />
                <p className="mt-1 text-xs text-gray-400 text-right">{description.length}/1000</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleBasicInfo}
                className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {/* 步骤2：地址信息（地图定位为可选增强） */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">地址信息</h2>
              <p className="text-gray-500">完善地址信息，方便游客找到你的文旅资源。地图精确定位为可选增强</p>
            </div>

            <div className="space-y-6">
              {/* 手动输入地址 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  详细地址
                </label>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="如：安徽省黄山市黄山区汤口镇"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* 手动输入经纬度（可选） */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    纬度（可选）
                  </label>
                  <input
                    type="text"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="如：30.1332"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    经度（可选）
                  </label>
                  <input
                    type="text"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    placeholder="如：118.1694"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* 提示信息 */}
              <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm">
                <p>
                  <strong>💡 说明：</strong>手动输入地址和经纬度即可完成此步骤，
                  无需地图API。如果你有高德/百度地图API，可以在设置中配置后使用地图精确定位功能。
                </p>
              </div>

              {/* 已定位信息展示 */}
              {(locationData || (manualLat && manualLng) || manualAddress) && (
                <div className="p-4 bg-green-50 text-green-700 rounded-xl">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📍</span>
                    <div>
                      <p className="font-medium">地址信息已填写</p>
                      {manualAddress && <p className="text-sm mt-1">地址：{manualAddress}</p>}
                      {locationData && <p className="text-sm mt-1">地图定位：{locationData.address}</p>}
                      {(locationData || (manualLat && manualLng)) && (
                        <p className="text-sm mt-1">
                          经纬度：{locationData ? `${locationData.lat.toFixed(4)}, ${locationData.lng.toFixed(4)}` : `${parseFloat(manualLat).toFixed(4)}, ${parseFloat(manualLng).toFixed(4)}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  上一步
                </button>
                <button
                  onClick={handleLocation}
                  disabled={loading}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {loading ? '保存中...' : '下一步'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 步骤3：资源分类 */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">选择资源类型</h2>
              <p className="text-gray-500">帮助游客快速找到你的文旅资源</p>
            </div>

            <div className="space-y-6">
              {/* 资源类型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  资源类型 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {RESOURCE_TYPES.map(type => (
                    <button
                      key={type.type}
                      onClick={() => setSelectedType(type.type)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedType === type.type
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{type.icon}</span>
                        <span className="font-semibold text-gray-900">{type.name}</span>
                      </div>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 具体分类选择 */}
              {selectedType && categories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    具体分类
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">请选择具体分类</option>
                    {categories.map(cat => (
                      <React.Fragment key={cat.id}>
                        <option value={cat.id}>{cat.name}</option>
                        {cat.children?.map((child: any) => (
                          <option key={child.id} value={child.id}>
                            &nbsp;&nbsp;├ {child.name}
                          </option>
                        ))}
                      </React.Fragment>
                    ))}
                  </select>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  上一步
                </button>
                <button
                  onClick={handleCategory}
                  disabled={loading || !selectedType}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {loading ? '保存中...' : '下一步'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 步骤4：完成 */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">入驻成功！</h2>
            <p className="text-gray-500 mb-8">
              欢迎加入文旅 GEO，你的资源即将被大模型推荐给游客
            </p>

            <div className="bg-green-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">入驻完成，接下来你可以：</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>上传精美的图片和视频，展示你的文旅资源</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>使用 AI 一键生成多平台宣传文案</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>一键分发到知乎、小红书、微信公众号</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>设置分销链接，让游客直接预订并获得佣金</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-8 text-left">
              <p className="text-sm text-blue-700">
                💡 <strong>小提示：</strong>完善资料、上传图片、设置分销链接的运营者，
                更容易被大模型推荐给游客哦！
              </p>
            </div>

            <button
              onClick={handleComplete}
              className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
            >
              进入管理后台
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default OnboardingPage
