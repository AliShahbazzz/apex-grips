/*
 * Storefront-only rules. Products, patterns, colors and prices come from the
 * Medusa store API (see src/api/catalog.ts); a "box" exists only here.
 */
import type { CuratedBundle } from "@/types"

export const PACK_SIZE = 5

/** Colors are hex codes; ones the catalog doesn't sell are skipped. */
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
    colors: ["#FF002B", "#080808", "#FFFFFF", "#0055FF", "#FF5500"],
  },
]
