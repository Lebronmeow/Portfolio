import React, { useState, useEffect, useRef } from 'react';

// ─── macOS Desktop UI ──────────────────────────────────────────────────────
// Apps data
const APPS = {
  resume: {
    title: 'resume.pdf',
    icon: '📄',
    type: 'file',
    dockIcon: '📄',
  },
  game: {
    title: 'Game Folder',
    icon: '🎮',
    type: 'folder',
    dockIcon: '🎮',
  },
  work: {
    title: 'Work',
    icon: '💼',
    type: 'folder',
    dockIcon: '💼',
  },
  chat: {
    title: 'Chat',
    icon: '💬',
    type: 'app',
    dockIcon: '💬',
  },
  paint: {
    title: 'Paint',
    icon: '🎨',
    type: 'app',
    dockIcon: '🎨',
  },
  about: {
    title: 'About Me.txt',
    icon: '📝',
    type: 'file',
    dockIcon: '📝',
  },
  me: {
    title: 'Me',
    icon: '👤',
    type: 'image',
    dockIcon: '👤',
  },
};

const PROJECTS = [
  {
    title: 'Grace Engineering',
    desc: 'Job portal & engineering management platform',
    url: 'https://www.graceengineering.in/',
    color: '#4f8ef7',
    icon: '🔧',
    embed: true,
  },
  {
    title: 'Scam Detection',
    desc: 'AI-powered fraud detection dashboard',
    url: 'https://job-scam-detection-dashboard.vercel.app/',
    color: '#f75f5f',
    icon: '🛡️',
    embed: true,
  },
  {
    title: 'Book Heaven',
    desc: 'Online book discovery & reading platform',
    url: 'https://bookhaven.ryanpereira.xyz/',
    screenshot: '/images/book.png',
    color: '#5fc77e',
    icon: '📚',
    embed: true,
  },
];

// ─── Desktop Icon ────────────────────────────────────────────────────────
function DesktopIcon({ app, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        padding: '10px 14px',
        borderRadius: 10,
        background: hovered ? 'rgba(255,255,255,0.12)' : 'transparent',
        transition: 'all 0.15s ease',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        userSelect: 'none',
        width: 90,
      }}
    >
      <div style={{
        fontSize: 42,
        lineHeight: 1,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
      }}>
        {app.icon}
      </div>
      <span style={{
        fontSize: 11,
        color: '#fff',
        textShadow: '0 1px 4px rgba(0,0,0,0.8)',
        textAlign: 'center',
        fontWeight: 500,
        background: hovered ? 'rgba(0,0,0,0.3)' : 'transparent',
        padding: '2px 6px',
        borderRadius: 4,
        maxWidth: 80,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {app.title}
      </span>
    </div>
  );
}

