import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

export default function HeatmapLayer({ reports }) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    const points = reports.map(r => [r.latitude, r.longitude, Number(r.severity) || 1])

    const heatLayer = L.heatLayer(points, { radius: 25, blur: 15, maxZoom: 17 })
    heatLayer.addTo(map)

    return () => {
      heatLayer.remove()
    }
  }, [map, reports])

  return null
}
