import { useEffect, useState } from 'react';

const COLORS = ['#D4AF37', '#10B981', '#C8102E', '#F5E6D3'];

export default function WinCelebration() {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    const pieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 40 + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 60,
      vy: -30 - Math.random() * 50,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      round: Math.random() > 0.5,
      rotation: Math.random() * 360,
      size: 6 + Math.random() * 8,
      delay: Math.random() * 200,
    }));
    setConfetti(pieces);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-40 animate-win-flash"
        style={{ background: 'rgba(16, 185, 129, 0.3)' }}
      />
      <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
        {confetti.map((p) => (
          <div
            key={p.id}
            className="absolute animate-confetti"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: p.round ? '50%' : '2px',
              animationDelay: `${p.delay}ms`,
              '--vx': `${p.vx}vw`,
              '--vy': `${p.vy}vh`,
              '--rot': `${p.rotation}deg`,
            }}
          />
        ))}
      </div>
    </>
  );
}
