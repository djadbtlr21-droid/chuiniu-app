/** Binomial coefficient C(n, k) */
function binomCoeff(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return result;
}

/** P(X >= k) where X ~ Binomial(n, p) */
export function probAtLeastK(n, k, p) {
  if (k <= 0) return 1;
  if (k > n) return 0;
  let sum = 0;
  for (let i = 0; i < k; i++) {
    sum += binomCoeff(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i);
  }
  return 1 - sum;
}

/**
 * Probability that a call is true given own dice and game state.
 * @param {number[]} ownDice
 * @param {{ count: number, value: number }} call
 * @param {number} totalDice
 * @param {boolean} wildOn - fei mode enabled
 * @param {boolean} [wildActive=true] - whether wild is currently active (false after explicit 1-call)
 */
export function probCallIsTrue(ownDice, call, totalDice, wildOn, wildActive = true) {
  const { count, value } = call;
  const useWild = wildOn && wildActive && value !== 1;
  const ownCount = ownDice.filter(
    (d) => d === value || (useWild && d === 1)
  ).length;
  const needed = Math.max(0, count - ownCount);
  const unknownDice = totalDice - ownDice.length;
  const p = useWild ? 2 / 6 : 1 / 6;
  return probAtLeastK(unknownDice, needed, p);
}

/** Roll n dice, returning array of values 1-6 */
export function rollDice(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 6) + 1);
}

/** Check if a call is satisfied by the actual dice on the table */
export function isCallTrue(allDice, call, wildOn, wildActive = true) {
  const { count, value } = call;
  const useWild = wildOn && wildActive && value !== 1;
  const actual = allDice.filter(
    (d) => d === value || (useWild && d === 1)
  ).length;
  return actual >= count;
}
