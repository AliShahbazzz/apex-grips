import { Badge, Button, Card } from "@/components"
import { findSport } from "@/catalog/selectors"
import { useCatalog } from "@/catalog/use-catalog"
import { PACK_SIZE } from "@/data/builder-rules"
import { formatPrice, getBoxesTotal } from "@/lib/pricing"
import { cn } from "@/lib/utils"
import { countFilled, selectActiveBox, useStore } from "@/store/store"
import { BoxSlots } from "./box-slots"
import { BoxTabs } from "./box-tabs"
import { ColorPicker } from "./color-picker"

function BoxStatus() {
  const { state, dispatch } = useStore()
  const box = selectActiveBox(state)
  const remaining = PACK_SIZE - countFilled(box.slots)
  const complete = remaining === 0

  return (
    <div className="mt-1.5 flex flex-col items-center justify-between gap-3 border-border/20 sm:mt-4 sm:flex-row sm:border-t-2 sm:pt-3">
      {/* On phones the button says how many are left, so this line is for screen readers only */}
      <div className="sr-only items-center gap-2 text-xs font-black uppercase sm:not-sr-only sm:flex">
        <Badge variant="dark" className="border-0">
          Box Status
        </Badge>
        <span role="status" className={cn(complete && "text-success")}>
          {complete
            ? "✨ Box complete! Ready to add to cart."
            : `Select ${remaining} more pattern(s) to complete Box ${box.id}`}
        </span>
      </div>

      <Button
        variant="dark"
        disabled={!complete}
        onClick={() => dispatch({ type: "addBoxToCart" })}
        className="h-8 w-full px-8 sm:h-10 sm:w-auto"
      >
        {complete ? (
          "⚡ Add Box to Cart"
        ) : (
          <>
            <span className="sm:hidden">Pick {remaining} more pattern(s)</span>
            <span className="hidden sm:inline">⚡ Add Box to Cart</span>
          </>
        )}
      </Button>
    </div>
  )
}

/** Sticky control bar: box tabs, running total, color picker and slots. */
export function BuilderPanel() {
  const { state, dispatch } = useStore()
  const catalog = useCatalog()
  const boxCount = state.boxes.length
  const sport = findSport(catalog, state.sport)
  const total = getBoxesTotal(boxCount, sport?.gripPrice ?? 0)

  return (
    <section aria-label="5-pack builder" className="sticky top-0 z-30 mb-8">
      <Card className="p-2 sm:p-4 md:p-5">
        <div className="mb-1.5 flex items-center justify-between gap-2 border-b-2 border-border pb-1.5 sm:mb-4 sm:gap-4 sm:pb-4">
          <div className="min-w-0 flex-1">
            <BoxTabs />
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Button
              variant="neutral"
              size="sm"
              aria-label={`Add another ${PACK_SIZE}-pack`}
              onClick={() => dispatch({ type: "addBox" })}
            >
              <span className="text-sm text-main">+</span>
              <span className="sm:hidden">Box</span>
              <span className="hidden sm:inline">Add Another {PACK_SIZE}-Pack</span>
            </Button>

            <div className="flex items-center gap-2 rounded-base border-2 border-border bg-inverse px-2 py-1 text-xs font-black uppercase text-inverse-foreground sm:px-4 sm:py-1.5">
              <span className="hidden text-main sm:inline">Total:</span>
              <span className="text-sm sm:text-base">{formatPrice(total, catalog.currencyCode)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-1.5 sm:gap-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <ColorPicker />
          </div>
          <div className="lg:col-span-8">
            <BoxSlots />
          </div>
        </div>

        <BoxStatus />
      </Card>
    </section>
  )
}
