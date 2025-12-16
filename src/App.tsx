import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSecretSantaStore } from './store/useSecretSantaStore';
import { Snowfall } from './components/Snowfall/Snowfall';
import { ChristmasTree } from './components/ChristmasTree/ChristmasTree';
import { SoundToggle } from './components/SoundToggle/SoundToggle';
import { SetupScreen } from './screens/SetupScreen/SetupScreen';
import { SelectScreen } from './screens/SelectScreen/SelectScreen';
import { SpinScreen } from './screens/SpinScreen/SpinScreen';
import { RevealScreen } from './screens/RevealScreen/RevealScreen';
import { preloadSounds } from './utils/sound';
import './App.css';

function App() {
  const { currentScreen, loadFromShareData, isDrawComplete } = useSecretSantaStore();

  // Check for shared link on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const kuraData = urlParams.get('kura');
    
    if (kuraData && !isDrawComplete) {
      const success = loadFromShareData(kuraData);
      if (success) {
        // Clean the URL without reloading
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [loadFromShareData, isDrawComplete]);

  // Preload sounds on mount
  useEffect(() => {
    preloadSounds();
  }, []);

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'setup':
        return <SetupScreen />;
      case 'select':
        return <SelectScreen />;
      case 'spin':
        return <SpinScreen />;
      case 'reveal':
        return <RevealScreen />;
      default:
        return <SetupScreen />;
    }
  };

  return (
    <div className="app">
      {/* Background Effects */}
      <div className="background-gradient" />
      <Snowfall count={40} />
      <ChristmasTree />
      
      {/* Sound Toggle */}
      <SoundToggle />
      
      {/* Main Content */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>🎄 Mutlu Yıllar 2025 🎄</p>
      </footer>
    </div>
  );
}

export default App;
