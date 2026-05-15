import { createShooConvexAuth, useShooAuth } from '@shoojs/react'

interface FetchAccessTokenOptions {
  forceRefreshToken: boolean
}

const redirectUri =
  import.meta.env.VITE_SHOO_REDIRECT_URI ??
  (import.meta.env.DEV
    ? 'http://localhost:3000/shoo/callback'
    : 'https://www.vibecodingtutorial.de/shoo/callback')

const shooAuth = createShooConvexAuth({
  callbackPath: '/shoo/callback',
  redirectUri,
})

export const { signIn, signOut } = shooAuth

export function useAuth() {
  if (typeof window === 'undefined') {
    return {
      isLoading: false,
      isAuthenticated: false,
      fetchAccessToken: (_opts: FetchAccessTokenOptions) =>
        Promise.resolve(null),
    }
  }

  return shooAuth.useAuth()
}

export function useShooIdentityName() {
  const { identity } = useShooAuth({
    callbackPath: '/shoo/callback',
    redirectUri,
  })

  return identity.userId
}

export function useIsShooAuthenticated() {
  return useShooIdentityName() !== null
}
