import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'

export default function ReportModal({ open, onClose, initialLocation, onSubmitted, user, showToast }) {
  const [type, setType] = useState('Flood')
  const [severity, setSeverity] = useState(3)
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState(initialLocation)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLocation(initialLocation)
  }, [initialLocation])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!location) return alert('Please select a location on the map')

    setSubmitting(true)

    const payload = {
      type,
      severity,
      description,
      latitude: location.lat,
      longitude: location.lng,
      reporter: user?.email || 'Guest',
    }

    const { data, error } = await supabase.from('reports').insert(payload).select().single()
    if (error) {
      console.error(error)
      alert('Failed to submit report: ' + error.message)
      setSubmitting(false)
      return
    }
    onSubmitted(data)
    onClose()
    setSubmitting(false)
    if (showToast) showToast('Report submitted')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white rounded-t-xl md:rounded-xl w-full md:w-1/3 p-4 z-50"
      >
        <h3 className="text-lg font-semibold mb-2">Report Disaster</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Type */}
          <label htmlFor="disaster-type" className="block">
            <div className="text-sm">Type</div>
            <select
              id="disaster-type"
              name="type"
              className="w-full border rounded p-2"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option>Typhoon</option>
              <option>Flood</option>
              <option>Earthquake</option>
              <option>Fire</option>
              <option>Landslide</option>
            </select>
          </label>

          {/* Severity */}
          <label htmlFor="severity" className="block">
            <div className="flex justify-between text-sm">
              <span>Severity</span>
              <span className="text-xs text-gray-500">{severity}</span>
            </div>
            <input
              id="severity"
              name="severity"
              type="range"
              min="1"
              max="5"
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
            />
          </label>

          {/* Description */}
          <label htmlFor="description" className="block">
            <div className="text-sm">Description</div>
            <textarea
              id="description"
              name="description"
              className="w-full border rounded p-2"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          {/* Location (read-only fields) */}
          <div>
            <div className="text-sm mb-1">Location</div>
            <div className="text-xs text-gray-600">Click on the map to set location</div>
            <div className="mt-2 text-sm">
              {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'No location selected'}
            </div>

            {/* Hidden inputs to ensure values are included in form submission if needed */}
            <input type="hidden" id="latitude" name="latitude" value={location?.lat ?? ''} readOnly />
            <input type="hidden" id="longitude" name="longitude" value={location?.lng ?? ''} readOnly />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
