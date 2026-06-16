import React, { useState, useMemo, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { MOLECULES, MoleculeData } from './data/molecules'
import { MoleculeScene, DisplayMode } from './components/MoleculeScene'
import { AtomTooltip } from './components/AtomTooltip'

export function App() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mode, setMode] = useState<DisplayMode>('ball-and-stick')
  const [searchText, setSearchText] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [hoveredAtom, setHoveredAtom] = useState<{
    element: string
    name: string
    charge?: string
    screenX: number
    screenY: number
  } | null>(null)

  const molecule: MoleculeData = MOLECULES[selectedIndex]

  const searchResults = useMemo(() => {
    if (!searchText.trim()) return []
    const q = searchText.toLowerCase()
    return MOLECULES.filter(
      m => m.name.toLowerCase().includes(q) || m.formula.toLowerCase().includes(q)
    )
  }, [searchText])

  const handleSelect = useCallback((idx: number) => {
    setSelectedIndex(idx)
    setSearchText('')
    setShowResults(false)
    setHoveredAtom(null)
  }, [])

  const handleAtomHover = useCallback((info: typeof hoveredAtom) => {
    setHoveredAtom(info)
  }, [])

  const modeLabels: Record<DisplayMode, string> = {
    'ball-and-stick': '球棍模型',
    'space-filling': '空间填充',
    'wireframe': '线框骨架',
  }

  return (
    <div className="app-container">
      <div className="canvas-wrapper">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
          onPointerMissed={() => setHoveredAtom(null)}
        >
          <MoleculeScene
            molecule={molecule}
            mode={mode}
            onAtomHover={handleAtomHover}
          />
        </Canvas>
      </div>

      <div className="top-bar">
        <div className="search-box">
          <span className="search-icon">+</span>
          <input
            className="search-input"
            placeholder="搜索分子名称或化学式..."
            value={searchText}
            onChange={e => {
              setSearchText(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 180)}
          />
        </div>
        {showResults && searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map(m => {
              const idx = MOLECULES.indexOf(m)
              return (
                <div
                  key={idx}
                  className="search-result-item"
                  onMouseDown={() => handleSelect(idx)}
                >
                  <span className="result-name">{m.name}</span>
                  <span className="result-formula">{m.formula}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="info-panel">
        <div className="panel-title">{molecule.name}</div>
        <div className="panel-formula">{molecule.formula}</div>
        <div className="panel-divider" />
        <div className="panel-row">
          <span className="panel-label">分子量</span>
          <span className="panel-value">{molecule.molecularWeight}</span>
        </div>
        <div className="panel-row">
          <span className="panel-label">原子数</span>
          <span className="panel-value">{molecule.atoms.length}</span>
        </div>
        <div className="panel-row">
          <span className="panel-label">化学键</span>
          <span className="panel-value">{molecule.bonds.length}</span>
        </div>
        <div className="panel-divider" />
        <div style={{ fontSize: 13, color: 'rgba(180,190,220,0.8)', lineHeight: 1.6 }}>
          {molecule.description}
        </div>
      </div>

      <div className="quick-molecules">
        {MOLECULES.map((m, i) => (
          <button
            key={i}
            className={`quick-btn ${i === selectedIndex ? 'active' : ''}`}
            onClick={() => handleSelect(i)}
          >
            {m.name} {m.formula}
          </button>
        ))}
      </div>

      <div className="mode-toggle">
        {(Object.keys(modeLabels) as DisplayMode[]).map(m => (
          <button
            key={m}
            className={`mode-btn ${mode === m ? 'active' : ''}`}
            onClick={() => setMode(m)}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>

      {hoveredAtom && (
        <AtomTooltip
          element={hoveredAtom.element}
          name={hoveredAtom.name}
          x={hoveredAtom.screenX}
          y={hoveredAtom.screenY}
          charge={hoveredAtom.charge}
        />
      )}
    </div>
  )
}

export default App
