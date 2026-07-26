import React, { useState, useEffect } from 'react';
import ComputerScene from './components/3D/ComputerScene';
import DesktopUI from './components/2D/DesktopUI';
import CRTBorder from './components/2D/CRTBorder';

function App() {
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [activeApp, setActiveApp] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnterPortfolio = () => {
    setIsZoomedIn(true);
    setActiveApp(null);
  };

  const handleNavigate = (app) => {
    setIsZoomedIn(true);
    setActiveApp(app);
  };

  const handleCloseApp = () => {
    setActiveApp(null);
  };

  const handleExitDesktop = () => {
    setIsZoomedIn(false);
    setActiveApp(null);
  };

  return (
    <>
      <div className={`canvas-container${isZoomedIn ? ' fade-out' : ''}`}>
        <ComputerScene onEnter={handleEnterPortfolio} isZoomedIn={isZoomedIn} onNavigate={handleNavigate} />
      </div>

      {showHint && !isZoomedIn && (
        <div className="loading-hint">Click the computer screen to enter ↑</div>
      )}

      <DesktopUI isActive={isZoomedIn} activeApp={activeApp} onClose={handleCloseApp} onExit={handleExitDesktop} />

      <CRTBorder isActive={isZoomedIn} />
    </>
  );
}

export default App;