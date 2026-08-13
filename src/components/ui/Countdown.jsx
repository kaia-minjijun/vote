import React, { useState, useEffect } from 'react';

export function Countdown({ countdownEndAt }) {
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    if (!countdownEndAt) return;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((countdownEndAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [countdownEndAt]);

  const scale = 1 + (1 - secondsLeft / 10) * 0.3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop vignette */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Countdown Circle */}
      <div className="relative flex flex-col items-center justify-center gap-6">
        {/* Glow rings */}
        <div className="absolute w-72 h-72 rounded-full border-4 border-amber-400/30 animate-ping" />
        <div className="absolute w-64 h-64 rounded-full border-4 border-amber-500/40" />

        {/* Number Disc */}
        <div
          className="w-56 h-56 rounded-full flex flex-col items-center justify-center shadow-[0_0_80px_rgba(245,158,11,0.8)] bg-gradient-to-br from-amber-500 to-orange-600 transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}
        >
          <span className="text-8xl font-black text-white tracking-tight leading-none">
            {secondsLeft}
          </span>
          <span className="text-sm font-bold text-amber-100 tracking-widest uppercase mt-1">초 남음</span>
        </div>

        {/* Text below */}
        <div className="text-center">
          <p className="text-2xl font-extrabold text-white drop-shadow-lg">
            🗳️ 44명 투표 완료!
          </p>
          <p className="text-base text-amber-300 mt-1 font-semibold">
            {secondsLeft > 0 ? '카운트다운 후 투표가 자동 마감됩니다.' : '투표가 마감되었습니다!'}
          </p>
        </div>
      </div>
    </div>
  );
}
