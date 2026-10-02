import { cn } from "@/lib/utils"

type ProgressProps = {
  /** 0-100 */
  value: number
  label: string
  className?: string
  indicatorClassName?: string
}

export function Progress({
  value,
  label,
  className,
  indicatorClassName,
}: ProgressProps) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-2 w-full rounded-base border border-border bg-secondary-background",
        className
      )}
    >
      <div
        className={cn("h-full bg-main", indicatorClassName)}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
