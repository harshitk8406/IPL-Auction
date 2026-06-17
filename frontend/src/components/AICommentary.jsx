import { useEffect, useState, useRef } from 'react';
import { Sparkles, Mic } from 'lucide-react';

/**
 * AICommentary — animated AI commentary and scouting insight display.
 *
 * Props:
 *   commentary      — sold/unsold one-liner (null to suppress)
 *   insight         — scouting report text (null to suppress)
 *   commentaryColor — accent color for commentary bubble
 *   persistInsight  — if true, insight stays visible until replaced (no 30s fade)
 */
export default function AICommentary({ commentary, insight, commentaryColor, persistInsight = false }) {
  const [displayedCommentary, setDisplayedCommentary] = useState('');
  const [displayedInsight, setDisplayedInsight]       = useState('');
  const [showCommentary, setShowCommentary]           = useState(false);
  const [showInsight, setShowInsight]                 = useState(false);
  const commentaryTimerRef = useRef(null);
  const insightTimerRef    = useRef(null);

  // ── Commentary (sold/unsold) ──────────────────────────────────
  useEffect(() => {
    if (!commentary) return;
    clearTimeout(commentaryTimerRef.current);
    setDisplayedCommentary(commentary);
    setShowCommentary(true);
    commentaryTimerRef.current = setTimeout(() => setShowCommentary(false), 8000);
  }, [commentary]);

  // ── Scouting insight (player nominated) ──────────────────────
  useEffect(() => {
    if (!insight) return;
    clearTimeout(insightTimerRef.current);
    setDisplayedInsight(insight);
    setShowInsight(true);
    // If persistInsight, keep until next player is nominated (insight prop changes)
    if (!persistInsight) {
      insightTimerRef.current = setTimeout(() => setShowInsight(false), 30000);
    }
  }, [insight, persistInsight]);

  // Cleanup on unmount
  useEffect(() => () => {
    clearTimeout(commentaryTimerRef.current);
    clearTimeout(insightTimerRef.current);
  }, []);

  const accentColor = commentaryColor || '#f59e0b';

  return (
    <div className="space-y-2">
      {/* 🎙️ Live Commentary */}
      {showCommentary && displayedCommentary && (
        <div
          className="rounded-xl px-4 py-3 animate-slide-up flex items-start gap-3"
          style={{
            background: `${accentColor}12`,
            border: `1px solid ${accentColor}33`,
          }}
        >
          <div className="flex-shrink-0 mt-0.5">
            <Mic size={14} style={{ color: accentColor }} className="animate-pulse" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-rajdhani font-bold tracking-widest uppercase mb-1" style={{ color: accentColor }}>
              AI Commentator
            </p>
            <p className="text-white/80 text-xs font-inter leading-relaxed italic">
              "{displayedCommentary}"
            </p>
          </div>
        </div>
      )}

      {/* 🔍 Scouting Report */}
      {showInsight && displayedInsight && (
        <div className="rounded-xl px-4 py-3 animate-slide-up flex items-start gap-3"
          style={{
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.25)',
          }}
        >
          <div className="flex-shrink-0 mt-0.5">
            <Sparkles size={14} className="text-purple-400 animate-pulse" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-rajdhani font-bold tracking-widest uppercase mb-1 text-purple-400">
              AI Scout Report
            </p>
            <p className="text-white/70 text-xs font-inter leading-relaxed">
              {displayedInsight}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
