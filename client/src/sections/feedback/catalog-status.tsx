import { Button, Card } from "@/components"

export function CatalogLoading() {
  return (
    <div role="status" className="flex min-h-screen items-center justify-center p-4">
      <Card className="px-6 py-4 text-sm font-black uppercase motion-safe:animate-pulse">
        Loading grips…
      </Card>
    </div>
  )
}

export function CatalogError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div role="alert" className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md space-y-3 p-6">
        <h2 className="text-xl font-black uppercase">
          Couldn't load the <span className="text-main">store</span>
        </h2>
        <p className="text-xs font-bold uppercase text-foreground/70">{error.message}</p>
        <Button onClick={onRetry}>Try again</Button>
      </Card>
    </div>
  )
}
