// Environment Variables Manager
export interface EnvironmentVariables {
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
  VITE_SUPABASE_SERVICE_ROLE_KEY: string
  VITE_ADMIN_EMAIL: string
  VITE_ADMIN_SECRET_KEY: string
  VITE_APP_NAME: string
  VITE_API_BASE_URL: string
  VITE_FIREBASE_PROJECT_ID: string
  VITE_FIREBASE_CLIENT_EMAIL: string
  VITE_FIREBASE_PRIVATE_KEY: string
  VITE_FCM_SERVER_KEY: string
  ADMOB_APP_ID: string
  ADMOB_BANNER_ID: string
  ADMOB_INTERSTITIAL_ID: string
  ADMOB_REWARDED_ID: string
  VITE_JWT_SECRET: string
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

  private loadEnvironmentVariables(): EnvironmentVariables {
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

    const envFromStorage = this.loadFromStorage()

    const mergedEnv = {
      ...defaultEnvironmentVariables,
      ...envFromStorage,
      ...envFromVite
    }

    return mergedEnv
  }

  private loadFromStorage(): Partial<EnvironmentVariables> {
    try {
      if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
        return {}
      }
      
      const stored = localStorage.getItem('vidgro_env_vars')
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Failed to load environment variables from storage:', error)
      return {}
    }
  }

  public async saveEnvironmentVariables(newVars: Partial<EnvironmentVariables>): Promise<{
    success: boolean
    message: string
    envContent?: string
  }> {
    try {
      this.envVars = { ...this.envVars, ...newVars }
      localStorage.setItem('vidgro_env_vars', JSON.stringify(this.envVars))

      const envContent = this.generateEnvFileContent(this.envVars)

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
          console.log('Backend sync result:', syncResult.success)
        }
      } catch (syncErr) {
        console.warn('Env sync to backend failed:', (syncErr as Error).message)
      }

      await new Promise(resolve => setTimeout(resolve, 500))

      return {
        success: true,
        message: 'Environment variables saved successfully!',
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

# Firebase Configuration
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

  public forceReloadFromEnv(): void {
    try {
      localStorage.removeItem('vidgro_env_vars')
      EnvironmentManager.instance = new EnvironmentManager()
      this.envVars = EnvironmentManager.instance.envVars
      
      const currentServiceKey = this.envVars.VITE_SUPABASE_SERVICE_ROLE_KEY
      if (!currentServiceKey || currentServiceKey.length < 200) {
        this.envVars.VITE_SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1aWJzd3FmbWhoZHlidHRiY29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4MjA1NiwiZXhwIjoyMDY5MzU4MDU2fQ.hJNaVa025MEen4DM567AO1y0NQxAZO3HWt6nbX6OBKs'
      }
    } catch (error) {
      console.error('Failed to force reload environment:', error)
    }
  }

  public getEnvironmentVariables(): EnvironmentVariables {
    return { ...this.envVars }
  }

  public getEnvVar(key: keyof EnvironmentVariables): string {
    return this.envVars[key]
  }

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

export const envManager = EnvironmentManager.getInstance()
