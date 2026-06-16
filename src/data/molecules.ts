export interface AtomData {
  element: string
  position: [number, number, number]
  color: string
  radius: number
  charge?: string
  name: string
}

export interface BondData {
  from: number
  to: number
  order: number
}

export interface MoleculeData {
  name: string
  formula: string
  atoms: AtomData[]
  bonds: BondData[]
  molecularWeight: number
  description: string
}

export const ELEMENT_COLORS: Record<string, string> = {
  H: '#ffffff',
  C: '#333333',
  N: '#3050f8',
  O: '#ff0d0d',
  F: '#90e050',
  Cl: '#1ff01f',
  Br: '#a62929',
  I: '#940094',
  S: '#ffff30',
  P: '#ff8000',
}

export const ELEMENT_RADII: Record<string, number> = {
  H: 0.25,
  C: 0.4,
  N: 0.38,
  O: 0.36,
  F: 0.34,
  Cl: 0.45,
  Br: 0.48,
  I: 0.52,
  S: 0.5,
  P: 0.44,
}

export const ELEMENT_NAMES: Record<string, string> = {
  H: '氢',
  C: '碳',
  N: '氮',
  O: '氧',
  F: '氟',
  Cl: '氯',
  Br: '溴',
  I: '碘',
  S: '硫',
  P: '磷',
}

// 键长常数（埃）
const BOND_LENGTH: Record<string, number> = {
  'C-H': 1.09,
  'C-C': 1.54,
  'C=C': 1.34,
  'C#C': 1.20,
  'C-N': 1.47,
  'C=N': 1.29,
  'C-O': 1.43,
  'C=O': 1.23,
  'O-H': 0.96,
  'N-H': 1.01,
  'H-H': 0.74,
  'O=O': 1.21,
  'N-N': 1.45,
  'N=N': 1.25,
  'N#N': 1.10,
}

function makeWater(): MoleculeData {
  // H2O - 键角 104.5°
  const d = 0.96
  const angle = (104.5 * Math.PI) / 180
  return {
    name: '水',
    formula: 'H₂O',
    molecularWeight: 18.015,
    description: '最常见的化合物，生命之源',
    atoms: [
      { element: 'O', position: [0, 0, 0], color: ELEMENT_COLORS.O, radius: ELEMENT_RADII.O, name: '氧' },
      { element: 'H', position: [-d * Math.sin(angle / 2), d * Math.cos(angle / 2), 0], color: ELEMENT_COLORS.H, radius: ELEMENT_RADII.H, name: '氢' },
      { element: 'H', position: [d * Math.sin(angle / 2), d * Math.cos(angle / 2), 0], color: ELEMENT_COLORS.H, radius: ELEMENT_RADII.H, name: '氢' },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
    ],
  }
}

function makeCO2(): MoleculeData {
  // CO2 - 直线型
  const d = 1.16
  return {
    name: '二氧化碳',
    formula: 'CO₂',
    molecularWeight: 44.01,
    description: '温室气体，植物光合作用原料',
    atoms: [
      { element: 'C', position: [0, 0, 0], color: ELEMENT_COLORS.C, radius: ELEMENT_RADII.C, name: '碳' },
      { element: 'O', position: [-d, 0, 0], color: ELEMENT_COLORS.O, radius: ELEMENT_RADII.O, name: '氧' },
      { element: 'O', position: [d, 0, 0], color: ELEMENT_COLORS.O, radius: ELEMENT_RADII.O, name: '氧' },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 0, to: 2, order: 2 },
    ],
  }
}

function makeCH4(): MoleculeData {
  // CH4 - 正四面体
  const d = 1.09
  const a = d * Math.sqrt(2 / 3)
  const b = d / Math.sqrt(3)
  return {
    name: '甲烷',
    formula: 'CH₄',
    molecularWeight: 16.04,
    description: '天然气主要成分，最简单的有机物',
    atoms: [
      { element: 'C', position: [0, 0, 0], color: ELEMENT_COLORS.C, radius: ELEMENT_RADII.C, name: '碳' },
      { element: 'H', position: [a, a, a], color: ELEMENT_COLORS.H, radius: ELEMENT_RADII.H, name: '氢' },
      { element: 'H', position: [-a, -a, a], color: ELEMENT_COLORS.H, radius: ELEMENT_RADII.H, name: '氢' },
      { element: 'H', position: [-a, a, -a], color: ELEMENT_COLORS.H, radius: ELEMENT_RADII.H, name: '氢' },
      { element: 'H', position: [a, -a, -a], color: ELEMENT_COLORS.H, radius: ELEMENT_RADII.H, name: '氢' },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
    ],
  }
}

