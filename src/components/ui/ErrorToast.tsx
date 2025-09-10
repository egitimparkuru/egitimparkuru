'use client'

import React, { useState, useEffect } from 'react'
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { ApiError, ErrorSeverity, getErrorMessage, getErrorSeverity } from '@/hooks/useApiError'

interface ErrorToastProps {
  error: ApiError | null
  onClose: () => void
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export function ErrorToast({ 
  error, 
  onClose, 
  duration = 5000,
  position = 'top-right'
}: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (error) {
      setIsVisible(true)
      setIsExiting(false)

      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose()
        }, duration)

        return () => clearTimeout(timer)
      }
    } else {
      handleClose()
    }
  }, [error, duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 300)
  }

  if (!error || !isVisible) return null

  const message = getErrorMessage(error)
  const severity = getErrorSeverity(error)

  const getIcon = () => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case ErrorSeverity.MEDIUM:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case ErrorSeverity.LOW:
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'bg-red-50 border-red-200'
      case ErrorSeverity.MEDIUM:
        return 'bg-yellow-50 border-yellow-200'
      case ErrorSeverity.LOW:
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getTextColor = () => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'text-red-800'
      case ErrorSeverity.MEDIUM:
        return 'text-yellow-800'
      case ErrorSeverity.LOW:
        return 'text-blue-800'
      default:
        return 'text-gray-800'
    }
  }

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50 max-w-sm w-full'
    
    switch (position) {
      case 'top-right':
        return `${baseClasses} top-4 right-4`
      case 'top-left':
        return `${baseClasses} top-4 left-4`
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`
      case 'top-center':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`
      case 'bottom-center':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`
      default:
        return `${baseClasses} top-4 right-4`
    }
  }

  return (
    <div className={getPositionClasses()}>
      <div
        className={`
          ${getBackgroundColor()}
          border rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out
          ${isExiting ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'}
        `}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <div className={`text-sm font-medium ${getTextColor()}`}>
              {message}
            </div>
            {error.details && (
              <div className={`mt-1 text-xs ${getTextColor()} opacity-75`}>
                {typeof error.details === 'string' 
                  ? error.details 
                  : JSON.stringify(error.details)
                }
              </div>
            )}
            {error.code && (
              <div className={`mt-1 text-xs ${getTextColor()} opacity-50`}>
                Hata Kodu: {error.code}
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`inline-flex ${getTextColor()} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Success toast component
interface SuccessToastProps {
  message: string
  onClose: () => void
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export function SuccessToast({ 
  message, 
  onClose, 
  duration = 3000,
  position = 'top-right'
}: SuccessToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    setIsExiting(false)

    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 300)
  }

  if (!isVisible) return null

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50 max-w-sm w-full'
    
    switch (position) {
      case 'top-right':
        return `${baseClasses} top-4 right-4`
      case 'top-left':
        return `${baseClasses} top-4 left-4`
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`
      case 'top-center':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`
      case 'bottom-center':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`
      default:
        return `${baseClasses} top-4 right-4`
    }
  }

  return (
    <div className={getPositionClasses()}>
      <div
        className={`
          bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out
          ${isExiting ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'}
        `}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="ml-3 flex-1">
            <div className="text-sm font-medium text-green-800">
              {message}
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex text-green-800 hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
