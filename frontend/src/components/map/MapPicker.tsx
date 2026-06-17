import React, { useState, useCallback, useEffect } from 'react'
import useAmap from '@/hooks/useAmap'

interface MapPickerProps {
  defaultValue?: { lat: number; lng: number; address: string }
  onChange: (location: { lat: number; lng: number; address: string }) => void
  onConfirm?: () => void
}

function MapPicker({ defaultValue, onChange, onConfirm }: MapPickerProps) {
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lng: number } | null>(
    defaultValue ? { lat: defaultValue.lat, lng: defaultValue.lng } : null
  )
  const [address, setAddress] = useState(defaultValue?.address || '')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { mapRef, initMap } = useAmap({
    onReady: (map) => {
      // 设置默认中心点
      if (selectedPoint) {
        map.setCenter([selectedPoint.lng, selectedPoint.lat])
        addMarker(map, selectedPoint)
      }

      // 监听点击事件
      map.on('click', (e: any) => {
        const lat = e.lnglat.getLat()
        const lng = e.lnglat.getLng()
        const point = { lat, lng }
        setSelectedPoint(point)
        addMarker(map, point)
        getAddress(lat, lng)
      })

      // 添加定位控件
      map.addControl(new (window as any).AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        buttonPosition: 'RB',
        buttonOffset: new (window as any).AMap.Pixel(10, 20)
      }))
    },
    onError: (error) => {
      console.error('Map loading error:', error)
    }
  })

  const addMarker = useCallback((map: any, point: { lat: number; lng: number }) => {
    // 清除旧标记
    map.remove(map.getAllOverlays('marker'))

    // 添加新标记
    const marker = new (window as any).AMap.Marker({
      position: [point.lng, point.lat],
      draggable: true,
      icon: new (window as any).AMap.Icon({
        size: new (window as any).AMap.Size(40, 40),
        image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png'
      })
    })

    map.add(marker)

    // 拖拽标记更新位置
    marker.on('dragend', (e: any) => {
      const lat = e.lnglat.getLat()
      const lng = e.lnglat.getLng()
      const newPoint = { lat, lng }
      setSelectedPoint(newPoint)
      getAddress(lat, lng)
    })
  }, [])

  const getAddress = useCallback(async (lat: number, lng: number) => {
    if (!(window as any).AMap) return

    const geocoder = new (window as any).AMap.Geocoder({
      radius: 1000,
      extensions: 'all'
    })

    geocoder.getAddress([lng, lat], (status: string, result: any) => {
      if (status === 'complete' && result.regeocode) {
        const formattedAddress = result.regeocode.formattedAddress
        setAddress(formattedAddress)
        onChange({ lat, lng, address: formattedAddress })
      }
    })
  }, [onChange])

  const handleSearch = useCallback(async () => {
    if (!searchKeyword.trim() || !(window as any).AMap) return

    setIsLoading(true)

    const geocoder = new (window as any).AMap.Geocoder()
    geocoder.getLocation(searchKeyword, (status: string, result: any) => {
      if (status === 'complete' && result.geocodes.length > 0) {
        const loc = result.geocodes[0]
        const lat = loc.location.lat
        const lng = loc.location.lng
        const point = { lat, lng }

        setSelectedPoint(point)
        setAddress(loc.formattedAddress)

        // 更新地图视图
        const map = document.querySelector('.amap-container')
        if (map) {
          // 重新初始化地图到新位置
          initMap()
          // 需要延迟让地图重新加载
          setTimeout(() => {
            const amapInstance = (window as any)._amapInstance
            if (amapInstance) {
              amapInstance.setCenter([lng, lat])
              addMarker(amapInstance, point)
            }
          }, 500)
        }

        onChange({ lat, lng, address: loc.formattedAddress })
      }
      setIsLoading(false)
    })
  }, [searchKeyword, onChange, initMap, addMarker])

  // 处理回车键搜索
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSearch])

  // 初始化默认值
  useEffect(() => {
    if (defaultValue && !selectedPoint) {
      setSelectedPoint({ lat: defaultValue.lat, lng: defaultValue.lng })
      setAddress(defaultValue.address)
    }
  }, [defaultValue, selectedPoint])

  return (
    <div className="w-full">
      {/* 搜索框 */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="搜索地址，如：北京市朝阳区望京SOHO"
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          disabled={isLoading}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !searchKeyword.trim()}
          className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? '搜索中...' : '搜索'}
        </button>
      </div>

      {/* 地图容器 */}
      <div className="relative">
        <div
          ref={mapRef}
          className="amap-container w-full h-72 bg-gray-100 rounded-xl"
        />
        
        {/* 地图加载失败提示 */}
        <div className="absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-center" style={{ display: 'none' }}>
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-500">地图加载中...</p>
          </div>
        </div>
      </div>

      {/* 地址显示 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">当前位置</p>
            <p className="font-medium text-gray-900">{address || '点击地图选择位置'}</p>
          </div>
          {selectedPoint && (
            <span className="text-sm text-gray-400">
              {selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}
            </span>
          )}
        </div>
      </div>

      {/* 确认按钮 */}
      {onConfirm && selectedPoint && (
        <button
          onClick={onConfirm}
          className="mt-4 w-full py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
        >
          确认位置
        </button>
      )}
    </div>
  )
}

export default MapPicker
