import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Save, RotateCcw, Trash2, Grid3x3, Plus, GripVertical, Building2, Waves, Trees, Car, DoorOpen, Utensils, Sparkles, Dumbbell, Tent, Sun, Fence, Loader2, Ban } from 'lucide-react'
import api from '../../services/api'

const GRID_COLS = 10
const GRID_SIZE = 80

const ELEMENT_TYPES = {
  main_building: { label: 'Main Building', icon: Building2, defaultW: 3, defaultH: 2, color: '#3B82F6' },
  pool: { label: 'Pool', icon: Waves, defaultW: 3, defaultH: 2, color: '#06B6D4' },
  garden: { label: 'Garden', icon: Trees, defaultW: 3, defaultH: 2, color: '#22C55E' },
  parking: { label: 'Parking', icon: Car, defaultW: 3, defaultH: 2, color: '#6B7280' },
  entrance: { label: 'Entrance', icon: DoorOpen, defaultW: 1, defaultH: 1, color: '#F59E0B' },
  restaurant: { label: 'Restaurant', icon: Utensils, defaultW: 2, defaultH: 1, color: '#EF4444' },
  spa: { label: 'Spa', icon: Sparkles, defaultW: 2, defaultH: 1, color: '#EC4899' },
  gym: { label: 'Gym', icon: Dumbbell, defaultW: 2, defaultH: 1, color: '#8B5CF6' },
  cabanas: { label: 'Cabana', icon: Tent, defaultW: 2, defaultH: 1, color: '#F97316' },
  lounge: { label: 'Lounge Area', icon: Sun, defaultW: 2, defaultH: 1, color: '#14B8A6' },
  playground: { label: 'Playground', icon: Fence, defaultW: 2, defaultH: 2, color: '#84CC16' },
  terrace: { label: 'Terrace', icon: Grid3x3, defaultW: 3, defaultH: 1, color: '#A855F7' },
}

function getEmptyGrid() {
  return Array.from({ length: GRID_COLS }, () => null)
}

function detectCollisions(elements, newEl, excludeId) {
  return elements.some(el => {
    if (excludeId && el.id === excludeId) return false
    const overlapX = newEl.x < el.x + el.w && newEl.x + newEl.w > el.x
    const overlapY = newEl.y < el.y + el.h && newEl.y + newEl.h > el.y
    return overlapX && overlapY
  })
}

function getMaxY(elements) {
  if (elements.length === 0) return 0
  return Math.max(...elements.map(el => el.y + el.h))
}

