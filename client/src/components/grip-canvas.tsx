import { useEffect, useRef } from "react"
import { drawGrip } from "@/lib/draw-grip"
import type { PatternId, SportId } from "@/types"

type GripCanvasProps = {
  pattern: PatternId
  color: string
  sport: SportId
  width: number
  height: number
  label: string
  className?: string
}

/** Procedural grip preview, rendered sharp on high-DPI screens. */
export function GripCanvas({
  pattern,
  color,
  sport,
  width,
  height,
  label,
  className,
}: GripCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const ratio = window.devicePixelRatio || 1
    canvas.width = width * ratio
    canvas.height = height * ratio
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    drawGrip(ctx, { pattern, color, sport, width, height })
  }, [pattern, color, sport, width, height])

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      style={{ width, height }}
      className={className}
    />
  )
}
