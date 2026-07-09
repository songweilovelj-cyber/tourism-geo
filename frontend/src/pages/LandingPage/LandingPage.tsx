import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authStore } from '@/stores/authStore'

function LandingPage() {
  const navigate = useNavigate()
  const { provider } = authStore()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-red-800 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🏛️</span>
              </div>
              <span className="text-xl font-bold text-gray-900">策展助手</span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-red-700 transition-colors cursor-pointer"
              >
                核心功能
              </button>
              <button
                onClick={() => document.getElementById('workflow-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-red-700 transition-colors cursor-pointer"
              >
                工作流程
              </button>
              <button
                onClick={() => document.getElementById('value-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-red-700 transition-colors cursor-pointer"
              >
                产品价值
              </button>
            </div>

            <div className="flex items-center gap-3">
              {provider ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-red-700 transition-colors"
                  >
                    我的方案
                  </Link>
                  <Link
                    to="/exhibition/new"
                    className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-medium"
                  >
                    新建策展
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-red-700 transition-colors"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-medium"
                  >
                    免费试用
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="bg-gradient-to-br from-stone-50 via-white to-amber-50 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium mb-6">
            <span>✨</span>
            <span>AI 赋能博物馆策展</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            博物馆策展方案
            <br />
            <span className="text-red-700">AI 辅助生成系统</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            步骤式输入 · 模块化生成 · 灵魂展品配置 · 展陈布局设计
            <br />
            让策展更专业、更高效、更有创意
          </p>

          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-red-700 text-white rounded-xl hover:bg-red-800 transition-colors font-semibold text-lg shadow-lg shadow-red-200"
            >
              立即免费试用
            </Link>
            <button
              onClick={() => document.getElementById('workflow-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-lg"
            >
              了解工作流程
            </button>
          </div>
          
          <p className="mt-8 text-sm text-gray-400">
            已有 200+ 博物馆 / 策展人在使用
          </p>
        </div>
      </section>

      {/* 核心功能 */}
      <section id="features-section" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              七大核心模块，覆盖策展全流程
            </h2>
            <p className="text-gray-600">
              从展览定位到教育推广，模块化设计，每一步都可控、可优化
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 border border-red-100">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">基本信息</h3>
              <p className="text-gray-600 leading-relaxed">
                展览主题、名称、时间、地点、面积等基础信息配置
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl p-8 border border-amber-100">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">展览定位</h3>
              <p className="text-gray-600 leading-relaxed">
                常设展/临时展/专题展，目标受众与教育目的
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">展区规划</h3>
              <p className="text-gray-600 leading-relaxed">
                多展区自由配置，定义每个展区的主题与叙事
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl p-8 border border-yellow-100">
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">灵魂展品</h3>
              <p className="text-gray-600 leading-relaxed">
                每个展区设置核心展品，深度解读，C位展示
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border border-blue-100">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">辅助展品</h3>
              <p className="text-gray-600 leading-relaxed">
                围绕核心展品配置辅助展品，形成完整展陈体系
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-3xl p-8 border border-purple-100">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">展陈设计</h3>
              <p className="text-gray-600 leading-relaxed">
                空间布局、参观动线、灯光设计、多媒体配置
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-8 border border-pink-100">
              <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">📢</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">教育推广</h3>
              <p className="text-gray-600 leading-relaxed">
                配套活动、社教项目、宣传方案、出版物
              </p>
            </div>

            <div className="bg-gradient-to-br from-stone-50 to-gray-50 rounded-3xl p-8 border border-stone-100">
              <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">版本管理</h3>
              <p className="text-gray-600 leading-relaxed">
                支持方案复制、版本迭代，方便多轮优化
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 工作流程 */}
      <section id="workflow-section" className="py-20 px-4 bg-gradient-to-br from-stone-50 to-amber-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              七步生成专业策展方案
            </h2>
            <p className="text-gray-600">
              结构化输入，让AI精准理解你的需求
            </p>
          </div>

          <div className="space-y-6">
            {[
              { step: 1, title: '基本信息', desc: '确定展览主题、名称、时间地点等基础要素', icon: '📋' },
              { step: 2, title: '展览定位', desc: '明确展览类型、目标受众和教育目的', icon: '🎯' },
              { step: 3, title: '展区规划', desc: '规划展览结构，设置各展区的主题与叙事', icon: '🗺️' },
              { step: 4, title: '灵魂展品', desc: '为每个展区配置核心展品，定义其重要性与展示方式', icon: '⭐' },
              { step: 5, title: '辅助展品', desc: '补充辅助展品，形成完整的展品矩阵', icon: '📦' },
              { step: 6, title: '展陈设计', desc: '设计空间布局、动线、灯光与多媒体', icon: '🎨' },
              { step: 7, title: '教育推广', desc: '策划配套活动与宣传方案', icon: '📢' }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center gap-6">
                <div className="w-16 h-16 bg-red-700 text-white rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                  {item.icon}
                </div>
                <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      步骤 {item.step}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                {index < 6 && (
                  <div className="hidden md:block text-gray-300 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-red-700 text-white rounded-xl hover:bg-red-800 transition-colors font-semibold text-lg shadow-lg shadow-red-200"
            >
              开始创建策展方案
            </Link>
          </div>
        </div>
      </section>

      {/* 产品价值 */}
      <section id="value-section" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              为什么选择策展助手？
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">效率提升10倍</h3>
              <p className="text-gray-600 leading-relaxed">
                传统策展方案撰写需要数周，AI辅助生成只需数小时。结构化输入+大模型生成，让你把时间花在创意而非文案上。
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">专业策展思维</h3>
              <p className="text-gray-600 leading-relaxed">
                基于博物馆学、策展学专业方法设计，灵魂展品理念、叙事性展陈、C位布局设计，让AI方案更专业。
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">模块化可迭代</h3>
              <p className="text-gray-600 leading-relaxed">
                每一步输入都可独立修改优化，支持版本管理与方案克隆。不满意某部分？单独调整该模块即可。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 适用场景 */}
      <section className="py-20 px-4 bg-gradient-to-br from-red-900 to-red-800 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            适用于各类博物馆策展场景
          </h2>
          <p className="text-xl text-red-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            无论是国家级博物馆的大型特展，还是地方馆的专题展览，
            策展助手都能帮你快速产出高质量方案
          </p>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: '🏛️', title: '历史类展览', desc: '通史展、断代史展、专题史展' },
              { icon: '🏺', title: '艺术类展览', desc: '书画、陶瓷、青铜、玉器专题' },
              { icon: '🌿', title: '自然类展览', desc: '自然史、地质、古生物' },
              { icon: '🎭', title: '民俗文化展', desc: '非遗、民俗、地方文化' }
            ].map((item) => (
              <div key={item.title} className="bg-white/10 backdrop-blur rounded-2xl p-6 text-left">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-sm text-red-200">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="py-20 px-4 bg-red-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-6">
            立即开始使用策展助手
          </h2>
          <p className="text-xl text-red-100 mb-10">
            免费注册，即可体验完整功能
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 bg-white text-red-700 rounded-xl hover:bg-red-50 transition-colors font-bold text-lg"
          >
            免费试用
          </Link>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-700 rounded-lg flex items-center justify-center">
                  <span className="text-white">🏛️</span>
                </div>
                <span className="text-white font-bold">策展助手</span>
              </div>
              <p className="text-sm">
                博物馆策展方案AI辅助生成工具
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">产品</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">策展方案生成</a></li>
                <li><a href="#" className="hover:text-white transition-colors">灵魂展品配置</a></li>
                <li><a href="#" className="hover:text-white transition-colors">展陈设计</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">资源</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">使用指南</a></li>
                <li><a href="#" className="hover:text-white transition-colors">策展案例</a></li>
                <li><a href="#" className="hover:text-white transition-colors">帮助中心</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">联系</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">关于我们</a></li>
                <li><a href="#" className="hover:text-white transition-colors">用户协议</a></li>
                <li><a href="#" className="hover:text-white transition-colors">隐私政策</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2026 策展助手. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
