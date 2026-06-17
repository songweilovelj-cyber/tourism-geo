import React, { useState } from 'react'

interface MediaItem {
  id: string
  mediaType: 'IMAGE' | 'VIDEO'
  url: string
  thumbnailUrl?: string
  title?: string
  isPrimary: boolean
}

interface MediaGalleryProps {
  media: MediaItem[]
  showThumbnails?: boolean
}

export function MediaGallery({ media, showThumbnails = true }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  if (media.length === 0) {
    return (
      <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">暂无图片或视频</p>
        </div>
      </div>
    )
  }

  const handlePrev = () => {
    setSelectedIndex(prev => (prev === 0 ? media.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedIndex(prev => (prev === media.length - 1 ? 0 : prev + 1))
  }

  const selectedMedia = media[selectedIndex]

  return (
    <div className="space-y-4">
      {/* 主展示区域 */}
      <div
        className="relative rounded-xl overflow-hidden cursor-pointer"
        onClick={() => setIsLightboxOpen(true)}
      >
        {selectedMedia.mediaType === 'IMAGE' ? (
          <img
            src={selectedMedia.url}
            alt={selectedMedia.title || '图片'}
            className="w-full h-80 object-cover"
          />
        ) : (
          <div className="relative w-full h-80 bg-gray-900">
            <video
              src={selectedMedia.url}
              poster={selectedMedia.thumbnailUrl}
              className="w-full h-full object-contain"
              controls
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        )}
        
        {/* 导航箭头 */}
        {media.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* 图片/视频标签 */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
          {selectedMedia.mediaType === 'IMAGE' ? '图片' : '视频'}
        </div>

        {/* 主图标签 */}
        {selectedMedia.isPrimary && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-green-600 text-white text-sm rounded-full">
            主图
          </div>
        )}

        {/* 计数器 */}
        {media.length > 1 && (
          <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
            {selectedIndex + 1} / {media.length}
          </div>
        )}
      </div>

      {/* 缩略图列表 */}
      {showThumbnails && media.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedIndex
                  ? 'border-green-500 ring-2 ring-green-200'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              {item.mediaType === 'IMAGE' ? (
                <img
                  src={item.url}
                  alt={item.title || '缩略图'}
                  className="w-20 h-20 object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-900 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              {item.isPrimary && (
                <div className="absolute w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 灯箱模态框 */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {media.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev() }}
                className="absolute left-4 p-3 text-white hover:bg-white/20 rounded-full transition-colors"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext() }}
                className="absolute right-4 p-3 text-white hover:bg-white/20 rounded-full transition-colors"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {selectedMedia.mediaType === 'IMAGE' ? (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.title || '图片'}
                className="max-w-full max-h-[80vh] object-contain"
              />
            ) : (
              <video
                src={selectedMedia.url}
                className="max-w-full max-h-[80vh] object-contain"
                controls
                autoPlay
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}