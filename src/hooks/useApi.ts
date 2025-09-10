import { useState, useCallback, useEffect } from 'react'
import { useApiError, ApiError } from './useApiError'

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: ApiError) => void
  cacheKey?: string
  cacheTime?: number // milliseconds
}

interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

// Simple cache implementation
const cache = new Map<string, { data: any; timestamp: number }>()

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const { error, handleApiError, clearError } = useApiError()
  
  const { cacheKey, cacheTime = 5 * 60 * 1000 } = options // 5 minutes default

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    // Check cache first
    if (cacheKey) {
      const cached = cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setData(cached.data)
        return cached.data
      }
    }

    setLoading(true)
    clearError()

    try {
      const result = await apiFunction(...args)
      setData(result)
      
      // Cache the result
      if (cacheKey) {
        cache.set(cacheKey, { data: result, timestamp: Date.now() })
      }
      
      if (options.onSuccess) {
        options.onSuccess(result)
      }
      
      return result
    } catch (error) {
      handleApiError(error)
      
      if (options.onError) {
        options.onError(error)
      }
      
      return null
    } finally {
      setLoading(false)
    }
  }, [apiFunction, options, handleApiError, clearError, cacheKey, cacheTime])

  const reset = useCallback(() => {
    setData(null)
    clearError()
  }, [clearError])

  useEffect(() => {
    if (options.immediate) {
      execute()
    }
  }, [execute, options.immediate])

  return {
    data,
    loading,
    error,
    execute,
    reset
  }
}

// Hook for API mutations (POST, PUT, DELETE)
interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: ApiError) => void
  onSettled?: () => void
}

interface UseMutationReturn<T, V = any> {
  data: T | null
  loading: boolean
  error: ApiError | null
  mutate: (variables: V) => Promise<T | null>
  reset: () => void
}

export function useMutation<T = any, V = any>(
  mutationFunction: (variables: V) => Promise<T>,
  options: UseMutationOptions<T> = {}
): UseMutationReturn<T, V> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const { error, handleApiError, clearError } = useApiError()

  const mutate = useCallback(async (variables: V): Promise<T | null> => {
    setLoading(true)
    clearError()

    try {
      const result = await mutationFunction(variables)
      setData(result)
      
      if (options.onSuccess) {
        options.onSuccess(result)
      }
      
      return result
    } catch (error) {
      handleApiError(error)
      
      if (options.onError) {
        options.onError(error)
      }
      
      return null
    } finally {
      setLoading(false)
      
      if (options.onSettled) {
        options.onSettled()
      }
    }
  }, [mutationFunction, options, handleApiError, clearError])

  const reset = useCallback(() => {
    setData(null)
    clearError()
  }, [clearError])

  return {
    data,
    loading,
    error,
    mutate,
    reset
  }
}

// Hook for paginated data
interface UsePaginatedApiOptions {
  pageSize?: number
  immediate?: boolean
}

interface UsePaginatedApiReturn<T> {
  data: T[]
  loading: boolean
  error: ApiError | null
  page: number
  hasMore: boolean
  total: number
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  reset: () => void
}

export function usePaginatedApi<T = any>(
  apiFunction: (page: number, limit: number) => Promise<{
    data: T[]
    total: number
    page: number
    hasMore: boolean
  }>,
  options: UsePaginatedApiOptions = {}
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const { error, handleApiError, clearError } = useApiError()

  const pageSize = options.pageSize || 10

  const loadData = useCallback(async (pageNum: number, append = false) => {
    setLoading(true)
    if (!append) clearError()

    try {
      const result = await apiFunction(pageNum, pageSize)
      
      if (append) {
        setData(prev => [...prev, ...result.data])
      } else {
        setData(result.data)
      }
      
      setPage(result.page)
      setHasMore(result.hasMore)
      setTotal(result.total)
    } catch (error) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  }, [apiFunction, pageSize, handleApiError, clearError])

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await loadData(page + 1, true)
    }
  }, [hasMore, loading, page, loadData])

  const refresh = useCallback(async () => {
    await loadData(1, false)
  }, [loadData])

  const reset = useCallback(() => {
    setData([])
    setPage(1)
    setHasMore(true)
    setTotal(0)
    clearError()
  }, [clearError])

  useEffect(() => {
    if (options.immediate) {
      loadData(1, false)
    }
  }, [loadData, options.immediate])

  return {
    data,
    loading,
    error,
    page,
    hasMore,
    total,
    loadMore,
    refresh,
    reset
  }
}

// Hook for API polling
interface UsePollingOptions {
  interval?: number
  immediate?: boolean
  enabled?: boolean
}

export function usePolling<T = any>(
  apiFunction: () => Promise<T>,
  options: UsePollingOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const { error, handleApiError, clearError } = useApiError()

  const interval = options.interval || 5000
  const enabled = options.enabled !== false

  const fetchData = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    clearError()

    try {
      const result = await apiFunction()
      setData(result)
    } catch (error) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  }, [apiFunction, enabled, handleApiError, clearError])

  useEffect(() => {
    if (options.immediate) {
      fetchData()
    }
  }, [fetchData, options.immediate])

  useEffect(() => {
    if (!enabled) return

    const timer = setInterval(fetchData, interval)
    return () => clearInterval(timer)
  }, [fetchData, interval, enabled])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}
