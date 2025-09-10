import { useState, useCallback } from 'react'
import { z, ZodSchema, ZodError } from 'zod'

export interface FormError {
  field: string
  message: string
}

export interface UseFormValidationReturn<T> {
  errors: FormError[]
  setErrors: (errors: FormError[]) => void
  clearErrors: () => void
  clearFieldError: (field: string) => void
  validateField: (field: keyof T, value: any) => boolean
  validateForm: (data: T) => boolean
  getFieldError: (field: string) => string | undefined
  hasErrors: boolean
  hasFieldError: (field: string) => boolean
}

export function useFormValidation<T extends Record<string, any>>(
  schema: ZodSchema<T>
): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<FormError[]>([])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => prev.filter(error => error.field !== field))
  }, [])

  const validateField = useCallback((field: keyof T, value: any): boolean => {
    try {
      // Create a partial schema for the field
      const fieldSchema = schema.pick({ [field]: true } as any)
      fieldSchema.parse({ [field]: value })
      
      // Clear field error if validation passes
      clearFieldError(field as string)
      return true
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldError = error.errors.find(err => err.path[0] === field)
        if (fieldError) {
          setErrors(prev => [
            ...prev.filter(e => e.field !== field),
            {
              field: field as string,
              message: fieldError.message
            }
          ])
        }
      }
      return false
    }
  }, [schema, clearFieldError])

  const validateForm = useCallback((data: T): boolean => {
    try {
      schema.parse(data)
      setErrors([])
      return true
    } catch (error) {
      if (error instanceof ZodError) {
        const formErrors: FormError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        setErrors(formErrors)
      }
      return false
    }
  }, [schema])

  const getFieldError = useCallback((field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message
  }, [errors])

  const hasErrors = errors.length > 0

  const hasFieldError = useCallback((field: string): boolean => {
    return errors.some(error => error.field === field)
  }, [errors])

  return {
    errors,
    setErrors,
    clearErrors,
    clearFieldError,
    validateField,
    validateForm,
    getFieldError,
    hasErrors,
    hasFieldError
  }
}

// Hook for real-time validation
export function useRealTimeValidation<T extends Record<string, any>>(
  schema: ZodSchema<T>,
  debounceMs: number = 300
) {
  const [errors, setErrors] = useState<FormError[]>([])
  const [isValidating, setIsValidating] = useState(false)

  const validateField = useCallback(
    debounce(async (field: keyof T, value: any) => {
      setIsValidating(true)
      
      try {
        const fieldSchema = schema.pick({ [field]: true } as any)
        await fieldSchema.parseAsync({ [field]: value })
        
        setErrors(prev => prev.filter(error => error.field !== field))
      } catch (error) {
        if (error instanceof ZodError) {
          const fieldError = error.errors.find(err => err.path[0] === field)
          if (fieldError) {
            setErrors(prev => [
              ...prev.filter(e => e.field !== field),
              {
                field: field as string,
                message: fieldError.message
              }
            ])
          }
        }
      } finally {
        setIsValidating(false)
      }
    }, debounceMs),
    [schema, debounceMs]
  )

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const getFieldError = useCallback((field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message
  }, [errors])

  return {
    errors,
    validateField,
    clearErrors,
    getFieldError,
    isValidating
  }
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Form submission hook
export function useFormSubmission<T extends Record<string, any>>(
  schema: ZodSchema<T>,
  onSubmit: (data: T) => Promise<void> | void
) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const validation = useFormValidation(schema)

  const handleSubmit = useCallback(async (data: T) => {
    setSubmitError(null)
    
    // Validate form
    if (!validation.validateForm(data)) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await onSubmit(data)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Form gönderilirken hata oluştu'
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [schema, onSubmit, validation])

  return {
    ...validation,
    handleSubmit,
    isSubmitting,
    submitError,
    setSubmitError
  }
}
