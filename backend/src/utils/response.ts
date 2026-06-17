// 统一响应格式
import { Response } from 'express'

interface SuccessResponse<T = unknown> {
  success: true
  data: T
}

interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse

export function success<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data
  }
}

export function error(code: string, message: string, details?: unknown): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  }
}
