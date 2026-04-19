import Die from './Die';

export default function DiceCup({ dice, hidden = false, rolling = false, onReveal, size = 48 }) {
  return (
    <div
      className={`relative p-4 rounded-2xl border border-accent-gold/20 ${
        rolling ? 'die-shake' : ''
      }`}
      style={{
        background: 'linear-gradient(180deg, rgba(42,24,24,0.9) 0%, rgba(26,15,15,0.95) 100%)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.1)',
      }}
      onClick={onReveal}
    >
      {/* Gold corner decorations */}
      <div className="corner-deco top-0 left-0" />
      <div className="corner-deco top-0 right-0 rotate-90" />
      <div className="corner-deco bottom-0 right-0 rotate-180" />
      <div className="corner-deco bottom-0 left-0 -rotate-90" />

      <div className="flex gap-2 justify-center flex-wrap">
        {dice.map((val, i) => (
          <Die key={i} value={val} hidden={hidden} size={size} rolling={rolling} />
        ))}
      </div>
    </div>
  );
}
