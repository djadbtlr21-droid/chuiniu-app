import { useMemo } from 'react';
import Die from './Die';

/**
 * Collision-free placement: dice land close but never overlap.
 * Think: 5 real dice rolled from a cup, landing in a loose pile.
 */
function generateClusterPositions(count, containerW, containerH, dieSize, seed) {
  // Seeded PRNG (Park-Miller)
  let s = seed | 1;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s & 0x7fffffff) / 0x7fffffff;
  };

  const positions = [];
  const minDistance = dieSize * 0.90;
  const maxAttempts = 50;
  const halfDie = dieSize / 2;

  for (let i = 0; i < count; i++) {
    let placed = false;

    for (let attempt = 0; attempt < maxAttempts && !placed; attempt++) {
      // Start tight, widen if colliding
      const spread = 0.3 + (attempt / maxAttempts) * 0.5;
      const x = containerW / 2 + (rand() - 0.5) * containerW * spread;
      const y = containerH / 2 + (rand() - 0.5) * containerH * spread;

      // Keep within bounds (with padding for die size)
      if (
        x < halfDie + 2 ||
        x > containerW - halfDie - 2 ||
        y < halfDie + 2 ||
        y > containerH - halfDie - 2
      ) {
        continue;
      }

      const tooClose = positions.some((p) => {
        const dx = p.x - x;
        const dy = p.y - y;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
      });

      if (!tooClose) {
        positions.push({
          x,
          y,
          rotation: (rand() - 0.5) * 30, // ±15°
          scale: 0.95 + rand() * 0.1,     // 0.95–1.05
        });
        placed = true;
      }
    }

    // Fallback: place in a staggered row if collision-free spot not found
    if (!placed) {
      positions.push({
        x: (i - Math.floor(count / 2)) * (minDistance + 2) + containerW / 2,
        y: containerH / 2 + ((i % 2) * 16 - 8),
        rotation: (rand() - 0.5) * 30,
        scale: 1,
      });
    }
  }
  return positions;
}

/**
 * DiceCluster — a tight handful of dice on a table surface.
 *
 * @param {number[]} dice       - array of die values
 * @param {boolean}  hidden     - show face-down (red "?" cards)
 * @param {boolean}  rolling    - shake animation active
 * @param {boolean}  revealed   - staggered flip-in animation
 * @param {number}   dieSize    - px size of each die (default 56)
 * @param {number}   width      - container width  (default 280)
 * @param {number}   height     - container height (default 180)
 * @param {number}   clusterKey - seed for deterministic layout
 */
export default function DiceCluster({
  dice,
  hidden = false,
  rolling = false,
  revealed = false,
  dieSize = 56,
  width = 294,
  height = 189,
  clusterKey = 0,
}) {
  const positions = useMemo(
    () => generateClusterPositions(dice.length, width, height, dieSize, clusterKey || 1),
    [dice.length, width, height, dieSize, clusterKey]
  );

  return (
    <div
      className="relative mx-auto"
      style={{
        width,
        height,
        filter: rolling ? undefined : 'drop-shadow(0 6px 18px rgba(0,0,0,0.45))',
      }}
    >
      {dice.map((val, i) => {
        const pos = positions[i];
        if (!pos) return null;
        return (
          <div
            key={i}
            className={`absolute ${rolling ? `rolling-die-${i % 5}` : ''}`}
            style={{
              left: pos.x,
              top: pos.y,
              transform: rolling ? undefined : `translate(-50%, -50%) rotate(${pos.rotation}deg) scale(${pos.scale})`,
            }}
          >
            <Die
              value={val}
              size={dieSize}
              hidden={hidden}
              rolling={false}
              staggerIndex={i}
              revealed={revealed}
            />
          </div>
        );
      })}
    </div>
  );
}
