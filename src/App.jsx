import { useState } from 'react';
import { LangProvider } from './contexts/LangContext';
import { RuleProvider } from './contexts/RuleContext';
import Home from './components/Home';
import RuleSetup from './components/RuleSetup';
import SinglePlay from './components/SinglePlay';
import DiceCupMode from './components/DiceCupMode';
import RuleBook from './components/RuleBook';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [gameMode, setGameMode] = useState(null);
  const [activeRules, setActiveRules] = useState(null);

  const navigate = (target, mode) => {
    setScreen(target);
    if (mode) setGameMode(mode);
  };

  const goHome = () => {
    setScreen('home');
    setGameMode(null);
    setActiveRules(null);
  };

  const startGame = (rules) => {
    setActiveRules(rules);
    setScreen(gameMode === 'single' ? 'singlePlay' : 'diceCupMode');
  };

  return (
    <LangProvider>
      <RuleProvider>
        <div className="min-h-screen bg-bg-deep">
          {screen === 'home' && <Home onNavigate={navigate} />}
          {screen === 'ruleSetup' && (
            <RuleSetup mode={gameMode} onBack={goHome} onStart={startGame} />
          )}
          {screen === 'singlePlay' && activeRules && (
            <SinglePlay rules={activeRules} onBack={goHome} />
          )}
          {screen === 'diceCupMode' && activeRules && (
            <DiceCupMode rules={activeRules} onBack={goHome} />
          )}
          {screen === 'ruleBook' && <RuleBook onBack={goHome} />}
        </div>
      </RuleProvider>
    </LangProvider>
  );
}
