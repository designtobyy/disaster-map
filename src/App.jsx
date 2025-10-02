import React, { useEffect, useState } from 'react'
import MapView from './components/MapView'
import ReportModal from './components/ReportModal'
import { supabase } from './supabaseClient'
import './index.css'

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [heatmap, setHeatmap] = useState(false)

  useEffect(() => {
    let channel = null
    async function loadReports() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) {
          console.error('Error fetching reports', error)
          setToast('Failed to load reports')
        } else {
          setReports(data ?? [])
        }
      } catch (err) {
        console.error(err)
        setToast('Unexpected error loading reports')
      } finally {
        setLoading(false)
      }

      // realtime subscription (supports Supabase JS v2 channel API; fallback may vary)
      try {
        if (typeof supabase.channel === 'function') {
          channel = supabase
            .channel('public:reports')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'reports' },
              (payload) => {
                const ev = payload.eventType ?? payload.event
                if (ev === 'INSERT') {
                  setReports((prev) => [payload.new, ...prev])
                } else if (ev === 'UPDATE') {
                  setReports((prev) =>
                    prev.map((r) => (r.id === payload.new.id ? payload.new : r))
                  )
                } else if (ev === 'DELETE') {
                  setReports((prev) => prev.filter((r) => r.id !== payload.old.id))
                }
              }
            )
            .subscribe()
        } else if (supabase.from) {
          // older client fallback
          const sub = supabase
            .from('reports')
            .on('*', (payload) => {
              if (payload.eventType === 'INSERT' || payload.event === 'INSERT') {
                setReports((prev) => [payload.new ?? payload.record, ...prev])
              } else if (payload.eventType === 'UPDATE' || payload.event === 'UPDATE') {
                setReports((prev) =>
                  prev.map((r) =>
                    r.id === (payload.new?.id ?? payload.record?.id) ? (payload.new ?? payload.record) : r
                  )
                )
              } else if (payload.eventType === 'DELETE' || payload.event === 'DELETE') {
                setReports((prev) => prev.filter((r) => r.id !== (payload.old?.id ?? payload.record?.id)))
              }
            })
            .subscribe()
          channel = sub
        }
      } catch (err) {
        console.warn('Realtime subscribe failed', err)
      }
    }

    loadReports()

    return () => {
      // cleanup realtime subscription
      try {
        if (channel?.unsubscribe) channel.unsubscribe()
        else if (channel) supabase.removeChannel?.(channel)
      } catch (e) {
        // ignore
      }
    }
  }, [])

  // map click handler
  function handleMapClick(loc) {
    setSelectedLocation(loc)
    setIsModalOpen(true)
  }

  // called by ReportModal after successful submit
  function handleSubmitted(newReport) {
    if (newReport) setReports((r) => [newReport, ...r])
    showToast('Report submitted')
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // debug FAB click (keeps UX if map overlay still catches clicks)
  function handleFabClick() {
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen h-screen w-screen relative">
      {/* Top controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          type="button"
          className="px-3 py-2 rounded bg-white shadow text-sm"
          onClick={() => setHeatmap((s) => !s)}
        >
          {heatmap ? 'Show Markers' : 'Show Heatmap'}
        </button>
      </div>

      {/* Map */}
      <MapView
        reports={reports}
        onMapClick={handleMapClick}
        heatmap={heatmap}
      />

      {/* Floating Action Button */}
      <button
        type="button"
        className="fab"
        onClick={handleFabClick}
        aria-label="Report Disaster"
      >
        Report Disaster
      </button>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 left-4 z-50 bg-white/80 px-3 py-2 rounded shadow text-sm">
          Loading…
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-black text-white px-4 py-2 rounded">
          {toast}
        </div>
      )}

      {/* Report modal */}
      <ReportModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialLocation={selectedLocation}
        onSubmitted={handleSubmitted}
        user={null}
        showToast={showToast}
      />
    </div>
  )
}