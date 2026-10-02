import type { FormEvent } from "react"
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Heading,
  Input,
  Label,
  Textarea,
} from "@/components"
import { formatPrice } from "@/lib/pricing"
import { selectCartPricing, useStore } from "@/store/store"

const PAYMENT_METHODS = [
  { value: "upi", label: "⚡ UPI / GPay" },
  { value: "card", label: "💳 Card" },
  { value: "cod", label: "💵 COD" },
]

function createOrderId() {
  return `#AG-${Math.floor(10000 + Math.random() * 90000)}`
}

export function CheckoutDialog() {
  const { state, dispatch } = useStore()
  const { total } = selectCartPricing(state)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    dispatch({ type: "placeOrder", orderId: createOrderId() })
  }

  return (
    <Dialog
      open={state.overlay === "checkout"}
      onOpenChange={(open) => !open && dispatch({ type: "closeOverlay" })}
    >
      <DialogContent aria-describedby={undefined} className="max-w-lg sm:p-6">
        <div className="mb-4 border-b-2 border-border pb-3">
          <Badge>Express Checkout</Badge>
          <DialogTitle asChild>
            <Heading as="h3" highlight="Order" className="mt-1">
              Complete your
            </Heading>
          </DialogTitle>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label htmlFor="checkout-name">Full Name</Label>
            <Input id="checkout-name" required autoComplete="name" placeholder="Rahul Sharma" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="checkout-phone">Mobile Number</Label>
              <Input
                id="checkout-phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <Label htmlFor="checkout-pin">Pin Code</Label>
              <Input
                id="checkout-pin"
                required
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="110001"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="checkout-address">Delivery Address</Label>
            <Textarea
              id="checkout-address"
              required
              rows={2}
              autoComplete="street-address"
              placeholder="Flat no, street, area, city"
            />
          </div>

          <fieldset>
            <legend className="mb-1 text-xs font-black uppercase">Select Payment Method</legend>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((method, index) => (
                <label
                  key={method.value}
                  className="cursor-pointer rounded-base border-2 border-border p-2 text-center text-[10px] font-black uppercase hover:bg-secondary-background has-[:checked]:bg-secondary-background"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    defaultChecked={index === 0}
                    className="accent-main"
                  />
                  <div className="mt-1">{method.label}</div>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex justify-between rounded-base border-2 border-border bg-secondary-background p-3 text-xs font-black uppercase">
            <span>Total Payable:</span>
            <span className="text-main">{formatPrice(total)}</span>
          </div>

          <Button type="submit" size="lg" className="w-full">
            🔥 Confirm Order & Pay Now
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
