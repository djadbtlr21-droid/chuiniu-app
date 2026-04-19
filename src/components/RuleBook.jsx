import { useLang } from '../contexts/LangContext';
import Header from './Header';

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="font-title text-accent-gold text-lg mb-2 border-b border-accent-gold/10 pb-1">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function RuleBook({ onBack }) {
  const { t } = useLang();
  const expressions = t('ruleBook.expressionsList');

  return (
    <div className="min-h-screen flex flex-col bg-bg-deep texture-overlay">
      <Header title={t('ruleBook.title')} onBack={onBack} />

      <main className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="max-w-sm mx-auto">
          <Section title={t('ruleBook.basicRules')}>
            <p className="text-text-secondary text-sm leading-relaxed">
              {t('ruleBook.basicRulesText')}
            </p>
          </Section>

          <Section title={t('ruleBook.callingFormat')}>
            <p className="text-text-secondary text-sm leading-relaxed">
              {t('ruleBook.callingFormatText')}
            </p>
          </Section>

          <Section title={t('ruleBook.feiVsZhai')}>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-bg-surface border border-accent-red/10">
                <p className="text-accent-gold text-sm font-bold mb-1">飞 (Fei)</p>
                <p className="text-text-secondary text-xs leading-relaxed">
                  {t('ruleBook.feiText')}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-bg-surface border border-accent-gold/10">
                <p className="text-accent-gold text-sm font-bold mb-1">斋 (Zhai)</p>
                <p className="text-text-secondary text-xs leading-relaxed">
                  {t('ruleBook.zhaiText')}
                </p>
              </div>
            </div>
          </Section>

          <Section title={t('ruleBook.shunziExplain')}>
            <p className="text-text-secondary text-sm leading-relaxed">
              {t('ruleBook.shunziText')}
            </p>
          </Section>

          <Section title={t('ruleBook.baoziExplain')}>
            <p className="text-text-secondary text-sm leading-relaxed">
              {t('ruleBook.baoziText')}
            </p>
          </Section>

          <Section title={t('ruleBook.expressions')}>
            <div className="space-y-2">
              {Array.isArray(expressions) &&
                expressions.map((expr, i) => (
                  <div key={i} className="flex gap-3 py-2 border-b border-accent-gold/5 last:border-0">
                    <span className="text-accent-gold font-title text-sm flex-shrink-0 w-32">
                      {expr.zh}
                    </span>
                    <span className="text-text-secondary text-xs">{expr.meaning}</span>
                  </div>
                ))}
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}
