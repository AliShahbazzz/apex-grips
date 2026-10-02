export type SportId = "cricket" | "pickleball" | "tennis" | "badminton"

export type Sport = {
  id: SportId
  label: string
  icon: string
  /** Handle shape shown in the geometry section */
  handle: string
  /** Handle hint shown in the fit guide */
  fitHint: string
}

export type GripColor = {
  hex: string
  name: string
}

export type PatternId =
  | "chevron"
  | "ripple"
  | "coil"
  | "ring"
  | "octopus"
  | "lattice"
  | "hex"

export type Pattern = {
  id: PatternId
  name: string
  badge: string
  description: string
  tag: string
  /** 0-100 */
  sweatScore: number
  /** 0-100 */
  shockScore: number
}

export type CuratedBundleId = "stealth" | "crimson" | "mix"

export type CuratedBundle = {
  id: CuratedBundleId
  label: string
  icon: string
  /** One color per slot */
  colors: string[]
}

/** One filled grip slot in a 5-pack box */
export type Slot = {
  patternId: PatternId
  color: GripColor
}

export type Box = {
  id: number
  slots: (Slot | null)[]
}

export type CartItem = {
  id: string
  sport: SportId
  slots: Slot[]
}
