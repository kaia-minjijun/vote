import React, { useState } from 'react';
import { X, RotateCcw, Timer, Lock, ShieldAlert, AlertTriangle } from 'lucide-react';
import { resetVotes, forceCountdown, forceEnd } from '../../socket';

export function AdminControls({ onClose, session }) {
  const [confirming, setConfirming] = useState(null); // 'reset' | 'forceCountdown' | 'forceEnd'

  const handleAction = (action) => {
    if (confirming === action) {
      if (action === 'reset') resetVotes();
      if (action === 'forceCountdown') forceCountdown();
      if (action === 'forceEnd') forceEnd();
      setConfirming(null);
    } else {
      setConfirming(action);
    }
  };

  const buttonBase = 'flex items-center gap-3 w-full px-5 py-4 rounded-2xl font-bold text-sm transition-all border active:scale-95';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass-panel rounded-3xl p-8 w-full max-w-sm mx-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-500/20 p-2.5 rounded-xl">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">관리자 컨트롤</h2>
            <p className="text-xs text-slate-400">행사 운영자 전용 기능입니다.</p>
          </div>
        </div>

        {/* Current Status */}
        <div className="mb-6 px-4 py-3 bg-slate-800/60 rounded-2xl border border-slate-700">
          <span className="text-xs text-slate-400 font-semibold block mb-1">현재 세션 상태</span>
          <span className={`text-sm font-bold ${
            session?.status === 'voting' ? 'text-emerald-400' :
            session?.status === 'counting' ? 'text-amber-400' : 'text-red-400'
          }`}>
            {session?.status === 'voting' ? '🗳️ 투표 진행 중' :
             session?.status === 'counting' ? '⏱️ 카운트다운 진행 중' : '🔒 투표 마감'}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {/* Reset */}
          <button
            onClick={() => handleAction('reset')}
            className={`${buttonBase} ${
              confirming === 'reset'
                ? 'bg-red-600/90 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                : 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20'
            }`}
          >
            <RotateCcw className="w-5 h-5 flex-shrink-0" />
            <div className="text-left">
              <div className="font-extrabold">{confirming === 'reset' ? '⚠️ 정말 리셋하시겠습니까?' : '전체 투표 데이터 리셋'}</div>
              <div className="text-xs opacity-75 font-normal mt-0.5">
                {confirming === 'reset' ? '한 번 더 클릭하면 모든 투표가 초기화됩니다.' : '모든 투표 기록을 삭제하고 초기 상태로 돌아갑니다.'}
              </div>
            </div>
          </button>

          {/* Force Countdown */}
          <button
            onClick={() => handleAction('forceCountdown')}
            disabled={session?.status !== 'voting'}
            className={`${buttonBase} ${
              session?.status !== 'voting'
                ? 'bg-slate-800/40 border-slate-700 text-slate-600 cursor-not-allowed opacity-50'
                : confirming === 'forceCountdown'
                  ? 'bg-amber-500/90 border-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <Timer className="w-5 h-5 flex-shrink-0" />
            <div className="text-left">
              <div className="font-extrabold">{confirming === 'forceCountdown' ? '⚠️ 강제 카운트다운 시작?' : '강제 10초 카운트다운 시작'}</div>
              <div className="text-xs opacity-75 font-normal mt-0.5">
                44명 완료 전이라도 즉시 카운트다운을 시작합니다.
              </div>
            </div>
          </button>

          {/* Force End */}
          <button
            onClick={() => handleAction('forceEnd')}
            disabled={session?.status === 'ended'}
            className={`${buttonBase} ${
              session?.status === 'ended'
                ? 'bg-slate-800/40 border-slate-700 text-slate-600 cursor-not-allowed opacity-50'
                : confirming === 'forceEnd'
                  ? 'bg-slate-500/90 border-slate-300 text-white shadow-[0_0_20px_rgba(100,116,139,0.5)]'
                  : 'bg-slate-500/10 border-slate-500/30 text-slate-300 hover:bg-slate-500/20'
            }`}
          >
            <Lock className="w-5 h-5 flex-shrink-0" />
            <div className="text-left">
              <div className="font-extrabold">{confirming === 'forceEnd' ? '⚠️ 즉시 마감하시겠습니까?' : '즉시 투표 강제 마감'}</div>
              <div className="text-xs opacity-75 font-normal mt-0.5">
                카운트다운 없이 즉시 투표를 마감하고 결과를 공개합니다.
              </div>
            </div>
          </button>
        </div>

        {confirming && (
          <div className="mt-4 flex items-center gap-2 text-xs text-amber-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>한 번 더 클릭하면 실행됩니다. 취소하려면 다른 곳을 클릭하세요.</span>
          </div>
        )}
      </div>
    </div>
  );
}
