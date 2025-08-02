// Environment Variables Manager
// Handles reading and writing environment variables

export interface EnvironmentVariables {
  // Supabase Configuration
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
  VITE_SUPABASE_SERVICE_ROLE_KEY: string
  
  // Admin Configuration
  VITE_ADMIN_EMAIL: string
  VITE_ADMIN_SECRET_KEY: string
  
  // App Configuration
  VITE_APP_NAME: string
  VITE_API_BASE_URL: string
  
  // Firebase Configuration
  VITE_FIREBASE_PROJECT_ID: string
  VITE_FIREBASE_CLIENT_EMAIL: string
  VITE_FIREBASE_PRIVATE_KEY: string
  VITE_FCM_SERVER_KEY: string
  
  // AdMob Configuration
  ADMOB_APP_ID: string
  ADMOB_BANNER_ID: string
  ADMOB_INTERSTITIAL_ID: string
  ADMOB_REWARDED_ID: string
  
  // Security
  VITE_JWT_SECRET: string
  
  // Environment
  NODE_ENV: string
}

export const defaultEnvironmentVariables: EnvironmentVariables = {
  VITE_SUPABASE_URL: 'your_supabase_project_url',
  VITE_SUPABASE_ANON_KEY: 'your_supabase_anon_key',
  VITE_SUPABASE_SERVICE_ROLE_KEY: 'your_service_role_key',
  VITE_ADMIN_EMAIL: 'admin@vidgro.com',
  VITE_ADMIN_SECRET_KEY: 'your_admin_secret_key',
  VITE_APP_NAME: 'VidGro Admin Panel',
  VITE_API_BASE_URL: 'https://your-api-domain.com',
  VITE_FIREBASE_PROJECT_ID: 'your_firebase_project_id',
  VITE_FIREBASE_CLIENT_EMAIL: 'your_firebase_client_email',
  VITE_FIREBASE_PRIVATE_KEY: 'your_firebase_private_key',
  VITE_FCM_SERVER_KEY: 'your_fcm_server_key',
  ADMOB_APP_ID: 'ca-app-pub-1234567890123456~1234567890',
  ADMOB_BANNER_ID: 'ca-app-pub-1234567890123456/1234567890',
  ADMOB_INTERSTITIAL_ID: 'ca-app-pub-1234567890123456/1234567890',
  ADMOB_REWARDED_ID: 'ca-app-pub-1234567890123456/1234567890',
  VITE_JWT_SECRET: 'your_jwt_secret_key',
  NODE_ENV: 'development'
}

export class EnvironmentManager {
  private static instance: EnvironmentManager
  private envVars: EnvironmentVariables

