// Error Handler for VidGro Admin Panel
// Provides centralized error handling and recovery mechanisms

export interface ErrorContext {
  userId?: string
  adminId?: string
  action?: string
  component?: string
  metadata?: Record<string, any>
}

export interface HandledError {
  type: 'PERMISSION_DENIED' | 'AUTH_ERROR' | 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR'
  message: string
  retry: boolean
  action?: 'LOGOUT' | 'REFRESH' | 'REDIRECT'
  originalError?: Error
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: Array<{ error: Error; context: ErrorContext; timestamp: string }> = []

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // Main error handling method
  handle(error: Error, context: ErrorContext = {}): HandledError {
    const timestamp = new Date().toISOString()
    
    // Log error locally
    this.errorLog.push({ error, context, timestamp })
    console.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp
    })

    // Send to external error tracking service (mock)
    this.sendToErrorTracking(error, context)

    // Categorize and handle error
    return this.categorizeError(error, context)
  }

  // Categorize error types
  private categorizeError(error: Error, context: ErrorContext): HandledError {
    const message = error.message.toLowerCase()

    // Permission denied errors
    if (message.includes('pgrst301') || message.includes('permission denied') || message.includes('unauthorized')) {
      return {
        type: 'PERMISSION_DENIED',
        message: 'You do not have permission to perform this action',
        retry: false,
        originalError: error
      }
    }

    // Authentication errors
    if (message.includes('jwt') || message.includes('token') || message.includes('authentication')) {
      return {
        type: 'AUTH_ERROR',
        message: 'Authentication failed. Please log in again.',
        retry: false,
        action: 'LOGOUT',
        originalError: error
      }
    }

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return {
        type: 'NETWORK_ERROR',
        message: 'Network connection failed. Please check your internet connection.',
        retry: true,
        originalError: error
      }
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return {
        type: 'VALIDATION_ERROR',
        message: 'Please check your input and try again.',
        retry: false,
        originalError: error
      }
    }

    // Unknown errors
    return {
      type: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      retry: true,
      originalError: error
    }
  }

  // Retry mechanism with exponential backoff
  async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    initialDelay: number = 1000,
    context: ErrorContext = {}
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxAttempts) {
          throw this.handle(lastError, { ...context, attempt })
        }
        
        const delay = initialDelay * Math.pow(2, attempt - 1) // Exponential backoff
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, error)
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }

  // Send error to external tracking service
  private async sendToErrorTracking(error: Error, context: ErrorContext): Promise<void> {
    try {
      // Mock implementation - in real app, this would send to Sentry, Bugsnag, etc.
      const errorData = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }

      console.log('📊 Error tracked:', errorData)
      
      // Store in localStorage for demo
      const errors = this.getStoredErrors()
      errors.push(errorData)
      localStorage.setItem('vidgro_error_log', JSON.stringify(errors.slice(-100))) // Keep last 100 errors
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError)
    }
  }

  // Get error statistics
  getErrorStats(timeframe: '24h' | '7d' | '30d' = '7d'): {
    total: number
    byType: Record<string, number>
    byComponent: Record<string, number>
    recent: Array<{ error: Error; context: ErrorContext; timestamp: string }>
  } {
    const now = new Date()
    const cutoff = new Date(now.getTime() - this.getTimeframeMs(timeframe))
    
    const recentErrors = this.errorLog.filter(
      entry => new Date(entry.timestamp) > cutoff
    )

    const byType: Record<string, number> = {}
    const byComponent: Record<string, number> = {}

    recentErrors.forEach(entry => {
      const handledError = this.categorizeError(entry.error, entry.context)
      byType[handledError.type] = (byType[handledError.type] || 0) + 1
      
      if (entry.context.component) {
        byComponent[entry.context.component] = (byComponent[entry.context.component] || 0) + 1
      }
    })

    return {
      total: recentErrors.length,
      byType,
      byComponent,
      recent: recentErrors.slice(-10) // Last 10 errors
    }
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = []
    localStorage.removeItem('vidgro_error_log')
  }

  // Get stored errors from localStorage
  private getStoredErrors(): any[] {
    try {
      const stored = localStorage.getItem('vidgro_error_log')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Convert timeframe to milliseconds
  private getTimeframeMs(timeframe: '24h' | '7d' | '30d'): number {
    switch (timeframe) {
      case '24h': return 24 * 60 * 60 * 1000
      case '7d': return 7 * 24 * 60 * 60 * 1000
      case '30d': return 30 * 24 * 60 * 60 * 1000
      default: return 24 * 60 * 60 * 1000
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Utility function for API calls with error handling
export const apiCall = async <T>(
  operation: () => Promise<T>,
  context: ErrorContext = {}
): Promise<T> => {
  try {
    return await errorHandler.retry(operation, 3, 1000, context)
  } catch (error) {
    throw errorHandler.handle(error as Error, context)
  }
}

// React hook for error handling
export const useErrorHandler = () => {
  const handleError = (error: Error, context: ErrorContext = {}) => {
    return errorHandler.handle(error, context)
  }

  const retryOperation = async <T>(
    operation: () => Promise<T>,
    context: ErrorContext = {}
  ): Promise<T> => {
    return errorHandler.retry(operation, 3, 1000, context)
  }

  const getErrorStats = (timeframe: '24h' | '7d' | '30d' = '7d') => {
    return errorHandler.getErrorStats(timeframe)
  }

  return {
    handleError,
    retryOperation,
    getErrorStats,
    clearErrorLog: () => errorHandler.clearErrorLog()
  }
}