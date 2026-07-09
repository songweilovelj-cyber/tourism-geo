import React from 'react'
import type { FormatCheckResult } from '@/types/heritage'

interface FormatCheckPanelProps {
  result: FormatCheckResult
  onConfirm: () => void
  onRevise: () => void
}

const CHECK_ITEMS = [
  { key: 'titleFormat', label: '标题格式', desc: '标题控制在20字以内，居中排列' },
  { key: 'abstractFormat', label: '摘要格式', desc: '结构式摘要，包含目的、方法、结果、结论四要素' },
  { key: 'keywordCount', label: '关键词数量', desc: '3-5个关键词，用分号分隔' },
  { key: 'sectionStructure', label: '章节结构', desc: '引言、材料与方法、结果、讨论、结论五段式' },
  { key: 'referenceFormat', label: '参考文献格式', desc: '符合GB/T 7714标准格式' },
  { key: 'figureNumbering', label: '图表编号', desc: '图/表按出现顺序连续编号' }
]

function FormatCheckPanel({ result, onConfirm, onRevise }: FormatCheckPanelProps) {
  const passCount = CHECK_ITEMS.filter(item => result[item.key as keyof FormatCheckResult] === true).length

  return (
    <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-2xl border border-stone-200 p-6 mb-6">
      <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
        <span>✅</span> Word 格式校验报告
      </h3>

      <div className="bg-white rounded-xl p-4 mb-4 border border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">总体通过率</span>
          <span className="text-lg font-bold text-amber-600">
            {passCount} / {CHECK_ITEMS.length} 项通过
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${(passCount / CHECK_ITEMS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {CHECK_ITEMS.map(item => {
          const passed = result[item.key as keyof FormatCheckResult] as boolean
          return (
            <div 
              key={item.key}
              className={`p-3 rounded-lg border ${
                passed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`text-lg flex-shrink-0 ${passed ? 'text-green-500' : 'text-amber-500'}`}>
                  {passed ? '✓' : '⚠'}
                </span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${passed ? 'text-green-800' : 'text-amber-800'}`}>
                    {item.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${passed ? 'text-green-600' : 'text-amber-600'}`}>
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {result.issues.length > 0 && (
        <div className="bg-amber-50 rounded-lg p-4 mb-4 border border-amber-200">
          <p className="text-sm font-medium text-amber-800 mb-2">📋 需要注意的问题：</p>
          <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
            {result.issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onRevise}
          className="flex-1 py-3 border-2 border-amber-500 text-amber-700 rounded-xl font-medium hover:bg-amber-50 transition-colors"
        >
          修改调整
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-medium hover:from-amber-700 hover:to-orange-700 transition-all shadow-md"
        >
          确认格式，生成终稿
        </button>
      </div>
    </div>
  )
}

export default FormatCheckPanel
