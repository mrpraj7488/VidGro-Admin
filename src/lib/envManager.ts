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
  VITE_SUPABASE_URL: 'https://kuibswqfmhhdybttbcoa.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1aWJzd3FmbWhoZHlidHRiY29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODIwNTYsImV4cCI6MjA2OTM1ODA1Nn0.LRmGLu1OAcJza-eEPSIJUaFAyhxkdAGrbyRFRGSWpVw',
  VITE_SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1aWJzd3FmbWhoZHlidHRiY29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4MjA1NiwiZXhwIjoyMDY5MzU4MDU2fQ.hJNaVa025MEen4DM567AO1y0NQxAZO3HWt6nbX6OBKs',
  VITE_ADMIN_EMAIL: 'admin@vidgro.com',
  VITE_ADMIN_SECRET_KEY: 'vidgro_admin_secret_2024',
  VITE_APP_NAME: 'VidGro Admin Panel',
  VITE_API_BASE_URL: 'https://admin-vidgro.netlify.app',
  VITE_FIREBASE_PROJECT_ID: 'your_firebase_project_id',
  VITE_FIREBASE_CLIENT_EMAIL: 'your_firebase_client_email',
  VITE_FIREBASE_PRIVATE_KEY: 'your_firebase_private_key',
  VITE_FCM_SERVER_KEY: 'your_fcm_server_key',
  ADMOB_APP_ID: 'ca-app-pub-2892152842024866~2841739969',
  ADMOB_BANNER_ID: 'ca-app-pub-2892152842024866/6180566789',
  ADMOB_INTERSTITIAL_ID: 'ca-app-pub-2892152842024866/2604283857',
  ADMOB_REWARDED_ID: 'ca-app-pub-2892152842024866/2049185437',
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

    // Merge with defaults, prioritizing VITE env > storage > defaults
    // This ensures that .env file values take precedence over localStorage
    const mergedEnv = {
      ...defaultEnvironmentVariables,
      ...envFromStorage,
      ...envFromVite  // VITE env variables take highest priority
    }

    // Log the loading process for debugging
    console.log('🔍 Environment loading:')
    console.log('📋 import.meta.env VITE_SUPABASE_SERVICE_ROLE_KEY:', envFromVite.VITE_SUPABASE_SERVICE_ROLE_KEY ? (envFromVite.VITE_SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...') : 'NOT FOUND')
    console.log('📋 localStorage VITE_SUPABASE_SERVICE_ROLE_KEY:', envFromStorage.VITE_SUPABASE_SERVICE_ROLE_KEY ? (envFromStorage.VITE_SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...') : 'NOT FOUND')
    console.log('📋 Final merged VITE_SUPABASE_SERVICE_ROLE_KEY:', mergedEnv.VITE_SUPABASE_SERVICE_ROLE_KEY ? (mergedEnv.VITE_SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...') : 'NOT FOUND')

    return mergedEnv
  }

  // Load environment variables from localStorage
  private loadFromStorage(): Partial<EnvironmentVariables> {
    try {
      // Skip localStorage if we're in development mode or if explicitly disabled
      if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
        console.log('🔍 Skipping localStorage in development mode')
        return {}
      }
      
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

      // Sync critical mobile runtime vars with backend server so mobile clients get real config
      let syncSuccess = false
      try {
        const syncResponse = await fetch('/api/admin/env-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            MOBILE_SUPABASE_URL: this.envVars.VITE_SUPABASE_URL,
            MOBILE_SUPABASE_ANON_KEY: this.envVars.VITE_SUPABASE_ANON_KEY,
            SUPABASE_URL: this.envVars.VITE_SUPABASE_URL,
            SUPABASE_ANON_KEY: this.envVars.VITE_SUPABASE_ANON_KEY,
            ADMOB_APP_ID: this.envVars.ADMOB_APP_ID,
            ADMOB_BANNER_ID: this.envVars.ADMOB_BANNER_ID,
            ADMOB_INTERSTITIAL_ID: this.envVars.ADMOB_INTERSTITIAL_ID,
            ADMOB_REWARDED_ID: this.envVars.ADMOB_REWARDED_ID,
          })
        })
        
        if (syncResponse.ok) {
          const syncResult = await syncResponse.json()
          syncSuccess = syncResult.success
        } else {
          console.warn('Backend env sync failed with status:', syncResponse.status)
        }
      } catch (syncErr) {
        console.warn('Env sync to backend failed (will still work locally):', (syncErr as Error).message)
      }

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

  // Force clear localStorage cache and reload from .env file
  public forceReloadFromEnv(): void {
    try {
      console.log('🔄 Force reloading environment variables...')
      
      // Clear localStorage cache
      localStorage.removeItem('vidgro_env_vars')
      console.log('✅ Cleared localStorage cache')
      
      // Log what's in import.meta.env
      console.log('📋 import.meta.env values:')
      console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
      console.log('VITE_SUPABASE_SERVICE_ROLE_KEY:', import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...' : 'NOT FOUND')
      
      // Force reload by reinitializing the instance
      EnvironmentManager.instance = new EnvironmentManager()
      console.log('✅ Reinitialized environment manager')
      
      // Get the new instance and update the current envVars
      this.envVars = EnvironmentManager.instance.envVars
      
      // Manually set the correct service role key if it's not loaded from .env
      const currentServiceKey = this.envVars.VITE_SUPABASE_SERVICE_ROLE_KEY
      if (!currentServiceKey || currentServiceKey.length < 200) {
        console.log('🔧 Manually setting correct service role key...')
        this.envVars.VITE_SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1aWJzd3FmbWhoZHlidHRiY29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4MjA1NiwiZXhwIjoyMDY5MzU4MDU2fQ.hJNaVa025MEen4DM567AO1y0NQxAZO3HWt6nbX6OBKs'
        console.log('✅ Service role key manually set')
      }
      
      // Log the current service role key
      const serviceKey = this.envVars.VITE_SUPABASE_SERVICE_ROLE_KEY
      console.log('🔑 Current service role key:', serviceKey ? (serviceKey.substring(0, 20) + '...') : 'NOT FOUND')
      
    } catch (error) {
      console.error('Failed to force reload environment:', error)
    }
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
