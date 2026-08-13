import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RotateCcw } from 'lucide-react';
import { TEAM_COLORS } from '../3d/TableGroup';
import { resetVotes } from '../../socket';

const TEAM_LABELS = {
  1: '1팀', 2: '2팀', 3: '3팀', 4: '4팀', 5: '5팀',
  6: '6팀', 7: '7팀', 8: '8팀', 9: '9팀'
};

export function ResultView({ votes = {} }) {
  const confettiFiredRef = useRef(false);

  // Compute vote counts
  const teamCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  Object.values(votes).forEach(v => {
    if (v.votedTeam) teamCounts[v.votedTeam] = (teamCounts[v.votedTeam] || 0) + 1;
  });

  const maxVotes = Math.max(...Object.values(teamCounts), 1);
  const winnerTeam = parseInt(
    Object.entries(teamCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '0'
  );

  // Sorted teams for display (winner first)
  const sortedTeams = Object.entries(teamCounts)
    .map(([t, c]) => ({ team: parseInt(t), count: c }))
    .sort((a, b) => b.count - a.count);

  // Fire confetti once
  useEffect(() => {
    if (confettiFiredRef.current) return;
    confettiFiredRef.current = true;

    const fire = (opts) => confetti({ particleCount: 120, spread: 70, ...opts });
    setTimeout(() => fire({ angle: 60, origin: { x: 0 } }), 100);
    setTimeout(() => fire({ angle: 120, origin: { x: 1 } }), 300);
    setTimeout(() => fire({ angle: 90, origin: { x: 0.5, y: 0.6 } }), 600);
  }, []);

  const handleReset = () => {
    if (window.confirm('투표 결과를 초기화하고 새로운 투표를 시작하시겠습니까?')) {
      resetVotes();
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950/95 via-slate-900/95 to-indigo-950/95 backdrop-blur-md overflow-auto py-10">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <Trophy className="w-14 h-14 text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.9)]" />
        <h1 className="text-4xl font-black text-white tracking-tight">투표 결과 발표</h1>
        <p className="text-slate-400 text-base font-medium">
          최다 득표 조는 <span className="text-amber-400 font-bold">{TEAM_LABELS[winnerTeam]}</span>입니다! 🎉
        </p>
      </div>

      {/* Winner Card */}
      {winnerTeam > 0 && (
        <div
          className="flex flex-col items-center gap-3 mb-8 px-12 py-6 rounded-3xl border-2 shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${TEAM_COLORS[winnerTeam]}22, ${TEAM_COLORS[winnerTeam]}44)`,
            borderColor: TEAM_COLORS[winnerTeam],
            boxShadow: `0 0 50px ${TEAM_COLORS[winnerTeam]}55`,
          }}
        >
          <Award className="w-10 h-10" style={{ color: TEAM_COLORS[winnerTeam] }} />
          <div className="text-5xl font-black text-white">{TEAM_LABELS[winnerTeam]}</div>
          <div className="text-2xl font-bold text-white">{teamCounts[winnerTeam]}표</div>
        </div>
      )}

      {/* Bar Chart */}
      <div className="w-full max-w-2xl px-6 flex flex-col gap-3 mb-10">
        {sortedTeams.map(({ team, count }, idx) => {
          const isWinner = team === winnerTeam;
          const barWidth = Math.round((count / maxVotes) * 100);
          const color = TEAM_COLORS[team];

          return (
            <div key={team} className="flex items-center gap-4">
              <div className="w-16 text-right flex-shrink-0">
                <span
                  className={`text-sm font-bold ${isWinner ? 'text-amber-300' : 'text-slate-300'}`}
                >
                  {TEAM_LABELS[team]}
                </span>
              </div>
              <div className="flex-1 h-8 bg-slate-800/60 rounded-full overflow-hidden border border-slate-700/60">
                <div
                  className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-700 ease-out"
                  style={{
                    width: `${barWidth}%`,
                    background: isWinner
                      ? `linear-gradient(90deg, ${color}bb, ${color})`
                      : `linear-gradient(90deg, ${color}55, ${color}99)`,
                    boxShadow: isWinner ? `0 0 14px ${color}aa` : 'none',
                  }}
                >
                  {count > 0 && (
                    <span className="text-xs font-extrabold text-white drop-shadow">{count}표</span>
                  )}
                </div>
              </div>
              {isWinner && <Trophy className="w-5 h-5 text-amber-400 flex-shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Admin Reset Button */}
      <button
        onClick={handleReset}
        className="px-6 py-3 bg-rose-600/90 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-lg border border-rose-400 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95"
      >
        <RotateCcw className="w-5 h-5" />
        <span>투표 초기화 (새로 시작하기)</span>
      </button>
    </div>
  );
}
