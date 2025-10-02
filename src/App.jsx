import React, { useState } from 'react'
import MapView from './components/MapView'
import ReportModal from './components/ReportModal'
import { supabase } from './supabaseClient'
import './index.css'

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [reports, setReports] = useState([])

  // simple map click handler (MapView should call onMapClick with {lat,lng})
  function handleMapClick(loc) {
    setSelectedLocation(loc)
    console.log('map clicked, location set:', loc)
  }

  // called after successful submit from ReportModal
  function handleSubmitted(newReport) {
    setReports((r) => [newReport, ...r])
  }

  // debug toggle to verify click fires
  function handleFabClick() {
    console.log('FAB clicked')
    // quick visual confirmation
    // eslint-disable-next-line no-alert
    alert('FAB clicked — opening modal')
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen h-screen w-screen relative">
      {/* Map fills the screen */}
      <MapView
        reports={reports}
        onMapClick={handleMapClick}
        heatmap={false}
      />

      {/* Floating Action Button (must be sibling of MapView) */}
      <button
        type="button"
        className="fab"
        onClick={handleFabClick}
        aria-label="Report Disaster"
      >
        Report Disaster
      </button>

      {/* Report modal */}
      <ReportModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialLocation={selectedLocation}
        onSubmitted={handleSubmitted}
        user={supabase.auth?.user?.() ?? null}
        showToast={(msg) => console.log('toast:', msg)}
      />
    </div>
  )
}
