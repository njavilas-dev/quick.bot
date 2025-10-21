export type Environment = 'development' | 'preview' | 'production'

export const getEnvironment = (): Environment => {
  if (typeof window === 'undefined') {
    const vercelEnv = process.env.VERCEL_ENV
    if (vercelEnv === 'production' || vercelEnv === 'preview' || vercelEnv === 'development') {
      return vercelEnv
    }
  } else {
    const publicEnv = process.env.NEXT_PUBLIC_VERCEL_ENV
    if (publicEnv === 'production' || publicEnv === 'preview' || publicEnv === 'development') {
      return publicEnv
    }
  }

  return process.env.NODE_ENV === 'production' ? 'production' : 'development'
}

export const isProduction = (): boolean => {
  return getEnvironment() === 'production'
}

export const isPreview = (): boolean => {
  return getEnvironment() === 'preview'
}

export const isDevelopment = (): boolean => {
  return getEnvironment() === 'development'
}

export const isProductionOrPreview = (): boolean => {
  const env = getEnvironment()
  return env === 'production' || env === 'preview'
}
