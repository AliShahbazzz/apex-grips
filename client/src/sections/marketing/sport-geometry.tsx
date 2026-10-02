import { Card, InfoTile } from "@/components"
import { SPORTS } from "@/data/catalog"

export function SportGeometry() {
  return (
    <Card tone="inverse" className="mt-10 p-6">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-main">
            Handle Geometry Engine
          </span>
          <h4 className="mt-1 text-2xl font-black uppercase">
            Sport-specific molding & taper
          </h4>
          <p className="mt-1 max-w-xl text-xs font-bold uppercase text-inverse-foreground/70">
            Each grip is pre-contoured for the specific bevel geometry of your sport:
            octagonal tapered for cricket/tennis, oval flanged for pickleball/badminton.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 md:w-auto">
          {SPORTS.map((sport) => (
            <InfoTile
              key={sport.id}
              layout="stack"
              icon={sport.icon}
              title={sport.label}
              subtitle={sport.handle}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
