import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSocket } from '../context/SocketContext';

const PHASES = [
  { key: 'LOBBY',        label: 'Lobby',        emoji: '🏠', desc: 'Players join' },
  { key: 'MINTING',      label: 'Minting',       emoji: '🎨', desc: 'Create assets' },
  { key: 'MARKET_EVENT', label: 'Market Event',  emoji: '⚡', desc: 'Prices shift' },
  { key: 'LEADERBOARD',  label: 'Leaderboard',   emoji: '🏆', desc: 'Rankings reveal' },
  { key: 'REVEAL',       label: 'Web3 Reveal',   emoji: '🌐', desc: 'The big reveal' },
];

const MARKET_EVENTS = [
  { id: 'GLITCH_UP',  label: '⚡ GLITCH → 2× Value',       message: 'GLITCH TRAITS ARE NOW 2× MORE VALUABLE!' },
  { id: 'DRAGON_UP',  label: '🐉 DRAGON → 1.8× Value',     message: 'DRAGON TRAITS JUST BECAME HIGHLY SOUGHT AFTER!' },
  { id: 'FIRE_BONUS', label: '🔥 FIRE Core → +25% Bonus',  message: 'FIRE CORE ASSETS GET A 25% VALUE BONUS!' },
  { id: 'VOID_UP',    label: '🌑 VOID Core → 1.5× Value',  message: 'VOID CORE SURGES — SCARCITY CREATES VALUE!' },
  { id: 'COMMON_DOWN',label: '📉 Common Traits Lose Value', message: 'COMMON TRAITS ARE LOSING VALUE FAST!' },
  { id: 'ENERGY_SURGE', label: '🔋 ENERGY Core → +40% Bonus', message: 'ENERGY CORE ASSETS POWER UP WITH A 40% BONUS!' },
  { id: 'ICE_FREEZE',   label: '❄ ICE Core → +30% Bonus',    message: 'ICE CORE DEMAND RISES, GAINING 30% BONUS!' },
  { id: 'CROWN_HYPE',   label: '👑 CROWN Trait → 1.5× Value', message: 'ROYALTY! CROWN TRAITS ARE IN HUGE DEMAND!' },
  { id: 'ARMOR_UP',     label: '🛡 ARMOR Trait → +500 PTS',   message: 'CYBER ARMOR BECOMES ESSENTIAL! +500 FLAT BONUS!' },
  { id: 'MARKET_CRASH', label: '📉 MARKET CRASH → -15% All',  message: 'TOTAL MARKET CRASH! ALL ASSETS LOSE 15% VALUE!' },
  { id: 'STIMULUS',     label: '💰 STIMULUS → +20% All',      message: 'MARKET STIMULUS! ALL ASSETS GAIN 20% VALUE!' },
];

