import { PACK_SIZE } from "@/data/catalog"
import { cn } from "@/lib/utils"
import { countFilled, useStore } from "@/store/store"

export function BoxTabs() {
  const { state, dispatch } = useStore()
  const canDelete = state.boxes.length > 1

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {state.boxes.map((box, index) => {
        const active = index === state.activeBoxIndex
        return (
          <div
            key={box.id}
            className={cn(
              "flex shrink-0 items-center rounded-base border-2 border-border text-xs font-black uppercase shadow-shadow transition-all",
              active
                ? "bg-main text-main-foreground"
                : "bg-secondary-background text-foreground hover:bg-background"
            )}
          >
            <button
              type="button"
              aria-pressed={active}
              onClick={() => dispatch({ type: "switchBox", index })}
              className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 uppercase"
            >
              <span>Box {box.id}</span>
              <span className="bg-inverse px-1.5 text-[10px] text-inverse-foreground">
                {countFilled(box.slots)}/{PACK_SIZE}
              </span>
            </button>
            {canDelete && (
              <button
                type="button"
                aria-label={`Delete box ${box.id}`}
                onClick={() => dispatch({ type: "deleteBox", index })}
                className="cursor-pointer border-l border-border/30 pl-1 pr-2 text-sm hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