// ─── Dock ────────────────────────────────────────────────────────────────
function Dock({ activeApp, onOpenApp }) {
  const [hoveredApp, setHoveredApp] = useState(null);

  return (
    <div style={{
      position: 'absolute',
      bottom: 12,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 6,
      background: 'rgba(40,40,50,0.55)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: 16,
      padding: '8px 16px',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
      zIndex: 100,
    }}>
      {Object.entries(APPS).map(([key, app]) => (
        <div
          key={key}
          onClick={() => onOpenApp(key)}
          onMouseEnter={() => setHoveredApp(key)}
          onMouseLeave={() => setHoveredApp(null)}
          style={{
            fontSize: 28,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 8,
            background: activeApp === key ? 'rgba(255,255,255,0.15)' : 'transparent',
            transform: hoveredApp === key ? 'scale(1.2) translateY(-4px)' : activeApp === key ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.2s ease',
            position: 'relative',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        >
          {app.dockIcon}
          {activeApp === key && (
            <div style={{
              position: 'absolute',
              bottom: -4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: '#fff',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Window ──────────────────────────────────────────────────────────────
function Window({ app, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  const windowStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: visible && !isClosing
      ? 'translate(-50%, -50%) scale(1)'
      : 'translate(-50%, -50%) scale(0.9)',
    opacity: visible && !isClosing ? 1 : 0,
    transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
    background: 'rgba(30,30,38,0.92)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
    minWidth: maximized ? 800 : 600,
    maxWidth: maximized ? '95vw' : 860,
    height: maximized ? '95vh' : undefined,
    maxHeight: '95vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 200,
  };

  const renderContent = () => {
    switch (app) {
      case 'resume':
        return <ResumeContent />;
      case 'game':
        return <GameContent />;
      case 'chat':
        return <ChatContent />;
      case 'work':
        return <WorkContent />;
      case 'paint':
        return <PaintContent />;
      case 'about':
        return <AboutContent />;
      case 'me':
        return <MeContent />;
      default:
        return <div style={{ padding: 40, color: '#888' }}>Coming soon...</div>;
    }
  };

  return (
    <div style={windowStyle}>
      {/* Title bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        gap: 10,
      }}>
        {/* Traffic light buttons */}
        <div style={{ display: 'flex', gap: 7 }}>
          <div
            onClick={handleClose}
            style={{
              width: 12, height: 12,
              borderRadius: '50%',
              background: '#ff5f57',
              cursor: 'pointer',
              transition: 'filter 0.15s',
            }}
            onMouseEnter={(e) => e.target.style.filter = 'brightness(0.8)'}
            onMouseLeave={(e) => e.target.style.filter = 'brightness(1)'}
          />
          <div
            onClick={handleClose}
            style={{
              width: 12, height: 12,
              borderRadius: '50%',
              background: '#febc2e',
              cursor: 'pointer',
              transition: 'filter 0.15s',
            }}
            onMouseEnter={(e) => e.target.style.filter = 'brightness(0.8)'}
            onMouseLeave={(e) => e.target.style.filter = 'brightness(1)'}
          />
          <div
            onClick={() => setMaximized(p => !p)}
            style={{
              width: 12, height: 12,
              borderRadius: '50%',
              background: '#28c840',
              cursor: 'pointer',
              transition: 'filter 0.15s',
            }}
            onMouseEnter={(e) => e.target.style.filter = 'brightness(0.8)'}
            onMouseLeave={(e) => e.target.style.filter = 'brightness(1)'}
          />
        </div>
        <span style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 600,
          color: '#ddd',
          marginRight: 50,
        }}>
          {APPS[app]?.title || app}
        </span>
      </div>

      {/* Content */}
      <div style={{
        padding: '20px 24px',
        overflowY: 'auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {renderContent()}
      </div>
    </div>
  );
}

// ─── Resume Content ──────────────────────────────────────────────────────
function ResumeContent() {
  const handleOpenPDF = () => {
    window.open('/Lebron_Pereira_Resume.pdf', '_blank');
  };
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = '/Lebron_Pereira_Resume.pdf';
    a.download = 'Lebron_Pereira_Resume.pdf';
    a.click();
  };

  return (
    <div style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
      {/* PDF Preview */}
      <div style={{
        width: '100%',
        height: 620,
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: 12,
        background: '#111',
        position: 'relative',
      }}>
        <iframe
          src="/Lebron_Pereira_Resume.pdf#view=FitH"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="Resume Preview"
        />
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginBottom: 16,
      }}>
        <button
          onClick={handleOpenPDF}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'rgba(79,142,247,0.2)',
            border: '1px solid rgba(79,142,247,0.3)',
            borderRadius: 8,
            color: '#4f8ef7',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.target.style.background = 'rgba(79,142,247,0.3)'; }}
          onMouseLeave={(e) => { e.target.style.background = 'rgba(79,142,247,0.2)'; }}
        >
          ↗ Open in new tab
        </button>
        <button
          onClick={handleDownload}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            color: '#ddd',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.12)'; }}
          onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.06)'; }}
        >
          ⬇ Download
        </button>
      </div>
    </div>
  );
}

// ─── Game Content ────────────────────────────────────────────────────────
function GameContent() {
  const [selectedGame, setSelectedGame] = useState(null);

  const GAMES = [
    { id: 'mountainclimb', title: 'Mountain Climb 4x4', icon: '🏔️', desc: 'Off-road 3D mountain climbing', url: 'https://html5.gamemonetize.co/brry5qcwx1zf01gwfvxxx53vi8mir5d2/' },
    { id: 'airracer', title: '3D Air Racer', icon: '✈️', desc: 'High-speed 3D airplane racing', url: 'https://html5.gamemonetize.co/ebkusg44h2su1qsxvupz498x2f5m85im/' },
    { id: 'gtacrime', title: 'GTA Crime Simulator', icon: '🚗', desc: 'Open world 3D crime simulator', url: 'https://html5.gamemonetize.co/ywgsu1e8jqboj8d4tbnomnm111ro0vpy/' },
    { id: 'blockworld', title: 'Block World', icon: '🧱', desc: 'Build and explore in 3D block world', url: 'https://html5.gamemonetize.co/ztj2w5e5pdnhdomxkoufe27b35sk1ng1/' },
  ];

  if (selectedGame) {
    const game = GAMES.find(g => g.id === selectedGame);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <button onClick={() => setSelectedGame(null)} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#ddd', fontSize: 12, cursor: 'pointer' }}>← Back</button>
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 600, flex: 1 }}>{game?.title}</span>
          <span style={{ color: '#666', fontSize: 11 }}>use 🟢 to maximize</span>
        </div>
        <div style={{ flex: 1, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#000' }}>
          <iframe src={game?.url} style={{ width: '100%', height: '100%', border: 'none' }} title={game?.title} sandbox="allow-scripts allow-same-origin allow-pointer-lock" allowFullScreen />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {GAMES.map(g => (
          <div key={g.id} onClick={() => setSelectedGame(g.id)} style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
            <span style={{ fontSize: 32 }}>{g.icon}</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{g.title}</div>
              <div style={{ color: '#888', fontSize: 12 }}>{g.desc}</div>
            </div>
            <span style={{ color: '#555' }}>▶</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Snake Game ─────────────────────────────────────────────────────────
function SnakeGame({ onBack }) {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gridSize = 20;

  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      switch (e.key) {
        case 'ArrowUp': if (dir.y !== 1) setDir({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (dir.y !== -1) setDir({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (dir.x !== 1) setDir({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (dir.x !== -1) setDir({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake(prev => {
        const head = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize || prev.some(s => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          return prev;
        }
        const ate = head.x === food.x && head.y === food.y;
        const newSnake = [head, ...prev];
        if (ate) {
          setScore(s => s + 1);
          setFood({ x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [dir, food, gameOver]);

  const restart = () => {
    setSnake([{ x: 10, y: 10 }]); setFood({ x: 15, y: 15 }); setDir({ x: 1, y: 0 }); setGameOver(false); setScore(0);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <button onClick={onBack} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#ddd', fontSize: 12, cursor: 'pointer' }}>← Back</button>
        <span style={{ color: '#facc15', fontSize: 14, fontWeight: 600 }}>Score: {score}</span>
        {gameOver && <button onClick={restart} style={{ padding: '4px 12px', background: '#f75f5f44', border: '1px solid #f75f5f', borderRadius: 6, color: '#f75f5f', fontSize: 12, cursor: 'pointer' }}>Restart</button>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gap: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        {Array.from({ length: gridSize * gridSize }).map((_, i) => {
          const x = i % gridSize, y = Math.floor(i / gridSize);
          const isSnake = snake.some(s => s.x === x && s.y === y);
          const isHead = snake[0]?.x === x && snake[0]?.y === y;
          const isFood = food.x === x && food.y === y;
          return <div key={i} style={{ paddingBottom: '100%', background: isHead ? '#44ff88' : isSnake ? '#22aa55' : isFood ? '#ff4444' : 'transparent', borderRadius: isHead ? 4 : isSnake ? 3 : 0 }} />;
        })}
      </div>
      {gameOver && <p style={{ color: '#ff4444', textAlign: 'center', marginTop: 8, fontSize: 13 }}>Game Over! Score: {score}</p>}
    </div>
  );
}

// ─── Tic Tac Toe ─────────────────────────────────────────────────────────
function TicTacToeGame({ onBack }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const winner = calcWinner(board);
  const status = winner ? `Winner: ${winner}` : board.every(Boolean) ? 'Draw!' : `Next: ${xIsNext ? 'X' : 'O'}`;

  function calcWinner(sq) {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a,b,c] of lines) { if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) return sq[a]; }
    return null;
  }

  const handleClick = (i) => {
    if (board[i] || winner) return;
    const next = [...board]; next[i] = xIsNext ? 'X' : 'O';
    setBoard(next); setXIsNext(!xIsNext);
  };

  const restart = () => { setBoard(Array(9).fill(null)); setXIsNext(true); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <button onClick={onBack} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#ddd', fontSize: 12, cursor: 'pointer' }}>← Back</button>
        <span style={{ color: '#facc15', fontSize: 14, fontWeight: 600 }}>{status}</span>
        <button onClick={restart} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#ddd', fontSize: 12, cursor: 'pointer' }}>Restart</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, maxWidth: 240, margin: '0 auto' }}>
        {board.map((cell, i) => (
          <div key={i} onClick={() => handleClick(i)} style={{ aspectRatio: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, background: 'rgba(255,255,255,0.04)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', cursor: cell ? 'default' : 'pointer', color: cell === 'X' ? '#44ff88' : '#ff4488' }}>
            {cell}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Clicker Game ────────────────────────────────────────────────────────
function ClickerGame({ onBack }) {
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [active, timeLeft]);

  useEffect(() => { if (timeLeft <= 0 && active) setActive(false); }, [timeLeft, active]);

  const start = () => { setCount(0); setTimeLeft(10); setActive(true); };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <button onClick={onBack} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#ddd', fontSize: 12, cursor: 'pointer' }}>← Back</button>
        <span style={{ color: '#facc15', fontSize: 14, fontWeight: 600 }}>Time: {timeLeft}s</span>
        {!active && <button onClick={start} style={{ padding: '4px 12px', background: '#44ff8844', border: '1px solid #44ff88', borderRadius: 6, color: '#44ff88', fontSize: 12, cursor: 'pointer' }}>{timeLeft === 0 ? 'Try Again' : 'Start'}</button>}
      </div>
      <div style={{ fontSize: 48, fontWeight: 700, color: '#fff', margin: '20px 0' }}>{count}</div>
      <button onClick={() => active && setCount(c => c + 1)} disabled={!active} style={{ padding: '16px 40px', fontSize: 18, fontWeight: 600, borderRadius: 12, background: active ? 'linear-gradient(135deg, #4f8ef7, #aa44ff)' : 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: active ? 'pointer' : 'default', opacity: active ? 1 : 0.4, transition: 'transform 0.1s' }}
        onMouseDown={(e) => { if (active) e.target.style.transform = 'scale(0.95)'; }}
        onMouseUp={(e) => { if (active) e.target.style.transform = 'scale(1)'; }}>
        {active ? '👆 CLICK ME!' : timeLeft === 0 ? `Done! ${count} clicks` : 'Press Start'}
      </button>
      {timeLeft === 0 && <p style={{ color: '#44ff88', marginTop: 12, fontSize: 13 }}>You clicked {count} times in 10 seconds!</p>}
    </div>
  );
}

// ─── Chat Content ────────────────────────────────────────────────────────
function ChatContent() {
  const handleOpenInstagram = () => {
    window.open('https://www.instagram.com/lebron_gemss/', '_blank');
  };

  return (
    <div style={{
      textAlign: 'center',
      padding: '20px',
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>💬</div>
      <h3 style={{ color: '#ddd', margin: '0 0 8px', fontSize: 16 }}>Let's Chat!</h3>
      <p style={{ color: '#888', fontSize: 13, margin: '0 0 20px' }}>
        Message me on Instagram
      </p>
      <button
        onClick={handleOpenInstagram}
        style={{
          padding: '10px 28px',
          background: 'linear-gradient(135deg, #f58529, #dd2a7b, #8134af)',
          border: 'none',
          borderRadius: 100,
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        Open Instagram
      </button>
    </div>
  );
}

// ─── Paint Content ───────────────────────────────────────────────────────
const COLORS = ['#ffffff', '#ff4444', '#ff8800', '#ffdd00', '#44ff44', '#44ddff', '#4488ff', '#aa44ff', '#ff44aa', '#888888', '#444444', '#000000'];
const BRUSH_TYPES = ['round', 'square'];
function PaintContent() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(4);
  const [brushType, setBrushType] = useState('round');
  const lastPos = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = color; ctx.lineWidth = brushSize; ctx.lineCap = brushType; ctx.lineJoin = brushType;
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y); ctx.lineTo(x, y); ctx.stroke();
    lastPos.current = { x, y };
  };
  const stopDrawing = () => { setIsDrawing(false); lastPos.current = null; };
  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#111'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', maxWidth: 200 }}>
          {COLORS.map(c => (
            <div key={c} onClick={() => setColor(c)} style={{ width: 20, height: 20, borderRadius: 4, background: c, border: c === color ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ color: '#888', fontSize: 11 }}>Size:</span>
          <input type="range" min="1" max="30" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} style={{ width: 80 }} />
          <span style={{ color: '#888', fontSize: 11, width: 20 }}>{brushSize}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {BRUSH_TYPES.map(b => (
            <div key={b} onClick={() => setBrushType(b)} style={{ padding: '3px 10px', borderRadius: 6, background: brushType === b ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc', fontSize: 11, cursor: 'pointer' }}>{b}</div>
          ))}
        </div>
        <button onClick={clearCanvas} style={{ padding: '4px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#ddd', fontSize: 12, cursor: 'pointer' }}>Clear</button>
      </div>
      <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} style={{ width: '100%', height: 300, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', cursor: 'crosshair', background: '#111' }} />
    </div>
  );
}

// ─── About Content ───────────────────────────────────────────────────────
function AboutContent() {
  const [text, setText] = useState(`About Me

The UI & Frontend Engineer
I am a computer engineering student at Fr. Conceicao Rodrigues College with a laser focus on UI/UX design and frontend development. I am not interested in being a jack-of-all-trades; my passion lies entirely in specializing and crafting clean, intuitive, and highly responsive user interfaces using React.js and modern frontend technologies.

The Builder & Problem Solver
I love building platforms that prioritize seamless, purpose-driven user experiences. My current portfolio reflects this dedicated frontend focus, featuring live and conceptual projects like grace engineering.in, bookheavan, and a specialized analytical dashboard for detecting job scams. My goal with every line of code is to turn complex functional requirements into accessible, visually engaging digital solutions.

The Gym Freak & Creator
Outside of development, I am an absolute gym freak. I stay highly disciplined with a structured 5-day workout split and intense incline treadmill routines. I also have a strong creative outlet producing hip-hop and rap instrumentals in FL Studio. When it is time to unwind, I am either brainstorming new project ideas with my partner, keeping in touch with my circle, or grinding competitive matches in Fortnite, Valorant, and Counter-Strike 2.`);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>📝</span>
        <span>About_Me.txt — edit freely</span>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} style={{ width: '100%', minHeight: 420, padding: 16, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#ddd', fontSize: 13, lineHeight: 1.7, fontFamily: 'monospace', resize: 'vertical', outline: 'none' }} />
    </div>
  );
}

// ─── Me Content ─────────────────────────────────────────────────────────
function MeContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
      <div style={{ fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
        <span>🖼</span>
        <span>Me.jpeg</span>
      </div>
      <img
        src="/images/me.jpeg"
        alt="Lebron Pereira"
        style={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        }}
      />
    </div>
  );
}

// ─── Work Content ────────────────────────────────────────────────────────
function WorkContent() {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const dragStart = useRef({ x: 0, rot: 0 });
  const autoRotate = useRef(null);

  const RADIUS = 200;

  useEffect(() => {
    if (!isDragging) {
      autoRotate.current = setInterval(() => { setRotation(prev => prev + 0.6); }, 30);
    }
    return () => clearInterval(autoRotate.current);
  }, [isDragging]);

  const handleMouseDown = (e) => { setIsDragging(true); dragStart.current = { x: e.clientX, rot: rotation }; };
  const handleMouseMove = (e) => { if (!isDragging) return; const dx = e.clientX - dragStart.current.x; setRotation(dragStart.current.rot + dx * 0.3); };
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={{ userSelect: 'none', padding: '10px 0' }}>
      <h3 style={{ color: '#ddd', margin: '0 0 4px', fontSize: 15, textAlign: 'center' }}>My Work</h3>
      <p style={{ color: '#666', fontSize: 11, textAlign: 'center', margin: '0 0 12px' }}>Drag to rotate · Click to preview live</p>

      {previewUrl && (
        <div style={{ width: '100%', height: 300, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 12, background: '#111', position: 'relative' }}>
          <button onClick={() => setPreviewUrl(null)} style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, width: 28, height: 28, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: '#fff', fontSize: 14, cursor: 'pointer' }}>✕</button>
          <iframe src={previewUrl} style={{ width: '100%', height: '100%', border: 'none' }} title={previewTitle} sandbox="allow-scripts allow-same-origin" />
        </div>
      )}

      <div style={{ position: 'relative', width: '100%', height: 440, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1000px', transformStyle: 'preserve-3d', overflow: 'hidden' }}>
        {PROJECTS.map((p, i) => {
          const angle = (i / PROJECTS.length) * Math.PI * 2 + (rotation * Math.PI) / 180;
          const x = Math.sin(angle) * RADIUS;
          const z = Math.cos(angle) * RADIUS - RADIUS;
          const scale = 0.35 + (z + RADIUS) / (RADIUS * 2) * 0.75;
          const opacity = 0.1 + (z + RADIUS) / (RADIUS * 2) * 0.9;
          const isFront = z > -RADIUS * 0.1;
          const rotateY = -angle * (180 / Math.PI);
          return (
            <div key={i} style={{ position: 'absolute', width: 240, height: 300, borderRadius: 16, overflow: 'hidden', border: `2px solid ${isFront ? p.color + '99' : 'rgba(255,255,255,0.06)'}`, cursor: isFront ? 'pointer' : 'default', transform: `translateX(${x}px) translateZ(${z}px) scale(${scale}) rotateY(${rotateY}deg)`, opacity, transition: 'transform 0.05s linear, opacity 0.05s linear', transformStyle: 'preserve-3d', boxShadow: isFront ? `0 10px 40px rgba(0,0,0,0.6), 0 0 0 1px ${p.color}33 inset` : '0 4px 12px rgba(0,0,0,0.3)', zIndex: isFront ? 10 : 1 }}>
              <div onClick={() => { if (isFront && p.url) { if (p.screenshot) { window.open(p.url, '_blank'); } else { setPreviewUrl(p.url); setPreviewTitle(p.title); } } }} style={{ width: '100%', height: '100%', position: 'relative' }}>
                {p.screenshot ? (
                  <>
                    <img src={p.screenshot} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {isFront && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 12px 12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: '#fff', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>↗ Open {p.title}</div>}
                  </>
                ) : (
                  <iframe src={p.url} style={{ width: '100%', height: '100%', border: 'none' }} title={p.title} sandbox="allow-scripts allow-same-origin" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Desktop Background ──────────────────────────────────────────────────
const WALLPAPER_STYLE = {
  position: 'absolute',
  inset: 0,
  backgroundImage: 'url(/wallpaper.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  overflow: 'hidden',
};

// ─── Desktop UI Main Export ──────────────────────────────────────────────
export default function DesktopUI({ isActive, activeApp, onClose, onExit }) {
  const [windowApp, setWindowApp] = useState(null);
  const desktopRef = useRef(null);

  // When activeApp changes from outside (floor labels), open the window
  useEffect(() => {
    if (activeApp && isActive) {
      setWindowApp(activeApp);
    }
  }, [activeApp, isActive]);

  // Reset when not active
  useEffect(() => {
    if (!isActive) {
      setWindowApp(null);
    }
  }, [isActive]);

  const handleOpenApp = (appKey) => {
    if (appKey === 'chat') {
      // Chat opens Instagram directly
      window.open('https://www.instagram.com/lebron_gemss/', '_blank');
      return;
    }
    setWindowApp(appKey);
  };

  const handleCloseWindow = () => {
    setWindowApp(null);
    onClose?.();
  };

  if (!isActive) return null;

  return (
    <div
      ref={desktopRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      }}
      onClick={(e) => {
        // Click on desktop background closes window
        if (e.target === desktopRef.current || e.target === e.currentTarget) {
          handleCloseWindow();
        }
      }}
    >
      {/* Wallpaper */}
      <div style={WALLPAPER_STYLE}>
        {/* Subtle floating orbs */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

      {/* Exit button — top-right */}
      <button
        onClick={(e) => { e.stopPropagation(); onExit?.(); }}
        style={{
          position: 'absolute', top: 16, right: 16,
          width: 36, height: 36,
          background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 8, color: '#fff', fontSize: 18,
          cursor: 'pointer', zIndex: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.15)'; }}
        onMouseLeave={(e) => { e.target.style.background = 'rgba(0,0,0,0.5)'; }}
        title="Exit desktop"
      >
        ✕
      </button>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,95,95,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Desktop icons */}
      <div style={{
        position: 'absolute',
        top: 24,
        left: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 10,
      }}>
        {Object.entries(APPS).map(([key, app]) => (
          <DesktopIcon key={key} app={app} onClick={() => handleOpenApp(key)} />
        ))}
      </div>

      {/* Window */}
      {windowApp && (
        <Window app={windowApp} onClose={handleCloseWindow} />
      )}

      {/* Dock */}
      <Dock activeApp={windowApp} onOpenApp={handleOpenApp} />
    </div>
  );
}