import { REGION_COUNTRY, storeGet } from "@/lib/medusa"
import type { Catalog, GripColor, Pattern, Sport } from "@/types"
import { variantKey } from "@/catalog/selectors"

/** Shared product option titles, as seeded on the server */
const PATTERN_OPTION = "Pattern"
const COLOR_OPTION = "Grip Color"

const PRODUCT_FIELDS = [
  "id",
  "title",
  "handle",
  "metadata",
  "*options",
  "*options.values",
  "variants.id",
  "variants.thumbnail",
  "*variants.options",
  "*variants.calculated_price",
].join(",")

// ---- Store API response shapes (only the fields used here) ----------------

type Metadata = Record<string, unknown> | null

type ApiRegion = {
  id: string
  currency_code: string
  countries?: { iso_2: string }[]
}

type ApiPattern = {
  handle: string
  name: string
  description: string | null
  badge: string | null
  tag: string | null
  image_url: string | null
  metadata: Metadata
}

type ApiOptionValue = {
  id: string
  value: string
  rank: number | null
  metadata: Metadata
  option_id: string
}

type ApiProduct = {
  id: string
  title: string
  handle: string
  metadata: Metadata
  options: { id: string; title: string; values: ApiOptionValue[] }[]
  variants: {
    id: string
    thumbnail: string | null
    options: ApiOptionValue[]
    calculated_price: { calculated_amount: number; currency_code: string } | null
  }[]
}

// ---- Mapping ------------------------------------------------------------------

const text = (metadata: Metadata, key: string) =>
  typeof metadata?.[key] === "string" ? (metadata[key] as string) : undefined

const score = (metadata: Metadata, key: string) =>
  typeof metadata?.[key] === "number" ? (metadata[key] as number) : undefined

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const byRank = (a: ApiOptionValue, b: ApiOptionValue) => (a.rank ?? 0) - (b.rank ?? 0)

function toPattern(pattern: ApiPattern): Pattern {
  return {
    id: pattern.handle,
    name: pattern.name,
    badge: pattern.badge ?? "",
    description: pattern.description ?? "",
    tag: pattern.tag ?? "",
    imageUrl: pattern.image_url,
    sweatScore: score(pattern.metadata, "sweat_score"),
    shockScore: score(pattern.metadata, "shock_score"),
  }
}

function toSport(product: ApiProduct): Sport {
  const patternOption = product.options.find((option) => option.title === PATTERN_OPTION)
  const colorOption = product.options.find((option) => option.title === COLOR_OPTION)
  const patternByValueId = new Map(
    (patternOption?.values ?? []).map((value) => [value.id, text(value.metadata, "pattern_handle")])
  )
  const hexByValueId = new Map(
    (colorOption?.values ?? []).map((value) => [value.id, text(value.metadata, "hex")])
  )

  const variantIds: Record<string, string> = {}
  const variantImages: Record<string, string> = {}
  const patternIds = new Set<string>()
  for (const variant of product.variants) {
    const patternId = variant.options
      .map((value) => patternByValueId.get(value.id))
      .find(Boolean)
    const hex = variant.options.map((value) => hexByValueId.get(value.id)).find(Boolean)
    if (!patternId || !hex) continue
    patternIds.add(patternId)
    variantIds[variantKey(patternId, hex)] = variant.id
    if (variant.thumbnail) variantImages[variantKey(patternId, hex)] = variant.thumbnail
  }

  const id = text(product.metadata, "sport") ?? product.handle
  return {
    id,
    productId: product.id,
    label: text(product.metadata, "label") ?? capitalize(id),
    icon: text(product.metadata, "icon") ?? "",
    handle: text(product.metadata, "geometry") ?? "",
    fitHint: text(product.metadata, "fit_hint") ?? "",
    patternIds: [...patternIds],
    variantIds,
    variantImages,
  }
}

/** Grip colors across all products, in option-value rank order */
function toColors(products: ApiProduct[]): GripColor[] {
  const colors = new Map<string, GripColor>()
  products
    .flatMap((product) => product.options)
    .filter((option) => option.title === COLOR_OPTION)
    .flatMap((option) => option.values)
    .sort(byRank)
    .forEach((value) => {
      const hex = text(value.metadata, "hex")
      if (hex && !colors.has(hex)) colors.set(hex, { hex, name: value.value })
    })
  return [...colors.values()]
}

/** Products sort by metadata.rank (set it in the admin), then by title */
function sportOrder(a: ApiProduct, b: ApiProduct) {
  const rankA = Number(a.metadata?.rank ?? Infinity)
  const rankB = Number(b.metadata?.rank ?? Infinity)
  return rankA === rankB ? a.title.localeCompare(b.title) : rankA - rankB
}

// ---- Fetch ----------------------------------------------------------------------

export async function fetchCatalog(signal?: AbortSignal): Promise<Catalog> {
  const [{ regions }, { patterns }] = await Promise.all([
    storeGet<{ regions: ApiRegion[] }>(
      "/store/regions",
      { fields: "id,currency_code,*countries" },
      signal
    ),
    storeGet<{ patterns: ApiPattern[] }>("/store/patterns", {}, signal),
  ])

  const region = regions.find((candidate) =>
    candidate.countries?.some((country) => country.iso_2 === REGION_COUNTRY)
  )
  if (!region) throw new Error(`No region found for country "${REGION_COUNTRY}"`)

  // Prices are only calculated when a region is given
  const { products } = await storeGet<{ products: ApiProduct[] }>(
    "/store/products",
    { region_id: region.id, fields: PRODUCT_FIELDS, limit: 100 },
    signal
  )
  if (!products.length) throw new Error("No products found")

  const sports = [...products].sort(sportOrder).map(toSport)
  const soldPatternIds = new Set(sports.flatMap((sport) => sport.patternIds))
  const gripPrice = products
    .flatMap((product) => product.variants)
    .find((variant) => variant.calculated_price)?.calculated_price?.calculated_amount

  if (gripPrice === undefined) throw new Error("Products have no price in this region")

  return {
    regionId: region.id,
    countryCode: REGION_COUNTRY,
    currencyCode: region.currency_code,
    gripPrice,
    sports,
    // Patterns come ranked from the API; hide any no product sells
    patterns: patterns.map(toPattern).filter((pattern) => soldPatternIds.has(pattern.id)),
    colors: toColors(products),
  }
}
