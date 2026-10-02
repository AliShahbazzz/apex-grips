import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

const pressable =
  "shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-base border-2 border-border font-black uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: cn("bg-main text-main-foreground", pressable),
        dark: cn("bg-inverse text-inverse-foreground", pressable),
        neutral: cn("bg-background text-foreground", pressable),
        muted:
          "border bg-secondary-background text-foreground hover:bg-inverse hover:text-inverse-foreground",
        noShadow: "bg-main text-main-foreground hover:bg-inverse",
        ghost: "border-transparent bg-transparent text-foreground hover:text-main",
        link: "border-0 text-main underline hover:text-foreground",
      },
      size: {
        default: "h-10 px-5 text-xs",
        sm: "h-8 px-3 text-xs",
        xs: "h-7 px-2 text-[10px]",
        lg: "h-12 px-8 text-sm",
        icon: "size-8 text-lg",
        inline: "h-auto p-0 text-[10px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
