import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

const cardVariants = cva("rounded-base border-border", {
  variants: {
    tone: {
      default: "bg-background text-foreground",
      muted: "bg-secondary-background text-foreground",
      inverse: "bg-inverse text-inverse-foreground",
    },
    weight: {
      bold: "border-4 shadow-shadow",
      thin: "border-2",
    },
  },
  defaultVariants: { tone: "default", weight: "bold" },
})

type CardProps = ComponentProps<"div"> & VariantProps<typeof cardVariants>

export function Card({ className, tone, weight, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ tone, weight }), className)} {...props} />
  )
}
