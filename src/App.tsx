import React, { useState, useMemo, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { MOLECULES, MoleculeData } from './data/molecules'
import { MoleculeScene, DisplayMode } from './components/MoleculeScene'
import { AtomTooltip } from './components/AtomTooltip'

type ViewMode = 'single' | 'compare'

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('compare')

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [referenceIndex, setReferenceIndex] = useState(1)
  const [mode, setMode] = useState<DisplayMode>('ball-and-stick')
  const [searchText, setSearchText] = useState('')
  const [searchTarget, setSearchTarget] = useState<'left' | 'right' | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [hoveredAtom, setHoveredAtom] = useState<{
    element: string
    name: string
    charge?: string
    screenX: number
    screenY: number
  } | null>(null)

  const molecule: MoleculeData = MOLECULES[selectedIndex]
  const referenceMolecule: MoleculeData = MOLECULES[referenceIndex]

  const searchResults = useMemo(() => {
    if (!searchText.trim()) return []
    const q = searchText.toLowerCase()
    return MOLECULES.filter(
      m => m.name.toLowerCase().includes(q) || m.formula.toLowerCase().includes(q)
    )
  }, [searchText])

  const handleSelect = useCallback((idx: number) => {
    if (searchTarget === 'left') {
      setSelectedIndex(idx)
    } else if (searchTarget === 'right') {
      setReferenceIndex(idx)
    } else {
      setSelectedIndex(idx)
    }
    setSearchText('')
    setShowResults(false)
    setSearchTarget(null)
    setHoveredAtom(null)
  }, [searchTarget])

  const handleLeftSelect = useCallback((idx: number) => {
    setSelectedIndex(idx)
    setHoveredAtom(null)
  }, [])

  const handleRightSelect = useCallback((idx: number) => {
    setReferenceIndex(idx)
    setHoveredAtom(null)
  }, [])

  const handleAtomHover = useCallback((info: typeof hoveredAtom) => {
    setHoveredAtom(info)
  }, [])

  const openSearch = useCallback((target: 'left' | 'right') => {
    setSearchTarget(target)
    setSearchText('')
    setShowResults(true)
  }, [])

  const modeLabels: Record<DisplayMode, string> = {
    'ball-and-stick': '球棍模型',
    'space-filling': '空间填充',
    'wireframe': '线框骨架',
  }

  return (
    <div className="app-container">
      {viewMode === 'single' ? (
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
              viewKey="single"
            />
          </Canvas>
        </div>
      ) : (
        <>
          <div className="canvas-wrapper split-left">
            <div className="scene-label scene-label-left">
              <span className="scene-label-title">{molecule.name}</span>
              <span className="scene-label-formula">{molecule.formula}</span>
            </div>
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
                viewKey="left"
                autoRotate={false}
              />
            </Canvas>
          </div>
          <div className="split-divider" />
          <div className="canvas-wrapper split-right">
            <div className="scene-label scene-label-right">
              <span className="scene-label-title">{referenceMolecule.name}</span>
              <span className="scene-label-formula">{referenceMolecule.formula}</span>
            </div>
            <Canvas
              camera={{ position: [0, 0, 8], fov: 50 }}
              dpr={[1, 2]}
              gl={{ antialias: true }}
              onPointerMissed={() => setHoveredAtom(null)}
            >
              <MoleculeScene
                molecule={referenceMolecule}
                mode={mode}
                onAtomHover={handleAtomHover}
                viewKey="right"
                autoRotate={false}
              />
            </Canvas>
          </div>
        </>
      )}

      <div className="top-bar">
        <div className="view-mode-toggle">
          <button
            className={`view-mode-btn ${viewMode === 'compare' ? 'active' : ''}`}
            onClick={() => setViewMode('compare')}
          >
            双分子对照
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'single' ? 'active' : ''}`}
            onClick={() => setViewMode('single')}
          >
            单分子查看
          </button>
        </div>

        {viewMode === 'single' ? (
          <div className="search-box">
            <span className="search-icon">+</span>
            <input
              className="search-input"
              placeholder="搜索分子名称或化学式..."
              value={searchText}
              onChange={e => {
                setSearchText(e.target.value)
                setShowResults(true)
                setSearchTarget(null)
              }}
              onFocus={() => {
                setShowResults(true)
                setSearchTarget(null)
              }}
              onBlur={() => setTimeout(() => setShowResults(false), 180)}
            />
          </div>
        ) : (
          <div className="dual-search-boxes">
            <div className="search-box search-box-left">
              <span className="search-tag search-tag-left">左侧</span>
              <input
                className="search-input"
                placeholder={`当前: ${molecule.name} - 点击切换左侧分子`}
                value={searchTarget === 'left' ? searchText : ''}
                onChange={e => {
                  setSearchText(e.target.value)
                  setShowResults(true)
                }}
                onFocus={() => openSearch('left')}
                onBlur={() => setTimeout(() => {
                  setShowResults(false)
                  setSearchTarget(null)
                }, 180)}
              />
            </div>
            <div className="search-box search-box-right">
              <span className="search-tag search-tag-right">右侧</span>
              <input
                className="search-input"
                placeholder={`当前: ${referenceMolecule.name} - 点击切换右侧参照`}
                value={searchTarget === 'right' ? searchText : ''}
                onChange={e => {
                  setSearchText(e.target.value)
                  setShowResults(true)
                }}
                onFocus={() => openSearch('right')}
                onBlur={() => setTimeout(() => {
                  setShowResults(false)
                  setSearchTarget(null)
                }, 180)}
              />
            </div>
          </div>
        )}

        {showResults && searchResults.length > 0 && (
          <div className="search-results search-results-dual">
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

      {viewMode === 'compare' && (
        <>
          <div className="info-panel info-panel-left">
            <div className="panel-tag panel-tag-left">左侧分子</div>
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
            <div className="panel-divider" />
            <div className="panel-molecule-list">
              {MOLECULES.map((m, i) => (
                <button
                  key={i}
                  className={`panel-mol-btn ${i === selectedIndex ? 'active' : ''}`}
                  onClick={() => handleLeftSelect(i)}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <div className="info-panel info-panel-right">
            <div className="panel-tag panel-tag-right">右侧参照</div>
            <div className="panel-title">{referenceMolecule.name}</div>
            <div className="panel-formula">{referenceMolecule.formula}</div>
            <div className="panel-divider" />
            <div className="panel-row">
              <span className="panel-label">分子量</span>
              <span className="panel-value">{referenceMolecule.molecularWeight}</span>
            </div>
            <div className="panel-row">
              <span className="panel-label">原子数</span>
              <span className="panel-value">{referenceMolecule.atoms.length}</span>
            </div>
            <div className="panel-row">
              <span className="panel-label">化学键</span>
              <span className="panel-value">{referenceMolecule.bonds.length}</span>
            </div>
            <div className="panel-divider" />
            <div style={{ fontSize: 13, color: 'rgba(180,190,220,0.8)', lineHeight: 1.6 }}>
              {referenceMolecule.description}
            </div>
            <div className="panel-divider" />
            <div className="panel-molecule-list">
              {MOLECULES.map((m, i) => (
                <button
                  key={i}
                  className={`panel-mol-btn ${i === referenceIndex ? 'active' : ''}`}
                  onClick={() => handleRightSelect(i)}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {viewMode === 'single' && (
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
      )}

      {viewMode === 'single' && (
        <div className="quick-molecules">
          {MOLECULES.map((m, i) => (
            <button
              key={i}
              className={`quick-btn ${i === selectedIndex ? 'active' : ''}`}
              onClick={() => handleLeftSelect(i)}
            >
              {m.name} {m.formula}
            </button>
          ))}
        </div>
      )}

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
