import { Badge, Button, Card } from "@/components"
import { MULTI_PACK_DISCOUNT, PACK_SIZE } from "@/data/catalog"
import { formatPrice, getBundlePricing } from "@/lib/pricing"
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
    <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t-2 border-border/20 pt-3 sm:flex-row">
      <div className="flex items-center gap-2 text-xs font-black uppercase">
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
        className="w-full px-8 sm:w-auto"
      >
        ⚡ Add Box to Cart
      </Button>
    </div>
  )
}

/** Sticky control bar: box tabs, running total, color picker and slots. */
export function BuilderPanel() {
  const { state, dispatch } = useStore()
  const boxCount = state.boxes.length
  const { total } = getBundlePricing(boxCount)

  return (
    <section aria-label="5-pack builder" className="z-30 mb-8 lg:sticky lg:top-[84px]">
      <Card className="p-4 md:p-5">
        <div className="mb-4 flex flex-col justify-between gap-4 border-b-2 border-border pb-4 md:flex-row md:items-center">
          <BoxTabs />

          <div className="flex items-center gap-3">
            <Button variant="neutral" size="sm" onClick={() => dispatch({ type: "addBox" })}>
              <span className="text-sm text-main">+</span> Add Another {PACK_SIZE}-Pack
            </Button>

            <div className="flex items-center gap-2 rounded-base border-2 border-border bg-inverse px-4 py-1.5 text-xs font-black uppercase text-inverse-foreground">
              <span className="text-main">Total:</span>
              <span className="text-base">{formatPrice(total)}</span>
              {boxCount > 1 && (
                <Badge size="sm" className="border-0 text-[10px]">
                  {MULTI_PACK_DISCOUNT * 100}% off multi-pack
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-12">
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
