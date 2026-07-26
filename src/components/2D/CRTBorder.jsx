import React from 'react';

// ─── CRT Border & Scanline Effect ───────────────────────────────────────
export default function CRTBorder({ isActive }) {
  if (!isActive) return null;

  return (
    <>
      {/* Scanlines */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px)',
        animation: 'crt-flicker 8s infinite',
      }} />

      {/* White CRT border — thick */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        border: '12px solid rgba(255,255,255,0.5)',
        boxShadow: `
          inset 0 0 80px rgba(0,0,0,0.7),
          inset 0 0 200px rgba(0,0,0,0.4),
          0 0 0 2px rgba(255,255,255,0.15),
          0 0 0 8px rgba(0,0,0,0.6)
        `,
        borderRadius: 4,
      }} />

      {/* Subtle curvature overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9997,
        pointerEvents: 'none',
        border: '2px solid rgba(0,0,0,0.3)',
        borderRadius: 20,
        margin: 8,
      }} />

      {/* Flicker animation */}
      <style>{`
        @keyframes crt-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.97; }
        }
      `}</style>
    </>
  );
}