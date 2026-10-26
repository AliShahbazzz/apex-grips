import { Button, Heading } from "@/components"
import { patternsForSport } from "@/catalog/selectors"
import { useCatalog } from "@/catalog/use-catalog"
import { CURATED_BUNDLES } from "@/data/builder-rules"
import { useStore } from "@/store/store"
import { PatternCard } from "./pattern-card"

export function PatternGallery() {
  const { state, dispatch } = useStore()
  const catalog = useCatalog()
  const patterns = patternsForSport(catalog, state.sport)

  return (
    <section aria-labelledby="patterns-heading" className="mb-12">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Heading id="patterns-heading" as="h3" highlight="Texture Patterns">
            1. Select
          </Heading>
          <p className="mt-1 text-xs font-bold uppercase text-foreground/60">
            Click "+ Add to slot" to fill your current active box in{" "}
            <span className="text-main">{state.activeColor.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="whitespace-nowrap text-xs font-black uppercase">
            ⚡ Pre-built curated:
          </span>
          {CURATED_BUNDLES.map((bundle) => (
            <Button
              key={bundle.id}
              variant="muted"
              size="xs"
              onClick={() => dispatch({ type: "applyBundle", bundleId: bundle.id })}
              className="text-[11px]"
            >
              {bundle.icon} {bundle.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {patterns.map((pattern) => (
          <PatternCard
            key={pattern.id}
            pattern={pattern}
            color={state.activeColor}
            sport={state.sport}
            onAdd={() => dispatch({ type: "addPattern", patternId: pattern.id })}
            onInspect={() => dispatch({ type: "inspectPattern", patternId: pattern.id })}
          />
        ))}
      </div>
    </section>
  )
}
