import { useState, type FormEvent } from "react"
import {
  Button,
  Input,
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components"
import { PACK_SIZE } from "@/data/catalog"
import { formatPrice } from "@/lib/pricing"
import { cn } from "@/lib/utils"
import { selectCartPricing, useStore } from "@/store/store"
import { CartItemCard } from "./cart-item-card"

type SummaryRowProps = {
  label: string
  value: string
  className?: string
  valueClassName?: string
}

function SummaryRow({ label, value, className, valueClassName }: SummaryRowProps) {
  return (
    <div className={cn("flex justify-between", className)}>
      <span>{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  )
}

function PromoForm() {
  const { state, dispatch } = useStore()
  const [code, setCode] = useState("")

  const submit = (event: FormEvent) => {
    event.preventDefault()
    dispatch({ type: "applyPromo", code })
  }

  return (
    <form onSubmit={submit} className="space-y-1">
      <div className="flex items-center gap-2">
        <Input
          aria-label="Promo code"
          placeholder="Promo code (e.g. APEX10)"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="flex-1 py-2"
        />
        <Button type="submit" variant="noShadow" className="h-auto bg-inverse py-2 text-inverse-foreground hover:bg-main">
          Apply
        </Button>
      </div>
      {state.promoMessage && (
        <p
          role="status"
          className={cn(
            "text-[10px] font-black uppercase",
            state.promoMessage.valid ? "text-success" : "text-main"
          )}
        >
          {state.promoMessage.text}
        </p>
      )}
    </form>
  )
}

export function CartSheet() {
  const { state, dispatch } = useStore()
  const { subtotal, multiPackDiscount, promoDiscount, total } = selectCartPricing(state)
  const isEmpty = state.cart.length === 0

  return (
    <Sheet
      open={state.overlay === "cart"}
      onOpenChange={(open) => !open && dispatch({ type: "closeOverlay" })}
    >
      <SheetContent aria-describedby={undefined}>
        <div className="flex items-center justify-between border-b-4 border-border bg-inverse p-5 text-inverse-foreground">
          <div className="flex items-center gap-2">
            <span className="text-xl text-main">🛒</span>
            <SheetTitle className="text-xl font-black uppercase tracking-tight">
              Your Apex <span className="text-main">Cart</span>
            </SheetTitle>
          </div>
          <SheetClose
            aria-label="Close cart"
            className="cursor-pointer text-xl font-black hover:text-main"
          >
            ✕
          </SheetClose>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isEmpty ? (
            <div className="space-y-3 py-12 text-center">
              <div className="text-4xl">📦</div>
              <div className="text-sm font-black uppercase">Your cart is empty</div>
              <p className="text-xs font-bold uppercase text-foreground/60">
                Complete a {PACK_SIZE}-pack box in the builder to add to cart.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {state.cart.map((item, index) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  position={index + 1}
                  onRemove={() => dispatch({ type: "removeFromCart", id: item.id })}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3 border-t-4 border-border bg-secondary-background p-5">
          <PromoForm />

          <div className="space-y-1 border-t-2 border-border/20 pt-3 text-xs font-black uppercase">
            <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
            <SummaryRow
              label="Multi-pack discount"
              value={`-${formatPrice(multiPackDiscount)}`}
              className="text-main"
            />
            {promoDiscount > 0 && (
              <SummaryRow
                label="Promo discount"
                value={`-${formatPrice(promoDiscount)}`}
                className="text-main"
              />
            )}
            <SummaryRow label="Express shipping" value="Free" valueClassName="text-success" />
            <SummaryRow
              label="Total amount"
              value={formatPrice(total)}
              className="border-t border-border pt-2 text-base"
              valueClassName="text-main"
            />
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={isEmpty}
            onClick={() => dispatch({ type: "openOverlay", overlay: "checkout" })}
          >
            ⚡ Proceed to Checkout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
