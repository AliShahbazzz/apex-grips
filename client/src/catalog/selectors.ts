import type { Catalog, PatternId, SportId } from "@/types"

export const variantKey = (patternId: PatternId, hex: string) =>
  `${patternId}:${hex.toUpperCase()}`

export function findPattern(catalog: Catalog, id: PatternId) {
  return catalog.patterns.find((pattern) => pattern.id === id)
}

export function findSport(catalog: Catalog, id: SportId) {
  return catalog.sports.find((sport) => sport.id === id)
}

export function findColor(catalog: Catalog, hex: string) {
  return catalog.colors.find((color) => color.hex.toUpperCase() === hex.toUpperCase())
}

/** The variant's photo, if one is set in Medusa */
export function findVariantImage(
  catalog: Catalog,
  sportId: SportId,
  patternId: PatternId,
  hex: string
): string | undefined {
  return findSport(catalog, sportId)?.variantImages[variantKey(patternId, hex)]
}

/** Patterns sold for a sport, in catalog order */
export function patternsForSport(catalog: Catalog, sportId: SportId) {
  const sport = findSport(catalog, sportId)
  return catalog.patterns.filter((pattern) => sport?.patternIds.includes(pattern.id))
}
