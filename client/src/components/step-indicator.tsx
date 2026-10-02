import { Fragment } from "react"
import { cn } from "@/lib/utils"

type StepIndicatorProps = {
  total: number
  /** 1-based */
  current: number
  className?: string
}

export function StepIndicator({ total, current, className }: StepIndicatorProps) {
  return (
    <ol
      aria-label={`Step ${current} of ${total}`}
      className={cn("flex items-center gap-2", className)}
    >
      {Array.from({ length: total }, (_, index) => {
        const step = index + 1
        return (
          <Fragment key={step}>
            {step > 1 && <li aria-hidden className="h-1 flex-1 bg-border" />}
            <li
              aria-current={step === current ? "step" : undefined}
              className={cn(
                "flex size-8 items-center justify-center rounded-base border-2 border-border text-xs font-black",
                step <= current
                  ? "bg-main text-main-foreground"
                  : "bg-secondary-background text-foreground"
              )}
            >
              {step}
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}
