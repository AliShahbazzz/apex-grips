import { Button, SegmentedControl } from "@/components"
import { SPORTS } from "@/data/catalog"
import { formatPrice } from "@/lib/pricing"
import { selectCartPricing, useStore } from "@/store/store"
import type { SportId } from "@/types"

const sportOptions = SPORTS.map((sport) => ({
  value: sport.id,
  label: `${sport.icon} ${sport.label}`,
}))

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-base border-2 border-border bg-main p-2 text-xl font-black leading-none text-main-foreground shadow-shadow">
        AG
      </div>
      <div>
        <h1 className="text-2xl font-black uppercase leading-none tracking-tight">
          Apex <span className="text-main">Grips</span>
        </h1>
        <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-foreground/60">
          Your Grip Guy
        </p>
      </div>
    </div>
  )
}

export function SiteHeader() {
  const { state, dispatch } = useStore()
  const { total } = selectCartPricing(state)
  const setSport = (sport: SportId) => dispatch({ type: "setSport", sport })

  return (
    <header className="sticky top-0 z-40 border-b-4 border-border bg-background">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <SegmentedControl
          label="Sport"
          options={sportOptions}
          value={state.sport}
          onChange={setSport}
          className="hidden md:flex"
        />

        <div className="flex items-center gap-3">
          <Button
            variant="neutral"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => dispatch({ type: "openOverlay", overlay: "fitGuide" })}
          >
            <span className="text-main">⚡</span> Fit Guide
          </Button>

          <Button onClick={() => dispatch({ type: "openOverlay", overlay: "cart" })}>
            <span>Cart</span>
            <span className="rounded-full bg-background px-2 py-0.5 text-[11px] text-foreground">
              {state.cart.length}
            </span>
            <span className="hidden border-l border-main-foreground/30 pl-2 sm:inline-block">
              {formatPrice(total)}
            </span>
          </Button>
        </div>
      </div>

      <SegmentedControl
        label="Sport"
        options={sportOptions}
        value={state.sport}
        onChange={setSport}
        className="justify-around rounded-none border-0 border-t-2 p-2 md:hidden"
        itemClassName="rounded-base px-3 py-1"
      />
    </header>
  )
}
