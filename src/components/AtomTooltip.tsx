import React from 'react'
import { ELEMENT_NAMES } from '../data/molecules'

interface AtomTooltipProps {
  element: string
  name: string
  x: number
  y: number
  charge?: string
}

export const AtomTooltip: React.FC<AtomTooltipProps> = ({ element, name, x, y, charge }) => {
  const cnName = ELEMENT_NAMES[element] || name
  return (
    <div className="atom-tooltip" style={{ left: x, top: y - 12 }}>
      <div className="tooltip-element">{element}</div>
      <div className="tooltip-detail">{cnName}</div>
      {charge && <div className="tooltip-charge">{charge}</div>}
    </div>
  )
}
