import { Wallet } from 'lucide-react';
import { formatCrore } from '../api/index.js';

export default function PurseBar({ purseRemaining, maxPurse = 9000, teamColor = '#f59e0b' }) {
  const percent = Math.min(100, Math.max(0, Math.round((purseRemaining / maxPurse) * 100)));
  const spent = maxPurse - purseRemaining;

  const getColor = () => {
    if (percent > 60) return '#22c55e';
    if (percent > 30) return '#f59e0b';
    return '#ef4444';
  };

  const barColor = getColor();

  return (
    <div className="glass rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet size={14} className="text-ipl-gold" />
          <span className="font-rajdhani font-semibold text-sm text-white/70">Purse</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="font-rajdhani font-bold text-lg" style={{ color: barColor }}>
              {formatCrore(purseRemaining)}
            </span>
            <span className="text-white/30 text-xs font-inter ml-1">remaining</span>
          </div>
        </div>
      </div>

      {/* Bar */}
      <div className="h-3 bg-white/10 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-700 relative"
          style={{ width: `${percent}%`, background: barColor }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-[10px] text-white/30 font-inter">
          Spent: {formatCrore(spent)}
        </span>
        <span
          className="text-[10px] font-rajdhani font-bold"
          style={{ color: barColor }}
        >
          {percent}% remaining
        </span>
      </div>
    </div>
  );
}
