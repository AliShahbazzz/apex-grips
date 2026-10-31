import Razorpay from "razorpay"
import type { Payments } from "razorpay/dist/types/payments"
import {
  AbstractPaymentProvider,
  MathBN,
  MedusaError,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  BigNumberInput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"

type Options = {
  key_id: string
  key_secret: string
  /** Secret set on the webhook in the Razorpay dashboard; webhooks are ignored without it */
  webhook_secret?: string
}

/**
 * What the payment session stores. It is returned to the storefront, which
 * opens Razorpay Checkout with `key_id` and `razorpay_order_id`, so it must
 * never hold anything secret.
 */
type SessionData = {
  session_id?: string
  key_id: string
  razorpay_order_id: string
  /** In the smallest currency unit (paise) */
  amount: number
  currency: string
  razorpay_payment_id?: string
}

/** Razorpay amounts are in the smallest currency unit; Medusa's are in the main unit */
const toMinorUnit = (amount: BigNumberInput) =>
  MathBN.mult(amount, 100).integerValue().toNumber()

const toMainUnit = (amount: number | string) => MathBN.div(amount, 100)

/**
 * Pays with Razorpay Checkout. The storefront opens Checkout for the Razorpay
 * order created here; when the cart is completed, the payment is confirmed by
 * asking Razorpay for the order's payments, never by trusting the browser.
 * Webhooks cover customers who pay and leave before the cart is completed.
 */
class RazorpayProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "razorpay"

  protected logger_: Logger
  protected options_: Options
  protected razorpay_: Razorpay

  static validateOptions(options: Record<string, unknown>) {
    if (!options.key_id || !options.key_secret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Razorpay needs key_id and key_secret (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)."
      )
    }
  }

  constructor(container: { logger: Logger }, options: Options) {
    super(container, options)
    this.logger_ = container.logger
    this.options_ = options
    this.razorpay_ = new Razorpay({
      key_id: options.key_id,
      key_secret: options.key_secret,
    })
  }

  async initiatePayment({
    amount,
    currency_code,
    data,
  }: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const sessionData = await this.createOrder(amount, currency_code, data?.session_id as string)
    return { id: sessionData.razorpay_order_id, data: sessionData }
  }

  /** A Razorpay order's amount can't change, so a new amount needs a new order */
  async updatePayment({
    amount,
    currency_code,
    data,
  }: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const current = data as SessionData
    if (
      current?.razorpay_order_id &&
      current.amount === toMinorUnit(amount) &&
      current.currency === currency_code.toUpperCase()
    ) {
      return { data: current, status: PaymentSessionStatus.PENDING }
    }
    const sessionData = await this.createOrder(amount, currency_code, current?.session_id)
    return { data: sessionData, status: PaymentSessionStatus.PENDING }
  }

  async authorizePayment({ data }: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const sessionData = data as SessionData
    const payment = await this.findSuccessfulPayment(sessionData.razorpay_order_id)
    if (!payment) {
      return { data: sessionData, status: PaymentSessionStatus.PENDING }
    }
    return {
      data: { ...sessionData, razorpay_payment_id: payment.id },
      status:
        payment.status === "captured"
          ? PaymentSessionStatus.CAPTURED
          : PaymentSessionStatus.AUTHORIZED,
    }
  }

  async getPaymentStatus({ data }: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    return this.authorizePayment({ data })
  }

  /** Only needed when auto-capture is off in the Razorpay dashboard */
  async capturePayment({ data }: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const sessionData = data as SessionData
    const paymentId = this.requirePaymentId(sessionData)
    const payment = await this.call("fetch the payment", () =>
      this.razorpay_.payments.fetch(paymentId)
    )
    if (payment.status === "authorized") {
      await this.call("capture the payment", () =>
        this.razorpay_.payments.capture(paymentId, sessionData.amount, sessionData.currency)
      )
    }
    return { data: sessionData }
  }

  async refundPayment({ amount, data }: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const sessionData = data as SessionData
    const paymentId = this.requirePaymentId(sessionData)
    await this.call("refund the payment", () =>
      this.razorpay_.payments.refund(paymentId, { amount: toMinorUnit(amount) })
    )
    return { data: sessionData }
  }

  /**
   * Razorpay has no way to void a payment. Unpaid orders simply expire, and
   * authorized payments that are never captured are refunded automatically.
   */
  async cancelPayment({ data }: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data }
  }

  async deletePayment({ data }: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data }
  }

  async retrievePayment({ data }: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const sessionData = data as SessionData
    const order = await this.call("fetch the order", () =>
      this.razorpay_.orders.fetch(sessionData.razorpay_order_id)
    )
    return { data: { ...sessionData, razorpay_order_status: order.status } }
  }

  /**
   * Handles `payment.authorized` (manual capture) and `order.paid` (captured).
   * Configure these two events on the webhook in the Razorpay dashboard.
   */
  async getWebhookActionAndData({
    data,
    rawData,
    headers,
  }: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    const notSupported = { action: PaymentActions.NOT_SUPPORTED }

    if (!this.options_.webhook_secret) {
      this.logger_.warn("Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET isn't set; ignoring it.")
      return notSupported
    }
    const signature = headers["x-razorpay-signature"]
    const isValid =
      typeof signature === "string" &&
      Razorpay.validateWebhookSignature(rawData.toString(), signature, this.options_.webhook_secret)
    if (!isValid) {
      this.logger_.warn("Razorpay webhook with an invalid signature; ignoring it.")
      return notSupported
    }

    const event = data as {
      event: string
      payload: {
        payment?: { entity: Payments.RazorpayPayment }
        order?: { entity: { notes?: Record<string, string> } }
      }
    }
    const payment = event.payload.payment?.entity
    if (!payment) {
      return notSupported
    }

    let action: PaymentActions
    let notes = event.payload.order?.entity.notes
    if (event.event === "order.paid") {
      action = PaymentActions.SUCCESSFUL
    } else if (event.event === "payment.authorized") {
      action = PaymentActions.AUTHORIZED
      // This event doesn't include the order, which holds the session id
      const order = await this.call("fetch the order", () =>
        this.razorpay_.orders.fetch(payment.order_id)
      )
      notes = order.notes as Record<string, string> | undefined
    } else {
      return notSupported
    }

    const sessionId = notes?.session_id
    if (!sessionId) {
      return notSupported
    }
    return {
      action,
      data: { session_id: sessionId, amount: toMainUnit(payment.amount) },
    }
  }

  private async createOrder(
    amount: BigNumberInput,
    currencyCode: string,
    sessionId?: string
  ): Promise<SessionData> {
    const currency = currencyCode.toUpperCase()
    const order = await this.call("create the order", () =>
      this.razorpay_.orders.create({
        amount: toMinorUnit(amount),
        currency,
        receipt: sessionId,
        notes: sessionId ? { session_id: sessionId } : undefined,
      })
    )
    return {
      session_id: sessionId,
      key_id: this.options_.key_id,
      razorpay_order_id: order.id,
      amount: Number(order.amount),
      currency,
    }
  }

  /** The order's captured payment, or an authorized one when auto-capture is off */
  private async findSuccessfulPayment(orderId: string) {
    const { items } = await this.call("fetch the order's payments", () =>
      this.razorpay_.orders.fetchPayments(orderId)
    )
    return (
      items.find((payment) => payment.status === "captured") ??
      items.find((payment) => payment.status === "authorized")
    )
  }

  private requirePaymentId(data: SessionData) {
    if (!data.razorpay_payment_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Razorpay order ${data.razorpay_order_id} has no payment yet.`
      )
    }
    return data.razorpay_payment_id
  }

  /** The SDK rejects with a plain object, not an Error; turn it into a readable MedusaError */
  private async call<T>(action: string, request: () => Promise<T>): Promise<T> {
    try {
      return await request()
    } catch (error) {
      const description =
        (error as { error?: { description?: string } })?.error?.description ??
        (error as Error)?.message ??
        "unknown error"
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Razorpay couldn't ${action}: ${description}`
      )
    }
  }
}

export default RazorpayProviderService
