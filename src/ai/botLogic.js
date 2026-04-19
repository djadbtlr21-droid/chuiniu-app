import { probCallIsTrue } from '../utils/probability';

const TAUNTS_ZH = [
  '哈哈，不信就开啊！',
  '我手气今天不错',
  '你确定吗？',
  '敢不敢跟？',
  '来来来，继续！',
  '这把我稳了',
  '你在吹牛吧？',
  '开不开？',
];

const TAUNTS_KO = [
  '하하, 못 믿겠으면 까봐!',
  '오늘 운이 좋은데~',
  '확실해?',
  '따라올 수 있어?',
  '자자자, 계속!',
  '이번엔 내가 이겼다',
  '허풍 치는 거지?',
  '까볼래?',
];

function pickRandomTaunt(lang) {
  const taunts = lang === 'zh' ? TAUNTS_ZH : TAUNTS_KO;
  return taunts[Math.floor(Math.random() * taunts.length)];
}

/**
 * Find valid raises above the current call, respecting first-call minimums.
 */
function getValidRaises(currentCall, maxCount, isFirstCall) {
  const raises = [];
  if (!currentCall) {
    // First call: value 1 needs count >= 2, values 2-6 need count >= 3
    if (isFirstCall) {
      for (let c = 2; c <= maxCount; c++) {
        raises.push({ count: c, value: 1 });
      }
      for (let c = 3; c <= maxCount; c++) {
        for (let v = 2; v <= 6; v++) {
          raises.push({ count: c, value: v });
        }
      }
    } else {
      for (let v = 1; v <= 6; v++) {
        raises.push({ count: 1, value: v });
      }
    }
    return raises;
  }
  const { count, value } = currentCall;
  for (let v = value + 1; v <= 6; v++) {
    raises.push({ count, value: v });
  }
  for (let c = count + 1; c <= maxCount; c++) {
    for (let v = 1; v <= 6; v++) {
      raises.push({ count: c, value: v });
    }
  }
  return raises;
}

function pickBestRaise(state, bluffChance) {
  const { ownDice, currentCall, totalDice, wildOn, wildActive = true, isFirstCall = false } = state;
  const maxCount = totalDice;
  const raises = getValidRaises(currentCall, maxCount, isFirstCall);

  if (raises.length === 0) return null;

  const scored = raises.map((r) => ({
    ...r,
    prob: probCallIsTrue(ownDice, r, totalDice, wildOn, wildActive),
  }));

  const reasonable = scored.filter((r) => r.prob > 0.3);
  const pool = reasonable.length > 0 ? reasonable : scored.slice(0, 3);

  if (Math.random() < bluffChance && scored.length > 3) {
    const bluffPool = scored.filter((r) => r.prob > 0.1 && r.prob < 0.4);
    if (bluffPool.length > 0) {
      return bluffPool[Math.floor(Math.random() * bluffPool.length)];
    }
  }

  pool.sort((a, b) => b.prob - a.prob);
  const topN = Math.min(3, pool.length);
  return pool[Math.floor(Math.random() * topN)];
}

const THRESHOLDS = { easy: 0.35, medium: 0.45, hard: 0.55 };
const BLUFF_CHANCE = { easy: 0.0, medium: 0.1, hard: 0.2 };

function probabilityMove(difficulty, state) {
  const { currentCall, ownDice, totalDice, wildOn, wildActive = true, isFirstCall = false } = state;

  if (!currentCall) {
    const raise = pickBestRaise(state, BLUFF_CHANCE[difficulty]);
    return {
      action: 'call',
      call: raise || { count: 3, value: 2 },
      taunt: pickRandomTaunt(state.lang || 'zh'),
    };
  }

  const pTrue = probCallIsTrue(ownDice, currentCall, totalDice, wildOn, wildActive);
  const threshold = THRESHOLDS[difficulty] || THRESHOLDS.medium;

  if (pTrue < threshold) {
    return {
      action: 'challenge',
      taunt: pickRandomTaunt(state.lang || 'zh'),
    };
  }

  const raise = pickBestRaise(state, BLUFF_CHANCE[difficulty]);
  if (!raise) {
    return {
      action: 'challenge',
      taunt: pickRandomTaunt(state.lang || 'zh'),
    };
  }

  return {
    action: 'call',
    call: raise,
    taunt: pickRandomTaunt(state.lang || 'zh'),
  };
}

async function geminiMove() {
  throw new Error('Gemini AI not implemented — Phase 2 feature');
}

export async function getBotMove(difficulty, state) {
  if (difficulty === 'gemini') return await geminiMove(state);
  return probabilityMove(difficulty, state);
}
