import { useEffect, useRef, useCallback } from 'react';

/**
 * Request iOS DeviceMotion permission.
 * Must be called from a user gesture (tap/click handler).
 * Returns true if granted or not needed.
 */
export async function requestMotionPermission() {
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function'
  ) {
    try {
      const result = await DeviceMotionEvent.requestPermission();
      return result === 'granted';
    } catch {
      return false;
    }
  }
  return true; // Android / desktop — no permission needed
}

/**
 * Custom hook: detect phone shake via DeviceMotionEvent.
 * @param {Function} onShake - callback when shake detected
 * @param {boolean} enabled - whether detection is active
 */
export function useShakeDetection(onShake, enabled = true) {
  const lastShakeTime = useRef(0);
  const lastAccel = useRef({ x: 0, y: 0, z: 0 });
  const stableOnShake = useRef(onShake);
  stableOnShake.current = onShake;

  useEffect(() => {
    if (!enabled) return;

    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const delta =
        Math.abs((acc.x || 0) - lastAccel.current.x) +
        Math.abs((acc.y || 0) - lastAccel.current.y) +
        Math.abs((acc.z || 0) - lastAccel.current.z);

      const now = Date.now();
      if (delta > 15 && now - lastShakeTime.current > 1500) {
        lastShakeTime.current = now;
        stableOnShake.current();
      }

      lastAccel.current = {
        x: acc.x || 0,
        y: acc.y || 0,
        z: acc.z || 0,
      };
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [enabled]);
}
