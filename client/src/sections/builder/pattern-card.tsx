import { Badge, Button, Card, GripCanvas } from "@/components"
import type { GripColor, Pattern, SportId } from "@/types"

type PatternCardProps = {
  pattern: Pattern
  color: GripColor
  sport: SportId
  onAdd: () => void
  onInspect: () => void
}

export function PatternCard({ pattern, color, sport, onAdd, onInspect }: PatternCardProps) {
  return (
    <Card className="relative flex flex-col justify-between p-4 transition-all hover:border-main">
      <Badge size="sm" className="absolute left-2 top-2 z-10">
        {pattern.badge}
      </Badge>

      <div className="relative mb-3 flex items-center justify-center rounded-base border-2 border-border bg-secondary-background p-3">
        <GripCanvas
          pattern={pattern.id}
          color={color.hex}
          sport={sport}
          width={140}
          height={170}
          label={`${pattern.name} in ${color.name}`}
        />
        <Button
          variant="dark"
          size="xs"
          onClick={onInspect}
          className="absolute bottom-2 right-2 h-auto border px-2 py-1 text-[9px] shadow-none hover:translate-x-0 hover:translate-y-0 hover:bg-main"
        >
          🔍 Inspect
        </Button>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <h4 className="text-lg font-black uppercase leading-none">{pattern.name}</h4>
          <Badge variant="neutral" size="sm">
            {pattern.tag}
          </Badge>
        </div>
        <p className="mb-3 text-[11px] font-bold uppercase leading-snug text-foreground/70">
          {pattern.description}
        </p>
      </div>

      <div className="space-y-2 border-t-2 border-border/10 pt-3">
        <div className="flex justify-between text-[10px] font-black uppercase">
          <span>Sweat Tack: {pattern.sweatScore}%</span>
          <span>Shock Abs: {pattern.shockScore}%</span>
        </div>
        <Button variant="dark" onClick={onAdd} className="w-full">
          <span>+ Add to Slot</span>
          <span className="text-[10px] opacity-75">({color.name})</span>
        </Button>
      </div>
    </Card>
  )
}
