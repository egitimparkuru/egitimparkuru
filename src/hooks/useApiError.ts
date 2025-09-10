import { useState, useCallback } from 'react'

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

export interface UseApiErrorReturn {
  error: ApiError | null
  setError: (error: ApiError | null) => void
  clearError: () => void
  handleApiError: (error: any) => void
}

export function useApiError(): UseApiErrorReturn {
  const [error, setError] = useState<ApiError | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleApiError = useCallback((error: any) => {
    console.error('API Error:', error)

    if (error?.response?.data) {
      // API response error
      const apiError = error.response.data
      setError({
        message: apiError.error || apiError.message || 'Bir hata oluştu',
        code: apiError.code,
        status: error.response.status,
        details: apiError.details
      })
    } else if (error?.message) {
      // Generic error
      setError({
        message: error.message,
        code: error.code,
        status: error.status
      })
    } else {
      // Unknown error
      setError({
        message: 'Beklenmeyen bir hata oluştu',
        code: 'UNKNOWN_ERROR'
      })
    }
  }, [])

  return {
    error,
    setError,
    clearError,
    handleApiError
  }
}

// Error message helper
export function getErrorMessage(error: ApiError | null): string {
  if (!error) return ''
  
  // Map common error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    'VALIDATION_ERROR': 'Girilen bilgilerde hata var',
    'UNAUTHORIZED': 'Oturum süreniz dolmuş, lütfen tekrar giriş yapın',
    'FORBIDDEN': 'Bu işlem için yetkiniz bulunmuyor',
    'NOT_FOUND': 'Aradığınız kayıt bulunamadı',
    'CONFLICT': 'Bu bilgi zaten mevcut',
    'RATE_LIMIT': 'Çok fazla istek gönderdiniz, lütfen bekleyin',
    'SERVER_ERROR': 'Sunucu hatası, lütfen daha sonra tekrar deneyin',
    'NETWORK_ERROR': 'İnternet bağlantınızı kontrol edin',
    'UNKNOWN_ERROR': 'Beklenmeyen bir hata oluştu'
  }

  return errorMessages[error.code || ''] || error.message
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export function getErrorSeverity(error: ApiError | null): ErrorSeverity {
  if (!error) return ErrorSeverity.LOW

  const status = error.status || 0

  if (status >= 500) return ErrorSeverity.CRITICAL
  if (status >= 400) return ErrorSeverity.HIGH
  if (status >= 300) return ErrorSeverity.MEDIUM
  return ErrorSeverity.LOW
}
