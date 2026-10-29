import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  createCustomer,
  getCustomer,
  login,
  registerIdentity,
  resetPassword,
  updateCustomer,
  type Customer,
  type CustomerProfile,
} from "@/api/auth"
import { AuthContext, type AuthContextValue, type SignUpInput } from "@/auth/context"
import { clearAuthToken, readAuthToken, saveAuthToken } from "@/lib/auth-token"
import { MedusaError } from "@/lib/medusa"

const RESET_TOKEN_PARAM = "reset_token"

type Session = { token: string; customer: Customer }

/** Reads the reset token from the URL once and removes it from the address bar */
function takeResetTokenFromUrl() {
  const url = new URL(window.location.href)
  const token = url.searchParams.get(RESET_TOKEN_PARAM)
  if (token) {
    url.searchParams.delete(RESET_TOKEN_PARAM)
    window.history.replaceState(null, "", url)
  }
  return token
}

const isUnauthorized = (error: unknown) =>
  error instanceof MedusaError && error.status === 401

/** Customer session: restores a saved login and exposes sign in/up/out. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [restoring, setRestoring] = useState(() => readAuthToken() !== null)
  const [resetToken, setResetToken] = useState(takeResetTokenFromUrl)

  // Restore the saved session; an expired token is dropped
  useEffect(() => {
    const token = readAuthToken()
    if (!token) return
    const controller = new AbortController()
    getCustomer(token, controller.signal)
      .then((customer) => setSession({ token, customer }))
      .catch((error) => {
        if (controller.signal.aborted) return
        if (isUnauthorized(error)) clearAuthToken()
      })
      .finally(() => {
        if (!controller.signal.aborted) setRestoring(false)
      })
    return () => controller.abort()
  }, [])

  const startSession = useCallback(async (token: string) => {
    const customer = await getCustomer(token)
    saveAuthToken(token)
    setSession({ token, customer })
  }, [])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const token = await login(email, password)
      try {
        await startSession(token)
      } catch (error) {
        // The login exists but sign-up stopped before the customer was created
        if (isUnauthorized(error)) {
          throw new Error("Your account isn't finished. Use Create Account with the same email.")
        }
        throw error
      }
    },
    [startSession]
  )

  const signUp = useCallback(
    async ({ email, password, ...profile }: SignUpInput) => {
      let token: string
      try {
        token = await registerIdentity(email, password)
      } catch (error) {
        if (!(error instanceof MedusaError) || !error.message.includes("already exists")) {
          throw error
        }
        // Retry a sign-up that stopped halfway, if the password matches
        token = await login(email, password).catch(() => {
          throw new Error("An account with this email already exists. Sign in instead.")
        })
        const existing = await getCustomer(token).catch(() => null)
        if (existing) {
          saveAuthToken(token)
          setSession({ token, customer: existing })
          return
        }
      }

      await createCustomer(token, email, profile)
      // The registration token has no customer attached; log in for one that does
      await startSession(await login(email, password))
    },
    [startSession]
  )

  const signOut = useCallback(() => {
    clearAuthToken()
    setSession(null)
  }, [])

  const updateProfile = useCallback(
    async (profile: CustomerProfile) => {
      if (!session) return
      try {
        const customer = await updateCustomer(session.token, profile)
        setSession({ token: session.token, customer })
      } catch (error) {
        if (isUnauthorized(error)) signOut()
        throw error
      }
    },
    [session, signOut]
  )

  const completePasswordReset = useCallback(
    async (password: string) => {
      if (!resetToken) return
      await resetPassword(resetToken, password)
      setResetToken(null)
    },
    [resetToken]
  )

  const dismissPasswordReset = useCallback(() => setResetToken(null), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status: restoring ? "loading" : session ? "signedIn" : "signedOut",
      customer: session?.customer ?? null,
      token: session?.token ?? null,
      signIn,
      signUp,
      signOut,
      updateProfile,
      resetToken,
      completePasswordReset,
      dismissPasswordReset,
    }),
    [
      restoring,
      session,
      signIn,
      signUp,
      signOut,
      updateProfile,
      resetToken,
      completePasswordReset,
      dismissPasswordReset,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
