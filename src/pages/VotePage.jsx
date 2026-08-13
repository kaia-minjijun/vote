import React, { useState, useEffect, useMemo } from 'react';
import { Search, CheckCircle2, ChevronRight, RotateCcw, Lock, Settings } from 'lucide-react';
import { ROSTER, TOTAL_PARTICIPANTS, getParticipantKey } from '../data/roster';
import { socket, submitVote } from '../socket';
import { TEAM_COLORS } from '../components/3d/TableGroup';
import { AdminControls } from '../components/ui/AdminControls';

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
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 2: Team Selection
function TeamSelectStep({ participant, currentVote, sessionStatus, onVote, onChangeName }) {
  const isLocked = sessionStatus !== 'voting';
  const assignedTeam = participant.team;
  const userKey = getParticipantKey(participant);

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
      {/* Participant Profile Banner */}
      <div className="glass-panel p-4 rounded-2xl mb-6 border border-slate-700/80 bg-slate-800/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-black text-lg text-white shadow-lg"
              style={{ backgroundColor: TEAM_COLORS[assignedTeam] }}
            >
              {participant.name[0]}
            </div>
            <div>
              <div className="text-lg font-black text-white">{participant.name}</div>
              <div className="text-xs text-slate-400">{participant.dept} · {participant.title}</div>
            </div>
          </div>
          <button
            onClick={onChangeName}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/60 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-semibold text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>변경</span>
          </button>
        </div>

        <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          원래 소속: {assignedTeam}팀 (자신의 팀에는 투표 불가)
        </div>
      </div>

      {/* Lock Banner */}
      {isLocked && (
        <div className="mb-6 p-4 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-amber-300 text-sm font-bold">
          <Lock className="w-5 h-5 flex-shrink-0" />
          <span>투표가 마감되어 조를 변경할 수 없습니다.</span>
        </div>
      )}

      {/* Team Selection Grid */}
      <div className="mb-4">
        <h2 className="text-xl font-black text-white mb-1">투표할 조 선택</h2>
        <p className="text-xs text-slate-400">1~9팀 중 1팀을 선택하세요.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 pb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(teamNum => {
          const isOwnTeam = teamNum === assignedTeam;
          const isSelected = currentVote === teamNum;
          const color = TEAM_COLORS[teamNum];
          const isDisabled = isOwnTeam || isLocked;

          return (
            <button
              key={teamNum}
              disabled={isDisabled}
              onClick={() => onVote(userKey, teamNum)}
              className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all text-left active:scale-[0.98] ${
                isDisabled
                  ? 'bg-slate-900/30 border-slate-800/60 opacity-40 cursor-not-allowed'
                  : isSelected
                    ? 'bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-800/60 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md flex-shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {teamNum}
                </div>
                <div>
                  <div className="font-extrabold text-white text-base">
                    {teamNum}팀
                  </div>
                  {isOwnTeam && (
                    <span className="text-[11px] font-bold text-slate-400">내 팀</span>
                  )}
                </div>
              </div>

              {isSelected && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500 text-white rounded-full font-bold text-xs shadow-md animate-pulse">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>선택됨</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Main VotePage
export function VotePage() {
  const [participant, setParticipant] = useState(null);
  const [votes, setVotes] = useState({});
  const [session, setSession] = useState({ status: 'voting', countdownEndAt: null });
  const [voteError, setVoteError] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);

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
        <div className="flex items-center gap-2">
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

          <button
            onClick={() => setShowAdminModal(true)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="관리자 설정"
          >
            <Settings className="w-4 h-4" />
          </button>
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

      {/* Admin Modal */}
      {showAdminModal && (
        <AdminControls
          sessionStatus={session.status}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </div>
  );
}