export default function HotelLayoutBuilder() {
  const [elements, setElements] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [draggedType, setDraggedType] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const canvasRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ width: GRID_COLS * GRID_SIZE, height: 6 * GRID_SIZE })

  useEffect(() => {
    loadLayout()
  }, [])

  const loadLayout = async () => {
    try {
      const res = await api.get('hotel-layout')
      if (res.data?.elements?.length) {
        setElements(res.data.elements)
        recalcCanvas(res.data.elements)
      }
    } catch {
      // No saved layout yet
    } finally {
      setLoading(false)
    }
  }

  const saveLayout = async () => {
    setSaving(true)
    try {
      await api.post('hotel-layout', { elements })
    } catch {
      console.error('Failed to save layout')
    } finally {
      setSaving(false)
    }
  }

  const recalcCanvas = (els) => {
    const maxY = getMaxY(els || elements)
    const h = Math.max(maxY + 2, 6)
    setCanvasSize({ width: GRID_COLS * GRID_SIZE, height: h * GRID_SIZE })
  }

  const addElement = useCallback((type, x, y) => {
    const def = ELEMENT_TYPES[type]
    if (!def) return

    const newEl = {
      id: `${type}-${Date.now()}`,
      type,
      x: Math.max(0, Math.min(x, GRID_COLS - def.defaultW)),
      y: Math.max(0, y),
      w: def.defaultW,
      h: def.defaultH,
    }

    if (detectCollisions(elements, newEl)) return
    setElements(prev => {
      const next = [...prev, newEl]
      recalcCanvas(next)
      return next
    })
  }, [elements])

  const removeElement = useCallback((id) => {
    setElements(prev => {
      const next = prev.filter(el => el.id !== id)
      recalcCanvas(next)
      return next
    })
    setSelectedId(null)
  }, [])

  const moveElement = useCallback((id, newX, newY) => {
    setElements(prev => {
      const el = prev.find(e => e.id === id)
      if (!el) return prev
      const moved = { ...el, x: Math.max(0, Math.min(newX, GRID_COLS - el.w)), y: Math.max(0, newY) }
      if (detectCollisions(prev, moved, id)) return prev
      const next = prev.map(e => e.id === id ? moved : e)
      recalcCanvas(next)
      return next
    })
  }, [])

  const resetLayout = () => {
    if (window.confirm('Reset entire layout?')) {
      setElements([])
      recalcCanvas([])
    }
  }

  // Drag from palette
  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('text/plain', type)
    e.dataTransfer.effectAllowed = 'copy'
    setDraggedType(type)
  }

  const handleCanvasDragOver = (e) => {
    e.preventDefault()
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / GRID_SIZE)
    const y = Math.floor((e.clientY - rect.top) / GRID_SIZE)
    setDragOver({ x: Math.max(0, Math.min(x, GRID_COLS - 1)), y: Math.max(0, y) })
  }

  const handleCanvasDrop = (e) => {
    e.preventDefault()
    setDragOver(null)
    const type = e.dataTransfer.getData('text/plain') || draggedType
    if (!type || !ELEMENT_TYPES[type]) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / GRID_SIZE)
    const y = Math.floor((e.clientY - rect.top) / GRID_SIZE)
    addElement(type, x, y)
    setDraggedType(null)
  }

  // Drag within canvas
  const handleElementDragStart = (e, el) => {
    e.dataTransfer.setData('application/hotel-element', el.id)
    e.dataTransfer.effectAllowed = 'move'
    setSelectedId(el.id)
  }

  const handleElementDragOver = (e) => {
    e.preventDefault()
  }

  const handleElementDrop = (e) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('application/hotel-element')
    if (!id) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / GRID_SIZE)
    const y = Math.floor((e.clientY - rect.top) / GRID_SIZE)
    moveElement(id, x, y)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 flex items-center justify-between border-b border-slate-200 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <Building2 size={20} className="text-primary" />
          <div>
            <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Hotel Layout</h3>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Drag & drop to map your property</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing && (
            <>
              <button
                onClick={resetLayout}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition tracking-widest"
              >
                <RotateCcw size={14} /> Reset
              </button>
              <button
                onClick={saveLayout}
                disabled={saving}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-white px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 transition tracking-widest disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving...' : 'Save Layout'}
              </button>
            </>
          )}
          <button
            onClick={() => { setEditing(!editing); setSelectedId(null) }}
            className={`flex items-center gap-2 text-[10px] font-black uppercase px-4 py-1.5 rounded-lg transition tracking-widest ${editing ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <Plus size={14} /> {editing ? 'Done' : 'Edit Layout'}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Palette (edit mode only) */}
        {editing && (
          <div className="w-48 shrink-0 border-r border-slate-200 p-3 space-y-1 bg-slate-50/50">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Elements</p>
            {Object.entries(ELEMENT_TYPES).map(([key, def]) => {
              const Icon = def.icon
              return (
                <div
                  key={key}
                  draggable
                  onDragStart={(e) => handleDragStart(e, key)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-grab active:cursor-grabbing hover:border-primary hover:shadow-sm transition-all text-[10px] font-bold text-slate-700 uppercase tracking-wider"
                >
                  <div className="h-6 w-6 rounded flex items-center justify-center text-white" style={{ backgroundColor: def.color }}>
                    <Icon size={12} />
                  </div>
                  <span className="truncate">{def.label}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-6">
          <div
            ref={canvasRef}
            style={{ width: canvasSize.width, height: canvasSize.height, position: 'relative' }}
            onDragOver={editing ? handleCanvasDragOver : undefined}
            onDrop={editing ? handleCanvasDrop : undefined}
            className={`bg-slate-50/50 rounded-xl border-2 ${editing ? 'border-dashed border-primary/30' : 'border-slate-100'} relative transition-colors`}
          >
            {/* Grid lines */}
            {editing && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.15 }}>
                <defs>
                  <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                    <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="#94A3B8" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            )}

            {/* Placed elements */}
            {elements.map(el => {
              const def = ELEMENT_TYPES[el.type]
              const Icon = def?.icon || Grid3x3
              const isSelected = selectedId === el.id
              return (
                <div
                  key={el.id}
                  draggable={editing}
                  onDragStart={(e) => handleElementDragStart(e, el)}
                  onDragOver={handleElementDragOver}
                  onClick={() => setSelectedId(editing ? el.id : null)}
                  style={{
                    position: 'absolute',
                    left: el.x * GRID_SIZE,
                    top: el.y * GRID_SIZE,
                    width: el.w * GRID_SIZE - 8,
                    height: el.h * GRID_SIZE - 8,
                    backgroundColor: (def?.color || '#6B7280') + '18',
                    borderColor: isSelected ? def?.color || '#6B7280' : (def?.color || '#6B7280') + '40',
                    cursor: editing ? 'grab' : 'default',
                    zIndex: isSelected ? 10 : 1,
                  }}
                  className="m-1 rounded-xl border-2 transition-all hover:shadow-lg group"
                >
                  <div className="h-full w-full flex flex-col items-center justify-center gap-1 p-2">
                    <Icon size={el.w * el.h > 3 ? 28 : 20} className="shrink-0" style={{ color: def?.color || '#6B7280' }} />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider text-center leading-tight">{def?.label || el.type}</span>
                  </div>
                  {isSelected && editing && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeElement(el.id) }}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow-sm"
                    >
                      <Ban size={10} />
                    </button>
                  )}
                  {editing && (
                    <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-40 transition-opacity">
                      <GripVertical size={12} className="text-slate-400" />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Drop preview */}
            {editing && dragOver && draggedType && ELEMENT_TYPES[draggedType] && (
              <div
                style={{
                  position: 'absolute',
                  left: dragOver.x * GRID_SIZE,
                  top: dragOver.y * GRID_SIZE,
                  width: ELEMENT_TYPES[draggedType].defaultW * GRID_SIZE - 8,
                  height: ELEMENT_TYPES[draggedType].defaultH * GRID_SIZE - 8,
                  pointerEvents: 'none',
                  opacity: 0.3,
                }}
                className="m-1 rounded-xl border-2 border-primary bg-primary/10"
              />
            )}

            {/* Empty state */}
            {elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Building2 size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    {editing ? 'Drag elements from the palette' : 'No layout configured'}
                  </p>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="mt-3 text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      Start Building
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          {elements.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {Object.entries(ELEMENT_TYPES).filter(([key]) => elements.some(e => e.type === key)).map(([key, def]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded" style={{ backgroundColor: def.color }} />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{def.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
