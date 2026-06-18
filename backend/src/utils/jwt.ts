import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'geoservice-secret-key-dev'
const ACCESS_TOKEN_EXPIRES = '7d'
const REFRESH_TOKEN_EXPIRES = '30d'

interface TokenPayload {
  providerId: string
  phone: string
  isResource?: boolean
}

interface TokenPair {
  accessToken: string
  refreshToken: string
}

export function generateTokens(payload: TokenPayload): TokenPair {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
    issuer: 'geoservice'
  })

  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
    issuer: 'geoservice'
  })

  return { accessToken, refreshToken }
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { issuer: 'geoservice' }) as TokenPayload
    return decoded
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { issuer: 'geoservice' }) as TokenPayload
    return decoded
  } catch {
    return null
  }
}
