import React from 'react'
import { motion } from 'framer-motion'

export default function Sidebar({ open, filters, setFilters }) {
  const types = ['Typhoon', 'Flood', 'Earthquake', 'Fire', 'Landslide']

  function toggleType(t) {
    setFilters((f) => ({ ...f, types: f.types.includes(t) ? f.types.filter(x => x !== t) : [...f.types, t] }))
  }

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: open ? 0 : -300 }}
        transition={{ type: 'spring' }}
        className="hidden md:block fixed top-0 left-0 z-40 h-full w-64 bg-white shadow p-4 overflow-auto"
      >
        <h4 className="font-semibold mb-2">Filters</h4>
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Disaster Types</div>
          {types.map(t => (
            <label key={t} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={filters.types.includes(t)} onChange={() => toggleType(t)} />
              <span>{t}</span>
            </label>
          ))}
        </div>

        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Severity (min)</div>
          <input type="range" min="1" max="5" value={filters.minSeverity || 1} onChange={(e) => setFilters((f) => ({ ...f, minSeverity: Number(e.target.value) }))} />
          <div className="text-xs text-gray-500">Showing severity ≥ {filters.minSeverity || 1}</div>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Time</div>
          <select className="w-full border rounded p-2" value={filters.time} onChange={(e) => setFilters((f) => ({ ...f, time: e.target.value }))}>
            <option value="24">Last 24 hours</option>
            <option value="168">Last 7 days</option>
            <option value="all">All</option>
          </select>
        </div>
      </motion.aside>

      {/* Mobile top drawer */}
      <motion.div
        initial={{ y: -200 }}
        animate={{ y: open ? 0 : -200 }}
        transition={{ type: 'spring' }}
        className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white p-3 shadow"
      >
        <div className="flex gap-2 items-center justify-between">
          <h4 className="font-semibold">Filters</h4>
          <div className="text-sm">Close</div>
        </div>
        <div className="mt-2">
          <div className="text-sm font-medium mb-2">Disaster Types</div>
          {types.map(t => (
            <label key={t} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={filters.types.includes(t)} onChange={() => toggleType(t)} />
              <span>{t}</span>
            </label>
          ))}
        </div>
        <div className="mt-2">
          <div className="text-sm font-medium mb-2">Severity (min)</div>
          <input type="range" min="1" max="5" value={filters.minSeverity || 1} onChange={(e) => setFilters((f) => ({ ...f, minSeverity: Number(e.target.value) }))} />
          <div className="text-xs text-gray-500">Showing severity ≥ {filters.minSeverity || 1}</div>
        </div>
      </motion.div>
    </>
  )
}
