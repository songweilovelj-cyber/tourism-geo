import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import CurationWorkspace from '@/pages/ExhibitionPlanPage/CurationWorkspace'

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
      <HashRouter>
        <Routes>
          {/* 首页 - 默认跳转到策展助手 */}
          <Route path="/" element={<Navigate to="/curation" replace />} />

          {/* 策展助手 - 博物馆策展方案AI辅助生成系统 */}
          <Route path="/curation" element={<CurationWorkspace />} />
          <Route path="/curation/:id" element={<CurationWorkspace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  )
}

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #0a0a14, #1e1b4b)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '80px', marginBottom: '16px', color: '#4ECDC4' }}>404</div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '8px' }}>页面不存在</h1>
        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>抱歉，你访问的页面不存在</p>
        <a
          href="#/curation"
          style={{
            padding: '10px 24px',
            background: 'linear-gradient(to right, #4ECDC4, #818CF8)',
            color: '#fff',
            borderRadius: '8px',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '14px'
          }}
        >
          返回策展助手
        </a>
      </div>
    </div>
  )
}

export default App
