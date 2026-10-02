import { cn, isLightColor } from "@/lib/utils"

type ColorSwatchProps = {
  color: string
  label: string
  selected: boolean
  onSelect: () => void
}

export function ColorSwatch({ color, label, selected, onSelect }: ColorSwatchProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      title={label}
      onClick={onSelect}
      style={{ backgroundColor: color }}
      className={cn(
        "flex size-10 cursor-pointer items-center justify-center rounded-base border-2 border-border transition-transform hover:scale-110",
        selected && "ring-4 ring-ring"
      )}
    >
      {selected && (
        <span
          className={cn(
            "text-xs font-black",
            isLightColor(color) ? "text-black" : "text-white"
          )}
        >
          ✓
        </span>
      )}
    </button>
  )
}
