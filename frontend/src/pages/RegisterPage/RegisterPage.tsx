import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'

function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post('/auth/send-code', {
        phone,
        purpose: 'REGISTER'
      })
      setCodeSent(true)
      setStep(2)
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '发送验证码失败')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('请输入6位验证码')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/verify-code', { phone, code })
      const { accessToken, provider } = response.data.data

      // 保存 token
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('provider', JSON.stringify(provider))

      // 跳转到引导页或仪表盘
      if (provider.isOnboarded) {
        navigate('/dashboard')
      } else {
        navigate('/onboarding')
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '验证失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-800 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl">🏛️</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">策展助手</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 1 ? '手机号登录/注册' : '输入验证码'}
          </h1>
          <p className="text-gray-500 mt-2">
            {step === 1 ? '博物馆策展方案AI辅助生成工具' : `验证码已发送至 ${phone}`}
          </p>
        </div>

        {/* 表单卡片 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          {step === 1 && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  手机号
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  maxLength={11}
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50"
              >
                {loading ? '发送中...' : '获取验证码'}
              </button>

              <p className="mt-6 text-center text-sm text-gray-500">
                登录即表示同意{' '}
                <a href="#" className="text-orange-600 hover:underline">《用户协议》</a>
                {' '}和{' '}
                <a href="#" className="text-orange-600 hover:underline">《隐私政策》</a>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  验证码
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="请输入6位验证码"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl tracking-widest"
                  maxLength={6}
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-500 text-center">
                  测试环境：验证码会输出到控制台
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={loading || code.length !== 6}
                className="w-full py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50"
              >
                {loading ? '验证中...' : '验证并登录'}
              </button>

              <button
                onClick={() => {
                  setStep(1)
                  setCode('')
                  setCodeSent(false)
                  setError('')
                }}
                className="mt-4 w-full py-3 text-gray-600 hover:text-orange-600 transition-colors"
              >
                重新输入手机号
              </button>

              <div className="mt-4 text-center">
                <button
                  onClick={handleSendCode}
                  disabled={loading}
                  className="text-sm text-orange-600 hover:underline disabled:opacity-50"
                >
                  {loading ? '重新发送中...' : '重新获取验证码'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* 底部 */}
        <p className="mt-8 text-center text-sm text-gray-500">
          已有账号？{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-orange-600 hover:underline"
          >
            立即登录
          </button>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