function makeEthanol(): MoleculeData {
  // C2H5OH - 乙醇
  const cc = 1.54
  const co = 1.43
  const ch = 1.09
  const oh = 0.96
  const tetAngle = (109.5 * Math.PI) / 180

  const atoms: AtomData[] = [
    // C1 (methyl)
    { element: 'C', position: [-cc / 2, 0, 0], color: ELEMENT_COLORS.C, radius: ELEMENT_RADII.C, name: '碳' },
    // C2 (methylene)
    { element: 'C', position: [cc / 2, 0, 0], color: ELEMENT_COLORS.C, radius: ELEMENT_RADII.C, name: '碳' },
    // O
    { element: 'O', position: [cc / 2 + co * Math.cos(tetAngle / 2), co * Math.sin(tetAngle / 2), 0], color: ELEMENT_COLORS.O, radius: ELEMENT_RADII.O, name: '氧' },
    // H on O
    { element: 'H', position: [cc / 2 + co * Math.cos(tetAngle / 2) + oh * Math.cos(tetAngle), co * Math.sin(tetAngle / 2) + oh * Math.sin(tetAngle), 0], color: ELEMENT_COLORS.H, radius: ELEMENT_RADII.H, name: '氢' },
    // 3 H on C1
    { element: 'H', position: [-cc / 2 - ch * Math.cos(tetAngle / 2), ch * Math.sin(tetAngle / 2), 0], color: ELEMENT_COLORS.H, radius: ELEMENT_RADII.H, name: '氢' },
    { element: 'H', position: [-cc / 2 - ch * Math.cos(tetAngle / 2) * Math.cos(Math.PI / 3), -ch * Math.sin(tetAngle / 2) * Math.cos(Math.PI / 3), ch * 0.8], color: ELEMENT_COLORS.H, radius: ELEMENT_RADII.H, name: '氢' },
    { element: 'H', position: [-cc / 2 - ch * Math.cos(tetAngle / 2) * Math.cos(Math.PI / 3), -ch * Math.sin(tetAngle / 2) * Math.cos(Math.PI / 3), -ch * 0.8], color: ELEMENT_COLORS.H, radius: ELEMENT_RADII.H, name: '氢' },
    // 2 H on C2
    { element: 'H', position: [cc / 2, ch * Math.sin(tetAngle / 2), ch * Math.cos(tetAngle / 2)], color: ELEMENT_COLORS.H, radius: ELEMENT_RADII.H, name: '氢' },
    { element: 'H', position: [cc / 2, -ch * Math.sin(tetAngle / 2), ch * Math.cos(tetAngle / 2)], color: ELEMENT_COLORS.H, radius: ELEMENT_RADII.H, name: '氢' },
  ]

  return {
    name: '乙醇',
    formula: 'C₂H₅OH',
    molecularWeight: 46.07,
    description: '酒精主要成分，常见溶剂',
    atoms,
    bonds: [
      { from: 0, to: 1, order: 1 }, // C-C
      { from: 1, to: 2, order: 1 }, // C-O
      { from: 2, to: 3, order: 1 }, // O-H
      { from: 0, to: 4, order: 1 }, // C-H
      { from: 0, to: 5, order: 1 },
      { from: 0, to: 6, order: 1 },
      { from: 1, to: 7, order: 1 },
      { from: 1, to: 8, order: 1 },
    ],
  }
}

function makeBenzene(): MoleculeData {
  // C6H6 - 苯环
  const r = 1.40 // C-C aromatic bond length
  const ch = 1.09
  const atoms: AtomData[] = []
  const bonds: BondData[] = []

  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 * Math.PI) / 180
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    atoms.push({
      element: 'C',
      position: [x, y, 0],
      color: ELEMENT_COLORS.C,
      radius: ELEMENT_RADII.C,
      name: '碳',
    })
    // H
    const hx = (r + ch) * Math.cos(angle)
    const hy = (r + ch) * Math.sin(angle)
    atoms.push({
      element: 'H',
      position: [hx, hy, 0],
      color: ELEMENT_COLORS.H,
      radius: ELEMENT_RADII.H,
      name: '氢',
    })
  }

  for (let i = 0; i < 6; i++) {
    bonds.push({ from: i * 2, to: ((i + 1) % 6) * 2, order: i % 2 === 0 ? 2 : 1 })
    bonds.push({ from: i * 2, to: i * 2 + 1, order: 1 })
  }

  return {
    name: '苯',
    formula: 'C₆H₆',
    molecularWeight: 78.11,
    description: '最简单的芳香烃，平面六元环结构',
    atoms,
    bonds,
  }
}

function makeNH3(): MoleculeData {
  // NH3 - 三角锥
  const d = 1.01
  const angle = (107.8 * Math.PI) / 180
  const h = d * Math.cos(angle / 2)
  const r = d * Math.sin(angle / 2)

  return {
    name: '氨',
    formula: 'NH₃',
    molecularWeight: 17.03,
    description: '有刺激性气味的气体，常用化肥原料',
    atoms: [
      { element: 'N', position: [0, 0, 0], color: ELEMENT_COLORS.N, radius: ELEMENT_RADII.N, name: '氮' },
      { element: 'H', position: [r, -h, 0], color: ELEMENT_COLORS.H, radius: ELEMENT_RADII.H, name: '氢' },
      { element: 'H', position: [-r * Math.cos(Math.PI / 6), -h, r * Math.sin(Math.PI / 6)], color: ELEMENT_COLORS.H, radius: ELEMENT_RADII.H, name: '氢' },
      { element: 'H', position: [-r * Math.cos(Math.PI / 6), -h, -r * Math.sin(Math.PI / 6)], color: ELEMENT_COLORS.H, radius: ELEMENT_RADII.H, name: '氢' },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
    ],
  }
}

export const MOLECULES: MoleculeData[] = [
  makeWater(),
  makeCO2(),
  makeCH4(),
  makeEthanol(),
  makeBenzene(),
  makeNH3(),
]
