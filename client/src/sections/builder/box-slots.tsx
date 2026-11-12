import { Button, GripPreview } from "@/components"
import { findPattern, findVariantImage } from "@/catalog/selectors"
import { useCatalog } from "@/catalog/use-catalog"
import { PACK_SIZE } from "@/data/builder-rules"
import { cn } from "@/lib/utils"
import { countFilled, selectActiveBox, useStore } from "@/store/store"

export function BoxSlots() {
  const { state, dispatch } = useStore()
  const catalog = useCatalog()
  const { slots } = selectActiveBox(state)

  return (
    <div>
      {/* Hidden on phones to save height: the box tab shows the count and each slot has ✕ */}
      <div className="mb-2 hidden items-center justify-between sm:flex">
        <span className="flex items-center gap-1.5 text-xs font-black uppercase">
          <span>📦</span> Active Box Slots:
          <span className="text-main">
            {countFilled(slots)} / {PACK_SIZE} Filled
          </span>
        </span>
        <Button
          variant="link"
          size="inline"
          onClick={() => dispatch({ type: "clearBox" })}
        >
          Clear Box Slots
        </Button>
      </div>

      <ul className="grid grid-cols-5 gap-2">
        {slots.map((slot, index) => {
          const pattern = slot && findPattern(catalog, slot.patternId)
          return (
            <li
              key={index}
              className={cn(
                "relative flex h-[72px] flex-col items-center justify-between rounded-base border-2 p-1 transition-all duration-200 hover:-translate-y-0.5 sm:h-28 sm:p-1.5",
                slot
                  ? "border-border bg-background"
                  : "border-dashed border-border/40 bg-secondary-background"
              )}
            >
              <span
                className={cn(
                  "absolute left-1 top-1 px-1 text-[8px] font-black",
                  slot
                    ? "bg-inverse text-inverse-foreground"
                    : "bg-border/20 text-foreground"
                )}
              >
                {index + 1}
              </span>

              {slot && pattern ? (
                <>
                  <button
                    type="button"
                    aria-label={`Remove ${pattern.name} from slot ${index + 1}`}
                    onClick={() => dispatch({ type: "clearSlot", index })}
                    className="absolute right-1 top-1 flex size-4 cursor-pointer items-center justify-center bg-main text-[10px] font-black text-main-foreground hover:bg-inverse"
                  >
                    ✕
                  </button>
                  <GripPreview
                    imageUrl={findVariantImage(catalog, state.sport, slot.patternId, slot.color.hex)}
                    pattern={slot.patternId}
                    color={slot.color.hex}
                    sport={state.sport}
                    width={48}
                    height={64}
                    label={`${pattern.name} in ${slot.color.name}`}
                    className="mt-1 motion-safe:animate-pop sm:mt-2"
                  />
                  {/* No room on phones; the image's alt text still names it */}
                  <span className="mt-1 hidden w-full truncate text-center text-[9px] font-black uppercase leading-tight sm:block">
                    {pattern.name}
                  </span>
                </>
              ) : (
                <div className="mt-1 flex flex-1 flex-col items-center justify-center gap-1 text-foreground/40 sm:mt-2">
                  <span className="text-xl">+</span>
                  <span className="text-[8px] font-black uppercase">Empty</span>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
