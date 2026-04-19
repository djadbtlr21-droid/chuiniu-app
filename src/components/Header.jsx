import { useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { isMuted, toggleMute } from '../utils/sounds';

export default function Header({ title, onBack }) {
  const { lang, setLang } = useLang();
  const [muted, setMutedState] = useState(isMuted);

  const handleToggleMute = () => {
    const next = toggleMute();
    setMutedState(next);
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-accent-gold/10">
      <div className="w-20 flex items-center gap-1">
        {onBack && (
          <button
            onClick={onBack}
            className="text-accent-gold hover:text-accent-goldLight transition-colors p-1"
            aria-label="Back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <button
          onClick={handleToggleMute}
          className="text-text-muted hover:text-accent-gold transition-colors p-1"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
            </svg>
          )}
        </button>
      </div>

      <h1 className="font-title text-accent-gold text-lg tracking-wide">{title}</h1>

      <button
        onClick={() => setLang(lang === 'ko' ? 'zh' : 'ko')}
        className="w-20 text-right text-sm text-text-secondary hover:text-accent-gold transition-colors"
      >
        {lang === 'ko' ? '中文' : '한국어'}
      </button>
    </header>
  );
}
