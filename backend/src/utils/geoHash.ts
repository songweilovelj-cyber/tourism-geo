// GeoHash 工具函数
// 用于地理坐标的粗略索引和区域查询

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'

/**
 * 计算 GeoHash（精度约 ±0.6km，对应 8 位）
 * @param lat 纬度
 * @param lng 经度
 * @param precision 精度（默认 8 位）
 */
export function calculateGeoHash(lat: number, lng: number, precision: number = 8): string {
  const BITS = [16, 8, 4, 2, 1]
  let minLat = -90.0, maxLat = 90.0
  let minLng = -180.0, maxLng = 180.0
  let hash = ''
  let bit = 0
  let ch = 0
  let isEven = true

  while (hash.length < precision) {
    if (isEven) {
      const mid = (minLng + maxLng) / 2
      if (lng >= mid) {
        ch |= BITS[bit]
        minLng = mid
      } else {
        maxLng = mid
      }
    } else {
      const mid = (minLat + maxLat) / 2
      if (lat >= mid) {
        ch |= BITS[bit]
        minLat = mid
      } else {
        maxLat = mid
      }
    }

    isEven = !isEven
    if (bit < 4) {
      bit++
    } else {
      hash += BASE32[ch]
      bit = 0
      ch = 0
    }
  }

  return hash
}

/**
 * 获取 GeoHash 相邻的 8 个格子（用于扩展查询）
 */
export function getAdjacentGeoHashes(hash: string): string[] {
  const result: string[] = [hash]

  // 简化实现：返回相同前缀的哈希范围
  const prefix = hash.slice(0, -1)

  // 实际应实现完整的相邻格子算法
  // 这里返回简化版本
  for (let i = 0; i < BASE32.length; i++) {
    result.push(prefix + BASE32[i])
  }

  return result
}

/**
 * 计算两点之间的距离（单位：km）
 * 使用 Haversine 公式
 */
export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371 // 地球半径（km）
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}
