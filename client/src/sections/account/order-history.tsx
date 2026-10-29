import { useEffect, useState } from "react"
import { Badge, Card } from "@/components"
import { listOrders, type OrderSummary } from "@/api/auth"
import { useAuth } from "@/auth/use-auth"
import { MedusaError } from "@/lib/medusa"
import { formatPrice } from "@/lib/pricing"

type OrdersState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; orders: OrderSummary[] }

const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" })

/** Customer-facing label for Medusa's fulfillment status */
const FULFILLMENT_LABELS: Record<string, string> = {
  not_fulfilled: "Processing",
  partially_fulfilled: "Packing",
  fulfilled: "Packed",
  partially_shipped: "Partly Shipped",
  shipped: "Shipped",
  partially_delivered: "Partly Delivered",
  delivered: "Delivered",
  canceled: "Cancelled",
}

function orderStatusLabel(order: OrderSummary) {
  if (order.status === "canceled") return "Cancelled"
  return FULFILLMENT_LABELS[order.fulfillment_status] ?? "Processing"
}

function OrderRow({ order }: { order: OrderSummary }) {
  const label = orderStatusLabel(order)
  return (
    <li>
      <Card weight="thin" className="flex items-center justify-between gap-3 p-3">
        <div className="space-y-1">
          <div className="text-sm font-black uppercase">Order #{order.display_id}</div>
          <div className="text-[10px] font-bold uppercase text-foreground/60">
            {dateFormatter.format(new Date(order.created_at))}
          </div>
        </div>
        <div className="space-y-1 text-right">
          <div className="text-sm font-black text-main">
            {formatPrice(order.total, order.currency_code)}
          </div>
          <Badge variant={label === "Cancelled" ? "neutral" : "dark"} size="sm">
            {label}
          </Badge>
        </div>
      </Card>
    </li>
  )
}

export function OrderHistory() {
  const { token, signOut } = useAuth()
  const [state, setState] = useState<OrdersState>({ status: "loading" })

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    listOrders(token, controller.signal)
      .then((orders) => setState({ status: "ready", orders }))
      .catch((error) => {
        if (controller.signal.aborted) return
        // The saved login expired
        if (error instanceof MedusaError && error.status === 401) signOut()
        else setState({ status: "error" })
      })
    return () => controller.abort()
  }, [token, signOut])

  return (
    <section aria-labelledby="order-history-title" className="space-y-3">
      <h3 id="order-history-title" className="text-sm font-black uppercase">
        Your Orders
      </h3>

      {state.status === "loading" && (
        <p className="text-xs font-bold uppercase text-foreground/60">Loading orders…</p>
      )}
      {state.status === "error" && (
        <p className="text-xs font-bold uppercase text-main">
          Couldn't load your orders. Close and reopen your account to retry.
        </p>
      )}
      {state.status === "ready" &&
        (state.orders.length === 0 ? (
          <div className="space-y-2 py-6 text-center">
            <div className="text-3xl">📦</div>
            <p className="text-xs font-bold uppercase text-foreground/60">No orders yet</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {state.orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </ul>
        ))}
    </section>
  )
}
