import type { PatternId, SportId } from "@/types"
import { isLightColor } from "@/lib/utils"

type DrawGripOptions = {
  pattern: PatternId
  color: string
  sport: SportId
  width: number
  height: number
}

function themeColor(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** Draws a procedural grip handle. Coordinates are in CSS pixels. */
export function drawGrip(
  ctx: CanvasRenderingContext2D,
  { pattern, color, sport, width, height }: DrawGripOptions
) {
  const borderColor = themeColor("--border")
  const accentColor = themeColor("--main")

  ctx.clearRect(0, 0, width, height)

  let handleWidth = width * 0.45
  let handleTopY = height * 0.1
  let handleHeight = height * 0.8

  if (sport === "pickleball") {
    handleWidth = width * 0.55
    handleTopY = height * 0.18
    handleHeight = height * 0.68
  } else if (sport === "badminton") {
    handleWidth = width * 0.35
    handleTopY = height * 0.08
    handleHeight = height * 0.84
  }
  const handleTopX = (width - handleWidth) / 2

  // Handle outline: octagonal taper for cricket/tennis, oval flange otherwise
  ctx.save()
  ctx.beginPath()
  if (sport === "cricket" || sport === "tennis") {
    const inset = handleWidth * 0.15
    ctx.moveTo(handleTopX + inset, handleTopY)
    ctx.lineTo(handleTopX + handleWidth - inset, handleTopY)
    ctx.lineTo(handleTopX + handleWidth, handleTopY + inset)
    ctx.lineTo(handleTopX + handleWidth * 0.95, handleTopY + handleHeight)
    ctx.lineTo(handleTopX + handleWidth * 0.05, handleTopY + handleHeight)
    ctx.lineTo(handleTopX, handleTopY + inset)
  } else {
    ctx.moveTo(handleTopX + 10, handleTopY)
    ctx.quadraticCurveTo(
      handleTopX + handleWidth / 2,
      handleTopY - 5,
      handleTopX + handleWidth - 10,
      handleTopY
    )
    ctx.lineTo(handleTopX + handleWidth + 4, handleTopY + handleHeight - 15)
    ctx.quadraticCurveTo(
      handleTopX + handleWidth / 2,
      handleTopY + handleHeight + 10,
      handleTopX - 4,
      handleTopY + handleHeight - 15
    )
  }
  ctx.closePath()
  ctx.clip()

  // Base fill with cylindrical shading
  ctx.fillStyle = color
  ctx.fillRect(0, 0, width, height)
  const shading = ctx.createLinearGradient(0, 0, width, 0)
  shading.addColorStop(0, "rgba(0,0,0,0.4)")
  shading.addColorStop(0.2, "rgba(255,255,255,0.25)")
  shading.addColorStop(0.5, "rgba(255,255,255,0)")
  shading.addColorStop(0.8, "rgba(0,0,0,0.2)")
  shading.addColorStop(1, "rgba(0,0,0,0.6)")
  ctx.fillStyle = shading
  ctx.fillRect(0, 0, width, height)

  // Texture pattern
  const light = isLightColor(color)
  ctx.strokeStyle = light ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)"
  ctx.fillStyle = light ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.4)"
  ctx.lineWidth = 2

  const stepY = 16
  for (let y = handleTopY - 20; y < handleTopY + handleHeight + 20; y += stepY) {
    switch (pattern) {
      case "chevron":
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width / 2, y + 10)
        ctx.lineTo(width, y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, y + 8)
        ctx.lineTo(width / 2, y + 18)
        ctx.lineTo(width, y + 8)
        ctx.stroke()
        break

      case "ripple":
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.bezierCurveTo(width * 0.25, y - 8, width * 0.75, y + 8, width, y)
        ctx.stroke()
        break

      case "coil":
        ctx.beginPath()
        ctx.moveTo(-10, y)
        ctx.lineTo(width + 10, y + 24)
        ctx.stroke()
        ctx.fillStyle = "rgba(0,0,0,0.15)"
        ctx.fillRect(0, y + 12, width, 4)
        break

      case "ring":
        ctx.fillRect(0, y, width, 5)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
        break

      case "octopus":
        for (let x = 15; x < width; x += 22) {
          ctx.beginPath()
          ctx.arc(x, y + (x % 2 === 0 ? 0 : 6), 5, 0, Math.PI * 2)
          ctx.stroke()
          ctx.fill()
        }
        break

      case "lattice":
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y + 20)
        ctx.moveTo(width, y)
        ctx.lineTo(0, y + 20)
        ctx.stroke()
        break

      case "hex":
        for (let x = 10; x < width; x += 24) {
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + 8, y - 4)
          ctx.lineTo(x + 16, y)
          ctx.lineTo(x + 16, y + 8)
          ctx.lineTo(x + 8, y + 12)
          ctx.lineTo(x, y + 8)
          ctx.closePath()
          ctx.stroke()
        }
        break
    }
  }
  ctx.restore()

  // Finishing tape on top of the handle
  ctx.fillStyle = borderColor
  ctx.fillRect(handleTopX - 2, handleTopY - 4, handleWidth + 4, 12)
  ctx.fillStyle = accentColor
  ctx.fillRect(handleTopX - 2, handleTopY + 2, handleWidth + 4, 3)

  // Frame
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, width, height)
}
