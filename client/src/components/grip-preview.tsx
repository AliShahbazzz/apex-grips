import { useState, type ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { GripCanvas } from "./grip-canvas"

type GripPreviewProps = ComponentProps<typeof GripCanvas> & {
  /** Product photo; the procedural canvas is drawn when missing or broken */
  imageUrl?: string
}

export function GripPreview({ imageUrl, ...canvasProps }: GripPreviewProps) {
  const [failedUrl, setFailedUrl] = useState<string>()
  const { width, height, label, className } = canvasProps

  if (!imageUrl || failedUrl === imageUrl) {
    return <GripCanvas {...canvasProps} />
  }

  return (
    <img
      src={imageUrl}
      alt={label}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => setFailedUrl(imageUrl)}
      // Same footprint as the canvas, shrinking with its container
      style={{ width, maxWidth: "100%", height: "auto", aspectRatio: `${width} / ${height}` }}
      className={cn("object-contain", className)}
    />
  )
}
