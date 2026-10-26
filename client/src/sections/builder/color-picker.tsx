import { ColorSwatch } from "@/components"
import { useCatalog } from "@/catalog/use-catalog"
import { useStore } from "@/store/store"

export function ColorPicker() {
  const { state, dispatch } = useStore()
  const { colors } = useCatalog()

  return (
    <div className="rounded-base border-2 border-border bg-secondary-background p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-black uppercase">
          <span>🎨</span> Active Color:
          <span className="text-main">{state.activeColor.name}</span>
        </span>
        <span className="text-[10px] font-bold uppercase text-foreground/60">
          Click swatch to set fill
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        {colors.map((color) => (
          <ColorSwatch
            key={color.hex}
            color={color.hex}
            label={color.name}
            selected={color.hex === state.activeColor.hex}
            onSelect={() => dispatch({ type: "selectColor", color })}
          />
        ))}
      </div>
    </div>
  )
}
