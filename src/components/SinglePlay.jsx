import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLang } from '../contexts/LangContext';
import { rollDice, isCallTrue } from '../utils/probability';
import { getBotMove } from '../ai/botLogic';
import { useShakeDetection, requestMotionPermission } from '../utils/useShakeDetection';
import { playDiceShuffle } from '../utils/sounds';
import Header from './Header';
import Button from './Button';
import Die from './Die';
import DiceCluster from './DiceCluster';
import DiceSortedCount from './DiceSortedCount';

/* ── Result Die with optional highlight ── */
function ResultDie({ value, callValue, wildOn, wildActive, size = 48, staggerIndex = 0 }) {
  const isMatch = value === callValue ||
    (wildOn && wildActive && value === 1 && callValue !== 1);
  return (
    <div className={isMatch ? 'die-highlight rounded-xl' : ''}>
      <Die value={value} size={size} staggerIndex={staggerIndex} revealed />
    </div>
  );
}

/* ── Call Picker with first-call minimums ── */
function CallPicker({ currentCall, totalDice, onCall, t, isFirstCall, wildActive, wildOn }) {
  const defaultQty = isFirstCall ? 3 : (currentCall ? currentCall.count : 2);
  const [qty, setQty] = useState(defaultQty);
  const [val, setVal] = useState(
    currentCall ? (currentCall.value < 6 ? currentCall.value + 1 : 1) : 2
  );

  useEffect(() => {
    if (currentCall) {
      setQty(currentCall.count);
      setVal(currentCall.value < 6 ? currentCall.value + 1 : 1);
    }
  }, [currentCall]);

  // Auto-adjust qty to meet first-call minimum when value changes
  useEffect(() => {
    if (isFirstCall) {
      const min = val === 1 ? 2 : 3;
      if (qty < min) setQty(min);
    }
  }, [val, isFirstCall, qty]);

  const getMinQty = () => {
    if (isFirstCall) return val === 1 ? 2 : 3;
    return 1;
  };

  const isValid = () => {
    const minQty = getMinQty();
    if (qty < minQty) return false;
    if (!currentCall) return qty >= minQty && val >= 1 && val <= 6;
    return qty > currentCall.count || (qty === currentCall.count && val > currentCall.value);
  };

  const firstCallHint = isFirstCall
    ? (val === 1 ? t('singlePlay.firstCallMin1') : t('singlePlay.firstCallMin3'))
    : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setQty((q) => Math.max(getMinQty(), q - 1))}
            className="w-10 h-10 rounded-lg bg-bg-elevated border border-text-muted/20 text-text-primary text-lg font-bold active:scale-90 transition-transform"
          >-</button>
          <span className="w-10 text-center font-mono text-2xl font-bold text-accent-gold">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(totalDice, q + 1))}
            className="w-10 h-10 rounded-lg bg-bg-elevated border border-text-muted/20 text-text-primary text-lg font-bold active:scale-90 transition-transform"
          >+</button>
        </div>
        <span className="text-accent-gold text-2xl font-title">x</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((v) => (
            <button
              key={v}
              onClick={() => setVal(v)}
              className={`w-10 h-10 rounded-lg text-base font-bold transition-all active:scale-90 ${
                val === v
                  ? 'bg-accent-red text-white border-accent-red'
                  : 'bg-bg-elevated text-text-secondary border-text-muted/20'
              } border`}
            >{v}</button>
          ))}
        </div>
      </div>
      {firstCallHint && (
        <p className="text-accent-gold/70 text-xs text-center">{firstCallHint}</p>
      )}
      <Button
        fullWidth size="lg"
        disabled={!isValid()}
        onClick={() => onCall({ count: qty, value: val })}
      >
        {t('singlePlay.callSubmit')} {qty} x {val}
      </Button>
    </div>
  );
}

