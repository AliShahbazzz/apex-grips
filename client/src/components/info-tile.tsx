import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const infoTileVariants = cva("rounded-base font-black uppercase", {
  variants: {
    layout: {
      row: "flex items-center gap-2 border-2 border-border bg-secondary-background p-2.5 text-xs text-foreground",
      stack:
        "border border-inverse-foreground/20 bg-inverse-foreground/10 p-3 text-center text-inverse-foreground",
    },
  },
  defaultVariants: { layout: "row" },
})

type InfoTileProps = VariantProps<typeof infoTileVariants> & {
  icon: string
  title: string
  subtitle: string
  className?: string
}

/** Small icon + title + subtitle tile. "row" for light surfaces, "stack" for dark ones. */
export function InfoTile({ icon, title, subtitle, layout, className }: InfoTileProps) {
  const stacked = layout === "stack"
  return (
    <div className={cn(infoTileVariants({ layout }), className)}>
      <span className={stacked ? "mb-1 block text-lg" : "text-base text-main"}>
        {icon}
      </span>
      <div>
        <div className={stacked ? "text-xs" : "leading-none"}>{title}</div>
        <div
          className={cn(
            "text-[9px]",
            stacked ? "font-bold text-main" : "text-foreground/60"
          )}
        >
          {subtitle}
        </div>
      </div>
    </div>
  )
}
