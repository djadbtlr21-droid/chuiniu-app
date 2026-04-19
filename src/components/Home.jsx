import { useLang } from '../contexts/LangContext';
import Header from './Header';

export default function Home({ onNavigate }) {
  const { t } = useLang();

  const modes = [
    {
      key: 'single',
      title: t('home.singleMode'),
      desc: t('home.singleDesc'),
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="4" width="24" height="24" rx="4" stroke="#D4AF37" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="3" fill="#C8102E" />
        </svg>
      ),
      screen: 'ruleSetup',
      mode: 'single',
    },
    {
      key: 'diceCup',
      title: t('home.diceCupMode'),
      desc: t('home.diceCupDesc'),
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M10 6h12l2 20H8L10 6z" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
          <circle cx="14" cy="18" r="2" fill="#F5E6D3" />
          <circle cx="20" cy="14" r="2" fill="#F5E6D3" />
        </svg>
      ),
      screen: 'ruleSetup',
      mode: 'diceCup',
    },
    {
      key: 'ruleBook',
      title: t('home.ruleBook'),
      desc: t('home.ruleBookDesc'),
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="6" y="4" width="20" height="24" rx="2" stroke="#D4AF37" strokeWidth="1.5" />
          <line x1="10" y1="10" x2="22" y2="10" stroke="#A89080" strokeWidth="1" />
          <line x1="10" y1="14" x2="22" y2="14" stroke="#A89080" strokeWidth="1" />
          <line x1="10" y1="18" x2="18" y2="18" stroke="#A89080" strokeWidth="1" />
        </svg>
      ),
      screen: 'ruleBook',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg-deep texture-overlay">
      <Header title="" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Title block */}
        <div className="text-center mb-10">
          <h1 className="font-title text-6xl text-accent-gold mb-2 tracking-wider gold-glow">
            {t('home.title')}
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-accent-gold to-transparent mx-auto mb-3" />
          <p className="text-text-secondary text-lg">{t('home.subtitle')}</p>
        </div>

        {/* Mode cards */}
        <div className="w-full max-w-sm space-y-4">
          {modes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => onNavigate(mode.screen, mode.mode)}
              className="w-full text-left p-4 rounded-xl border border-accent-gold/15
                         bg-bg-surface hover:bg-bg-elevated
                         transition-all duration-300 active:scale-[0.98]
                         group gold-border-frame"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-bg-deep/60 flex items-center justify-center
                                border border-accent-gold/10 group-hover:border-accent-gold/30 transition-colors">
                  {mode.icon}
                </div>
                <div>
                  <h3 className="font-bold text-text-primary group-hover:text-accent-gold transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-sm text-text-muted">{mode.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Watermark */}
      <footer className="text-center py-4">
        <span className="text-text-muted/40 text-xs tracking-[0.3em] uppercase">
          {t('home.watermark')}
        </span>
      </footer>
    </div>
  );
}
