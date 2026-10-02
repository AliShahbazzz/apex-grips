/*
 * Hardcoded catalog. These will be replaced by Medusa store API data
 * (products, variants, prices, promotions) once the backend is wired in.
 */
import type { CuratedBundle, GripColor, Pattern, Sport } from "@/types"

export const PACK_SIZE = 5
export const PACK_PRICE = 899
export const CURRENCY = "INR"
/** Discount applied to every box after the first */
export const MULTI_PACK_DISCOUNT = 0.15
export const PROMO_DISCOUNT = 0.1
export const PROMO_CODES = ["APEX10", "SUPER10"]

export const SPORTS: Sport[] = [
  {
    id: "cricket",
    label: "Cricket",
    icon: "🏏",
    handle: "Octagonal Heavy",
    fitHint: "Octagonal Bat Contour",
  },
  {
    id: "pickleball",
    label: "Pickleball",
    icon: "🏓",
    handle: "Oval Flange Base",
    fitHint: "Short Oval Flanged",
  },
  {
    id: "tennis",
    label: "Tennis",
    icon: "🎾",
    handle: "Bevel Spiral",
    fitHint: "Standard Bevel",
  },
  {
    id: "badminton",
    label: "Badminton",
    icon: "🏸",
    handle: "Ultra-Thin Micro",
    fitHint: "Micro Thin Precision",
  },
]

export const GRIP_COLORS: GripColor[] = [
  { hex: "#FF002B", name: "Crimson Red" },
  { hex: "#080808", name: "Stealth Black" },
  { hex: "#FFFFFF", name: "Pure White" },
  { hex: "#0055FF", name: "Nitro Blue" },
  { hex: "#FF5500", name: "Sunset Orange" },
]

export const PATTERNS: Pattern[] = [
  {
    id: "chevron",
    name: "Chevron Matrix",
    badge: "🔥 Top Seller",
    description:
      "V-shaped herringbone micro-grooves engineered for maximum anti-slip lock during aggressive swings.",
    tag: "Max Tack",
    sweatScore: 98,
    shockScore: 82,
  },
  {
    id: "ripple",
    name: "Hydro Ripple",
    badge: "⚡ Only 2 Left",
    description:
      "Continuous fluid wave channels that push sweat outward away from palm contact points.",
    tag: "Wet Grip",
    sweatScore: 99,
    shockScore: 78,
  },
  {
    id: "coil",
    name: "Helical Coil",
    badge: "⭐ Best Seller",
    description:
      "Deep diagonal spiral contour wraps offering enhanced bevel feel and index finger placement.",
    tag: "Bevel Feel",
    sweatScore: 94,
    shockScore: 88,
  },
  {
    id: "ring",
    name: "Gel Ring Band",
    badge: "🏆 Pro Choice",
    description:
      "Segmented ring nodes with dampening gel inserts for high-impact vibration absorption.",
    tag: "Shock Absorb",
    sweatScore: 91,
    shockScore: 96,
  },
  {
    id: "octopus",
    name: "Octo-Tack Suction",
    badge: "🔥 Hot Pick",
    description:
      "Micro-suction cup cell array creating a sticky vacuum effect for firm wrist relaxation.",
    tag: "Vacuum Grip",
    sweatScore: 96,
    shockScore: 85,
  },
  {
    id: "lattice",
    name: "3D Diamond Lattice",
    badge: "⚡ New Tech",
    description:
      "Interlocking diamond mesh grid with raised nodes providing tactile multi-directional grip.",
    tag: "3D Mesh",
    sweatScore: 95,
    shockScore: 90,
  },
  {
    id: "hex",
    name: "Hex Core Honeycomb",
    badge: "⭐ All-Court",
    description:
      "Hexagonal honeycomb geometry with micro-perforated aeration for fast heat dissipation.",
    tag: "Aerated",
    sweatScore: 97,
    shockScore: 87,
  },
]

export const CURATED_BUNDLES: CuratedBundle[] = [
  {
    id: "stealth",
    label: "Stealth All-Black",
    icon: "🕶️",
    colors: Array(PACK_SIZE).fill("#080808"),
  },
  {
    id: "crimson",
    label: "Crimson Attack",
    icon: "🔥",
    colors: Array(PACK_SIZE).fill("#FF002B"),
  },
  {
    id: "mix",
    label: "Pro Mix Pack",
    icon: "🌈",
    colors: GRIP_COLORS.map((color) => color.hex),
  },
]

export function getPattern(id: string) {
  return PATTERNS.find((pattern) => pattern.id === id)
}

export function getSport(id: string) {
  return SPORTS.find((sport) => sport.id === id)
}

export function getGripColor(hex: string) {
  return GRIP_COLORS.find((color) => color.hex === hex)
}
