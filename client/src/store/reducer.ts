import {
  CURATED_BUNDLES,
  GRIP_COLORS,
  PACK_SIZE,
  PATTERNS,
  PROMO_CODES,
  getGripColor,
  getPattern,
} from "@/data/catalog"
import type {
  Box,
  CartItem,
  CuratedBundleId,
  GripColor,
  PatternId,
  Slot,
  SportId,
} from "@/types"

export type Overlay = "fitGuide" | "inspect" | "cart" | "checkout" | "success"

export type StoreState = {
  sport: SportId
  activeColor: GripColor
  boxes: Box[]
  activeBoxIndex: number
  nextBoxId: number
  nextCartItemId: number
  cart: CartItem[]
  promoApplied: boolean
  promoMessage: { text: string; valid: boolean } | null
  overlay: Overlay | null
  inspectedPatternId: PatternId | null
  orderId: string | null
  toast: Toast | null
  nextToastId: number
}

export type Toast = { id: number; message: string }

export type StoreAction =
  | { type: "setSport"; sport: SportId }
  | { type: "selectColor"; color: GripColor }
  | { type: "addPattern"; patternId: PatternId }
  | { type: "clearSlot"; index: number }
  | { type: "clearBox" }
  | { type: "addBox" }
  | { type: "switchBox"; index: number }
  | { type: "deleteBox"; index: number }
  | { type: "applyBundle"; bundleId: CuratedBundleId }
  | { type: "addBoxToCart" }
  | { type: "removeFromCart"; id: string }
  | { type: "applyPromo"; code: string }
  | { type: "openOverlay"; overlay: Overlay }
  | { type: "inspectPattern"; patternId: PatternId }
  | { type: "closeOverlay" }
  | { type: "placeOrder"; orderId: string }
  | { type: "dismissToast"; id: number }
  | { type: "reset" }

const emptySlots = (): (Slot | null)[] => Array(PACK_SIZE).fill(null)

export const initialState: StoreState = {
  sport: "cricket",
  activeColor: GRIP_COLORS[0],
  boxes: [{ id: 1, slots: emptySlots() }],
  activeBoxIndex: 0,
  nextBoxId: 2,
  nextCartItemId: 1,
  cart: [],
  promoApplied: false,
  promoMessage: null,
  overlay: null,
  inspectedPatternId: null,
  orderId: null,
  toast: null,
  nextToastId: 1,
}

function updateActiveSlots(
  state: StoreState,
  update: (slots: (Slot | null)[]) => (Slot | null)[]
): StoreState {
  const boxes = state.boxes.map((box, index) =>
    index === state.activeBoxIndex ? { ...box, slots: update(box.slots) } : box
  )
  return { ...state, boxes }
}

function withToast(state: StoreState, message: string): StoreState {
  return {
    ...state,
    toast: { id: state.nextToastId, message },
    nextToastId: state.nextToastId + 1,
  }
}

function withNewBox(state: StoreState): StoreState {
  return {
    ...state,
    boxes: [...state.boxes, { id: state.nextBoxId, slots: emptySlots() }],
    activeBoxIndex: state.boxes.length,
    nextBoxId: state.nextBoxId + 1,
  }
}

export function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case "setSport":
      return { ...state, sport: action.sport }

    case "selectColor":
      return { ...state, activeColor: action.color }

    case "addPattern": {
      const slot: Slot = { patternId: action.patternId, color: state.activeColor }
      const activeSlots = state.boxes[state.activeBoxIndex].slots
      // A full box rolls over into a new one, like the mockup
      const rolledOver = !activeSlots.includes(null)
      const target = rolledOver ? withNewBox(state) : state
      const next = updateActiveSlots(target, (slots) => {
        const filled = [...slots]
        filled[filled.indexOf(null)] = slot
        return filled
      })

      const box = next.boxes[next.activeBoxIndex]
      const filledCount = box.slots.filter(Boolean).length
      const patternName = getPattern(action.patternId)?.name ?? "Grip"
      const message = rolledOver
        ? `Box ${state.boxes[state.activeBoxIndex].id} was full. Started Box ${box.id} with ${patternName}`
        : filledCount === PACK_SIZE
          ? `Box ${box.id} complete! Add it to cart`
          : `${patternName} (${slot.color.name}) added to Box ${box.id} · ${filledCount}/${PACK_SIZE}`
      return withToast(next, message)
    }

    case "clearSlot":
      return updateActiveSlots(state, (slots) =>
        slots.map((slot, index) => (index === action.index ? null : slot))
      )

    case "clearBox":
      return updateActiveSlots(state, emptySlots)

    case "addBox":
      return withNewBox(state)

    case "switchBox":
      return { ...state, activeBoxIndex: action.index }

    case "deleteBox": {
      if (state.boxes.length <= 1) return state
      const boxes = state.boxes.filter((_, index) => index !== action.index)
      const activeBoxIndex =
        action.index < state.activeBoxIndex ||
        (action.index === state.activeBoxIndex && action.index > 0)
          ? state.activeBoxIndex - 1
          : state.activeBoxIndex
      return { ...state, boxes, activeBoxIndex: Math.min(activeBoxIndex, boxes.length - 1) }
    }

    case "applyBundle": {
      const bundle = CURATED_BUNDLES.find((b) => b.id === action.bundleId)
      if (!bundle) return state
      const next = updateActiveSlots(state, () =>
        bundle.colors.map((hex, index) => ({
          patternId: PATTERNS[index % PATTERNS.length].id,
          color: getGripColor(hex) ?? { hex, name: bundle.label },
        }))
      )
      return withToast(next, `${bundle.label} loaded into Box ${next.boxes[next.activeBoxIndex].id}`)
    }

    case "addBoxToCart": {
      const box = state.boxes[state.activeBoxIndex]
      if (box.slots.includes(null)) return state
      const item: CartItem = {
        id: `cart-item-${state.nextCartItemId}`,
        sport: state.sport,
        slots: box.slots as Slot[],
      }
      return {
        ...state,
        cart: [...state.cart, item],
        nextCartItemId: state.nextCartItemId + 1,
        overlay: "cart",
      }
    }

    case "removeFromCart":
      return { ...state, cart: state.cart.filter((item) => item.id !== action.id) }

    case "applyPromo": {
      const valid = PROMO_CODES.includes(action.code.trim().toUpperCase())
      return {
        ...state,
        promoApplied: state.promoApplied || valid,
        promoMessage: valid
          ? { text: "Promo applied: extra 10% off!", valid }
          : { text: `Invalid promo code. Try ${PROMO_CODES[0]}`, valid },
      }
    }

    case "openOverlay":
      return { ...state, overlay: action.overlay }

    case "inspectPattern":
      return { ...state, overlay: "inspect", inspectedPatternId: action.patternId }

    case "closeOverlay":
      return { ...state, overlay: null }

    case "placeOrder":
      return { ...state, overlay: "success", orderId: action.orderId }

    case "dismissToast":
      // Ignore timers from toasts that were already replaced
      return state.toast?.id === action.id ? { ...state, toast: null } : state

    case "reset":
      return {
        ...initialState,
        sport: state.sport,
        activeColor: state.activeColor,
        // Keep ids unique so a pending dismiss timer can't close a newer toast
        nextToastId: state.nextToastId,
      }
  }
}
