import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"

const headingVariants = cva("font-black uppercase leading-none tracking-tight", {
  variants: {
    size: {
      sm: "text-lg",
      md: "text-2xl",
      lg: "text-3xl sm:text-4xl",
      xl: "text-3xl md:text-5xl",
    },
  },
  defaultVariants: { size: "md" },
})

type HeadingProps = ComponentProps<"h2"> &
  VariantProps<typeof headingVariants> & {
    as?: "h1" | "h2" | "h3" | "h4"
    /** Trailing words rendered in the brand color */
    highlight?: ReactNode
  }

export function Heading({
  as: Tag = "h2",
  size,
  highlight,
  className,
  children,
  ...props
}: HeadingProps) {
  return (
    <Tag className={cn(headingVariants({ size }), className)} {...props}>
      {children}
      {highlight && (
        <>
          {" "}
          <span className="text-main">{highlight}</span>
        </>
      )}
    </Tag>
  )
}
