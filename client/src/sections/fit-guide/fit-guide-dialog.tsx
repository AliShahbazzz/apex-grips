import { useState, type ReactNode } from "react"
import {
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Heading,
  OptionCard,
  StepIndicator,
} from "@/components"
import { PATTERNS, SPORTS } from "@/data/catalog"
import { useStore } from "@/store/store"

const TOTAL_STEPS = 3

type StepProps = {
  step: number
  title: string
  highlight: string
  description?: string
  children: ReactNode
}

function Step({ step, title, highlight, description, children }: StepProps) {
  return (
    <div className="space-y-4">
      <Badge>
        Step {step} of {TOTAL_STEPS}
      </Badge>
      <DialogTitle asChild>
        <Heading as="h3" highlight={highlight}>
          {title}
        </Heading>
      </DialogTitle>
      {description && (
        <DialogDescription className="text-xs font-bold uppercase text-foreground/70">
          {description}
        </DialogDescription>
      )}
      <div className="pt-2">{children}</div>
    </div>
  )
}

export function FitGuideDialog() {
  const { state, dispatch } = useStore()
  const [step, setStep] = useState(1)
  const open = state.overlay === "fitGuide"
  const close = () => dispatch({ type: "closeOverlay" })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) return
        close()
        setStep(1)
      }}
    >
      {/* Step 3 has no description; tell Radix so it doesn't warn */}
      <DialogContent {...(step === 3 ? { "aria-describedby": undefined } : {})}>
        <StepIndicator
          total={TOTAL_STEPS}
          current={step}
          className="mb-6 border-b-2 border-border pb-4 pr-8"
        />

        {step === 1 && (
          <Step
            step={1}
            title="What is your"
            highlight="Primary Sport?"
            description="We'll calibrate handle contours, texture grip thickness, and stretch ratio."
          >
            <div className="grid grid-cols-2 gap-3">
              {SPORTS.map((sport) => (
                <OptionCard
                  key={sport.id}
                  icon={sport.icon}
                  title={sport.label}
                  description={sport.fitHint}
                  onClick={() => {
                    dispatch({ type: "setSport", sport: sport.id })
                    setStep(2)
                  }}
                />
              ))}
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step
            step={2}
            title="What is your"
            highlight="Building Approach?"
            description="Select how you want to navigate texture and color combinations."
          >
            <div className="space-y-3">
              <OptionCard
                tone="dark"
                title="⚡ Favorite pattern first"
                description="Choose high-tack groove textures then select colors"
                trailing="→"
                onClick={() => setStep(3)}
              />
              <OptionCard
                tone="dark"
                title="🎨 Favorite colour first"
                description={`Select signature color hex and test all ${PATTERNS.length} patterns`}
                trailing="→"
                onClick={() => setStep(3)}
              />
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step step={3} title="Choose your" highlight="Build Strategy">
            <div className="grid grid-cols-2 gap-3">
              <OptionCard
                title="🛠️ Custom mix & match"
                description="Handpick every single grip slot manually from scratch"
                className="p-5"
                onClick={() => {
                  close()
                  setStep(1)
                }}
              />
              <OptionCard
                title="🏆 Pre-built pro pack"
                description="Auto-fill box with tournament winning mix"
                className="p-5"
                onClick={() => {
                  dispatch({ type: "applyBundle", bundleId: "crimson" })
                  close()
                  setStep(1)
                }}
              />
            </div>
          </Step>
        )}
      </DialogContent>
    </Dialog>
  )
}