  private constructor() {
    this.envVars = this.loadEnvironmentVariables()
  }

  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager()
    }
    return EnvironmentManager.instance
  }

  // Load environment variables from various sources
  private loadEnvironmentVariables(): EnvironmentVariables {
    // First try to load from import.meta.env (Vite environment)
    const envFromVite: Partial<EnvironmentVariables> = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_SUPABASE_SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
      VITE_ADMIN_EMAIL: import.meta.env.VITE_ADMIN_EMAIL,
      VITE_ADMIN_SECRET_KEY: import.meta.env.VITE_ADMIN_SECRET_KEY,
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      VITE_FIREBASE_CLIENT_EMAIL: import.meta.env.VITE_FIREBASE_CLIENT_EMAIL,
      VITE_FIREBASE_PRIVATE_KEY: import.meta.env.VITE_FIREBASE_PRIVATE_KEY,
      VITE_FCM_SERVER_KEY: import.meta.env.VITE_FCM_SERVER_KEY,
      ADMOB_APP_ID: import.meta.env.ADMOB_APP_ID,
      ADMOB_BANNER_ID: import.meta.env.ADMOB_BANNER_ID,
      ADMOB_INTERSTITIAL_ID: import.meta.env.ADMOB_INTERSTITIAL_ID,
      ADMOB_REWARDED_ID: import.meta.env.ADMOB_REWARDED_ID,
      VITE_JWT_SECRET: import.meta.env.VITE_JWT_SECRET,
      NODE_ENV: import.meta.env.NODE_ENV
    }

    // Then try to load from localStorage (for admin panel updates)
    const envFromStorage = this.loadFromStorage()

    // Merge with defaults, prioritizing storage > vite > defaults
    return {
      ...defaultEnvironmentVariables,
      ...envFromVite,
      ...envFromStorage
    }
  }

  // Load environment variables from localStorage
  private loadFromStorage(): Partial<EnvironmentVariables> {
    try {
      const stored = localStorage.getItem('vidgro_env_vars')
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Failed to load environment variables from storage:', error)
      return {}
    }
  }

  // Save environment variables to localStorage and generate .env content
  public async saveEnvironmentVariables(newVars: Partial<EnvironmentVariables>): Promise<{
    success: boolean
    message: string
    envContent?: string
  }> {
    try {
      // Update current environment variables
      this.envVars = { ...this.envVars, ...newVars }

      // Save to localStorage
      localStorage.setItem('vidgro_env_vars', JSON.stringify(this.envVars))

      // Generate .env file content
      const envContent = this.generateEnvFileContent(this.envVars)

      // In a real application, you would send this to a backend API
      // For demo purposes, we'll simulate the file save
      console.log('Environment variables updated:', this.envVars)
      console.log('Generated .env content:', envContent)

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      return {
        success: true,
        message: 'Environment variables saved successfully! Please restart the application for changes to take effect.',
        envContent
      }
    } catch (error) {
      console.error('Failed to save environment variables:', error)
      return {
        success: false,
        message: 'Failed to save environment variables. Please try again.'
      }
    }
  }

  // Generate .env file content
  private generateEnvFileContent(vars: EnvironmentVariables): string {
    return `# Supabase Configuration
VITE_SUPABASE_URL=${vars.VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${vars.VITE_SUPABASE_ANON_KEY}
VITE_SUPABASE_SERVICE_ROLE_KEY=${vars.VITE_SUPABASE_SERVICE_ROLE_KEY}

# Admin Configuration
VITE_ADMIN_EMAIL=${vars.VITE_ADMIN_EMAIL}
VITE_ADMIN_SECRET_KEY=${vars.VITE_ADMIN_SECRET_KEY}

# App Configuration
VITE_APP_NAME=${vars.VITE_APP_NAME}
VITE_API_BASE_URL=${vars.VITE_API_BASE_URL}

# Firebase Configuration (for push notifications)
VITE_FIREBASE_PROJECT_ID=${vars.VITE_FIREBASE_PROJECT_ID}
VITE_FIREBASE_CLIENT_EMAIL=${vars.VITE_FIREBASE_CLIENT_EMAIL}
VITE_FIREBASE_PRIVATE_KEY=${vars.VITE_FIREBASE_PRIVATE_KEY}
VITE_FCM_SERVER_KEY=${vars.VITE_FCM_SERVER_KEY}

# AdMob Configuration
ADMOB_APP_ID=${vars.ADMOB_APP_ID}
ADMOB_BANNER_ID=${vars.ADMOB_BANNER_ID}
ADMOB_INTERSTITIAL_ID=${vars.ADMOB_INTERSTITIAL_ID}
ADMOB_REWARDED_ID=${vars.ADMOB_REWARDED_ID}

# Security
VITE_JWT_SECRET=${vars.VITE_JWT_SECRET}

# Environment
NODE_ENV=${vars.NODE_ENV}`
  }

  // Get current environment variables
  public getEnvironmentVariables(): EnvironmentVariables {
    return { ...this.envVars }
  }

  // Get a specific environment variable
  public getEnvVar(key: keyof EnvironmentVariables): string {
    return this.envVars[key]
  }

  // Check if environment is properly configured
  public isConfigured(): boolean {
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_ADMIN_EMAIL'
    ] as const

    return requiredVars.every(key => {
      const value = this.envVars[key]
      return value && !value.startsWith('your_') && value !== ''
    })
  }

  // Get configuration status
  public getConfigurationStatus(): {
    isConfigured: boolean
    missingVars: string[]
    configuredVars: string[]
  } {
    const allVars = Object.keys(this.envVars) as (keyof EnvironmentVariables)[]
    const missingVars: string[] = []
    const configuredVars: string[] = []

    allVars.forEach(key => {
      const value = this.envVars[key]
      if (!value || value.startsWith('your_') || value === '') {
        missingVars.push(key)
      } else {
        configuredVars.push(key)
      }
    })

    return {
      isConfigured: missingVars.length === 0,
      missingVars,
      configuredVars
    }
  }

  // Download .env file
  public downloadEnvFile(): void {
    const content = this.generateEnvFileContent(this.envVars)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = '.env'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// Export singleton instance
export const envManager = EnvironmentManager.getInstance()