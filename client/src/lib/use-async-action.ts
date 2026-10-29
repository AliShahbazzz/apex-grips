import { useCallback, useState } from "react"

function toMessage(error: unknown) {
  // fetch() rejects with a TypeError when the server can't be reached
  if (error instanceof TypeError) return "Can't reach the server. Try again."
  return error instanceof Error ? error.message : "Something went wrong. Try again."
}

/** Pending and error state for a form submit. `run` resolves to true on success. */
export function useAsyncAction() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (action: () => Promise<void>) => {
    setPending(true)
    setError(null)
    try {
      await action()
      return true
    } catch (caught) {
      setError(toMessage(caught))
      return false
    } finally {
      setPending(false)
    }
  }, [])

  return { pending, error, run }
}
