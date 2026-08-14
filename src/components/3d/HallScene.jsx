import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei';
import { TableGroup, TABLE_POSITIONS } from './TableGroup';
import { AvatarHuman } from './AvatarHuman';
import { EntranceDoor } from './EntranceDoor';
import { ROSTER, getParticipantKey } from '../../data/roster';

export function HallScene({ votes = {}, session = {}, winningTeam = null }) {
  // Map participant keys to participants
  const rosterMap = useMemo(() => {
    const map = {};
    ROSTER.forEach(p => {
      map[getParticipantKey(p)] = p;
    });
    return map;
  }, []);

  // Compute vote count per team
  const teamVoteCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    Object.values(votes).forEach(vote => {
      if (vote.votedTeam && counts[vote.votedTeam] !== undefined) {
        counts[vote.votedTeam]++;
      }
    });
    return counts;
  }, [votes]);

  // Compute 3D target slot positions for active voters
  const activeAvatars = useMemo(() => {
    // Group voter keys by voted team
    const teamVoters = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };

    Object.entries(votes).forEach(([userKey, vote]) => {
      if (vote.votedTeam && teamVoters[vote.votedTeam]) {
        teamVoters[vote.votedTeam].push(userKey);
      }
    });

    const avatarList = [];

    // Calculate slots around each table
    Object.entries(teamVoters).forEach(([teamNumStr, userKeys]) => {
      const teamNum = Number(teamNumStr);
      const tableCenter = TABLE_POSITIONS[teamNum];
      const count = userKeys.length;

      userKeys.forEach((userKey, idx) => {
        const participant = rosterMap[userKey];
        if (!participant) return;

        // Angle around table ring
        const angle = (idx / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2;
        const radius = 2.0;
        const targetX = tableCenter[0] + Math.cos(angle) * radius;
        const targetZ = tableCenter[2] + Math.sin(angle) * radius;

        avatarList.push({
          userKey,
          participant,
          votedTeam: teamNum,
          targetPosition: [targetX, 0, targetZ]
        });
      });
    });

    return avatarList;
  }, [votes, rosterMap]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 16, 17], fov: 42 }}
        className="w-full h-full"
      >
        <color attach="background" args={['#080c16']} />
        
        {/* Soft Ambient & Directional Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[12, 24, 18]} 
          intensity={1.2} 
        />
        <pointLight position={[-10, 10, -10]} intensity={0.6} color="#38bdf8" />
        <pointLight position={[10, 10, 10]} intensity={0.6} color="#c084fc" />

        {/* Camera Control - restricted for optimal view */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          minDistance={10}
          maxDistance={35}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 6}
          target={[0, 0, 1]}
        />

        {/* Smooth Contact Shadows under objects - eliminates shadow map frustum wall bug */}
        <ContactShadows 
          position={[0, 0, 0]} 
          opacity={0.6} 
          scale={40} 
          blur={2.5} 
          far={10} 
          color="#000000" 
        />

        {/* Floor Base */}
        <mesh position={[0, -0.05, 0]}>
          <planeGeometry args={[35, 30]} />
          <meshStandardMaterial color="#0c1220" roughness={0.6} metalness={0.4} />
        </mesh>

        {/* Grid Accent */}
        <Grid 
          position={[0, 0, 0]} 
          args={[35, 30]} 
          cellSize={1} 
          cellThickness={0.8} 
          cellColor="#1e293b" 
          sectionSize={5} 
          sectionThickness={1.5} 
          sectionColor="#334155" 
          fadeDistance={30} 
        />

        {/* Entrance Door Gate */}
        <EntranceDoor position={[-11, 0, -8]} />

        {/* 9 Team Tables (3x3 Grid) */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(teamNum => (
          <TableGroup
            key={teamNum}
            teamNumber={teamNum}
            voteCount={teamVoteCounts[teamNum] || 0}
            isWinner={winningTeam === teamNum}
          />
        ))}

        {/* 3D Humanoid Avatars Standing Around Tables */}
        {activeAvatars.map(avatar => (
          <AvatarHuman
            key={avatar.userKey}
            participant={avatar.participant}
            targetPosition={avatar.targetPosition}
            isWinner={winningTeam === avatar.votedTeam}
          />
        ))}
      </Canvas>
    </div>
  );
}
