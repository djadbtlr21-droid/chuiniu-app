const PIP_POSITIONS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

export default function Die({
  value,
  size = 48,
  hidden = false,
  rolling = false,
  lost = false,
  staggerIndex = 0,
  revealed = false,
}) {
  if (lost) {
    return (
      <div
        className="rounded-lg border border-text-muted/30 flex items-center justify-center opacity-30"
        style={{ width: size, height: size, background: '#3a2a2a' }}
      >
        <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 20 20">
          <line x1="4" y1="4" x2="16" y2="16" stroke="#6B5B4F" strokeWidth="2" />
          <line x1="16" y1="4" x2="4" y2="16" stroke="#6B5B4F" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  if (hidden) {
    return (
      <div
        className="rounded-lg"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-accent-gold font-title" style={{ fontSize: size * 0.4 }}>?</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg ${rolling ? 'die-shake' : ''} ${revealed ? 'die-reveal-in' : ''}`}
      style={{
        width: size,
        height: size,
        background: '#F8F0E3',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        animationDelay: revealed ? `${staggerIndex * 80}ms` : '0ms',
      }}
    >
      <DiceFace value={value} size={size} />
    </div>
  );
}

function DiceFace({ value, size }) {
  const pips = PIP_POSITIONS[value] || [];
  const pipSize = size * 0.16;

  return (
    <div className="relative w-full h-full">
      {pips.map(([x, y], i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: pipSize,
            height: pipSize,
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)',
            background: (value === 1 || value === 4) ? '#C8102E' : '#1A0F0F',
          }}
        />
      ))}
    </div>
  );
}
