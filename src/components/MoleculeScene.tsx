import React, { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import { MoleculeData, AtomData, ELEMENT_RADII } from '../data/molecules'

export type DisplayMode = 'ball-and-stick' | 'space-filling' | 'wireframe'

interface MoleculeSceneProps {
  molecule: MoleculeData
  mode: DisplayMode
  onAtomHover: (info: { element: string; name: string; charge?: string; screenX: number; screenY: number } | null) => void
  autoRotate?: boolean
  autoRotateSpeed?: number
  viewKey?: string
}

const getAtomRadius = (atom: AtomData, mode: DisplayMode): number => {
  const base = ELEMENT_RADII[atom.element] || 0.35
  switch (mode) {
    case 'ball-and-stick': return base * 0.4
    case 'space-filling': return base * 1.0
    case 'wireframe': return base * 0.15
  }
}

const getAtomColor = (atom: AtomData, mode: DisplayMode): string => {
  return mode === 'wireframe' ? '#88aaff' : atom.color
}

interface Atom3DProps {
  atom: AtomData
  index: number
  mode: DisplayMode
  onAtomHover: MoleculeSceneProps['onAtomHover']
  viewKey?: string
}

const Atom3D: React.FC<Atom3DProps> = ({ atom, index, mode, onAtomHover, viewKey }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = React.useState(false)
  const radius = getAtomRadius(atom, mode)
  const color = getAtomColor(atom, mode)

  const handlePointerOver = (e: any) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
    const sx = e.clientX ?? (e.nativeEvent?.clientX ?? 0)
    const sy = e.clientY ?? (e.nativeEvent?.clientY ?? 0)
    onAtomHover({ element: atom.element, name: atom.name, charge: atom.charge, screenX: sx, screenY: sy })
  }

  const handlePointerOut = () => {
    setHovered(false)
    document.body.style.cursor = 'auto'
    onAtomHover(null)
  }

  return (
    <mesh
      ref={meshRef}
      key={`${index}-${mode}`}
      position={atom.position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[radius, mode === 'wireframe' ? 12 : 32, mode === 'wireframe' ? 12 : 32]} />
      <meshStandardMaterial
        color={hovered ? '#ffffff' : color}
        roughness={mode === 'space-filling' ? 0.25 : 0.4}
        metalness={mode === 'space-filling' ? 0.1 : 0.05}
        wireframe={mode === 'wireframe'}
        transparent={mode === 'wireframe'}
        opacity={mode === 'wireframe' ? 0.7 : 1}
      />
    </mesh>
  )
}

interface Bond3DProps {
  from: AtomData
  to: AtomData
  order: number
  mode: DisplayMode
}

const Bond3D: React.FC<Bond3DProps> = ({ from, to, order }) => {
  const fromPos = new THREE.Vector3(...from.position)
  const toPos = new THREE.Vector3(...to.position)
  const midpoint = new THREE.Vector3().addVectors(fromPos, toPos).multiplyScalar(0.5)
  const dir = new THREE.Vector3().subVectors(toPos, fromPos)
  const length = dir.length()
  dir.normalize()

  const up = new THREE.Vector3(0, 1, 0)
  const quat = new THREE.Quaternion()
  if (Math.abs(dir.dot(up)) > 0.999) {
    quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)
  } else {
    const axis = new THREE.Vector3().crossVectors(up, dir).normalize()
    const angle = Math.acos(up.dot(dir))
    quat.setFromAxisAngle(axis, angle)
  }

  const radius = 0.06
  const separation = 0.14

  if (order === 1) {
    return (
      <mesh position={midpoint} quaternion={quat}>
        <cylinderGeometry args={[radius, radius, length, 8]} />
        <meshStandardMaterial color="#6688cc" roughness={0.5} metalness={0.1} />
      </mesh>
    )
  }

  const perp = new THREE.Vector3()
  if (Math.abs(dir.x) < 0.9) {
    perp.crossVectors(dir, new THREE.Vector3(1, 0, 0)).normalize()
  } else {
    perp.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize()
  }

  const offsets = order === 2
    ? [perp.clone().multiplyScalar(-separation / 2), perp.clone().multiplyScalar(separation / 2)]
    : [perp.clone().multiplyScalar(-separation), new THREE.Vector3(), perp.clone().multiplyScalar(separation)]

  return (
    <>
      {offsets.map((offset, i) => {
        const pos = midpoint.clone().add(offset)
        return (
          <mesh key={i} position={pos} quaternion={quat}>
            <cylinderGeometry args={[radius * 0.85, radius * 0.85, length, 8]} />
            <meshStandardMaterial color="#6688cc" roughness={0.5} metalness={0.1} />
          </mesh>
        )
      })}
    </>
  )
}

const CameraController: React.FC<{ molecule: MoleculeData }> = ({ molecule }) => {
  const targetRef = useRef(new THREE.Vector3(0, 0, 0))
  const { camera } = useThree()
  const initialized = useRef(false)

  const centroid = useMemo(() => {
    const sum = molecule.atoms.reduce(
      (acc, a) => [acc[0] + a.position[0], acc[1] + a.position[1], acc[2] + a.position[2]],
      [0, 0, 0]
    )
    const n = molecule.atoms.length
    return new THREE.Vector3(sum[0] / n, sum[1] / n, sum[2] / n)
  }, [molecule])

  useEffect(() => {
    targetRef.current.copy(centroid)
    if (!initialized.current) {
      camera.position.set(centroid.x, centroid.y, centroid.z + 8)
      camera.lookAt(centroid)
      initialized.current = true
    }
  }, [centroid, camera])

  useFrame(() => {
    const currentLook = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position)
    currentLook.lerp(targetRef.current, 0.06)
    camera.lookAt(currentLook)
  })

  return null
}

export const MoleculeScene: React.FC<MoleculeSceneProps> = ({
  molecule,
  mode,
  onAtomHover,
  autoRotate = true,
  autoRotateSpeed = 0.8,
  viewKey
}) => {
  return (
    <>
      <color attach="background" args={['#0a0e1a']} />
      <fog attach="fog" args={['#0a0e1a', 12, 30]} />

      <ambientLight intensity={0.45} />
      <directionalLight position={[8, 12, 8]} intensity={1.0} color="#e8eeff" />
      <directionalLight position={[-6, -4, -6]} intensity={0.35} color="#4466aa" />
      <pointLight position={[0, 0, 5]} intensity={0.3} color="#6688ff" />

      <CameraController molecule={molecule} />

      {molecule.atoms.map((atom, i) => (
        <Atom3D
          key={`atom-${i}-${mode}-${viewKey || ''}`}
          atom={atom}
          index={i}
          mode={mode}
          onAtomHover={onAtomHover}
          viewKey={viewKey}
        />
      ))}

      {mode !== 'space-filling' && molecule.bonds.map((bond, i) => (
        <Bond3D
          key={`bond-${i}-${mode}-${viewKey || ''}`}
          from={molecule.atoms[bond.from]}
          to={molecule.atoms[bond.to]}
          order={bond.order}
          mode={mode}
        />
      ))}

      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={0.3}
        scale={10}
        blur={2.5}
        far={4}
        color="#000020"
      />

      <OrbitControls
        key={`controls-${viewKey || 'default'}`}
        enableDamping
        dampingFactor={0.12}
        rotateSpeed={0.8}
        zoomSpeed={0.9}
        minDistance={2}
        maxDistance={20}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
      />
    </>
  )
}
