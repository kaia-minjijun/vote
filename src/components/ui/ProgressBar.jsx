import React from 'react';
import { Users, QrCode, ShieldAlert } from 'lucide-react';
import { TOTAL_PARTICIPANTS } from '../../data/roster';

export function ProgressBar({ voteCount = 0, sessionStatus = 'voting', onOpenQR, onOpenAdmin }) {
  const percentage = Math.min(Math.round((voteCount / TOTAL_PARTICIPANTS) * 100), 100);

  const getStatusBadge = () => {
    switch (sessionStatus) {
      case 'counting':
        return (
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold animate-pulse flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            10초 마감 카운트다운 진행 중
          </span>
        );
      case 'ended':
        return (
          <span className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            투표 마감 완료
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            실시간 투표 진행 중
          </span>
        );
    }
  };

  return (
    <div className="w-full glass-panel border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 z-20">
      {/* Title & Status */}
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-white">
              컨퍼런스홀 조 투표 현황
            </h1>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            개인 모바일 기기 접속 후 원하시는 조(1~9팀)에 투표해주세요.
          </p>
        </div>
      </div>

      {/* Progress Bar & Buttons */}
      <div className="flex items-center gap-6 w-full md:w-auto">
        <div className="flex-1 md:w-72 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-300">투표 참가율</span>
            <span className="text-blue-400 font-extrabold text-sm">
              {voteCount} / {TOTAL_PARTICIPANTS}명 ({percentage}%)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-900/90 rounded-full p-0.5 border border-slate-700/80 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(59,130,246,0.6)]"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQR}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            title="모바일 QR 접속"
          >
            <QrCode className="w-4 h-4" />
            <span>QR 코드</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95"
            title="관리자 설정"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>관리자</span>
          </button>
        </div>
      </div>
    </div>
  );
}
