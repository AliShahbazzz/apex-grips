import { useEffect } from "react"
import { BuilderIntro } from "@/sections/builder/builder-intro"
import { BuilderPanel } from "@/sections/builder/builder-panel"
import { InspectPatternDialog } from "@/sections/builder/inspect-pattern-dialog"
import { PatternGallery } from "@/sections/builder/pattern-gallery"
import { CartSheet } from "@/sections/cart/cart-sheet"
import { CheckoutDialog } from "@/sections/checkout/checkout-dialog"
import { OrderSuccessDialog } from "@/sections/checkout/order-success-dialog"
import { FitGuideDialog } from "@/sections/fit-guide/fit-guide-dialog"
import { AnnouncementBar } from "@/sections/header/announcement-bar"
import { SiteHeader } from "@/sections/header/site-header"
import { WhyApex } from "@/sections/marketing/why-apex"
import { useStore } from "@/store/store"

export default function App() {
  const { dispatch } = useStore()

  // Open the fit guide shortly after first load, like the mockup
  useEffect(() => {
    const timer = setTimeout(
      () => dispatch({ type: "openOverlay", overlay: "fitGuide" }),
      500
    )
    return () => clearTimeout(timer)
  }, [dispatch])

  return (
    <>
      <AnnouncementBar />
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <BuilderIntro />
        <BuilderPanel />
        <PatternGallery />
        <WhyApex />
      </main>

      <FitGuideDialog />
      <InspectPatternDialog />
      <CartSheet />
      <CheckoutDialog />
      <OrderSuccessDialog />
    </>
  )
}
