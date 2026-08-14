import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { TEAM_COLORS } from './TableGroup';

export function AvatarHuman({ participant, targetPosition, isWinner = false }) {
  const groupRef = useRef();
  
  // Create persistent THREE.Vector3 for smooth LERP position movement
  const currentPos = useRef(new THREE.Vector3(targetPosition[0], targetPosition[1], targetPosition[2]));
  const targetVec = useMemo(() => new THREE.Vector3(...targetPosition), [targetPosition]);

  // Color derived from original assigned team
  const assignedTeamColor = TEAM_COLORS[participant.team] || '#94a3b8';

  useFrame((state, delta) => {
    if (groupRef.current) {
      targetVec.set(...targetPosition);
      // Smooth lerp movement
      currentPos.current.lerp(targetVec, delta * 4.5);
      groupRef.current.position.copy(currentPos.current);

      // Subtle breathing / walking wobble animation when moving
      const isMoving = currentPos.current.distanceTo(targetVec) > 0.05;
      if (isMoving) {
        groupRef.current.rotation.y = Math.atan2(
          targetVec.x - currentPos.current.x,
          targetVec.z - currentPos.current.z
        );
        groupRef.current.position.y = targetPosition[1] + Math.sin(state.clock.getElapsedTime() * 12) * 0.08;
      } else {
        // Idle gentle float
        groupRef.current.position.y = targetPosition[1] + Math.sin(state.clock.getElapsedTime() * 2 + participant.name.charCodeAt(0)) * 0.03;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, delta * 3);
      }
    }
  });

  return (
    <group ref={groupRef} position={targetPosition}>
      {/* 3D Humanoid Body Parts */}

      {/* Head */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <sphereGeometry args={[0.25, 24, 24]} />
        <meshStandardMaterial color="#ffdbac" roughness={0.3} />
      </mesh>

      {/* Hair / Cap Accent */}
      <mesh position={[0, 1.48, 0]}>
        <sphereGeometry args={[0.26, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={assignedTeamColor} roughness={0.4} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.08, 1.38, 0.2]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>
      <mesh position={[-0.08, 1.38, 0.2]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>

      {/* Torso (Shirt in assigned team color) */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.28, 0.7, 16]} />
        <meshStandardMaterial color={assignedTeamColor} roughness={0.5} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.32, 0.75, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.6, 12]} />
        <meshStandardMaterial color={assignedTeamColor} />
      </mesh>
      <mesh position={[0.32, 0.75, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.6, 12]} />
        <meshStandardMaterial color={assignedTeamColor} />
      </mesh>

      {/* Legs (Pants) */}
      <mesh position={[-0.13, 0.22, 0]}>
        <cylinderGeometry args={[0.09, 0.08, 0.45, 12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.13, 0.22, 0]}>
        <cylinderGeometry args={[0.09, 0.08, 0.45, 12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Shoes */}
      <mesh position={[-0.13, 0.03, 0.05]}>
        <boxGeometry args={[0.16, 0.08, 0.24]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.13, 0.03, 0.05]}>
        <boxGeometry args={[0.16, 0.08, 0.24]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Floating Name Tag Above Avatar */}
      <Html 
        position={[0, 1.8, 0]} 
        center 
        distanceFactor={8} 
        zIndexRange={[1000, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap shadow-md backdrop-blur-md flex items-center gap-1 border select-none transition-transform ${
          isWinner 
            ? 'bg-amber-500 text-slate-950 border-amber-300 scale-105 shadow-[0_0_8px_rgba(245,158,11,0.8)]' 
            : 'bg-slate-900/90 text-white border-slate-700/80'
        }`}>
          <span 
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: assignedTeamColor }}
          />
          <span>{participant.name}</span>
          <span className="text-[9px] opacity-75 font-normal">({participant.dept})</span>
        </div>
      </Html>
    </group>
  );
}
