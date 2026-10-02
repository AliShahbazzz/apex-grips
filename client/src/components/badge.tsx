import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-base border-border font-black uppercase leading-none",
  {
    variants: {
      variant: {
        default: "bg-main text-main-foreground",
        dark: "bg-inverse text-inverse-foreground",
        neutral: "bg-secondary-background text-foreground",
      },
      size: {
        sm: "border px-1.5 py-0.5 text-[9px]",
        default: "border px-2 py-1 text-[10px]",
        lg: "border-2 px-3 py-1.5 text-xs",
      },
      shadow: {
        true: "shadow-shadow",
        false: "",
      },
    },
    defaultVariants: { variant: "default", size: "default", shadow: false },
  }
)

type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, size, shadow, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, shadow }), className)}
      {...props}
    />
  )
}
