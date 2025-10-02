import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../supabaseClient'
import { IconMapPin } from 'lucide-react'
import HeatmapLayer from './HeatmapLayer'

// Fix default icon paths
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function LocationSelector({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng)
    },
  })
  return null
}

export default function MapView({ reports, onMapClick, heatmap }) {
  const center = [12.8797, 121.7740]

  return (
    <MapContainer center={center} zoom={6} className="h-screen w-screen" scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationSelector onSelect={onMapClick} />

      {heatmap ? (
        <HeatmapLayer reports={reports} />
      ) : (
        reports.map((r) => (
          <Marker key={r.id} position={[r.latitude, r.longitude]}>
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-center gap-2">
                  <IconMapPin className="h-5 w-5 text-red-600" />
                  <strong>{r.type}</strong>
                </div>
                <div>Severity: {r.severity}</div>
                <div className="text-sm mt-2">{r.description}</div>
                <div className="text-xs text-gray-500 mt-2">{new Date(r.created_at).toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Reported by {r.reporter || 'Guest'}</div>
              </div>
            </Popup>
          </Marker>
        ))
      )}
    </MapContainer>
  )
}
