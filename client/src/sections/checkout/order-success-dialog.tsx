import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Heading,
} from "@/components"
import { PACK_SIZE } from "@/data/catalog"
import { useStore } from "@/store/store"

export function OrderSuccessDialog() {
  const { state, dispatch } = useStore()
  const reset = () => dispatch({ type: "reset" })

  return (
    <Dialog open={state.overlay === "success"} onOpenChange={(open) => !open && reset()}>
      <DialogContent
        hideClose
        className="max-w-md space-y-4 text-center"
        overlayClassName="backdrop-blur-md"
      >
        <div className="mx-auto flex size-20 items-center justify-center rounded-full border-4 border-border bg-main text-4xl shadow-shadow">
          🏆
        </div>
        <DialogTitle asChild>
          <Heading as="h3" className="text-3xl" highlight="Confirmed!">
            Order
          </Heading>
        </DialogTitle>
        <DialogDescription className="text-xs font-bold uppercase text-foreground/70">
          Your custom Apex Grips {PACK_SIZE}-pack is being handcrafted and dispatched via
          express shipping.
        </DialogDescription>

        <dl className="space-y-1 rounded-base border-2 border-border bg-secondary-background p-4 text-left text-xs font-black uppercase">
          <div className="flex gap-1">
            <dt>Order ID:</dt>
            <dd className="text-main">{state.orderId}</dd>
          </div>
          <div className="flex gap-1">
            <dt>Status:</dt>
            <dd className="text-success">In production</dd>
          </div>
          <div className="flex gap-1">
            <dt>Estimated Delivery:</dt>
            <dd>2-3 business days</dd>
          </div>
        </dl>

        <Button variant="dark" size="lg" className="w-full text-xs" onClick={reset}>
          ⚡ Build Another {PACK_SIZE}-Pack
        </Button>
      </DialogContent>
    </Dialog>
  )
}
