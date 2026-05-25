import { Clock } from 'lucide-react';

export default function Timer({ seconds, timerEnd }) {
  const isUrgent = seconds <= 10 && seconds > 0;
  const isDead = seconds <= 0;

  return (
    <div className="flex items-center gap-1.5">
      <Clock
        size={14}
        className={`transition-colors duration-300 ${
          isDead ? 'text-white/20' : isUrgent ? 'text-red-400' : 'text-ipl-gold'
        }`}
      />
      <span
        className={`font-rajdhani font-bold text-lg tabular-nums transition-all duration-200
          ${isDead ? 'text-white/20' : isUrgent ? 'timer-urgent' : 'text-ipl-gold'}`}
      >
        {isDead ? '--' : `${seconds}s`}
      </span>
    </div>
  );
}
