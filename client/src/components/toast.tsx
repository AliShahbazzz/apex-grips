import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

type ToastProps = ComponentProps<"div"> & {
  onDismiss?: () => void
}

/** A single neo-brutalist notification. Positioning is up to the caller. */
export function Toast({ className, children, onDismiss, ...props }: ToastProps) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-3 rounded-base border-2 border-border bg-inverse px-4 py-3 text-xs font-black uppercase text-inverse-foreground shadow-shadow motion-safe:animate-toast-in",
        className
      )}
      {...props}
    >
      <span className="text-main">✓</span>
      <span className="flex-1">{children}</span>
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={onDismiss}
          className="cursor-pointer text-inverse-foreground/60 hover:text-main"
        >
          ✕
        </button>
      )}
    </div>
  )
}
