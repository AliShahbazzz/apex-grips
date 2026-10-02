import { Badge, FeatureCard, Heading } from "@/components"
import { FEATURES } from "@/data/content"
import { SportGeometry } from "./sport-geometry"

export function WhyApex() {
  return (
    <section
      aria-labelledby="why-apex-heading"
      className="mb-12 border-t-4 border-border py-12"
    >
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <Badge size="lg" shadow>
          Why Apex outperforms
        </Badge>
        <Heading
          id="why-apex-heading"
          as="h3"
          size="lg"
          highlight="Maximum Control"
          className="mt-3"
        >
          Engineered for
        </Heading>
        <p className="mt-2 text-sm font-bold uppercase text-foreground/70">
          Traditional overgrips wear down in 2 matches. Apex Grips maintain tackiness
          for up to 15 intense sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {FEATURES.map(({ tone, ...feature }) => (
          <FeatureCard key={feature.title} iconTone={tone} {...feature} />
        ))}
      </div>

      <SportGeometry />
    </section>
  )
}
