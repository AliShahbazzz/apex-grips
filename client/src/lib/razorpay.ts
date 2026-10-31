const CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js"

/** The part of Razorpay Checkout's options this store uses */
type RazorpayOptions = {
  key: string
  order_id: string
  amount: number
  currency: string
  name: string
  description?: string
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
  handler: () => void
  modal?: { ondismiss?: () => void }
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void }
  }
}

export class PaymentCancelledError extends Error {
  constructor() {
    super("Payment cancelled. Your order hasn't been placed.")
    this.name = "PaymentCancelledError"
  }
}

let scriptLoad: Promise<void> | undefined

function loadCheckoutScript() {
  scriptLoad ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = CHECKOUT_SCRIPT
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptLoad = undefined
      script.remove()
      reject(new Error("Couldn't load the payment page. Check your connection and try again."))
    }
    document.body.append(script)
  })
  return scriptLoad
}

/**
 * Opens Razorpay Checkout for an order created by the server. Resolves once
 * the customer has paid; rejects with PaymentCancelledError if they close it.
 * The server checks the payment with Razorpay itself, so nothing returned by
 * Checkout needs to be passed on.
 */
export async function payWithRazorpay(
  options: Omit<RazorpayOptions, "handler" | "modal">
): Promise<void> {
  await loadCheckoutScript()
  const Razorpay = window.Razorpay
  if (!Razorpay) {
    throw new Error("Couldn't load the payment page. Try again.")
  }
  return new Promise((resolve, reject) => {
    new Razorpay({
      ...options,
      handler: () => resolve(),
      modal: { ondismiss: () => reject(new PaymentCancelledError()) },
    }).open()
  })
}
