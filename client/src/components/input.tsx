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

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(fieldClassName, "cursor-pointer", className)} {...props} />
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-1 block text-xs font-black uppercase", className)}
      {...props}
    />
  )
}

type FieldProps = ComponentProps<"input"> & {
  id: string
  label: string
}

/** Label + input pair. Emails and passwords keep their typed case. */
export function Field({ id, label, type, className, ...props }: FieldProps) {
  const keepCase = type === "email" || type === "password"
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} className={cn(keepCase && "normal-case", className)} {...props} />
    </div>
  )
}
