import { createContext, useContext, useState, useCallback } from 'react';

const DEFAULT_RULES = {
  playerCount: 3,
  startingDice: 5,
  wildMode: 'fei',
  zhaiReduction: 'none',
  shunzi: true,
  baozi: true,
  firstCallMin: '2',
  difficulty: 'medium',
};

const RuleContext = createContext();

function loadLastRules() {
  try {
    const saved = localStorage.getItem('chuiniu_lastRules');
    return saved ? { ...DEFAULT_RULES, ...JSON.parse(saved) } : { ...DEFAULT_RULES };
  } catch {
    return { ...DEFAULT_RULES };
  }
}

function loadPresets() {
  try {
    const saved = localStorage.getItem('chuiniu_presets');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function RuleProvider({ children }) {
  const [rules, setRulesState] = useState(loadLastRules);
  const [presets, setPresetsState] = useState(loadPresets);

  const setRules = useCallback((updater) => {
    setRulesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('chuiniu_lastRules', JSON.stringify(next));
      return next;
    });
  }, []);

  const savePreset = useCallback(
    (name) => {
      setPresetsState((prev) => {
        const next = [...prev.filter((p) => p.name !== name), { name, rules: { ...rules } }];
        localStorage.setItem('chuiniu_presets', JSON.stringify(next));
        return next;
      });
    },
    [rules]
  );

  const loadPreset = useCallback(
    (name) => {
      const preset = presets.find((p) => p.name === name);
      if (preset) setRules(preset.rules);
    },
    [presets, setRules]
  );

  const deletePreset = useCallback((name) => {
    setPresetsState((prev) => {
      const next = prev.filter((p) => p.name !== name);
      localStorage.setItem('chuiniu_presets', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <RuleContext.Provider
      value={{ rules, setRules, presets, savePreset, loadPreset, deletePreset }}
    >
      {children}
    </RuleContext.Provider>
  );
}

export function useRules() {
  return useContext(RuleContext);
}
