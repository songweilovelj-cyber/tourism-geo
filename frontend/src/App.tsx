import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import LandingPage from '@/pages/LandingPage/LandingPage'
import RegisterPage from '@/pages/RegisterPage/RegisterPage'
import LoginPage from '@/pages/LoginPage/LoginPage'
import OnboardingPage from '@/pages/OnboardingPage/OnboardingPage'
import ContentGeneratePage from '@/pages/ContentGeneratePage/ContentGeneratePage'
import DashboardPage from '@/pages/DashboardPage/DashboardPage'
import ProviderProfilePage from '@/pages/ProviderProfilePage/ProviderProfilePage'
import SearchResultsPage from '@/pages/SearchResultsPage/SearchResultsPage'
import ArticleDetailPage from '@/pages/ArticleDetailPage/ArticleDetailPage'
import ResourceProfilePage from '@/pages/ResourceProfilePage/ResourceProfilePage'

// 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* 首页 */}
          <Route path="/" element={<LandingPage />} />

          {/* 认证相关 */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* 入驻引导 */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* 内容生成 */}
          <Route path="/content/generate" element={<ContentGeneratePage />} />

          {/* 仪表盘 */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* 搜索结果页 */}
          <Route path="/search" element={<SearchResultsPage />} />

          {/* 服务者公开主页 */}
          <Route path="/p/:id" element={<ProviderProfilePage />} />

          {/* 文章详情页（落地页） */}
          <Route path="/p/:providerId/article/:articleId" element={<ArticleDetailPage />} />

          {/* 文旅资源详情页 */}
          <Route path="/r/:id" element={<ResourceProfilePage />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// 占位组件
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500">功能开发中，敬请期待...</p>
      </div>
    </div>
  )
}

// 404 页面
function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">页面不存在</h1>
        <p className="text-gray-500 mb-6">抱歉，你访问的页面不存在</p>
        <a
          href="/"
          className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold"
        >
          返回首页
        </a>
      </div>
    </div>
  )
}

export default App
