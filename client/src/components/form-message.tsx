import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

type FormMessageProps = ComponentProps<"p"> & {
  tone?: "error" | "success"
}

/** Inline result of a form submit; errors are announced immediately. */
export function FormMessage({ tone = "error", className, ...props }: FormMessageProps) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-base border-2 px-3 py-2 text-[10px] font-black uppercase",
        tone === "error" ? "border-main text-main" : "border-success text-success",
        className
      )}
      {...props}
    />
  )
}
