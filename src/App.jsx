import React, { useEffect, useState } from 'react'
import MapView from './components/MapView'
import ReportModal from './components/ReportModal'
import Sidebar from './components/Sidebar'
import { supabase } from './supabaseClient'
import './index.css'

// simple toast
function Toast({ message }) {
  if (!message) return null
  return (
    <div className="fixed top-6 right-6 bg-black text-white px-4 py-2 rounded z-50">{message}</div>
  )
}

function App() {
  const [reports, setReports] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filters, setFilters] = useState({ types: ['Typhoon','Flood','Earthquake','Fire','Landslide'], time: 'all', minSeverity: 1 })
  const [user, setUser] = useState(null)
  const [heatmap, setHeatmap] = useState(false)
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // auth: sign in anonymously if no session
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        supabase.auth.signInWithOtp({}) // noop placeholder; anonymous handled by RLS on server; we can just use clientless
      }
    }).catch(() => {})

  fetchReports()

    const channel = supabase.channel('public:reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, payload => {
        if (payload.eventType === 'INSERT') {
          setReports((r) => [payload.new, ...r])
        } else if (payload.eventType === 'UPDATE') {
          setReports((r) => r.map(item => item.id === payload.new.id ? payload.new : item))
        } else if (payload.eventType === 'DELETE') {
          setReports((r) => r.filter(item => item.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchReports() {
    let query = supabase.from('reports').select('*').order('created_at', { ascending: false })

    const { data, error } = await query
    if (error) {
      console.error(error)
      setLoading(false)
      return
    }
    setReports(data || [])
    setLoading(false)
  }

  function handleMapClick(latlng) {
    setSelectedLocation(latlng)
    setModalOpen(true)
  }

  function handleSubmitted(newReport) {
    setReports((s) => [newReport, ...s])
    setToast('Report submitted')
    setTimeout(() => setToast(''), 3000)
  }

  // filtering
  const filtered = reports
    .filter(r => filters.types.includes(r.type))
    .filter(r => Number(r.severity) >= (filters.minSeverity || 1))
    .filter(r => {
      if (filters.time === 'all') return true
      const hours = Number(filters.time)
      const cutoff = Date.now() - hours * 60 * 60 * 1000
      return new Date(r.created_at).getTime() >= cutoff
    })

  return (
    <div className="relative h-screen w-screen">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <button className="bg-white p-2 rounded shadow" onClick={() => setSidebarOpen(s => !s)}>Filters</button>
      </div>

      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button className="bg-white p-2 rounded shadow" onClick={() => setHeatmap(h => !h)}>{heatmap ? 'Markers' : 'Heatmap'}</button>
      </div>

      <MapView reports={filtered} onMapClick={handleMapClick} heatmap={heatmap} />

      <button className="fab" onClick={() => setModalOpen(true)}>Report Disaster</button>

      <ReportModal open={modalOpen} onClose={() => setModalOpen(false)} initialLocation={selectedLocation} onSubmitted={handleSubmitted} user={user} showToast={(m) => { setToast(m); setTimeout(() => setToast(''), 3000) }} />

      <Sidebar open={sidebarOpen} filters={filters} setFilters={setFilters} />

      <Toast message={toast} />
    </div>
  )
}

export default App
