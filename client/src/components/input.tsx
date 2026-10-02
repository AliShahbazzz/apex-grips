import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export const fieldClassName =
  "w-full rounded-base border-2 border-border bg-background px-3 py-2.5 text-xs font-bold uppercase text-foreground placeholder:text-foreground/40 focus:border-main focus:outline-none"

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldClassName, className)} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldClassName, className)} {...props} />
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-1 block text-xs font-black uppercase", className)}
      {...props}
    />
  )
}