export default function AdminPage() {
  const { socket, isConnected } = useSocket();
  const [roomId, setRoomId] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [roomState, setRoomState] = useState('LOBBY');
  const [players, setPlayers] = useState<any[]>([]);
  const [roomCreated, setRoomCreated] = useState(false);
  const [showQRFullscreen, setShowQRFullscreen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(MARKET_EVENTS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    if (!socket) return;

    const onRoomCreated = (room: any) => {
      setRoomId(room.roomId);
      setRoomCreated(true);
      setRoomState(room.status);
      socket.emit('joinAdmin', room.roomId);
    };
    const onPlayerList = (list: any[]) => setPlayers(list);
    const onGameState = (update: any) => {
      const status = typeof update === 'string' ? update : update?.status;
      if (status) setRoomState(status);
    };

    socket.on('roomCreated', onRoomCreated);
    socket.on('playerListUpdate', onPlayerList);
    socket.on('gameStateUpdate', onGameState);

    return () => {
      socket.off('roomCreated', onRoomCreated);
      socket.off('playerListUpdate', onPlayerList);
      socket.off('gameStateUpdate', onGameState);
    };
  }, [socket]);

  const handleCreateRoom = () => {
    if (!inputRoomId.trim()) return;
    if (socket) socket.emit('createRoom', inputRoomId.trim().toUpperCase());
  };

  const changePhase = (phase: string) => {
    if (socket && roomId) socket.emit('updateGameState', { roomId, status: phase });
  };

  const triggerMarketEvent = () => {
    if (socket && roomId) {
      socket.emit('updateGameState', {
        roomId,
        status: 'MARKET_EVENT',
        marketEvent: { message: selectedEvent.message },
        eventType: selectedEvent.id,
      });
    }
  };

  const addDemoPlayers = () => {
    if (!socket || !roomId) return;
    const demos = [
      { name: '0xNinja',     core: 'VOID',   traits: ['Glitch', 'Crown'] },
      { name: 'CryptoCat',   core: 'FIRE',   traits: ['Dragon', 'Wings'] },
      { name: 'BlockBuster', core: 'ICE',    traits: ['Shades', 'Halo'] },
      { name: 'Satoshi_21',  core: 'ENERGY', traits: ['Cyber Armor', 'Dragon'] },
      { name: 'PixelLord',   core: 'VOID',   traits: ['Wings', 'Glitch'] },
    ];
    demos.forEach(d => {
      const addr = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      socket.emit('joinRoom', { roomId, username: d.name, web3Address: addr });
      setTimeout(() => {
        socket.emit('mintAsset', { roomId, username: d.name, asset: { core: d.core, traits: d.traits } });
      }, 2000);
    });
  };

  const handleResetRoom = () => {
    if (!socket || !roomId) return;
    if (!window.confirm(`Reset room ${roomId}? This will DELETE all players and return to LOBBY.`)) return;
    socket.emit('resetRoom', { roomId });
    setPlayers([]);
    setRoomState('LOBBY');
  };

  const joinUrl = roomId ? `${window.location.origin}/join/${roomId}` : '';
  const mintedCount = players.filter(p => p.asset).length;
  const onlineCount = players.filter(p => p.isOnline).length;
  const currentPhaseIndex = PHASES.findIndex(p => p.key === roomState);

  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  // Winner categories
  const whale = sorted[0];
  const rarest = players.filter(p => p.asset).sort((a, b) => {
    const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
    return rarities.indexOf(b.asset.rarity) - rarities.indexOf(a.asset.rarity);
  })[0];
  const fastest = players.filter(p => p.mintedAt).sort((a, b) => new Date(a.mintedAt).getTime() - new Date(b.mintedAt).getTime())[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'axios2026';
    if (passwordInput === adminPass) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
      setPasswordInput('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-center" style={{ textAlign: 'center' }}>
        <div className="glass-elevated" style={{ padding: '40px 32px', maxWidth: '360px', width: '100%' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛡️</div>
          <h2 style={{ marginBottom: '8px', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.05em' }}>ADMIN PORTAL</h2>
          <p className="text-sm text-muted" style={{ marginBottom: '24px' }}>Restricted access.</p>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Enter password..." 
              value={passwordInput} 
              onChange={e => setPasswordInput(e.target.value)} 
              style={{ marginBottom: '16px', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.1em' }}
              autoFocus
            />
            <button type="submit" className="btn btn-primary btn-full btn-lg">
              AUTHENTICATE
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, padding: '0' }}>
      {/* Fullscreen QR overlay */}
      {showQRFullscreen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(7,7,16,0.97)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }} onClick={() => setShowQRFullscreen(false)}>
          <p style={{ color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '32px', fontSize: '0.85rem' }}>
            Scan to join · {joinUrl}
          </p>
          <div style={{ background: 'white', padding: '24px', borderRadius: '20px' }}>
            <QRCodeSVG value={joinUrl} size={350} />
          </div>
          <p style={{ marginTop: '32px', color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 700 }}>
            ROOM: {roomId}
          </p>
          <p style={{ marginTop: '16px', color: 'var(--text-3)', fontSize: '0.8rem' }}>
            Click anywhere to close
          </p>
        </div>
      )}

      {/* Top bar */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(7,7,16,0.95)',
        backdropFilter: 'blur(16px)',
        padding: '16px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div>
          <div className="text-xs text-dim" style={{ letterSpacing: '0.15em', textTransform: 'uppercase' }}>Axios Web3 Wing</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
            <span className="gradient-text">HOST DASHBOARD</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {roomCreated && (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem', color: 'var(--gold)', background: 'var(--gold-dim)', padding: '4px 12px', borderRadius: '6px' }}>
              {roomId}
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: isConnected ? 'var(--energy)' : '#f87171' }}>
            <span className={isConnected ? 'dot-online' : 'dot-offline'} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '0', minHeight: 'calc(100vh - 73px)' }}>
        {/* ── LEFT SIDEBAR ────────────────────────────────────────────────── */}
        <div style={{
          borderRight: '1px solid var(--border)',
          padding: '24px',
          display: 'flex', flexDirection: 'column', gap: '20px',
          overflowY: 'auto',
          height: 'calc(100vh - 73px)',
          position: 'sticky', top: '73px',
        }}>
          {/* Room setup */}
          {!roomCreated ? (
            <div className="glass-elevated" style={{ padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ fontWeight: 800, marginBottom: '16px' }}>🏠 Create Room</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="input mono"
                  placeholder="AXIOS-2024"
                  value={inputRoomId}
                  onChange={e => setInputRoomId(e.target.value.toUpperCase())}
                  style={{ letterSpacing: '0.1em' }}
                />
              </div>
              <button className="btn btn-primary btn-full" onClick={handleCreateRoom}>
                CREATE ROOM
              </button>
              <p className="text-xs text-dim" style={{ marginTop: '8px', textAlign: 'center' }}>
                Or enter an existing room ID to rebind
              </p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'Players', value: players.length, color: 'var(--gold)' },
                  { label: 'Online', value: onlineCount, color: 'var(--energy)' },
                  { label: 'Minted', value: mintedCount, color: 'var(--peach)' },
                  { label: 'Phase', value: currentPhaseIndex + 1 + '/6', color: '#fbbf24' },
                ].map(s => (
                  <div key={s.label} className="glass" style={{ padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                    <div className="text-xs text-dim">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* QR Code */}
              <div className="glass" style={{ padding: '20px', borderRadius: '14px', textAlign: 'center' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  QR Code
                </h3>
                <div style={{ background: 'white', padding: '12px', display: 'inline-block', borderRadius: '12px', cursor: 'pointer' }} onClick={() => setShowQRFullscreen(true)}>
                  <QRCodeSVG value={joinUrl} size={180} />
                </div>
                <p className="text-xs text-dim" style={{ marginTop: '8px', wordBreak: 'break-all' }}>{joinUrl}</p>
                <button className="btn btn-full" style={{ marginTop: '12px', fontSize: '0.8rem', padding: '10px' }} onClick={() => setShowQRFullscreen(true)}>
                  🖥 FULLSCREEN QR
                </button>
              </div>

              {/* Phase controls */}
              <div className="glass" style={{ padding: '20px', borderRadius: '14px' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '14px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Game Phases
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {PHASES.map((p, i) => {
                    const isActive = roomState === p.key;
                    const isDone = PHASES.findIndex(x => x.key === roomState) > i;
                    return (
                      <button
                        key={p.key}
                        onClick={() => changePhase(p.key)}
                        className="btn"
                        style={{
                          justifyContent: 'flex-start', gap: '10px', padding: '10px 14px',
                          borderColor: isActive ? 'var(--gold)' : isDone ? 'rgba(74,222,128,0.3)' : 'var(--border)',
                          background: isActive ? 'rgba(251,191,36,0.1)' : isDone ? 'rgba(74,222,128,0.05)' : 'transparent',
                          color: isActive ? 'var(--gold)' : isDone ? 'var(--energy)' : 'var(--text-2)',
                          textTransform: 'none', letterSpacing: 'normal', fontWeight: isActive ? 800 : 500,
                          fontSize: '0.85rem',
                        }}
                      >
                        <span>{isDone ? '✓' : isActive ? '▶' : '○'}</span>
                        <span>{p.emoji} {p.label}</span>
                        {isActive && <span className="text-xs text-dim" style={{ marginLeft: 'auto' }}>Active</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Market events */}
              <div className="glass" style={{ padding: '20px', borderRadius: '14px' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '14px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Market Events
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  {MARKET_EVENTS.map(e => (
                    <button
                      key={e.id}
                      onClick={() => setSelectedEvent(e)}
                      className="btn"
                      style={{
                        justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.8rem',
                        borderColor: selectedEvent.id === e.id ? '#fbbf24' : 'var(--border)',
                        background: selectedEvent.id === e.id ? 'rgba(251,191,36,0.08)' : 'transparent',
                        color: selectedEvent.id === e.id ? '#fbbf24' : 'var(--text-2)',
                        textTransform: 'none', letterSpacing: 'normal',
                      }}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
                <button className="btn btn-full" style={{ background: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.4)', color: '#fbbf24', padding: '10px' }} onClick={triggerMarketEvent}>
                  ⚡ TRIGGER EVENT
                </button>
              </div>

              {/* Demo mode + Reset */}
              <div className="glass" style={{ padding: '16px', borderRadius: '12px' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '10px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Demo & Reset</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="btn btn-full" style={{ fontSize: '0.8rem', padding: '10px', color: 'var(--text-3)' }} onClick={addDemoPlayers}>
                    ＋ Add 5 Demo Players
                  </button>
                  <button className="btn btn-danger btn-full" style={{ fontSize: '0.8rem', padding: '10px' }} onClick={handleResetRoom}>
                    🗑 Reset Room (Clear All)
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT MAIN PANEL ──────────────────────────────────────────── */}
        <div style={{ padding: '32px', overflowY: 'auto' }}>
          {!roomCreated ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '16px', opacity: 0.4, textAlign: 'center' }}>
              <div style={{ fontSize: '4rem' }}>🎮</div>
              <h2>Create a room to start</h2>
              <p className="text-sm text-muted">Enter a room code on the left to begin hosting.</p>
            </div>
          ) : (
            <>
              {/* Phase indicator */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
                {PHASES.map((p, i) => (
                  <div key={p.key} style={{
                    padding: '6px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700,
                    background: roomState === p.key ? 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(255,187,166,0.2))' : 'transparent',
                    border: `1px solid ${roomState === p.key ? 'rgba(251,191,36,0.5)' : 'var(--border)'}`,
                    color: roomState === p.key ? 'var(--gold)' : 'var(--text-3)',
                  }}>
                    {p.emoji} {p.label}
                  </div>
                ))}
              </div>

              {/* Player table */}
              <div className="glass-elevated" style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '32px' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Live Lobby</h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="badge badge-cyan">{players.length} Players</span>
                    <span className="badge badge-green">{onlineCount} Online</span>
                    <span className="badge badge-purple">{mintedCount} Minted</span>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Player', 'Status', 'Core', 'Traits', 'Score', 'Action'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {players.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
                            Waiting for players to join...
                          </td>
                        </tr>
                      ) : (
                        players.map(p => (
                          <tr key={p.username} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 700 }}>@{p.username}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className={p.isOnline ? 'dot-online' : 'dot-offline'} />
                                <span style={{ fontSize: '0.8rem', color: p.isOnline ? 'var(--energy)' : '#f87171' }}>
                                  {p.isOnline ? 'Online' : 'Offline'}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{p.asset?.core || <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-2)' }}>
                              {p.asset?.traits?.join(', ') || <span style={{ color: 'var(--text-3)' }}>—</span>}
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--gold)' }}>{p.score ? p.score.toLocaleString() : 0}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: p.actionTaken === 'HOLD' ? 'var(--peach)' : p.actionTaken === 'SELL' ? '#f87171' : 'var(--text-3)' }}>
                              {p.actionTaken || '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Leaderboard */}
              {sorted.length > 0 && (
                <div className="glass-elevated" style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '32px' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontWeight: 800 }}>🏆 Live Leaderboard</h2>
                  </div>
                  <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sorted.slice(0, 10).map((p, i) => (
                      <div key={p.username} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 12px', borderRadius: '10px',
                        background: i === 0 ? 'rgba(251,191,36,0.08)' : 'transparent',
                        border: `1px solid ${i === 0 ? 'rgba(251,191,36,0.3)' : 'transparent'}`,
                      }}>
                        <span style={{ width: '24px', textAlign: 'center', fontWeight: 900, color: i < 3 ? ['#fbbf24', '#94a3b8', '#b45309'][i] : 'var(--text-3)', flexShrink: 0 }}>
                          {i < 3 ? ['🥇', '🥈', '🥉'][i] : `${i + 1}`}
                        </span>
                        <span style={{ flex: 1, fontWeight: 700 }}>@{p.username}</span>
                        {p.asset && <span className="text-xs text-muted">{p.asset.core}</span>}
                        <span style={{ fontWeight: 800, color: i === 0 ? '#fbbf24' : 'var(--gold)' }}>
                          {(p.score || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Winner categories */}
              {mintedCount > 0 && (
                <div className="glass-elevated" style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '32px' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontWeight: 800 }}>🏅 Winner Categories</h2>
                  </div>
                  <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    {[
                      { emoji: '🐋', title: 'The Whale', desc: 'Highest value', player: whale },
                      { emoji: '💎', title: 'The Collector', desc: 'Rarest asset', player: rarest },
                      { emoji: '⚡', title: 'The Speedrunner', desc: 'Fastest mint', player: fastest },
                    ].map(w => (
                      <div key={w.title} className="glass" style={{ padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{w.emoji}</div>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>{w.title}</div>
                        <div className="text-xs text-dim" style={{ marginBottom: '8px' }}>{w.desc}</div>
                        <div style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '0.9rem' }}>
                          {w.player ? `@${w.player.username}` : '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Web3 Reveal Panel */}
              {roomState === 'REVEAL' && (
                <div className="glass-elevated" style={{ borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '24px' }}>
                    <span className="gradient-text">YOU JUST USED WEB3.</span>
                  </h2>
                  {[
                    { game: 'Your Web3 address', web3: 'Wallet / Account', emoji: '🔐' },
                    { game: '$AXIOS',             web3: 'Token',            emoji: '🪙' },
                    { game: 'Collectible card',   web3: 'NFT',              emoji: '🖼' },
                    { game: 'Creating asset',     web3: 'Minting',          emoji: '⚒' },
                    { game: 'Ownership record',   web3: 'Blockchain',       emoji: '⛓' },
                    { game: 'Game rules',         web3: 'Smart Contract',   emoji: '📜' },
                  ].map(c => (
                    <div key={c.game} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-2)' }}>{c.emoji} {c.game}</span>
                      <span style={{ fontWeight: 800, color: 'var(--gold)' }}>= {c.web3}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: '32px', padding: '24px', background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(255,187,166,0.1))', borderRadius: '14px', border: '1px solid rgba(251,191,36,0.3)' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '8px' }}>Want to build the real thing?</h3>
                    <p style={{ color: 'var(--text-2)' }}>Attend <strong style={{ color: 'var(--gold)' }}>AXIOS Web3 Wing</strong> lectures!</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
