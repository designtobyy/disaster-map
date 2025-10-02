import React, { useEffect, useState } from 'react'
import MapView from './components/MapView'
import ReportModal from './components/ReportModal'
import { supabase } from './supabaseClient'
import './index.css'

export default function App() {
  console.log('App mounted')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [user, setUser] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [heatmap, setHeatmap] = useState(false)

  useEffect(() => {
    let channel = null
    async function loadReports() {
      console.log('Loading reports from Supabase...')
      setLoading(true)
      try {
        const res = await supabase.from('reports').select('*').order('created_at', { ascending: false })
        console.log('fetch result:', res)
        const data = res.data ?? res
        const err = res.error ?? res
        if (err && err.message) {
          console.error('Error fetching reports:', err)
          setToast('Failed to load reports')
        } else {
          setReports(data ?? [])
          console.log('Reports loaded:', data?.length ?? 0)
        }
      } catch (err) {
        console.error('Unexpected error loading reports:', err)
        setToast('Unexpected error loading reports')
      } finally {
        setLoading(false)
      }

      // Realtime subscription with logging
      try {
        if (typeof supabase.channel === 'function') {
          channel = supabase
            .channel('public:reports')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'reports' },
              (payload) => {
                console.log('Realtime payload:', payload)
                const ev = payload.eventType ?? payload.event
                if (ev === 'INSERT') setReports((prev) => [payload.new, ...prev])
                if (ev === 'UPDATE') setReports((prev) => prev.map((r) => (r.id === payload.new.id ? payload.new : r)))
                if (ev === 'DELETE') setReports((prev) => prev.filter((r) => r.id !== payload.old.id))
              }
            )
            .subscribe()
          console.log('Subscribed to realtime channel:', channel)
        } else if (supabase.from) {
          // fallback older API
          const sub = supabase.from('reports').on('*', (payload) => {
            console.log('Legacy realtime payload:', payload)
            const rec = payload.new ?? payload.record
            if (payload.event === 'INSERT' || payload.eventType === 'INSERT') setReports((prev) => [rec, ...prev])
            if (payload.event === 'UPDATE' || payload.eventType === 'UPDATE') setReports((prev) => prev.map((r) => (r.id === rec.id ? rec : r)))
            if (payload.event === 'DELETE' || payload.eventType === 'DELETE') setReports((prev) => prev.filter((r) => r.id !== (payload.old?.id ?? payload.record?.id)))
          }).subscribe()
          channel = sub
          console.log('Subscribed (legacy) to realtime:', sub)
        }
        // read current auth session (if any)
        try {
          const sess = await supabase.auth.getSession()
          // supabase.auth.getSession() returns { data: { session } }
          const session = sess?.data?.session ?? sess?.session ?? null
          if (session?.user) {
            setUser(session.user)
            console.log('Auth session detected for user:', session.user.email ?? session.user.id)
          } else {
            console.log('No active auth session')
          }
        } catch (e) {
          console.warn('Failed to get auth session', e)
        }
      } catch (err) {
        console.warn('Realtime subscribe failed', err)
      }
    }

    loadReports()

    return () => {
      console.log('Cleaning up realtime subscription')
      try {
        if (channel?.unsubscribe) channel.unsubscribe()
        else if (channel) supabase.removeChannel?.(channel)
      } catch (e) {
        console.warn('Error cleaning channel', e)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Map click handler (MapView should call this)
  function handleMapClick(loc) {
    console.log('Map clicked at', loc)
    setSelectedLocation(loc)
    setIsModalOpen(true)
  }

  // called by ReportModal after successful submit
  function handleSubmitted(newReport) {
    console.log('Report submitted callback received:', newReport)
    if (newReport) setReports((r) => [newReport, ...r])
    showToast('Report submitted')
  }

  function showToast(msg) {
    console.log('Toast:', msg)
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // ensure FAB works
  function handleFabClick() {
    console.log('FAB clicked')
    setIsModalOpen(true)
  }

  // test helper: open modal with sample location so you can exercise the submit flow
  function openTestModal() {
    setSelectedLocation({ lat: 14.5995, lng: 120.9842 }) // Manila sample
    setIsModalOpen(true)
    console.log('Test modal opened with sample Manila location')
  }

  return (
    <div className="min-h-screen h-screen w-screen relative">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          type="button"
          className="px-3 py-2 rounded bg-white shadow text-sm"
          onClick={() => setHeatmap((s) => !s)}
        >
          {heatmap ? 'Show Markers' : 'Show Heatmap'}
        </button>
        <button
          type="button"
          className="px-3 py-2 rounded bg-yellow-100 shadow text-sm"
          onClick={openTestModal}
        >
          Open Test Modal
        </button>
      </div>

      <MapView reports={reports} onMapClick={handleMapClick} heatmap={heatmap} />

      <button
        type="button"
        className="fab"
        onClick={handleFabClick}
        aria-label="Report Disaster"
      >
        Report Disaster
      </button>

      {loading && (
        <div className="absolute top-4 left-4 z-50 bg-white/80 px-3 py-2 rounded shadow text-sm">
          Loading…
        </div>
      )}

      {toast && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-black text-white px-4 py-2 rounded">
          {toast}
        </div>
      )}

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