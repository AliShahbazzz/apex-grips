import { useEffect } from "react"
import { Toast } from "@/components"
import { useStore } from "@/store/store"

const TOAST_DURATION_MS = 2500

export function Toaster() {
  const { state, dispatch } = useStore()
  const { toast } = state

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(
      () => dispatch({ type: "dismissToast", id: toast.id }),
      TOAST_DURATION_MS
    )
    return () => clearTimeout(timer)
  }, [toast, dispatch])

  return (
    // Always mounted so screen readers announce each new message
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex justify-center"
    >
      {toast && (
        <Toast
          key={toast.id}
          onDismiss={() => dispatch({ type: "dismissToast", id: toast.id })}
          className="w-full max-w-sm"
        >
          {toast.message}
        </Toast>
      )}
    </div>
  )
}
