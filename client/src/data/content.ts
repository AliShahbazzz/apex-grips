/* Static marketing copy for the page sections. */

export const ANNOUNCEMENTS = [
  { icon: "⚡", text: "Apex Grips: Your Grip Guy" },
  { icon: "🔥", text: "Free Express Shipping on 2+ Bundles" },
  { icon: "🛡️", text: "5X Durability Eco-Latex Matrix" },
  { icon: "💪", text: "Sweat-Proof Micro-Channel Tech" },
]

export const VALUE_PROPS = [
  { icon: "💧", title: "Max Sweat", subtitle: "Micro-Channels" },
  { icon: "🛡️", title: "5X Durable", subtitle: "Eco-Latex Matrix" },
]

export const FEATURES = [
  {
    icon: "💧",
    tone: "main",
    title: "1. High-Sweat Micro-Channels",
    description:
      "Laser-etched directional grooves channel palm moisture away from contact points, preserving 99.4% tackiness during humid match conditions.",
    statLabel: "Sweat Resistance Score",
    statValue: "99.4% Tack",
  },
  {
    icon: "🛡️",
    tone: "dark",
    title: "2. 5X Durability Eco-Latex",
    description:
      "Cross-linked synthetic polymer matrix prevents surface flaking and tears. Resists friction wear 5x longer than standard PU overgrips.",
    statLabel: "Lifespan Rating",
    statValue: "15+ Matches",
  },
  {
    icon: "💥",
    tone: "main",
    title: "3. Advanced Shock Absorption",
    description:
      "Dual-layer viscous elastomer core dampens impact vibrations by up to 42%, reducing elbow strain and arm fatigue on heavy impacts.",
    statLabel: "Vibration Damping",
    statValue: "-42% Vibe",
  },
] as const
