import React, { useState, useCallback } from 'react'
import { api } from '@/api/client'

interface MediaFile {
  id: string
  mediaType: 'IMAGE' | 'VIDEO'
  url: string
  fileName: string
  fileSize: number
  isPrimary: boolean
}

interface MediaUploaderProps {
  initialFiles?: MediaFile[]
  onUploadComplete?: (files: MediaFile[]) => void
  onFileDelete?: (id: string) => void
  disabled?: boolean
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function MediaUploader({ initialFiles = [], onUploadComplete, onFileDelete, disabled }: MediaUploaderProps) {
  const [files, setFiles] = useState<MediaFile[]>(initialFiles)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      uploadFiles(droppedFiles)
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      uploadFiles(selectedFiles)
    }
  }, [])

  const uploadFiles = async (fileList: File[]) => {
    if (disabled) return
    
    setUploading(true)
    const formData = new FormData()
    fileList.forEach(file => {
      formData.append('files', file)
    })

    try {
      const response = await api.post('/media', formData, {
        headers: {
          'Content-Type': undefined
        }
      })

      const uploadedFiles: MediaFile[] = response.data.data.files.map((f: any) => ({
        id: f.id,
        mediaType: f.mediaType,
        url: `${import.meta.env.VITE_API_BASE_URL || ''}${f.url}`,
        fileName: f.fileName,
        fileSize: f.fileSize,
        isPrimary: f.isPrimary
      }))

      setFiles(prev => [...prev, ...uploadedFiles])
      onUploadComplete?.(uploadedFiles)
    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/media/${id}`)
      setFiles(prev => prev.filter(f => f.id !== id))
      onFileDelete?.(id)
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
    }
  }

  return (
    <div className="space-y-4">
      {/* 上传区域 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          isDragging 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/ogg"
          onChange={handleFileChange}
          className="hidden"
          id="media-upload-input"
          disabled={disabled}
        />
        <label htmlFor="media-upload-input" className="cursor-pointer">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-700">
                {uploading ? '上传中...' : '点击或拖拽文件到此处上传'}
              </p>
              <p className="text-sm text-gray-500">
                支持 JPG、PNG、WebP、GIF 图片，以及 MP4、WebM、OGG 视频，单文件最大 50MB
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* 已上传文件列表 */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">已上传媒体文件</h3>
          <div className="grid grid-cols-4 gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="relative group rounded-lg overflow-hidden border border-gray-200"
              >
                {file.mediaType === 'IMAGE' ? (
                  <img
                    src={file.url}
                    alt={file.fileName}
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {file.isPrimary && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">主图</span>
                  )}
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="p-2 bg-gray-50">
                  <p className="text-xs text-gray-600 truncate">{file.fileName}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.fileSize)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}