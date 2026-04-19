import Die from './Die';

export default function DiceSortedCount({ dice, highlightValue, wildActive = true, wildOn = false }) {
  if (!dice || dice.length === 0) return null;

  const counts = dice.reduce((acc, v) => {
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});
  const sorted = Object.keys(counts).sort((a, b) => +a - +b);

  return (
    <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
      {sorted.map((value) => {
        const v = +value;
        const isMatch = highlightValue !== undefined && (
          v === highlightValue ||
          (wildOn && wildActive && v === 1 && highlightValue !== 1)
        );
        return (
          <div key={value} className="flex items-center gap-1">
            <div className={isMatch ? 'die-highlight rounded-xl' : ''}>
              <Die value={v} size={32} />
            </div>
            <span className="text-accent-gold font-bold text-lg">
              x{counts[value]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
