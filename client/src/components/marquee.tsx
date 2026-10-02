import { Fragment, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type MarqueeProps = {
  items: ReactNode[]
  className?: string
}

/** Endless horizontal ticker. Items are rendered twice so the loop is seamless. */
export function Marquee({ items, className }: MarqueeProps) {
  const track = (hidden: boolean) =>
    items.map((item, index) => (
      <Fragment key={`${hidden}-${index}`}>
        <span aria-hidden={hidden || undefined}>{item}</span>
        <span aria-hidden>•</span>
      </Fragment>
    ))

  return (
    <div className={cn("overflow-hidden whitespace-nowrap", className)}>
      <div className="inline-flex animate-marquee items-center gap-8 pr-8">
        {track(false)}
        {track(true)}
      </div>
    </div>
  )
}
