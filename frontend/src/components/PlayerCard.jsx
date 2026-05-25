import { formatCrore, formatRole, getRoleColor } from '../api/index.js';
import { User, Globe, Star, Shield } from 'lucide-react';

export default function PlayerCard({ player, basePrice, status, soldPrice, soldTo, soldToColor }) {
  if (!player) {
    return (
      <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] animate-pulse">
        <div className="w-24 h-24 rounded-full bg-white/10 mb-4" />
        <div className="h-6 w-40 bg-white/10 rounded mb-2" />
        <div className="h-4 w-28 bg-white/10 rounded" />
        <p className="text-white/30 mt-6 font-rajdhani text-lg">Waiting for next player...</p>
      </div>
    );
  }

  const roleColor = getRoleColor(player.role);
  const isOverseas = player.nationality === 'Overseas';
  const isSold = status === 'sold';
  const isUnsold = status === 'unsold';

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all duration-500 animate-fade-in
        ${isSold ? 'glow-gold-strong ring-2 ring-ipl-gold/60' : ''}
        ${isUnsold ? 'ring-2 ring-red-500/40' : ''}
      `}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at top, ${roleColor}44, transparent 70%)`,
        }}
      />

      <div className="glass relative z-10 rounded-2xl p-6">
        {/* Status banner */}
        {isSold && (
          <div
            className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-rajdhani font-bold tracking-widest animate-pulse-gold"
            style={{ background: soldToColor || '#f59e0b', color: '#000' }}
          >
            SOLD!
          </div>
        )}
        {isUnsold && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-rajdhani font-bold tracking-widest bg-red-500/80 text-white">
            UNSOLD
          </div>
        )}

        {/* Avatar */}
        <div className="flex flex-col items-center mb-5">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4 relative"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${roleColor}66, ${roleColor}22)`,
              boxShadow: `0 0 30px ${roleColor}44`,
              border: `2px solid ${roleColor}66`,
            }}
          >
            <User size={36} style={{ color: roleColor }} />
            {isOverseas && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                <Globe size={10} className="text-white" />
              </div>
            )}
          </div>

          {/* Player name */}
          <h2 className="font-rajdhani font-bold text-2xl text-white text-center leading-tight">
            {player.name}
          </h2>

          {/* Role badge */}
          <div
            className="mt-2 px-3 py-1 rounded-full text-xs font-semibold font-rajdhani tracking-wide"
            style={{
              background: `${roleColor}22`,
              color: roleColor,
              border: `1px solid ${roleColor}44`,
            }}
          >
            {player.role}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="glass rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Globe size={12} className="text-blue-400" />
              <span className="text-xs text-white/50 font-inter">Nationality</span>
            </div>
            <span
              className={`font-rajdhani font-bold text-sm ${
                isOverseas ? 'text-blue-400' : 'text-green-400'
              }`}
            >
              {player.nationality}
            </span>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star size={12} className="text-ipl-gold" />
              <span className="text-xs text-white/50 font-inter">Base Price</span>
            </div>
            <span className="font-rajdhani font-bold text-sm text-ipl-gold">
              {formatCrore(basePrice || player.basePrice)}
            </span>
          </div>
        </div>

        {/* Sold info */}
        {isSold && (
          <div
            className="rounded-xl p-3 text-center mt-2 animate-slide-up"
            style={{
              background: `${soldToColor || '#f59e0b'}22`,
              border: `1px solid ${soldToColor || '#f59e0b'}44`,
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Shield size={14} style={{ color: soldToColor || '#f59e0b' }} />
              <span className="font-rajdhani font-bold text-sm" style={{ color: soldToColor || '#f59e0b' }}>
                {soldTo} • {formatCrore(soldPrice)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
