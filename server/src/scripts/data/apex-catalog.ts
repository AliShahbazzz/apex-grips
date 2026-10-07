/**
 * Apex Grips catalog definition, used by the seed and cleanup scripts.
 * Every grip is one SKU: a sport product's variant for one pattern × color.
 */

export const CURRENCY_CODE = "inr"
/** Price of one grip, in rupees (Medusa stores major units) */
export const GRIP_PRICE = 179.8

/** Shared option titles. Kept distinct from the demo "Color" option. */
export const PATTERN_OPTION_TITLE = "Pattern"
export const COLOR_OPTION_TITLE = "Grip Color"

export type SportData = {
  id: string
  title: string
  icon: string
  geometry: string
  fitHint: string
}

export const SPORTS: SportData[] = [
  {
    id: "cricket",
    title: "Apex Cricket Grip",
    icon: "🏏",
    geometry: "Octagonal Heavy",
    fitHint: "Octagonal Bat Contour",
  },
  {
    id: "pickleball",
    title: "Apex Pickleball Grip",
    icon: "🏓",
    geometry: "Oval Flange Base",
    fitHint: "Short Oval Flanged",
  },
  {
    id: "tennis",
    title: "Apex Tennis Grip",
    icon: "🎾",
    geometry: "Bevel Spiral",
    fitHint: "Standard Bevel",
  },
  {
    id: "badminton",
    title: "Apex Badminton Grip",
    icon: "🏸",
    geometry: "Ultra-Thin Micro",
    fitHint: "Micro Thin Precision",
  },
]

export const sportHandle = (sportId: string) => `${sportId}-grip`

export const APEX_PRODUCT_HANDLES = SPORTS.map((sport) => sportHandle(sport.id))

export type PatternData = {
  handle: string
  name: string
  badge: string
  tag: string
  description: string
}

export const PATTERNS: PatternData[] = [
  {
    handle: "chevron",
    name: "Chevron Matrix",
    badge: "🔥 Top Seller",
    tag: "Max Tack",
    description:
      "V-shaped herringbone micro-grooves engineered for maximum anti-slip lock during aggressive swings.",
  },
  {
    handle: "ripple",
    name: "Hydro Ripple",
    badge: "⚡ Only 2 Left",
    tag: "Wet Grip",
    description:
      "Continuous fluid wave channels that push sweat outward away from palm contact points.",
  },
  {
    handle: "coil",
    name: "Helical Coil",
    badge: "⭐ Best Seller",
    tag: "Bevel Feel",
    description:
      "Deep diagonal spiral contour wraps offering enhanced bevel feel and index finger placement.",
  },
  {
    handle: "ring",
    name: "Gel Ring Band",
    badge: "🏆 Pro Choice",
    tag: "Shock Absorb",
    description:
      "Segmented ring nodes with dampening gel inserts for high-impact vibration absorption.",
  },
  {
    handle: "octopus",
    name: "Octo-Tack Suction",
    badge: "🔥 Hot Pick",
    tag: "Vacuum Grip",
    description:
      "Micro-suction cup cell array creating a sticky vacuum effect for firm wrist relaxation.",
  },
  {
    handle: "lattice",
    name: "3D Diamond Lattice",
    badge: "⚡ New Tech",
    tag: "3D Mesh",
    description:
      "Interlocking diamond mesh grid with raised nodes providing tactile multi-directional grip.",
  },
  {
    handle: "hex",
    name: "Hex Core Honeycomb",
    badge: "⭐ All-Court",
    tag: "Aerated",
    description:
      "Hexagonal honeycomb geometry with micro-perforated aeration for fast heat dissipation.",
  },
]

export type ColorData = {
  name: string
  hex: string
}

export const COLORS: ColorData[] = [
  { name: "Crimson Red", hex: "#FF002B" },
  { name: "Stealth Black", hex: "#080808" },
  { name: "Pure White", hex: "#FFFFFF" },
  { name: "Nitro Blue", hex: "#0055FF" },
  { name: "Sunset Orange", hex: "#FF5500" },
]

/**
 * Patterns offered per sport. Every sport gets every pattern for now; drop a
 * handle here to stop selling that pattern for a sport.
 */
export const SPORT_PATTERNS: Record<string, string[]> = Object.fromEntries(
  SPORTS.map((sport) => [sport.id, PATTERNS.map((pattern) => pattern.handle)])
)

export const variantSku = (sportId: string, patternHandle: string, colorName: string) =>
  ["APX", sportId, patternHandle, colorName.replace(/\s+/g, "-")]
    .join("-")
    .toUpperCase()
