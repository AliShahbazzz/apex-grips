import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"

type OptionCardProps = ComponentProps<"button"> & {
  icon?: ReactNode
  title: ReactNode
  description: ReactNode
  /** Hover fill: brand color or dark */
  tone?: "main" | "dark"
  trailing?: ReactNode
}

/** Large selectable card used for multiple-choice steps. */
export function OptionCard({
  icon,
  title,
  description,
  tone = "main",
  trailing,
  className,
  ...props
}: OptionCardProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full cursor-pointer items-center justify-between gap-3 rounded-base border-2 border-border bg-secondary-background p-4 text-left text-foreground shadow-shadow transition-all",
        tone === "main"
          ? "hover:bg-main hover:text-main-foreground"
          : "hover:bg-inverse hover:text-inverse-foreground",
        className
      )}
      {...props}
    >
      <div>
        {icon && <div className="mb-1 text-2xl">{icon}</div>}
        <div className="text-sm font-black uppercase">{title}</div>
        <div className="text-[10px] font-bold uppercase leading-snug opacity-75">
          {description}
        </div>
      </div>
      {trailing && <span className="text-xl font-black">{trailing}</span>}
    </button>
  )
}
