import { useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { useRules } from '../contexts/RuleContext';
import Header from './Header';
import Button from './Button';

function OptionRow({ label, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-accent-gold/5">
      <span className="text-text-secondary text-sm">{label}</span>
      <div className="flex gap-1">{children}</div>
    </div>
  );
}

function Chip({ selected, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-sm transition-all border ${
        selected
          ? 'bg-accent-red/20 border-accent-red text-accent-gold'
          : 'bg-bg-deep border-text-muted/20 text-text-muted hover:border-accent-gold/30'
      }`}
    >
      {children}
    </button>
  );
}

export default function RuleSetup({ mode, onBack, onStart }) {
  const { t } = useLang();
  const { rules, setRules, presets, savePreset, loadPreset } = useRules();
  const [showExplainer, setShowExplainer] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const update = (key, val) => setRules((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen flex flex-col bg-bg-deep texture-overlay">
      <Header title={t('ruleSetup.title')} onBack={onBack} />

      <main className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="max-w-sm mx-auto space-y-1">
          {/* Player count — dice cup mode only */}
          {mode === 'diceCup' && (
            <OptionRow label={t('ruleSetup.playerCount')}>
              {[2, 3, 4, 5, 6].map((n) => (
                <Chip key={n} selected={rules.playerCount === n} onClick={() => update('playerCount', n)}>
                  {n}
                </Chip>
              ))}
            </OptionRow>
          )}

          {/* Difficulty — single mode only */}
          {mode === 'single' && (
            <OptionRow label={t('ruleSetup.difficulty')}>
              {['easy', 'medium', 'hard'].map((d) => (
                <Chip key={d} selected={rules.difficulty === d} onClick={() => update('difficulty', d)}>
                  {t(`ruleSetup.${d}`)}
                </Chip>
              ))}
            </OptionRow>
          )}

          <OptionRow label={t('ruleSetup.wildMode')}>
            <Chip selected={rules.wildMode === 'fei'} onClick={() => update('wildMode', 'fei')}>
              {t('ruleSetup.wildFei')}
            </Chip>
            <Chip selected={rules.wildMode === 'zhai'} onClick={() => update('wildMode', 'zhai')}>
              {t('ruleSetup.wildZhai')}
            </Chip>
          </OptionRow>

          {rules.wildMode === 'zhai' && (
            <OptionRow label={t('ruleSetup.zhaiReduction')}>
              <Chip selected={rules.zhaiReduction === 'none'} onClick={() => update('zhaiReduction', 'none')}>
                {t('ruleSetup.zhaiNone')}
              </Chip>
              <Chip selected={rules.zhaiReduction === 'half'} onClick={() => update('zhaiReduction', 'half')}>
                {t('ruleSetup.zhaiHalf')}
              </Chip>
            </OptionRow>
          )}

          <OptionRow label={t('ruleSetup.shunzi')}>
            <Chip selected={rules.shunzi} onClick={() => update('shunzi', true)}>
              {t('ruleSetup.shunziOn')}
            </Chip>
            <Chip selected={!rules.shunzi} onClick={() => update('shunzi', false)}>
              {t('ruleSetup.shunziOff')}
            </Chip>
          </OptionRow>

          <OptionRow label={t('ruleSetup.baozi')}>
            <Chip selected={rules.baozi} onClick={() => update('baozi', true)}>
              {t('ruleSetup.baoziOn')}
            </Chip>
            <Chip selected={!rules.baozi} onClick={() => update('baozi', false)}>
              {t('ruleSetup.baoziOff')}
            </Chip>
          </OptionRow>

          {/* Presets */}
          <div className="pt-4 space-y-2">
            <div className="flex gap-2">
              <input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder={t('ruleSetup.presetName')}
                className="flex-1 bg-bg-elevated border border-text-muted/20 rounded-md px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-gold/40 outline-none"
              />
              <Button
                variant="gold"
                size="sm"
                disabled={!presetName.trim()}
                onClick={() => { savePreset(presetName.trim()); setPresetName(''); }}
              >
                {t('ruleSetup.savePreset')}
              </Button>
            </div>

            {presets.length > 0 && (
              <div>
                <button
                  onClick={() => setShowPresets((s) => !s)}
                  className="text-sm text-accent-gold/70 hover:text-accent-gold transition-colors"
                >
                  {t('ruleSetup.loadPreset')} ({presets.length})
                </button>
                {showPresets && (
                  <div className="mt-2 space-y-1">
                    {presets.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => { loadPreset(p.name); setShowPresets(false); }}
                        className="block w-full text-left px-3 py-2 rounded bg-bg-elevated text-text-secondary text-sm hover:text-accent-gold hover:bg-bg-elevated/80 transition-colors"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rule explainer */}
          <div className="pt-2">
            <button
              onClick={() => setShowExplainer((s) => !s)}
              className="text-sm text-text-muted hover:text-accent-gold transition-colors flex items-center gap-1"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v4M8 11v0.5" />
              </svg>
              {t('ruleSetup.rulesExplainer')}
            </button>
            {showExplainer && (
              <div className="mt-2 p-3 rounded-lg bg-bg-elevated text-text-secondary text-xs leading-relaxed space-y-2 border border-accent-gold/5">
                <p><strong className="text-accent-gold">飞 (Fei):</strong> 1 = wild. Counts as any value.</p>
                <p><strong className="text-accent-gold">斋 (Zhai):</strong> No wilds. Pure probability.</p>
                <p><strong className="text-accent-gold">顺子 (Shunzi):</strong> Straight (1-5 or 2-6).</p>
                <p><strong className="text-accent-gold">豹子 (Baozi):</strong> All dice same value.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Start button */}
      <div className="p-4 border-t border-accent-gold/10">
        <Button fullWidth size="lg" onClick={() => onStart(rules)}>
          {t('ruleSetup.startGame')}
        </Button>
      </div>
    </div>
  );
}
