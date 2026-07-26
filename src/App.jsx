import React, { useState, useEffect, useCallback, useRef } from 'react';
import ComputerScene from './components/3D/ComputerScene';
import DesktopUI from './components/2D/DesktopUI';
import CRTBorder from './components/2D/CRTBorder';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [activeApp, setActiveApp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const loadTimerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    };
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

  // When the main scene model finishes loading, kick off the dismissal chain
  const handleSceneLoad = useCallback(() => {
    setLoadingProgress(100);

    // Safety net: force-dismiss the loading screen after 4 seconds no matter what
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    loadTimerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 4000);
  }, []);

  // Track model download progress for the loading bar
  const handleSceneProgress = useCallback((fraction) => {
    // If fraction is invalid (xhr.total was 0), bump to at least 30%
    // so the user sees movement and knows something is happening
    if (typeof fraction !== 'number' || fraction <= 0 || !isFinite(fraction)) {
      setLoadingProgress((prev) => Math.max(prev, 30));
      return;
    }
    // Map download fraction 0→1 to progress 10→90%
    // (the last 10% is for Suspense-based models to settle)
    const pct = Math.min(90, Math.round(fraction * 80) + 10);
    setLoadingProgress((prev) => Math.max(prev, pct));
  }, []);

  // Called by LoadingScreen when its fade-out animation completes
  const handleLoadingFinish = useCallback(() => {
    // Clear the safety timer since we're already dismissing
    if (loadTimerRef.current) {
      clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  return (
    <>
      {/* Loading screen overlay — covers everything until assets are ready */}
      {isLoading && (
        <LoadingScreen
          progress={loadingProgress}
          onFinish={handleLoadingFinish}
        />
      )}

      <div className={`canvas-container${isZoomedIn ? ' fade-out' : ''}`}>
        <ComputerScene
          onEnter={handleEnterPortfolio}
          isZoomedIn={isZoomedIn}
          onNavigate={handleNavigate}
          onLoad={handleSceneLoad}
          onProgress={handleSceneProgress}
        />
      </div>

      {showHint && !isZoomedIn && (
        <div className="loading-hint">Click the computer screen to enter ↑</div>
      )}

      <DesktopUI
        isActive={isZoomedIn}
        activeApp={activeApp}
        onClose={handleCloseApp}
        onExit={handleExitDesktop}
      />

      <CRTBorder isActive={isZoomedIn} />
    </>
  );
}

export default App;