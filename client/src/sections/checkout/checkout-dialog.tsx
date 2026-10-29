import type { FormEvent } from "react"
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Field,
  FormMessage,
  Heading,
  Label,
  Select,
} from "@/components"
import { CASH_ON_DELIVERY_PROVIDER, placeOrder, type PlacedOrder } from "@/api/checkout"
import { useAuth } from "@/auth/use-auth"
import { useCatalog } from "@/catalog/use-catalog"
import { INDIA_STATES } from "@/data/india-states"
import { formatPrice } from "@/lib/pricing"
import { useAsyncAction } from "@/lib/use-async-action"
import { selectCartTotal, useStore } from "@/store/store"

/** Only cash on delivery works until an online payment provider is set up */
const PAYMENT_METHODS = [
  { value: CASH_ON_DELIVERY_PROVIDER, label: "💵 COD", available: true },
  { value: "upi", label: "⚡ UPI / GPay", available: false },
  { value: "card", label: "💳 Card", available: false },
]

export function CheckoutDialog() {
  const { state, dispatch } = useStore()
  const catalog = useCatalog()
  const { customer, token } = useAuth()
  const { pending, error, run } = useAsyncAction()
  const total = selectCartTotal(state, catalog)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const field = (name: string) => String(form.get(name) ?? "").trim()

    let order: PlacedOrder | undefined
    const placed = await run(async () => {
      order = await placeOrder({
        catalog,
        boxes: state.cart,
        email: customer?.email ?? field("email"),
        address: {
          first_name: field("firstName"),
          last_name: field("lastName"),
          phone: field("phone"),
          address_1: field("address1"),
          address_2: field("address2") || undefined,
          city: field("city"),
          province: field("state"),
          postal_code: field("pincode"),
        },
        paymentProviderId: field("payment"),
        token: token ?? undefined,
      })
    })
    if (placed && order) {
      dispatch({ type: "placeOrder", orderId: `#${order.display_id}` })
    }
  }

  return (
    <Dialog
      open={state.overlay === "checkout"}
      // Stay open while the order is being placed
      onOpenChange={(open) => !open && !pending && dispatch({ type: "closeOverlay" })}
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
          {customer ? (
            <p className="text-xs font-bold text-foreground/60">
              <span className="uppercase">Ordering as </span>
              {customer.email}
            </p>
          ) : (
            <Field
              id="checkout-email"
              label="Email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field
              id="checkout-first-name"
              label="First Name"
              name="firstName"
              required
              autoComplete="given-name"
              defaultValue={customer?.first_name ?? ""}
            />
            <Field
              id="checkout-last-name"
              label="Last Name"
              name="lastName"
              required
              autoComplete="family-name"
              defaultValue={customer?.last_name ?? ""}
            />
          </div>

          <Field
            id="checkout-phone"
            label="Mobile Number"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="+91 98765 43210"
            defaultValue={customer?.phone ?? ""}
          />

          <Field
            id="checkout-address-1"
            label="Address"
            name="address1"
            required
            autoComplete="address-line1"
            placeholder="Flat no, building, street"
          />
          <Field
            id="checkout-address-2"
            label="Area / Landmark (optional)"
            name="address2"
            autoComplete="address-line2"
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              id="checkout-city"
              label="City"
              name="city"
              required
              autoComplete="address-level2"
            />
            <Field
              id="checkout-pincode"
              label="Pin Code"
              name="pincode"
              required
              inputMode="numeric"
              pattern="[1-9][0-9]{5}"
              title="6-digit pin code"
              autoComplete="postal-code"
              placeholder="110001"
            />
          </div>

          <div>
            <Label htmlFor="checkout-state">State</Label>
            <Select id="checkout-state" name="state" required defaultValue="" autoComplete="address-level1">
              <option value="" disabled>
                Select state
              </option>
              {INDIA_STATES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </div>

          <fieldset>
            <legend className="mb-1 text-xs font-black uppercase">Select Payment Method</legend>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((method, index) => (
                <label
                  key={method.value}
                  className="cursor-pointer rounded-base border-2 border-border p-2 text-center text-[10px] font-black uppercase hover:bg-secondary-background has-[:checked]:bg-secondary-background has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    defaultChecked={index === 0}
                    disabled={!method.available}
                    className="accent-main"
                  />
                  <div className="mt-1">{method.label}</div>
                  {!method.available && <div className="text-[9px] text-foreground/60">Coming soon</div>}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex justify-between rounded-base border-2 border-border bg-secondary-background p-3 text-xs font-black uppercase">
            <span>Total Payable:</span>
            <span className="text-main">{formatPrice(total, catalog.currencyCode)}</span>
          </div>

          {error && <FormMessage>{error}</FormMessage>}

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Placing order…" : "🔥 Confirm Order"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
