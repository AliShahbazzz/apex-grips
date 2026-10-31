import { useCallback, useRef, useState, type FormEvent } from "react"
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Field,
  FormMessage,
  Heading,
  Label,
  Select,
} from "@/components"
import {
  completeCheckout,
  prepareCheckout,
  type CheckoutAddress,
  type PreparedCheckout,
} from "@/api/checkout"
import { useAuth } from "@/auth/use-auth"
import { useCatalog } from "@/catalog/use-catalog"
import { INDIA_STATES } from "@/data/india-states"
import { formatPrice } from "@/lib/pricing"
import { payWithRazorpay } from "@/lib/razorpay"
import { useAsyncAction } from "@/lib/use-async-action"
import { selectCartTotal, useStore } from "@/store/store"

type CheckoutDetails = {
  email: string
  address: CheckoutAddress
}

/**
 * - form: filling in the details
 * - confirm: asking before payment
 * - paying: Razorpay Checkout is open. Our dialogs close so they don't trap
 *   its focus and clicks; the form refills from the saved details.
 */
type Step = "form" | "confirm" | "paying"

/** A cart that's ready to pay, kept so a cancelled payment can be retried */
type PendingPayment = PreparedCheckout & { paid: boolean }

const themeColor = () =>
  getComputedStyle(document.documentElement).getPropertyValue("--main").trim() || undefined

export function CheckoutDialog() {
  const { state, dispatch } = useStore()
  const catalog = useCatalog()
  const { customer, token } = useAuth()
  const { pending, error, run } = useAsyncAction()
  const total = selectCartTotal(state, catalog)

  const [step, setStep] = useState<Step>("form")
  const [details, setDetails] = useState<CheckoutDetails | null>(null)
  const pendingPayment = useRef<PendingPayment | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  /** Checked when the form mounts too, since it can reopen already filled in */
  const trackCompleteness = useCallback((form: HTMLFormElement | null) => {
    if (form) setIsComplete(form.checkValidity())
  }, [])

  const isOpen = state.overlay === "checkout"

  /** Editing the details after a cancelled payment needs a fresh cart */
  const discardUnpaidCart = () => {
    if (!pendingPayment.current?.paid) pendingPayment.current = null
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const field = (name: string) => String(form.get(name) ?? "").trim()

    setDetails({
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
    })
    setStep("confirm")
  }

  const pay = async () => {
    if (!details) return
    const authToken = token ?? undefined

    let orderId: string | undefined
    const placed = await run(async () => {
      pendingPayment.current ??= {
        ...(await prepareCheckout({
          catalog,
          boxes: state.cart,
          email: details.email,
          address: details.address,
          token: authToken,
        })),
        paid: false,
      }
      const payment = pendingPayment.current

      if (!payment.paid) {
        setStep("paying")
        try {
          await payWithRazorpay({
            key: payment.razorpay.key_id,
            order_id: payment.razorpay.razorpay_order_id,
            amount: payment.razorpay.amount,
            currency: payment.razorpay.currency,
            name: "Apex Grips",
            description: "Custom grip pack",
            prefill: {
              name: `${details.address.first_name} ${details.address.last_name}`,
              email: details.email,
              contact: details.address.phone,
            },
            theme: { color: themeColor() },
          })
        } finally {
          setStep("form")
        }
        payment.paid = true
      }

      const order = await completeCheckout(payment.cartId, authToken)
      orderId = `#${order.display_id}`
    })

    if (!placed) {
      setStep("form")
    } else if (orderId) {
      pendingPayment.current = null
      setDetails(null)
      dispatch({ type: "placeOrder", orderId })
    }
  }

  const close = () => {
    discardUnpaidCart()
    setStep("form")
    dispatch({ type: "closeOverlay" })
  }

  const address = details?.address

  return (
    <>
      <Dialog
        open={isOpen && step !== "paying"}
        // Stay open while the order is being placed
        onOpenChange={(open) => !open && !pending && close()}
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

          <form
            ref={trackCompleteness}
            onSubmit={submit}
            onChange={(event) => {
              discardUnpaidCart()
              trackCompleteness(event.currentTarget)
            }}
            className="space-y-3"
          >
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
                defaultValue={details?.email ?? ""}
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field
                id="checkout-first-name"
                label="First Name"
                name="firstName"
                required
                autoComplete="given-name"
                defaultValue={address?.first_name ?? customer?.first_name ?? ""}
              />
              <Field
                id="checkout-last-name"
                label="Last Name"
                name="lastName"
                required
                autoComplete="family-name"
                defaultValue={address?.last_name ?? customer?.last_name ?? ""}
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
              defaultValue={address?.phone ?? customer?.phone ?? ""}
            />

            <Field
              id="checkout-address-1"
              label="Address"
              name="address1"
              required
              autoComplete="address-line1"
              placeholder="Flat no, building, street"
              defaultValue={address?.address_1 ?? ""}
            />
            <Field
              id="checkout-address-2"
              label="Area / Landmark (optional)"
              name="address2"
              autoComplete="address-line2"
              defaultValue={address?.address_2 ?? ""}
            />

            <div className="grid grid-cols-2 gap-3">
              <Field
                id="checkout-city"
                label="City"
                name="city"
                required
                autoComplete="address-level2"
                defaultValue={address?.city ?? ""}
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
                defaultValue={address?.postal_code ?? ""}
              />
            </div>

            <div>
              <Label htmlFor="checkout-state">State</Label>
              <Select
                id="checkout-state"
                name="state"
                required
                defaultValue={address?.province ?? ""}
                autoComplete="address-level1"
              >
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

            <div className="flex justify-between rounded-base border-2 border-border bg-secondary-background p-3 text-xs font-black uppercase">
              <span>Total Payable:</span>
              <span className="text-main">{formatPrice(total, catalog.currencyCode)}</span>
            </div>

            {error && <FormMessage>{error}</FormMessage>}

            <Button type="submit" size="lg" className="w-full" disabled={pending || !isComplete}>
              {pending ? "Placing order…" : "🔥 Proceed to Pay"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isOpen && step === "confirm"}
        onOpenChange={(open) => !open && !pending && setStep("form")}
      >
        <DialogContent hideClose className="max-w-sm space-y-4 sm:p-6">
          <DialogTitle asChild>
            <Heading as="h3" highlight="Pay?">
              Proceed to
            </Heading>
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-foreground/70">
            You'll pay{" "}
            <span className="font-black text-main">{formatPrice(total, catalog.currencyCode)}</span>{" "}
            securely with Razorpay using UPI, card, netbanking or a wallet.
          </DialogDescription>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="neutral" disabled={pending} onClick={() => setStep("form")}>
              Go Back
            </Button>
            <Button disabled={pending} onClick={pay}>
              {pending ? "Opening…" : "Proceed"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
