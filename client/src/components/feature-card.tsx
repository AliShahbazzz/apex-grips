import { Badge } from "@/components/badge"
import { Card } from "@/components/card"
import { cn } from "@/lib/utils"

type FeatureCardProps = {
  icon: string
  iconTone?: "main" | "dark"
  title: string
  description: string
  statLabel: string
  statValue: string
}

export function FeatureCard({
  icon,
  iconTone = "main",
  title,
  description,
  statLabel,
  statValue,
}: FeatureCardProps) {
  return (
    <Card tone="muted" className="flex flex-col justify-between p-6">
      <div>
        <div
          className={cn(
            "mb-4 flex size-12 items-center justify-center rounded-base border-2 border-border text-2xl shadow-shadow",
            iconTone === "main"
              ? "bg-main text-main-foreground"
              : "bg-inverse text-inverse-foreground"
          )}
        >
          {icon}
        </div>
        <h4 className="mb-2 text-xl font-black uppercase">{title}</h4>
        <p className="text-xs font-bold uppercase leading-relaxed text-foreground/70">
          {description}
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between border-t-2 border-border/20 pt-4 text-[10px] font-black uppercase text-main">
        <span>{statLabel}</span>
        <Badge variant="dark" className="border-0 text-[10px]">
          {statValue}
        </Badge>
      </div>
    </Card>
  )
}
