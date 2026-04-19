import { useState, useEffect, useRef, useCallback } from 'react';
import { useLang } from '../contexts/LangContext';
import { rollDice } from '../utils/probability';
import { useShakeDetection, requestMotionPermission } from '../utils/useShakeDetection';
import { playDiceShuffle } from '../utils/sounds';
import Header from './Header';
import Button from './Button';
import DiceCluster from './DiceCluster';
import DiceSortedCount from './DiceSortedCount';

/* ── Cover curtain (top 15% — dome/arch shape via SVG) ── */
function CoverCurtain({ t }) {
  return (
    <div className="relative w-full flex-shrink-0" style={{ height: '15vh' }}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="curtainGrad" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor="#8B0000" stopOpacity="1" />
            <stop offset="60%" stopColor="#8B0000" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8B0000" stopOpacity="0.15" />
          </radialGradient>
        </defs>
        <path
          d="M 0,0 L 100,0 L 100,55 Q 50,110 0,55 Z"
          fill="url(#curtainGrad)"
          stroke="#C8102E"
          strokeWidth="0.5"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-10">
        <svg className="w-8 h-8 text-text-primary/70 mb-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11 1C9.9 1 9 1.9 9 3V11.5C9 11.8 8.8 12 8.5 12S8 11.8 8 11.5V5C8 3.9 7.1 3 6 3S4 3.9 4 5V15C4 19.4 7.6 23 12 23S20 19.4 20 15V8C20 6.9 19.1 6 18 6S16 6.9 16 8V11.5C16 11.8 15.8 12 15.5 12S15 11.8 15 11.5V3C15 1.9 14.1 1 13 1S11 1.9 11 3Z" />
        </svg>
        <p className="text-text-primary font-bold text-base text-center">
          {t('diceCup.coverTip')}
        </p>
        <p className="text-text-secondary text-xs text-center mt-0.5">
          {t('diceCup.coverSubtext')}
        </p>
      </div>
    </div>
  );
}

export default function DiceCupMode({ rules, onBack }) {
  const { t } = useLang();
  const [dice, setDice] = useState(() => rollDice(5));
  const [rolling, setRolling] = useState(false);
  const [clusterKey, setClusterKey] = useState(Date.now());
  const wakeLockRef = useRef(null);
  const motionDone = useRef(false);

  // Wake Lock
  useEffect(() => {
    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch {}
    }
    requestWakeLock();
    return () => { wakeLockRef.current?.release(); };
  }, []);

  const doShuffle = useCallback(() => {
    if (rolling) return;
    setDice(rollDice(5));
    setClusterKey(Date.now());
    setRolling(true);
    playDiceShuffle();
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    setTimeout(() => setRolling(false), 1500);
  }, [rolling]);

  useShakeDetection(doShuffle, true);

  const handleFirstTap = async () => {
    if (!motionDone.current) {
      motionDone.current = true;
      await requestMotionPermission();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-deep texture-overlay" onClick={handleFirstTap}>
      <Header title={t('diceCup.title')} onBack={onBack} />

      {/* Cover curtain */}
      <CoverCurtain t={t} />

      {/* Dice area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="table-surface rounded-2xl p-3 gold-border-frame w-full max-w-[320px]">
          <DiceCluster
            dice={dice}
            rolling={rolling}
            dieSize={56}
            width={294}
            height={189}
            clusterKey={clusterKey}
          />
        </div>

        <DiceSortedCount dice={dice} />
      </main>

      {/* Single shuffle button */}
      <div className="px-4 py-4 border-t border-accent-gold/10">
        <Button fullWidth size="lg" variant="gold" onClick={doShuffle}>
          {t('singlePlay.shake')}
        </Button>
      </div>
    </div>
  );
}
