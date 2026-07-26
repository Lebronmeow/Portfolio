import React, { useState, useEffect } from 'react';
import ComputerScene from './components/3D/ComputerScene';
import MainSite from './components/2D/MainSite';

function App() {
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnterPortfolio = () => {
    setIsZoomedIn(true);
  };

  return (
    <>
      <div className={`canvas-container${isZoomedIn ? ' fade-out' : ''}`}>
        <ComputerScene onEnter={handleEnterPortfolio} isZoomedIn={isZoomedIn} />
      </div>

      {showHint && !isZoomedIn && (
        <div className="loading-hint">Click the computer screen to enter ↑</div>
      )}

      <div className={`content-container${isZoomedIn ? ' active' : ''}`}>
        <MainSite isActive={isZoomedIn} />
      </div>
    </>
  );
}

export default App;
