// Optimized Environment Variables Manager
export interface EnvironmentVariables {
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceRoleKey: string
  adminEmail: string
  adminSecretKey: string
  appName: string
  apiBaseUrl: string
  admobAppId: string
  admobBannerId: string
  admobInterstitialId: string
  admobRewardedId: string
  jwtSecret: string
  nodeEnv: string
}

// Extend ImportMeta interface for Vite environment variables
declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string
    readonly VITE_ADMIN_EMAIL: string
    readonly VITE_ADMIN_SECRET_KEY: string
    readonly VITE_APP_NAME: string
    readonly VITE_API_BASE_URL: string
    readonly VITE_ADMOB_APP_ID: string
    readonly VITE_ADMOB_BANNER_ID: string
    readonly VITE_ADMOB_INTERSTITIAL_ID: string
    readonly VITE_ADMOB_REWARDED_ID: string
    readonly VITE_JWT_SECRET: string
    readonly VITE_NODE_ENV: string
    readonly NODE_ENV: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

// Default environment variables - fallback values only
const defaultEnvVars: EnvironmentVariables = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  supabaseServiceRoleKey: '',
  adminEmail: '',
  adminSecretKey: '',
  appName: 'VidGro Admin Panel',
  apiBaseUrl: 'http://localhost:5173',
  admobAppId: '',
  admobBannerId: '',
  admobInterstitialId: '',
  admobRewardedId: '',
  jwtSecret: '',
  nodeEnv: 'development'
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
    // Get Vite environment variables with validation
    const viteEnv = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      supabaseServiceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
      adminEmail: import.meta.env.VITE_ADMIN_EMAIL || '',
      adminSecretKey: import.meta.env.VITE_ADMIN_SECRET_KEY || '',
      appName: import.meta.env.VITE_APP_NAME || 'VidGro Admin Panel',
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173',
      admobAppId: import.meta.env.VITE_ADMOB_APP_ID || '',
      admobBannerId: import.meta.env.VITE_ADMOB_BANNER_ID || '',
      admobInterstitialId: import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || '',
      admobRewardedId: import.meta.env.VITE_ADMOB_REWARDED_ID || '',
      jwtSecret: import.meta.env.VITE_JWT_SECRET || '',
      nodeEnv: import.meta.env.VITE_NODE_ENV || import.meta.env.NODE_ENV || 'development'
    }

    const localStorageOverrides = this.loadFromStorage()

    // Validate critical environment variables
    this.validateCriticalVars(viteEnv)

    // Merge with defaults and local storage overrides
    const merged = {
      ...defaultEnvVars,
      ...viteEnv,
      ...localStorageOverrides
    }

    // Filter out undefined values and ensure type safety
    const filtered = Object.fromEntries(
      Object.entries(merged).filter(([_, value]) => value !== undefined && value !== '')
    ) as unknown as EnvironmentVariables

    return filtered
  }

  private loadFromStorage(): Partial<EnvironmentVariables> {
    try {
      if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
        return {}
      }
      
      const stored = localStorage.getItem('vidgro_env_vars')
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      // Failed to load environment variables from storage
      return {}
    }
  }

  private validateCriticalVars(envVars: Partial<EnvironmentVariables>): void {
    const criticalVars = [
      'supabaseUrl',
      'supabaseAnonKey',
      'adminEmail',
      'adminSecretKey'
    ]

    const missingVars = criticalVars.filter(varName => 
      !envVars[varName as keyof EnvironmentVariables] || 
      envVars[varName as keyof EnvironmentVariables] === ''
    )

    if (missingVars.length > 0 && import.meta.env.NODE_ENV === 'production') {
      // Missing critical environment variables
    }
  }

  public async saveEnvironmentVariables(newVars: Partial<EnvironmentVariables>): Promise<{
    success: boolean
    message: string
    envContent?: string
  }> {
    try {
      // Update current environment variables
      this.envVars = { ...this.envVars, ...newVars }

      // Save to localStorage for persistence
      if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
        localStorage.setItem('vidgro_env_vars', JSON.stringify(newVars))
      }

      // Generate .env file content
      const envContent = this.generateEnvContent()

      return {
        success: true,
        message: 'Environment variables updated successfully',
        envContent
      }
    } catch (error) {
      // Failed to save environment variables
      return {
        success: false,
        message: 'Failed to save environment variables'
      }
    }
  }

  public getEnvironmentVariables(): EnvironmentVariables {
    return { ...this.envVars }
  }

  public getVariable(key: keyof EnvironmentVariables): string {
    return this.envVars[key] || ''
  }

  public generateEnvContent(): string {
    const vars = this.envVars
    return `# VidGro Admin Panel Environment Configuration
# Generated on ${new Date().toISOString()}

# =============================================================================
# SUPABASE CONFIGURATION
# =============================================================================
VITE_SUPABASE_URL=${vars.supabaseUrl}
VITE_SUPABASE_ANON_KEY=${vars.supabaseAnonKey}
VITE_SUPABASE_SERVICE_ROLE_KEY=${vars.supabaseServiceRoleKey}

# =============================================================================
# ADMIN CONFIGURATION
# =============================================================================
VITE_ADMIN_EMAIL=${vars.adminEmail}
VITE_ADMIN_SECRET_KEY=${vars.adminSecretKey}

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================
VITE_APP_NAME=${vars.appName}
VITE_API_BASE_URL=${vars.apiBaseUrl}

# =============================================================================
# ADMOB CONFIGURATION
# =============================================================================
VITE_ADMOB_APP_ID=${vars.admobAppId}
VITE_ADMOB_BANNER_ID=${vars.admobBannerId}
VITE_ADMOB_INTERSTITIAL_ID=${vars.admobInterstitialId}
VITE_ADMOB_REWARDED_ID=${vars.admobRewardedId}

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
VITE_JWT_SECRET=${vars.jwtSecret}

# =============================================================================
# ENVIRONMENT CONFIGURATION
# =============================================================================
NODE_ENV=${vars.nodeEnv}
VITE_NODE_ENV=${vars.nodeEnv}
`
  }

  public reload(): void {
    this.envVars = this.loadEnvironmentVariables()
  }

  public downloadEnvFile(): void {
    const content = this.generateEnvContent()
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
