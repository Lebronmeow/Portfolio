import React from 'react';

export default function MainSite({ isActive }) {
  if (!isActive) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0c0c0e',
      color: '#fff',
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: '80px 40px',
      overflowY: 'auto',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ marginBottom: '80px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #999999)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="text-3d text-3d-heading">
            Lebron Pereira
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#888899', marginTop: '12px', fontWeight: 500 }}>
            Vibe Coder · Creative Technologist & 3D Web Engineer
          </p>
        </header>

        <section style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff', marginBottom: '28px', letterSpacing: '-0.01em' }} className="text-3d text-3d-section">
            Featured Work
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Interactive 3D Portfolio', desc: 'Custom WebGL & Three.js workspace experience', tag: '2024', tech: 'Three.js / React / GSAP' },
              { title: 'AI Code Assistant', desc: 'Real-time agentic IDE plugin and workflow engine', tag: '2024', tech: 'TypeScript / Node.js' },
              { title: 'Motion Design System', desc: 'High-performance micro-animations & canvas components', tag: '2023', tech: 'WebGL / Shader' },
            ].map(p => (
              <div key={p.title} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '28px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#666', letterSpacing: '0.1em' }}>{p.tag}</span>
                  <span style={{ fontSize: '0.7rem', color: '#00e5ff', background: 'rgba(0,229,255,0.1)', padding: '2px 8px', borderRadius: '12px' }}>{p.tech}</span>
                </div>
                <h3 style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: '8px', color: '#eee' }} className="text-3d text-3d-card">{p.title}</h3>
                <p style={{ color: '#888', fontSize: '0.92rem', lineHeight: '1.5' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '80px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff', marginBottom: '24px' }} className="text-3d text-3d-section">Tech Stack & Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {['React', 'Three.js', 'WebGL', 'GLSL Shaders', 'GSAP', 'TypeScript', 'Next.js', 'Node.js', 'TailwindCSS', 'Figma'].map(s => (
              <span key={s} className="text-3d-wrapper">
                <span className="text-3d text-3d-tag" style={{
                  padding: '8px 18px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '100px',
                  fontSize: '0.9rem',
                  color: '#ddd',
                  fontWeight: 500
                }}>{s}</span>
              </span>
            ))}
          </div>
        </section>

        <footer style={{ color: '#555', fontSize: '0.85rem', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          © {new Date().getFullYear()} Lebron Pereira. Built with React, Three.js & Vite.
        </footer>
      </div>
    </div>
  );
}
