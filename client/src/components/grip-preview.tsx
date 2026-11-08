import { useState, type ComponentProps, type PointerEvent } from "react"
import { cn } from "@/lib/utils"
import { GripCanvas } from "./grip-canvas"

type GripPreviewProps = ComponentProps<typeof GripCanvas> & {
  /** Product photo; the procedural canvas is drawn when missing or broken */
  imageUrl?: string
  /** Enlarges the photo inside the same footprint, cropping its edges (1 = none) */
  zoom?: number
  /** Zoom while the pointer hovers the photo, centred on the pointer */
  hoverZoom?: number
}

export function GripPreview({ imageUrl, zoom = 1, hoverZoom, ...canvasProps }: GripPreviewProps) {
  const [failedUrl, setFailedUrl] = useState<string>()
  // Pointer position over the photo, in percent; null when not hovering
  const [focus, setFocus] = useState<{ x: number; y: number } | null>(null)
  const { width, height, label, className } = canvasProps

  if (!imageUrl || failedUrl === imageUrl) {
    return <GripCanvas {...canvasProps} />
  }

  const trackPointer = (event: PointerEvent<HTMLDivElement>) => {
    // Touch has no hover; a tap shouldn't leave the photo zoomed
    if (!hoverZoom || event.pointerType !== "mouse") return
    const box = event.currentTarget.getBoundingClientRect()
    setFocus({
      x: ((event.clientX - box.left) / box.width) * 100,
      y: ((event.clientY - box.top) / box.height) * 100,
    })
  }

  const scale = focus && hoverZoom ? hoverZoom : zoom

  return (
    <div
      // Same footprint as the canvas, shrinking with its container
      style={{ width, maxWidth: "100%", aspectRatio: `${width} / ${height}` }}
      className={cn("overflow-hidden", hoverZoom && "cursor-zoom-in", className)}
      onPointerMove={trackPointer}
      onPointerLeave={() => setFocus(null)}
    >
      <img
        src={imageUrl}
        alt={label}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onError={() => setFailedUrl(imageUrl)}
        style={
          scale === 1
            ? undefined
            : {
                transform: `scale(${scale})`,
                transformOrigin: focus ? `${focus.x}% ${focus.y}%` : undefined,
              }
        }
        className="size-full object-contain transition-transform duration-150 ease-out"
      />
    </div>
  )
}
