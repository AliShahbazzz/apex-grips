import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  GripCanvas,
  Heading,
  Progress,
} from "@/components"
import { getPattern } from "@/data/catalog"
import { useStore } from "@/store/store"

export function InspectPatternDialog() {
  const { state, dispatch } = useStore()
  const pattern = state.inspectedPatternId && getPattern(state.inspectedPatternId)
  const open = state.overlay === "inspect" && !!pattern
  const close = () => dispatch({ type: "closeOverlay" })

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="max-w-2xl sm:p-6">
        {pattern && (
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center rounded-base border-2 border-border bg-secondary-background p-4">
              <GripCanvas
                pattern={pattern.id}
                color={state.activeColor.hex}
                sport={state.sport}
                width={260}
                height={320}
                label={`${pattern.name} in ${state.activeColor.name}`}
                className="border border-border bg-background"
              />
              <span className="mt-2 text-[10px] font-black uppercase text-foreground/60">
                Procedural 3D texture preview
              </span>
            </div>

            <div className="space-y-4">
              <Badge>{pattern.tag}</Badge>
              <DialogTitle asChild>
                <Heading as="h3" className="text-3xl">
                  {pattern.name}
                </Heading>
              </DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase leading-relaxed text-foreground/70">
                {pattern.description}
              </DialogDescription>

              <div className="space-y-2 text-xs font-black uppercase">
                <div>
                  <div className="mb-1 flex justify-between">
                    <span>Sweat Resistance</span>
                    <span className="text-main">{pattern.sweatScore}%</span>
                  </div>
                  <Progress label="Sweat resistance" value={pattern.sweatScore} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between">
                    <span>Shock Absorption</span>
                    <span className="text-main">{pattern.shockScore}%</span>
                  </div>
                  <Progress
                    label="Shock absorption"
                    value={pattern.shockScore}
                    indicatorClassName="bg-inverse"
                  />
                </div>
              </div>

              <Button
                size="lg"
                className="w-full text-xs"
                onClick={() => {
                  dispatch({ type: "addPattern", patternId: pattern.id })
                  close()
                }}
              >
                ⚡ Add to Active Box
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
