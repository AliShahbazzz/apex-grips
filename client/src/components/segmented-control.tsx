import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Option<T extends string> = {
  value: T
  label: ReactNode
}

type SegmentedControlProps<T extends string> = {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
  itemClassName?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  itemClassName,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "flex items-center gap-1 rounded-full border-2 border-border bg-secondary-background p-1.5",
        className
      )}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "cursor-pointer rounded-full px-4 py-1.5 text-xs font-black uppercase transition-all",
              selected
                ? "bg-inverse text-inverse-foreground"
                : "text-foreground hover:bg-background",
              itemClassName
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
