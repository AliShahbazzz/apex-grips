import { Badge, Button } from "@/components"
import { findPattern, findSport } from "@/catalog/selectors"
import { useCatalog } from "@/catalog/use-catalog"
import { PACK_SIZE } from "@/data/builder-rules"
import type { CartItem } from "@/types"

type CartItemCardProps = {
  item: CartItem
  position: number
  onRemove: () => void
}

export function CartItemCard({ item, position, onRemove }: CartItemCardProps) {
  const catalog = useCatalog()
  return (
    <li className="space-y-2 rounded-base border-2 border-border bg-secondary-background p-3">
      <div className="flex items-center justify-between border-b border-border/20 pb-2">
        <div className="flex items-center gap-2">
          <Badge size="sm">
            {PACK_SIZE}-Pack Bundle #{position}
          </Badge>
          <span className="text-xs font-black uppercase">
            {findSport(catalog, item.sport)?.label}
          </span>
        </div>
        <Button variant="link" size="inline" className="text-xs no-underline" onClick={onRemove}>
          Remove
        </Button>
      </div>

      <ul className="grid grid-cols-5 gap-1 pt-1">
        {item.slots.map((slot, index) => (
          <li
            key={index}
            className="border border-border bg-background p-1 text-center"
            title={`${findPattern(catalog, slot.patternId)?.name}, ${slot.color.name}`}
          >
            <div
              className="mb-1 h-3 w-full border border-border"
              style={{ backgroundColor: slot.color.hex }}
            />
            <div className="truncate text-[7px] font-black uppercase">
              {findPattern(catalog, slot.patternId)?.name}
            </div>
          </li>
        ))}
      </ul>
    </li>
  )
}
