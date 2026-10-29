import { createContext } from "react"
import type { Customer, CustomerProfile } from "@/api/auth"

export type SignUpInput = CustomerProfile & {
  email: string
  password: string
}

export type AuthContextValue = {
  /** "loading" while a saved session is being restored */
  status: "loading" | "signedOut" | "signedIn"
  customer: Customer | null
  token: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: SignUpInput) => Promise<void>
  signOut: () => void
  updateProfile: (profile: CustomerProfile) => Promise<void>
  /** Token from a password reset link (?reset_token=…), if the page was opened with one */
  resetToken: string | null
  completePasswordReset: (password: string) => Promise<void>
  dismissPasswordReset: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
