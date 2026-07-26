import React, { useState, useEffect, useRef } from 'react';

// ─── Animated Loading Screen ─────────────────────────────────────────────────
export default function LoadingScreen({ progress, onFinish }) {
  const [fadingOut, setFadingOut] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  // When progress hits 100, fade out after a brief pause, then signal done
  useEffect(() => {
    if (progress < 100 || fadingOut) return;
    const fadeTimer = setTimeout(() => {
      if (!mounted.current) return;
      setFadingOut(true);
      setTimeout(() => {
        if (!mounted.current) return;
        onFinish?.();
      }, 600);
    }, 500);
    return () => clearTimeout(fadeTimer);
  }, [progress, fadingOut, onFinish]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0f',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.6s ease-in-out',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Scanline overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
          pointerEvents: 'none',
          opacity: 0.5,
        }}
      />

      {/* CRT vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.6) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          maxWidth: 420,
          width: '90%',
        }}
      >
        {/* Spinning indicator */}
        <div style={{ fontSize: 48, marginBottom: 32, opacity: 0.9 }}>
          <div
            style={{
              animation: 'loadingSpin 2s linear infinite',
              display: 'inline-block',
            }}
          >
            ◌
          </div>
        </div>

        {/* "LOADING" text */}
        <div
          style={{
            fontSize: 13,
            letterSpacing: '0.35em',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 20,
            textTransform: 'uppercase',
          }}
        >
          Loading Portfolio
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            height: 3,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 2,
            overflow: 'hidden',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: `${Math.min(progress, 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4f8ef7, #facc15)',
              borderRadius: 2,
              transition: 'width 0.3s ease-out',
              boxShadow: '0 0 12px rgba(79,142,247,0.4)',
            }}
          />
        </div>

        {/* Percentage */}
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
          }}
        >
          {progress < 100 ? `${Math.round(progress)}%` : 'READY'}
        </div>

        {/* Pulsing dots */}
        <div
          style={{
            marginTop: 24,
            display: 'flex',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.3)',
                animation: 'loadingPulse 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom-right attribution */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 28,
          fontSize: 10,
          color: 'rgba(255,255,255,0.12)',
          letterSpacing: '0.1em',
          fontFamily: 'monospace',
        }}
      >
        LEBRON PEREIRA
      </div>
    </div>
  );
}

// Keyframe animations
if (
  typeof document !== 'undefined' &&
  !document.getElementById('loading-screen-styles')
) {
  const style = document.createElement('style');
  style.id = 'loading-screen-styles';
  style.textContent = `
    @keyframes loadingPulse {
      0%, 100% { opacity: 0.2; transform: scale(0.8); }
      50% { opacity: 0.8; transform: scale(1.2); }
    }
    @keyframes loadingSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}