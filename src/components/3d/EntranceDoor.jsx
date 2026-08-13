import React from 'react';
import { Html } from '@react-three/drei';

export function EntranceDoor({ position = [-10.5, 0, -7.5] }) {
  return (
    <group position={position}>
      {/* Door Frame Left */}
      <mesh position={[-0.8, 1.5, 0]} castShadow>
        <boxGeometry args={[0.2, 3, 0.4]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Door Frame Right */}
      <mesh position={[0.8, 1.5, 0]} castShadow>
        <boxGeometry args={[0.2, 3, 0.4]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Door Frame Top */}
      <mesh position={[0, 3.1, 0]} castShadow>
        <boxGeometry args={[1.8, 0.2, 0.4]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Glass Panel */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[1.4, 3, 0.05]} />
        <meshPhysicalMaterial 
          color="#38bdf8" 
          transparent={true} 
          opacity={0.3} 
          roughness={0.1} 
          transmission={0.6} 
        />
      </mesh>

      {/* Entrance Door Sign */}
      <Html position={[0, 3.7, 0]} center distanceFactor={14}>
        <div className="px-3 py-1 bg-emerald-600/90 text-white font-extrabold text-xs rounded-md shadow-[0_0_15px_rgba(16,185,129,0.7)] border border-emerald-400 backdrop-blur-md flex items-center gap-1.5 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
          <span>ENTRANCE (출입구)</span>
        </div>
      </Html>
    </group>
  );
}
