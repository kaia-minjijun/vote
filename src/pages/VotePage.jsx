import React, { useState, useEffect, useMemo } from 'react';
import { Search, CheckCircle2, ChevronRight, RotateCcw, Lock } from 'lucide-react';
import { ROSTER, TOTAL_PARTICIPANTS, getParticipantKey } from '../data/roster';
import { socket, submitVote } from '../socket';
import { TEAM_COLORS } from '../components/3d/TableGroup';

const TEAM_DESCRIPTIONS = {
  1: '1팀', 2: '2팀', 3: '3팀', 4: '4팀', 5: '5팀',
  6: '6팀', 7: '7팀', 8: '8팀', 9: '9팀'
};

// Step 1: Name selection
function NameSelectStep({ onSelect }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return ROSTER;
    const q = query.trim();
    return ROSTER.filter(p =>
      p.name.includes(q) || p.dept.includes(q) || p.title.includes(q)
    );
  }, [query]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-black text-white mb-1">본인 이름 선택</h1>
        <p className="text-slate-400 text-sm">이름 또는 소속팀을 검색하세요.</p>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="이름, 소속 검색..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Name List */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-2">
        {filtered.map(p => (
          <button
            key={getParticipantKey(p)}
            onClick={() => onSelect(p)}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 hover:border-blue-500/50 rounded-xl text-left transition-all group active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-md flex-shrink-0"
                style={{ backgroundColor: TEAM_COLORS[p.team] }}
              >
                {p.name[0]}
              </div>
              <div>
                <div className="font-bold text-white text-sm">{p.name}</div>
                <div className="text-xs text-slate-400">{p.dept} · {p.title} · <span style={{ color: TEAM_COLORS[p.team] }}>원래 {p.team}팀</span></div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-slate-500 py-12 text-sm">검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
}

// Step 2: Team selection vote
function TeamSelectStep({ participant, currentVote, sessionStatus, onVote, onChangeName }) {
  const isLocked = sessionStatus !== 'voting';
  const userKey = getParticipantKey(participant);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-8 pb-4">
        <button
          onClick={onChangeName}
          className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-4 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> 다른 이름 선택
        </button>

        {/* Participant Info */}
        <div className="flex items-center gap-3 mb-5 p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center font-black text-lg text-white shadow-lg flex-shrink-0"
            style={{ backgroundColor: TEAM_COLORS[participant.team] }}
          >
            {participant.name[0]}
          </div>
          <div>
            <div className="font-extrabold text-white">{participant.name}</div>
            <div className="text-xs text-slate-400">{participant.dept} · {participant.title}</div>
            <div className="text-xs mt-0.5" style={{ color: TEAM_COLORS[participant.team] }}>
              원래 소속: {participant.team}팀 (자신의 팀에는 투표 불가)
            </div>
          </div>
        </div>

        <h2 className="text-xl font-black text-white mb-1">투표할 조 선택</h2>
        <p className="text-slate-400 text-sm">
          {isLocked
            ? '⛔ 투표가 마감되어 조를 변경할 수 없습니다.'
            : currentVote
              ? `현재 투표: ${currentVote}팀 · 마감 전까지 변경 가능합니다.`
              : '1~9팀 중 1팀을 선택하세요.'}
        </p>
      </div>

      {/* Team Grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(teamNum => {
            const isOwnTeam = participant.team === teamNum;
            const isSelected = currentVote === teamNum;
            const color = TEAM_COLORS[teamNum];

            return (
              <button
                key={teamNum}
                disabled={isOwnTeam || isLocked}
                onClick={() => !isOwnTeam && !isLocked && onVote(userKey, teamNum)}
                className={`relative flex flex-col items-center justify-center gap-1.5 py-5 rounded-2xl border-2 font-bold text-sm transition-all active:scale-95 ${
                  isSelected
                    ? 'scale-105 shadow-xl text-white'
                    : isOwnTeam
                      ? 'bg-slate-800/30 border-slate-700/30 text-slate-600 cursor-not-allowed opacity-50'
                      : isLocked
                        ? 'bg-slate-800/30 border-slate-700/30 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-800/70 border-slate-700 hover:border-opacity-80 text-slate-200 hover:scale-[1.03]'
                }`}
                style={{
                  borderColor: isSelected ? color : isOwnTeam ? undefined : undefined,
                  backgroundColor: isSelected ? `${color}22` : undefined,
                  boxShadow: isSelected ? `0 0 20px ${color}55` : undefined,
                }}
              >
                {/* Color dot */}
                <div
                  className="w-6 h-6 rounded-full shadow-md"
                  style={{ backgroundColor: color, opacity: isOwnTeam ? 0.3 : 1 }}
                />
                <span className="text-base font-extrabold">{teamNum}팀</span>
                {isSelected && (
                  <CheckCircle2 className="absolute top-2 right-2 w-4 h-4" style={{ color }} />
                )}
                {isOwnTeam && (
                  <span className="text-[10px] text-slate-500 font-normal mt-0.5">내 팀</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Locked Banner */}
      {isLocked && (
        <div className="mx-5 mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
          <Lock className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-300 font-bold text-sm">투표가 마감되었습니다</p>
            <p className="text-red-400/70 text-xs mt-0.5">공용 화면에서 최종 결과를 확인하세요.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Main VotePage
export function VotePage() {
  const [participant, setParticipant] = useState(null);
  const [votes, setVotes] = useState({});
  const [session, setSession] = useState({ status: 'voting', countdownEndAt: null });
  const [voteError, setVoteError] = useState('');

  useEffect(() => {
    socket.on('state_changed', (data) => {
      setVotes(data.votes || {});
      setSession(data.session || { status: 'voting' });
    });

    socket.on('vote_error', ({ message }) => {
      setVoteError(message);
      setTimeout(() => setVoteError(''), 3000);
    });

    return () => {
      socket.off('state_changed');
      socket.off('vote_error');
    };
  }, []);

  const currentVote = participant
    ? votes[getParticipantKey(participant)]?.votedTeam ?? null
    : null;

  const handleVote = (userKey, teamNum) => {
    submitVote(userKey, teamNum);
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col">
      {/* Header strip */}
      <div className="glass-panel border-b border-slate-800 px-5 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold text-white leading-tight">🗳️ 컨퍼런스홀 조 투표</h1>
          <p className="text-[11px] text-slate-400">
            총 {Object.keys(votes).length} / {TOTAL_PARTICIPANTS}명 참여
          </p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
          session.status === 'voting'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : session.status === 'counting'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {session.status === 'voting' ? '투표 진행 중' :
           session.status === 'counting' ? '⏱ 마감 중' : '🔒 마감'}
        </div>
      </div>

      {/* Error toast */}
      {voteError && (
        <div className="mx-4 mt-3 px-4 py-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm font-semibold">
          ⚠️ {voteError}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!participant ? (
          <NameSelectStep onSelect={setParticipant} />
        ) : (
          <TeamSelectStep
            participant={participant}
            currentVote={currentVote}
            sessionStatus={session.status}
            onVote={handleVote}
            onChangeName={() => setParticipant(null)}
          />
        )}
      </div>
    </div>
  );
}
