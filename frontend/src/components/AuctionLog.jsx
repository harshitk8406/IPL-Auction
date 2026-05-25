import { useRef, useEffect } from 'react';
import { ScrollText, Activity } from 'lucide-react';

export default function AuctionLog({ log }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to top (newest first)
  }, [log]);

  const getLogIcon = (message) => {
    if (message.includes('SOLD')) return '🔨';
    if (message.includes('UNSOLD')) return '❌';
    if (message.includes('bid')) return '💰';
    if (message.includes('nominated')) return '🎯';
    if (message.includes('COMPLETE')) return '🏆';
    return '📋';
  };

  const getLogColor = (message) => {
    if (message.includes('SOLD')) return 'text-ipl-gold';
    if (message.includes('UNSOLD')) return 'text-red-400';
    if (message.includes('bid')) return 'text-blue-400';
    if (message.includes('nominated')) return 'text-purple-400';
    if (message.includes('COMPLETE')) return 'text-green-400';
    return 'text-white/60';
  };

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <Activity size={14} className="text-ipl-gold animate-pulse" />
        <span className="font-rajdhani font-bold text-sm text-white/80 tracking-wider">
          AUCTION LOG
        </span>
        <span className="ml-auto text-xs text-white/30 font-inter">
          {log.length} events
        </span>
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
        {log.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <ScrollText size={24} className="text-white/20 mb-2" />
            <p className="text-white/30 text-sm font-inter">Auction events will appear here</p>
          </div>
        ) : (
          log.map((entry, i) => (
            <div
              key={entry.id || i}
              className={`flex items-start gap-2.5 px-3 py-2 rounded-lg transition-all duration-300
                ${i === 0 ? 'animate-slide-up' : ''}
                hover:bg-white/5`}
              style={{
                background: i === 0 ? 'rgba(245,158,11,0.05)' : 'transparent',
                border: i === 0 ? '1px solid rgba(245,158,11,0.1)' : '1px solid transparent',
              }}
            >
              <span className="text-base flex-shrink-0 leading-none mt-0.5">
                {getLogIcon(entry.message)}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-inter ${getLogColor(entry.message)} leading-snug`}>
                  {entry.message}
                </p>
                {entry.timestamp && (
                  <p className="text-[10px] text-white/20 font-inter mt-0.5">
                    {entry.timestamp}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
