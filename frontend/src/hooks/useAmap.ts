// 高德地图加载 Hook
import { useEffect, useRef, useCallback } from 'react'

const AMAP_KEY = import.meta.env.VITE_AMAP_WEB_API_KEY || '***'

interface UseAmapOptions {
  onReady?: (map: AMap.Map) => void
  onError?: (error: Error) => void
}

export function useAmap(options?: UseAmapOptions) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<AMap.Map | null>(null)
  const isLoaded = useRef(false)

  const initMap = useCallback(async () => {
    if (!mapRef.current) return

    // 如果已加载，直接创建地图
    if (window.AMap) {
      createMap()
      return
    }

    // 动态加载高德地图 SDK
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&callback=onAmapLoaded`
    script.async = true
    script.onerror = () => {
      options?.onError?.(new Error('高德地图加载失败'))
    }

    // 全局回调
    ;(window as any).onAmapLoaded = () => {
      createMap()
    }

    document.head.appendChild(script)
  }, [options])

  const createMap = () => {
    if (!mapRef.current) return

    const map = new window.AMap.Map(mapRef.current, {
      zoom: 15,
      center: [116.4074, 39.9042], // 默认北京
      resizeEnable: true
    })

    mapInstance.current = map
    options?.onReady?.(map)
    isLoaded.current = true
  }

  useEffect(() => {
    initMap()

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy()
        mapInstance.current = null
      }
    }
  }, [initMap])

  return {
    mapRef,
    map: mapInstance.current,
    isLoaded: isLoaded.current,
    initMap
  }
}

export default useAmap
