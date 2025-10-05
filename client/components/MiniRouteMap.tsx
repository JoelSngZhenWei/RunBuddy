// components/MiniRouteMap.tsx
"use client"

type MiniRouteMapProps = {
  polyline: string
  width?: number
  height?: number
  padding?: number
}

/** Minimal Google-style polyline decoder (no deps) */
function decodePolyline(str: string): [number, number][] {
  let index = 0, lat = 0, lng = 0
  const coordinates: [number, number][] = []

  while (index < str.length) {
    let b, shift = 0, result = 0
    do {
      b = str.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1)
    lat += dlat

    shift = 0
    result = 0
    do {
      b = str.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1)
    lng += dlng

    coordinates.push([lat * 1e-5, lng * 1e-5])
  }
  return coordinates
}

export default function MiniRouteMap({
  polyline,
  width = 100,
  height = 100,
  padding = 5,
}: MiniRouteMapProps) {
  if (!polyline) return null
  const pts = decodePolyline(polyline)
  if (pts.length < 2) return null

  // Bounds
  let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity
  for (const [lat, lng] of pts) {
    if (lat < minLat) minLat = lat
    if (lng < minLng) minLng = lng
    if (lat > maxLat) maxLat = lat
    if (lng > maxLng) maxLng = lng
  }

  const w = width - padding * 2
  const h = height - padding * 2
  const spanLng = Math.max(1e-9, maxLng - minLng)
  const spanLat = Math.max(1e-9, maxLat - minLat)
  const sx = w / spanLng
  const sy = h / spanLat
  const s = Math.min(sx, sy) // preserve aspect
  const offX = (width - s * spanLng) / 2
  const offY = (height - s * spanLat) / 2

  // Convert lat/lng -> x/y (invert Y for SVG)
  const toXY = ([lat, lng]: [number, number]) => {
    const x = offX + (lng - minLng) * s
    const y = offY + (maxLat - lat) * s
    return [x, y]
  }

  const d = pts
    .map(toXY)
    .map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`))
    .join(" ")

  return (
    <svg width={width} height={height} className="text-strava">
      {/* Path */}
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2} />
    </svg>
  )
}
