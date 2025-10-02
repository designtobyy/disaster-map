import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { supabase } from '../supabaseClient'

export default function ReportModal({ open, onClose, initialLocation, onSubmitted, user, showToast }) {
  const [type, setType] = useState('Flood')
  const [severity, setSeverity] = useState(3)
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState(initialLocation ?? { lat: '', lng: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Sync location when user clicks on the map
  useEffect(() => {
    if (initialLocation) setLocation(initialLocation)
  }, [initialLocation])

  // Reset modal when closed
  useEffect(() => {
    if (!open) {
      setType('Flood')
      setSeverity(3)
      setDescription('')
      setLocation(initialLocation ?? { lat: '', lng: '' })
      setError(null)
      setSubmitting(false)
    }
  }, [open, initialLocation])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload = {
      type,
      severity,
      description,
      latitude: Number(location.lat),
      longitude: Number(location.lng),
      reporter: user?.email || 'Guest',
    }

    try {
      const { data, error: insertErr } = await supabase.from('reports').insert([payload]).select()
      if (insertErr) {
        setError(insertErr.message || 'Failed to submit report')
        showToast?.('Failed to submit report')
      } else {
        const created = Array.isArray(data) ? data[0] : data
        showToast?.('Report submitted')
        onSubmitted?.(created)
        onClose?.()
      }
    } catch (err) {
      setError(err.message || 'Unexpected error')
      showToast?.('Unexpected error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const modal = (
    <div
      className="fixed inset-0 z-[99999] flex items-end md:items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        data-testid="modal-backdrop"
      />

      {/* modal form */}
      <form
        className="relative bg-white rounded-t-xl md:rounded-xl w-full md:w-1/3 p-4 z-50"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Report Disaster</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Type */}
          <div>
            <label htmlFor="disaster-type" className="block text-sm font-medium text-gray-700">Disaster Type</label>
            <select
              id="disaster-type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 p-2"
            >
              <option>Typhoon</option>
              <option>Flood</option>
              <option>Earthquake</option>
              <option>Fire</option>
              <option>Landslide</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700">Severity: {severity}</label>
            <input
              id="severity"
              name="severity"
              type="range"
              min="1"
              max="5"
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 p-2"
              placeholder="Short description of the situation"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <input
                id="location-lat"
                name="latitude"
                type="text"
                value={location.lat ?? ''}
                onChange={(e) => setLocation((l) => ({ ...l, lat: e.target.value }))}
                className="rounded border-gray-300 p-2"
                placeholder="Latitude (click map to set)"
                required
              />
              <input
                id="location-lng"
                name="longitude"
                type="text"
                value={location.lng ?? ''}
                onChange={(e) => setLocation((l) => ({ ...l, lng: e.target.value }))}
                className="rounded border-gray-300 p-2"
                placeholder="Longitude (click map to set)"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tip: click on the map to pick a location (the app will set these fields if you clicked the map first).
            </p>
          </div>

          {/* Error */}
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        {/* Footer buttons */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-100 text-gray-800"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  )

  return (typeof document !== 'undefined') ? ReactDOM.createPortal(modal, document.body) : modal
}
