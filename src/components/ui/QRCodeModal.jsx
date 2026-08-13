import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Wifi, Smartphone } from 'lucide-react';

export function QRCodeModal({ onClose }) {
  const [voteUrl, setVoteUrl] = useState('');

  useEffect(() => {
    // Fetch local IP from server
    fetch('/api/info')
      .then(r => r.json())
      .then(data => setVoteUrl(data.voteUrl || `${window.location.protocol}//${window.location.host}/vote`))
      .catch(() => setVoteUrl(`${window.location.protocol}//${window.location.host}/vote`));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass-panel-glow rounded-3xl p-10 flex flex-col items-center gap-6 max-w-sm w-full mx-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <Smartphone className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-extrabold text-white">모바일 접속 QR 코드</h2>
        </div>

        <p className="text-slate-400 text-sm text-center">
          동일한 Wi-Fi(사내망)에 연결된 기기로 아래 QR 코드를 스캔하세요.
        </p>

        {voteUrl ? (
          <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.4)]">
            <QRCodeSVG value={voteUrl} size={200} level="M" />
          </div>
        ) : (
          <div className="w-52 h-52 rounded-2xl bg-slate-800 animate-pulse flex items-center justify-center">
            <span className="text-slate-500 text-sm">URL 불러오는 중...</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Wifi className="w-4 h-4" />
            <span className="text-xs font-semibold">동일 Wi-Fi 연결 필요</span>
          </div>
          {voteUrl && (
            <code className="text-xs bg-slate-900 text-blue-300 px-3 py-1.5 rounded-lg border border-slate-700 break-all text-center">
              {voteUrl}
            </code>
          )}
        </div>
      </div>
    </div>
  );
}
