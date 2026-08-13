import React from 'react';
import { Monitor, Smartphone, ExternalLink } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center px-6 gap-10">
      {/* Hero */}
      <div className="flex flex-col items-center text-center gap-4">
        <div className="text-5xl mb-2">🏛️</div>
        <h1 className="text-4xl font-black text-white tracking-tight">
          컨퍼런스홀 조 투표 프로그램
        </h1>
        <p className="text-slate-400 max-w-md text-base leading-relaxed">
          3D 실시간 투표 시스템 · 44명 참가자 · 9개 조
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-xl">
        {/* Display Screen */}
        <a
          href="/display"
          className="flex-1 glass-panel-glow rounded-3xl p-7 flex flex-col items-center gap-4 group hover:scale-[1.02] transition-all cursor-pointer text-center"
        >
          <div className="bg-blue-500/20 p-4 rounded-2xl group-hover:bg-blue-500/30 transition-colors">
            <Monitor className="w-10 h-10 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white mb-1">공용 대형 화면</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              3D 좌석 배치도 · 실시간 아바타 이동<br />
              진행률 · 카운트다운 · 결과 화면
            </p>
          </div>
          <div className="flex items-center gap-2 text-blue-400 text-sm font-bold group-hover:gap-3 transition-all">
            <span>프로젝터/TV에서 열기</span>
            <ExternalLink className="w-4 h-4" />
          </div>
        </a>

        {/* Vote Screen */}
        <a
          href="/vote"
          className="flex-1 glass-panel rounded-3xl p-7 flex flex-col items-center gap-4 group hover:scale-[1.02] transition-all cursor-pointer text-center border border-slate-700"
        >
          <div className="bg-emerald-500/20 p-4 rounded-2xl group-hover:bg-emerald-500/30 transition-colors">
            <Smartphone className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white mb-1">개인 투표 화면</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              이름 선택 후 원하는 조에 투표<br />
              마감 전까지 자유롭게 변경 가능
            </p>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold group-hover:gap-3 transition-all">
            <span>모바일에서 접속</span>
            <ExternalLink className="w-4 h-4" />
          </div>
        </a>
      </div>

      <p className="text-slate-600 text-xs text-center">
        모든 기기가 동일한 Wi-Fi(사내망)에 연결되어 있어야 합니다.
      </p>
    </div>
  );
}
