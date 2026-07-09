import React from 'react'
import type { PaperData } from '@/types/heritage'

interface PaperPreviewProps {
  paper: PaperData
  authorName: string
  institution: string
}

function PaperPreview({ paper, authorName, institution }: PaperPreviewProps) {
  const formatReference = (ref: any, idx: number) => {
    const parts: string[] = []
    parts.push(`[${idx + 1}]`)
    parts.push(`${ref.authors}.`)
    parts.push(`${ref.title}`)

    if (ref.type === 'J') {
      parts.push(`[J]. ${ref.journal}, ${ref.year}`)
      if (ref.volume) parts.push(`, ${ref.volume}`)
      if (ref.pages) parts.push(`: ${ref.pages}`)
    } else if (ref.type === 'M') {
      parts.push(`[M]. ${ref.publisher}, ${ref.year}`)
    } else if (ref.type === 'C') {
      parts.push(`[C]//${ref.journal}. ${ref.year}`)
      if (ref.pages) parts.push(`: ${ref.pages}`)
    }
    parts.push('.')
    return parts.join(' ')
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-stone-800 px-6 py-4">
        <h3 className="text-base font-bold text-amber-50 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          论文预览
        </h3>
      </div>

      <div className="p-6 max-h-[650px] overflow-y-auto paper-content">
        <div className="max-w-2xl mx-auto">
          {/* 标题区 */}
          <div className="text-center mb-8 pb-6 border-b-2 border-amber-200">
            <h1 className="text-xl font-bold text-stone-900 mb-4 leading-relaxed tracking-wide">
              {paper.title}
            </h1>
            <p className="text-stone-800 mb-1 font-medium">{authorName || '作者姓名'}</p>
            <p className="text-sm text-stone-500">{institution || '（作者单位）'}</p>
          </div>

          {/* 摘要 */}
          <div className="bg-gradient-to-br from-amber-50 to-stone-50 rounded-xl p-5 mb-6 border border-amber-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-amber-900 bg-amber-200 px-3 py-1 rounded-full">摘要</span>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed text-justify">{paper.abstract}</p>
            <div className="mt-3 pt-3 border-t border-amber-200/60">
              <span className="text-sm font-bold text-amber-900">关键词：</span>
              <span className="text-sm text-stone-700">{paper.keywords.join('；')}</span>
            </div>
          </div>

          {/* 正文 */}
          <div className="space-y-6">
            <section>
              <h2 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-sm">一</span>
                引言
              </h2>
              <div className="text-sm text-stone-700 leading-relaxed text-justify pl-10 space-y-3 whitespace-pre-line">
                {paper.introduction}
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-sm">二</span>
                研究对象与方法
              </h2>
              <div className="text-sm text-stone-700 leading-relaxed text-justify pl-10 space-y-3 whitespace-pre-line">
                {paper.materialsAndMethods}
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-sm">三</span>
                研究结果
              </h2>
              <div className="text-sm text-stone-700 leading-relaxed text-justify pl-10 space-y-3 whitespace-pre-line">
                {paper.results}
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-sm">四</span>
                讨论
              </h2>
              <div className="text-sm text-stone-700 leading-relaxed text-justify pl-10 space-y-3 whitespace-pre-line">
                {paper.discussion}
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-sm">五</span>
                结论
              </h2>
              <div className="text-sm text-stone-700 leading-relaxed text-justify pl-10 space-y-3 whitespace-pre-line">
                {paper.conclusion}
              </div>
            </section>

            {/* 参考文献 */}
            <section className="pt-4 border-t border-stone-200">
              <h2 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                参考文献
              </h2>
              <div className="space-y-2 pl-2">
                {paper.references.map((ref, idx) => (
                  <p key={idx} className="text-xs text-stone-600 leading-relaxed pl-4 -indent-4">
                    {formatReference(ref, idx)}
                  </p>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaperPreview
