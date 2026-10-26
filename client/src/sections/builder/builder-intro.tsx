import { Badge, Heading, InfoTile } from "@/components"
import { findSport, patternsForSport } from "@/catalog/selectors"
import { useCatalog } from "@/catalog/use-catalog"
import { PACK_SIZE } from "@/data/builder-rules"
import { VALUE_PROPS } from "@/data/content"
import { useStore } from "@/store/store"

export function BuilderIntro() {
  const { state } = useStore()
  const catalog = useCatalog()
  const sport = findSport(catalog, state.sport)
  const patternCount = patternsForSport(catalog, state.sport).length

  return (
    <div className="mb-6 flex flex-col justify-between gap-4 border-b-4 border-border pb-6 md:flex-row md:items-end">
      <div>
        <Badge size="lg" shadow className="mb-2">
          <span>⚡ Custom {PACK_SIZE}-Pack Builder</span>
          <span>•</span>
          <span>{sport?.label} Grips</span>
        </Badge>
        <Heading as="h2" size="xl" highlight={`${PACK_SIZE}-Pack Bundle`}>
          Build your
        </Heading>
        <p className="mt-2 text-sm font-bold uppercase tracking-wide text-foreground/70">
          Mix & match {patternCount} high-tack textures across {catalog.colors.length} pro
          colors. 5x longer lasting eco-latex.
        </p>
      </div>

      <div className="flex gap-3">
        {VALUE_PROPS.map((prop) => (
          <InfoTile key={prop.title} {...prop} />
        ))}
      </div>
    </div>
  )
}