/* ══════════════════════════════════════════════════ */
export default function SinglePlay({ rules, onBack }) {
  const { lang, t } = useLang();
  const wildOn = rules.wildMode === 'fei';

  const [playerDice, setPlayerDice] = useState([]);
  const [botDice, setBotDice] = useState([]);
  const [currentCall, setCurrentCall] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [turn, setTurn] = useState('player');
  const [phase, setPhase] = useState('rolling');
  const [rolling, setRolling] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [round, setRound] = useState(1);
  const [clusterKey, setClusterKey] = useState(1);

  // Wild deactivation + first-call tracking
  const [wildActive, setWildActive] = useState(wildOn);
  const [isFirstCall, setIsFirstCall] = useState(true);

  // Speech bubbles (AI + Player)
  const [aiBubble, setAiBubble] = useState({ text: '', visible: false });
  const [playerBubble, setPlayerBubble] = useState({ text: '', visible: false });
  const aiBubbleTimer = useRef(null);
  const playerBubbleTimer = useRef(null);

  // Shake hint
  const [showShakeHint, setShowShakeHint] = useState(
    () => !localStorage.getItem('chuiniu_shakeHintDismissed')
  );
  const motionPermissionDone = useRef(false);

  const totalDice = 10;

  const roundTitle = lang === 'zh'
    ? `${t('singlePlay.round')}${round}局`
    : `${t('singlePlay.round')} ${round}`;

  /* ── Bubble helpers ── */
  const showAiBubble = (text) => {
    if (aiBubbleTimer.current) clearTimeout(aiBubbleTimer.current);
    setAiBubble({ text, visible: true });
    aiBubbleTimer.current = setTimeout(() => setAiBubble((b) => ({ ...b, visible: false })), 2000);
  };

  const showPlayerBubble = (text) => {
    if (playerBubbleTimer.current) clearTimeout(playerBubbleTimer.current);
    setPlayerBubble({ text, visible: true });
    playerBubbleTimer.current = setTimeout(() => setPlayerBubble((b) => ({ ...b, visible: false })), 2000);
  };

  /* ── Round lifecycle ── */
  const startRound = useCallback(() => {
    setRolling(true);
    setCurrentCall(null);
    setCallHistory([]);
    setAiBubble({ text: '', visible: false });
    setPlayerBubble({ text: '', visible: false });
    setRoundResult(null);
    setClusterKey(Date.now());
    setWildActive(wildOn);
    setIsFirstCall(true);
    playDiceShuffle();

    setTimeout(() => {
      setPlayerDice(rollDice(5));
      setBotDice(rollDice(5));
      setRolling(false);
      setPhase('playing');
      setTurn('player');
    }, 1500);
  }, [wildOn]);

  useEffect(() => {
    if (phase === 'rolling') startRound();
  }, [phase, startRound]);

  /* ── Shake / Shuffle ── */
  const handleShake = useCallback(() => {
    if (phase !== 'playing' || rolling) return;
    setRolling(true);
    setClusterKey(Date.now());
    playDiceShuffle();
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    setTimeout(() => {
      setPlayerDice(rollDice(5));
      setBotDice(rollDice(5));
      setRolling(false);
    }, 1500);
  }, [phase, rolling]);

  useShakeDetection(handleShake, phase === 'playing');

  const handleFirstTap = async () => {
    if (!motionPermissionDone.current) {
      motionPermissionDone.current = true;
      await requestMotionPermission();
    }
  };

  /* ── Game actions ── */
  const addToHistory = (who, action, call) => {
    setCallHistory((prev) => [...prev, { who, action, call }].slice(-5));
  };

  const handlePlayerCall = (call) => {
    // Wild deactivation on explicit 1-call
    if (call.value === 1 && wildOn) setWildActive(false);
    setIsFirstCall(false);

    setCurrentCall(call);
    addToHistory('player', 'call', call);
    showPlayerBubble(`${call.count} x ${call.value}`);
    setTurn('bot');

    setTimeout(() => playDiceShuffle(400), 500);

    setTimeout(async () => {
      const state = {
        ownDice: botDice,
        currentCall: call,
        totalDice: 10,
        wildOn,
        wildActive: call.value === 1 && wildOn ? false : wildActive,
        isFirstCall: false,
        lang,
      };
      const move = await getBotMove(rules.difficulty, state);

      if (move.action === 'challenge') {
        showAiBubble(move.taunt || t('singlePlay.challenge'));
        addToHistory('bot', 'challenge', null);
        resolveChallenge('bot', call);
      } else {
        if (move.call.value === 1 && wildOn) setWildActive(false);
        setCurrentCall(move.call);
        addToHistory('bot', 'call', move.call);
        showAiBubble(`${move.call.count} x ${move.call.value}`);
        setTurn('player');
      }
    }, 1000 + Math.random() * 1000);
  };

  const handlePlayerChallenge = () => {
    addToHistory('player', 'challenge', null);
    resolveChallenge('player', currentCall);
  };

  const resolveChallenge = (challenger, call) => {
    const allDice = [...playerDice, ...botDice];
    const callTrue = isCallTrue(allDice, call, wildOn, wildActive);
    const callerIsBot = challenger === 'player';
    const loser = callTrue ? challenger : callerIsBot ? 'bot' : 'player';
    setRoundResult({ challenger, call, callTrue, allDice, loser, wildActive });
    setPhase('result');
  };

  const nextRound = () => {
    setRound((r) => r + 1);
    setPhase('rolling');
  };

  const dismissShakeHint = () => {
    setShowShakeHint(false);
    localStorage.setItem('chuiniu_shakeHintDismissed', '1');
  };

  const allDiceCounts = useMemo(() => {
    if (!roundResult) return {};
    return roundResult.allDice.reduce((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {});
  }, [roundResult]);

  return (
    <div className="min-h-screen flex flex-col bg-bg-deep texture-overlay" onClick={handleFirstTap}>
      <Header title={roundTitle} onBack={onBack} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ── Opponent zone ── */}
        <div className="px-4 pt-2 pb-1 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-accent-redDark flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="#D4AF37">
                <circle cx="8" cy="5" r="3" />
                <path d="M3 14c0-3 2-5 5-5s5 2 5 5" />
              </svg>
            </div>
            <span className="text-text-primary text-sm font-bold">{t('singlePlay.opponent')}</span>
          </div>

          <div className="table-surface rounded-xl px-2 pt-2 pb-1 gold-border-frame relative">
            <DiceCluster
              dice={Array(5).fill(0)} hidden rolling={rolling}
              dieSize={44} width={273} height={137} clusterKey={clusterKey + 7777}
            />
            {/* AI speech bubble (calls + taunts) */}
            {aiBubble.visible && (
              <div className="speech-bubble taunt-fade-in mx-auto mt-1 mb-1 max-w-[260px]">
                <p className="text-text-primary text-xl font-bold text-center font-zh leading-snug">
                  {aiBubble.text}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Wild deactivated banner ── */}
        {wildOn && !wildActive && phase === 'playing' && (
          <div className="mx-4 mt-1 px-3 py-1 rounded bg-accent-gold/15 border border-accent-gold/30 text-center">
            <span className="text-accent-goldLight text-xs font-bold">{t('singlePlay.wildDeactivated')}</span>
          </div>
        )}

        {/* ── Call history ── */}
        <div className="px-4 py-1.5 flex-shrink-0">
          <div className="space-y-1 max-h-[100px] overflow-y-auto">
            {callHistory.slice(-4).map((entry, i) => (
              <div key={i} className={`text-base leading-relaxed px-3 py-1.5 rounded-lg ${
                entry.who === 'player' ? 'bg-accent-red/10 text-text-primary' : 'bg-bg-elevated text-text-secondary'
              }`}>
                <span className="font-bold">
                  {entry.who === 'player' ? t('singlePlay.player') : t('singlePlay.bot')}:
                </span>{' '}
                {entry.action === 'challenge'
                  ? t('singlePlay.challenge')
                  : `${entry.call.count} x ${entry.call.value}`}
              </div>
            ))}
          </div>
        </div>

        {/* ── Player dice zone ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
          <p className="text-text-muted text-xs uppercase tracking-widest mb-1">
            {t('singlePlay.yourDice')}
          </p>

          {/* Player call bubble (above cluster) */}
          {playerBubble.visible && (
            <div className="speech-bubble-down taunt-fade-in mx-auto mb-2 max-w-[200px]">
              <p className="text-text-primary text-xl font-bold text-center leading-snug">
                {playerBubble.text}
              </p>
            </div>
          )}

          <div className="table-surface rounded-2xl p-3 gold-border-frame w-full max-w-[320px]">
            <DiceCluster
              dice={playerDice} rolling={rolling}
              dieSize={56} width={294} height={189} clusterKey={clusterKey}
            />
          </div>

          {playerDice.length > 0 && <DiceSortedCount dice={playerDice} />}

          {showShakeHint && phase === 'playing' && (
            <div onClick={dismissShakeHint}
              className="mt-3 px-4 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/20 text-text-secondary text-sm text-center cursor-pointer">
              {t('singlePlay.shakeHint')}
            </div>
          )}

          {phase === 'playing' && turn === 'bot' && (
            <div className="mt-3 px-4 py-2 rounded-lg bg-bg-elevated/80 border border-accent-gold/15">
              <p className="text-text-muted text-sm animate-pulse text-center">{t('singlePlay.opponent')}...</p>
            </div>
          )}
        </div>

        {/* ── Bottom action bar ── */}
        {phase === 'playing' && turn === 'player' && (
          <div className="flex-shrink-0 px-4 py-3 border-t border-accent-gold/10 bg-bg-surface/90 backdrop-blur-sm space-y-2">
            <CallPicker
              currentCall={currentCall} totalDice={totalDice}
              onCall={handlePlayerCall} t={t}
              isFirstCall={isFirstCall} wildActive={wildActive} wildOn={wildOn}
            />
            <div className="flex gap-2">
              <Button variant="gold" size="lg" onClick={handleShake} className="flex-1">
                {t('singlePlay.shake')}
              </Button>
              {currentCall && (
                <Button variant="danger" size="lg" onClick={handlePlayerChallenge} className="flex-[2]">
                  开 {t('singlePlay.challengeOpen')}
                </Button>
              )}
            </div>
          </div>
        )}

        {phase === 'playing' && turn === 'bot' && <div className="flex-shrink-0 h-4" />}
      </main>

      {/* ═══════ Result overlay ═══════ */}
      {phase === 'result' && roundResult && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-surface border border-accent-gold/20 rounded-xl p-5 max-w-sm w-full gold-border-frame overflow-y-auto max-h-[90vh]">
            <h3 className="text-accent-gold font-title text-xl text-center mb-4">
              {t('singlePlay.challengeResult')}
            </h3>

            {/* AI dice row — highlighted */}
            <div className="mb-3">
              <p className="text-text-muted text-xs mb-1.5 uppercase tracking-wider">{t('singlePlay.opponentDice')}</p>
              <div className="flex gap-2 justify-center">
                {botDice.map((v, i) => (
                  <ResultDie key={i} value={v} callValue={roundResult.call.value}
                    wildOn={wildOn} wildActive={roundResult.wildActive} size={48} staggerIndex={i} />
                ))}
              </div>
            </div>

            {/* Player dice row — highlighted */}
            <div className="mb-3">
              <p className="text-text-muted text-xs mb-1.5 uppercase tracking-wider">{t('singlePlay.myDice')}</p>
              <div className="flex gap-2 justify-center">
                {playerDice.map((v, i) => (
                  <ResultDie key={i} value={v} callValue={roundResult.call.value}
                    wildOn={wildOn} wildActive={roundResult.wildActive} size={48} staggerIndex={i + 5} />
                ))}
              </div>
            </div>

            {/* Combined count — highlighted */}
            <div className="mb-4 pt-3 border-t border-accent-gold/10">
              <p className="text-text-muted text-xs mb-1.5 uppercase tracking-wider text-center">{t('singlePlay.totalCount')}</p>
              <DiceSortedCount dice={roundResult.allDice}
                highlightValue={roundResult.call.value}
                wildOn={wildOn} wildActive={roundResult.wildActive} />
            </div>

            {/* Call vs actual */}
            <div className="text-center mb-4 py-3 border-t border-accent-gold/10">
              <p className="text-text-secondary text-sm">
                {t('singlePlay.theCall')}: {roundResult.call.count} x {roundResult.call.value}
              </p>
              <p className="text-text-secondary text-sm">
                {t('singlePlay.actualCount')}: {roundResult.call.value}{' '}
                → {allDiceCounts[roundResult.call.value] || 0}{t('singlePlay.countUnit')}
                {wildOn && roundResult.wildActive && roundResult.call.value !== 1 && (
                  <span className="text-text-muted"> (+1: {allDiceCounts[1] || 0})</span>
                )}
              </p>
            </div>

            {/* Win/Lose */}
            <div className="text-center mb-5">
              {roundResult.loser !== 'player' ? (
                <p className="text-3xl font-bold text-accent-gold gold-glow font-title">{t('singlePlay.youWin')}</p>
              ) : (
                <p className="text-2xl font-bold text-accent-red">{t('singlePlay.youLose')}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button fullWidth size="lg" onClick={nextRound}>{t('singlePlay.nextRound')}</Button>
              <Button variant="ghost" size="sm" onClick={onBack} className="flex-shrink-0 text-sm px-3">
                {t('singlePlay.show')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
