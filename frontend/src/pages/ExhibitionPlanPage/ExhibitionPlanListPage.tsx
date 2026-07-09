import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { ExhibitionPlanListItem } from '@/types/exhibition'

function ExhibitionPlanListPage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<ExhibitionPlanListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  
  const pageSize = 10
  
  useEffect(() => {
    loadPlans()
  }, [page])
  
  const loadPlans = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/exhibition/plans', {
        params: { page, limit: pageSize }
      })
      if (response.data.success) {
        setPlans(response.data.data.plans)
        setTotal(response.data.data.total)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '加载失败')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个策展方案吗？')) return
    
    try {
      await api.delete(`/exhibition/plans/${id}`)
      loadPlans()
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '删除失败')
    }
  }
  
  const handleClone = async (id: string) => {
    try {
      const response = await api.post(`/exhibition/plans/${id}/clone`)
      if (response.data.success) {
        navigate(`/exhibition/${response.data.data.id}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '创建新版本失败')
    }
  }
  
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: '草稿' },
      GENERATING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '生成中' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: '已完成' },
      FAILED: { bg: 'bg-red-100', text: 'text-red-700', label: '失败' }
    }
    const config = statusMap[status] || statusMap.DRAFT
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
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
          <h1 className="text-lg font-bold text-gray-900">策展方案</h1>
          <button
            onClick={() => navigate('/exhibition/new')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            新建方案
          </button>
        </div>
      </nav>
      
      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}
        
        {/* 空状态 */}
        {plans.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">暂无策展方案</h3>
            <p className="text-gray-500 mb-6">创建你的第一个策展方案</p>
            <button
              onClick={() => navigate('/exhibition/new')}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold"
            >
              新建策展方案
            </button>
          </div>
        )}
        
        {/* 方案列表 */}
        {plans.length > 0 && (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{plan.name || '未命名方案'}</h3>
                      {getStatusBadge(plan.status)}
                      {plan.version > 1 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          v{plan.version}
                        </span>
                      )}
                    </div>
                    
                    {plan.theme && (
                      <p className="text-gray-500 text-sm mb-3">
                        主题：{plan.theme}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📍 {plan.zoneCount}个展区</span>
                      <span>⭐ {plan.coreExhibitCount}件灵魂展品</span>
                      {plan.planType && <span>📅 {plan.planType}</span>}
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-3">
                      创建于 {new Date(plan.createdAt).toLocaleDateString('zh-CN')}
                      {plan.generatedAt && ` | 生成于 ${new Date(plan.generatedAt).toLocaleDateString('zh-CN')}`}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/exhibition/${plan.id}`)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleClone(plan.id)}
                      className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      复制
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="px-4 py-2 text-red-500 hover:text-red-600 transition-colors text-sm"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* 分页 */}
        {total > pageSize && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span className="text-gray-500">
              第 {page} / {Math.ceil(total / pageSize)} 页
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / pageSize)}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExhibitionPlanListPage
