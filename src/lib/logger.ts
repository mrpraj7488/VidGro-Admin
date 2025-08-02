// Centralized logging utility for VidGro Admin Panel
// Replaces scattered console.log statements with structured logging

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: string
  component?: string
}

class Logger {
  private isDevelopment = import.meta.env.DEV
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private log(level: LogLevel, message: string, data?: any, component?: string) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      component
    }

    // Add to internal log store
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Only log to console in development
    if (this.isDevelopment) {
      const logMethod = console[level] || console.log
      const prefix = `[${level.toUpperCase()}] ${component ? `[${component}] ` : ''}`
      
      if (data) {
        logMethod(prefix + message, data)
      } else {
        logMethod(prefix + message)
      }
    }
  }

  debug(message: string, data?: any, component?: string) {
    this.log('debug', message, data, component)
  }

  info(message: string, data?: any, component?: string) {
    this.log('info', message, data, component)
  }

  warn(message: string, data?: any, component?: string) {
    this.log('warn', message, data, component)
  }

  error(message: string, data?: any, component?: string) {
    this.log('error', message, data, component)
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level)
    }
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
  }
}

export const logger = new Logger()