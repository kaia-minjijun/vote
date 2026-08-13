import React, { useState, useEffect } from 'react';
import { HallScene } from '../components/3d/HallScene';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Countdown } from '../components/ui/Countdown';
import { ResultView } from '../components/ui/ResultView';
import { QRCodeModal } from '../components/ui/QRCodeModal';
import { AdminControls } from '../components/ui/AdminControls';
import { socket } from '../socket';

export function DisplayPage() {
  const [votes, setVotes] = useState({});
  const [session, setSession] = useState({ status: 'voting', countdownEndAt: null });
  const [showQR, setShowQR] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    socket.on('state_changed', (data) => {
      setVotes(data.votes || {});
      setSession(data.session || { status: 'voting', countdownEndAt: null });
    });

    return () => {
      socket.off('state_changed');
    };
  }, []);

  const voteCount = Object.keys(votes).length;

  // Determine winner for highlighting
  const teamCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  Object.values(votes).forEach(v => {
    if (v.votedTeam) teamCounts[v.votedTeam] = (teamCounts[v.votedTeam] || 0) + 1;
  });
  const maxCount = Math.max(...Object.values(teamCounts));
  const winningTeam = session.status === 'ended' && maxCount > 0
    ? parseInt(Object.entries(teamCounts).find(([, c]) => c === maxCount)?.[0] || '0')
    : null;

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#080c14]">
      {/* Top Progress Bar */}
      <ProgressBar
        voteCount={voteCount}
        sessionStatus={session.status}
        onOpenQR={() => setShowQR(true)}
        onOpenAdmin={() => setShowAdmin(true)}
      />

      {/* 3D Hall Canvas - fills remaining space */}
      <div className="flex-1 relative overflow-hidden">
        <HallScene votes={votes} session={session} winningTeam={winningTeam} />
      </div>

      {/* Overlays */}
      {session.status === 'counting' && session.countdownEndAt && (
        <Countdown countdownEndAt={session.countdownEndAt} />
      )}

      {session.status === 'ended' && (
        <ResultView votes={votes} />
      )}

      {showQR && <QRCodeModal onClose={() => setShowQR(false)} />}
      {showAdmin && (
        <AdminControls onClose={() => setShowAdmin(false)} session={session} />
      )}
    </div>
  );
}
