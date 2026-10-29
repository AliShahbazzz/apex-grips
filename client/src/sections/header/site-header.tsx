import { Button, SegmentedControl } from "@/components"
import { useAuth } from "@/auth/use-auth"
import { useCatalog } from "@/catalog/use-catalog"
import { formatPrice } from "@/lib/pricing"
import { selectCartPricing, useStore } from "@/store/store"
import type { SportId } from "@/types"

function AccountButton() {
  const { dispatch } = useStore()
  const { status, customer } = useAuth()
  const label = status === "signedIn" ? customer?.first_name || "Account" : "Sign In"

  return (
    <Button
      variant="neutral"
      aria-label={status === "signedIn" ? "Your account" : "Sign in"}
      onClick={() => dispatch({ type: "openOverlay", overlay: "account" })}
    >
      <span aria-hidden>👤</span>
      <span className="hidden max-w-24 truncate sm:inline">{label}</span>
    </Button>
  )
}

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
  const catalog = useCatalog()
  const { total } = selectCartPricing(state, catalog)
  const sportOptions = catalog.sports.map((sport) => ({
    value: sport.id,
    label: `${sport.icon} ${sport.label}`,
  }))
  const setSport = (sport: SportId) => dispatch({ type: "setSport", sport })

  return (
    <header className="top-0 z-40 border-b-4 border-border bg-background">
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

          <AccountButton />

          <Button onClick={() => dispatch({ type: "openOverlay", overlay: "cart" })}>
            <span>Cart</span>
            <span className="rounded-full bg-background px-2 py-0.5 text-[11px] text-foreground">
              {state.cart.length}
            </span>
            <span className="hidden border-l border-main-foreground/30 pl-2 sm:inline-block">
              {formatPrice(total, catalog.currencyCode)}
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
