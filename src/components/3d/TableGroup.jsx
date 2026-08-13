import React from 'react';
import { Html } from '@react-three/drei';

export const TEAM_COLORS = {
  1: '#ef4444', // Red
  2: '#f97316', // Orange
  3: '#f59e0b', // Gold
  4: '#10b981', // Emerald
  5: '#06b6d4', // Cyan
  6: '#3b82f6', // Blue
  7: '#8b5cf6', // Purple
  8: '#ec4899', // Pink
  9: '#14b8a6'  // Teal
};

export const TABLE_POSITIONS = {
  7: [-6.5, 0, -4],
  4: [0, 0, -4],
  1: [6.5, 0, -4],
  8: [-6.5, 0, 1.5],
  5: [0, 0, 1.5],
  2: [6.5, 0, 1.5],
  9: [-6.5, 0, 7],
  6: [0, 0, 7],
  3: [6.5, 0, 7]
};

export function TableGroup({ teamNumber, voteCount = 0, isWinner = false }) {
  const position = TABLE_POSITIONS[teamNumber] || [0, 0, 0];
  const color = TEAM_COLORS[teamNumber] || '#3b82f6';

  return (
    <group position={position}>
      {/* Table Cylinder */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.4, 1.2, 32]} />
        <meshStandardMaterial 
          color={isWinner ? '#fbbf24' : '#1e293b'} 
          roughness={0.2}
          metalness={0.7}
          emissive={isWinner ? '#f59e0b' : color}
          emissiveIntensity={isWinner ? 0.6 : 0.15}
        />
      </mesh>

      {/* Table Top Ring Accent */}
      <mesh position={[0, 1.21, 0]}>
        <ringGeometry args={[1.2, 1.5, 32]} />
        <meshBasicMaterial color={isWinner ? '#fef08a' : color} side={2} />
      </mesh>

      {/* Table Leg Base */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.8, 0.9, 0.1, 32]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>

      {/* 3D Label Badge Above Table */}
      <Html position={[0, 2.2, 0]} center distanceFactor={15}>
        <div className={`px-4 py-2 rounded-xl backdrop-blur-md flex flex-col items-center border transition-all duration-300 ${
          isWinner 
            ? 'bg-amber-500/90 border-amber-300 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.8)] scale-110 animate-bounce-subtle' 
            : 'bg-slate-900/85 border-slate-700 text-white shadow-xl'
        }`}>
          <div className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full inline-block" 
              style={{ backgroundColor: color }}
            />
            <span className="font-extrabold text-lg tracking-wider">
              {teamNumber}팀
            </span>
          </div>
          <div className="text-xs font-semibold mt-0.5 text-slate-300 flex items-center gap-1">
            <span>득표</span>
            <span className="text-sm font-bold text-amber-400">{voteCount}표</span>
          </div>
        </div>
      </Html>
    </group>
  );
}
