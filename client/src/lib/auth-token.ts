const STORAGE_KEY = "apex-grips:auth-token"

// Storage can be unavailable (private mode, blocked site data); the customer
// then just has to sign in again on the next visit.

export function readAuthToken() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function saveAuthToken(token: string) {
  try {
    localStorage.setItem(STORAGE_KEY, token)
  } catch {
    // Keep the session in memory only
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing stored
  }
}
