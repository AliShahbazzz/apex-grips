import { Badge, Heading, InfoTile } from "@/components"
import { GRIP_COLORS, PACK_SIZE, PATTERNS, getSport } from "@/data/catalog"
import { VALUE_PROPS } from "@/data/content"
import { useStore } from "@/store/store"

export function BuilderIntro() {
  const { state } = useStore()
  const sport = getSport(state.sport)

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
          Mix & match {PATTERNS.length} high-tack textures across {GRIP_COLORS.length} pro
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
