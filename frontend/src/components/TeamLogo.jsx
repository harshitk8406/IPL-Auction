/**
 * TeamLogo — renders the official team PNG from /logos/<shortName>.png
 * Falls back to a coloured badge with initials if the image is missing.
 */

// Map every shortName to its logo file (all lowercase filenames)
const LOGO_MAP = {
  CSK:  '/logos/csk.png',
  MI:   '/logos/mi.png',
  RCB:  '/logos/rcb.png',
  KKR:  '/logos/kkr.png',
  RR:   '/logos/rr.png',
  DC:   '/logos/dc.png',
  PBKS: '/logos/pbks.png',
  SRH:  '/logos/srh.png',
  LSG:  '/logos/lsg.png',
  GT:   '/logos/gt.png',
};

export default function TeamLogo({ shortName, color = '#f59e0b', size = 40, className = '' }) {
  const src = LOGO_MAP[shortName?.toUpperCase()];

  if (!src) {
    // Fallback: coloured badge
    return (
      <div
        className={`flex items-center justify-center font-rajdhani font-bold rounded-xl flex-shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          background: `${color}22`,
          border: `2px solid ${color}55`,
          color,
          fontSize: size * 0.28,
        }}
      >
        {shortName?.slice(0, 4) || '?'}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-xl flex-shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={`${shortName} logo`}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        onError={(e) => {
          // If PNG fails, replace with initials badge
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement.style.background = `${color}22`;
          e.currentTarget.parentElement.style.border = `2px solid ${color}55`;
          e.currentTarget.parentElement.style.color = color;
          e.currentTarget.parentElement.style.fontSize = `${size * 0.28}px`;
          e.currentTarget.parentElement.classList.add('font-rajdhani', 'font-bold');
          e.currentTarget.parentElement.textContent = shortName?.slice(0, 4) || '?';
        }}
      />
    </div>
  );
}
