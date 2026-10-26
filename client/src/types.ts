/** Sport key from the product's metadata, e.g. "cricket" */
export type SportId = string

/** One Medusa product: the grip for a sport */
export type Sport = {
  id: SportId
  productId: string
  label: string
  icon: string
  /** Handle shape shown in the geometry section */
  handle: string
  /** Handle hint shown in the fit guide */
  fitHint: string
  /** Patterns this sport is sold in */
  patternIds: PatternId[]
  /** Variant (SKU) id per pattern and color, keyed by variantKey() */
  variantIds: Record<string, string>
  /** Variant thumbnail per pattern and color, keyed by variantKey() */
  variantImages: Record<string, string>
}

export type GripColor = {
  hex: string
  name: string
}

/** Pattern handle, e.g. "chevron" */
export type PatternId = string

export type Pattern = {
  id: PatternId
  name: string
  badge: string
  description: string
  tag: string
  imageUrl: string | null
  /** 0-100, optional until the backend provides it */
  sweatScore?: number
  /** 0-100, optional until the backend provides it */
  shockScore?: number
}

/** Everything the storefront loads from the Medusa store API */
export type Catalog = {
  regionId: string
  currencyCode: string
  /** Price of a single grip */
  gripPrice: number
  /** In display order; the first one is the default */
  sports: Sport[]
  patterns: Pattern[]
  colors: GripColor[]
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
