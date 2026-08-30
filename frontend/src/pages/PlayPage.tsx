import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import MintingPhase from '../components/player/MintingPhase';
import AssetCard from '../components/player/AssetCard';

type GamePhase = 'LOBBY' | 'MINTING' | 'MARKET_EVENT' | 'DECISION' | 'LEADERBOARD' | 'REVEAL';

// ─── LOBBY SCREEN ─────────────────────────────────────────────────────────────
function LobbyScreen({ username, players }: { username: string; players: any[] }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, []);

  const steps = [
    { phase: '01', emoji: '🔗', title: 'Join the Room', desc: 'You\'re already in! Your mock Web3 wallet address has been auto-generated for you.' },
    { phase: '02', emoji: '🎨', title: 'Mint Your Asset', desc: 'You\'ll get 100 $AXIOS. Pick a Core type (ICE, FIRE, VOID, ENERGY) and up to 2 Traits. Spend wisely — rarer traits cost more!' },
    { phase: '03', emoji: '⚡', title: 'Market Event', desc: 'The market shifts! Certain cores or traits spike in value. Watch what the host announces on screen.' },
    { phase: '04', emoji: '💎', title: 'Hold or Sell?', desc: 'SELL now to lock in your current asset value. HOLD and gamble — the market may swing up or down before the final reveal!' },
    { phase: '05', emoji: '🏆', title: 'Leaderboard', desc: 'Final scores are revealed. The player with the most $AXIOS wins. You\'ll also be able to download & share your unique NFT card.' },
  ];

  return (
    <div style={{ padding: '24px 20px 40px', animation: 'fadeIn 0.5s ease-out' }}>
      {/* You're in header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎉</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '8px' }}>YOU'RE IN!</h1>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '100px', padding: '6px 20px', marginBottom: '16px' }}>
          <span style={{ color: 'var(--cyan)', fontWeight: 700, fontSize: '1.05rem' }}>@{username}</span>
        </div>

        {/* Live player count */}
        <div className="glass" style={{ padding: '14px 24px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--cyan)', lineHeight: 1 }}>{players.length}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Players</div>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'var(--border)' }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Waiting for host{dots}
          </div>
        </div>
      </div>

      {/* Game Instructions */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-3)', marginBottom: '14px', fontWeight: 700 }}>
          📋 HOW TO PLAY
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {steps.map((s, i) => (
            <div key={s.phase} style={{
              display: 'flex', gap: '14px', alignItems: 'flex-start',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '14px 16px',
              animation: `slideIn ${0.1 + i * 0.08}s ease-out`,
            }}>
              <div style={{ flexShrink: 0, width: '36px', height: '36px', background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                {s.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--cyan)', letterSpacing: '0.1em', opacity: 0.6 }}>PHASE {s.phase}</span>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{s.title}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.55, margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick rules */}
      <div className="glass" style={{ padding: '16px 20px', borderRadius: '14px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: '10px', fontWeight: 700 }}>⚡ Quick Rules</h3>
        <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            '💰 You start with 100 $AXIOS (in-game currency, no real value)',
            '🎨 Pick 1 Core + up to 2 Traits. Rarer = higher score',
            '⏱ Minting faster gives a speed bonus to your score',
            '📊 React to market events to maximize your asset value',
            '🔗 Keep your unique NFT card forever — download & share it!',
          ].map(r => (
            <li key={r} style={{ fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{r}</li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '12px 0' }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', lineHeight: 1.8 }}>
          Developed with ❤️ by <strong style={{ color: 'var(--cyan)' }}>Web3 Wing</strong>, Axios · IIITL
        </p>
      </div>
    </div>
  );
}

// ─── COUNTDOWN COMPONENT ──────────────────────────────────────────────────────
function CountdownOverlay({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => {
        if (c <= 1) { clearInterval(t); setTimeout(onDone, 500); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(7,7,16,0.97)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center',
    }}>
      <p style={{ color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.85rem', marginBottom: '32px' }}>
        GAME STARTING
      </p>
      <div key={count} style={{
        fontSize: 'clamp(6rem, 30vw, 12rem)',
        fontWeight: 900,
        lineHeight: 1,
        background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'bounceIn 0.4s ease-out',
      }}>
        {count || '🚀'}
      </div>
      {count === 0 && <p style={{ marginTop: '24px', fontSize: '1.5rem', color: 'var(--cyan)' }}>MINT TIME!</p>}
    </div>
  );
}

// ─── MINTED SUCCESS SCREEN ────────────────────────────────────────────────────
function MintedScreen({ playerData }: { playerData: any }) {
  return (
    <div style={{ padding: '32px 20px', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✅</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '8px' }}>
          <span className="gradient-text">ASSET MINTED!</span>
        </h2>
        <p className="text-sm text-muted">Waiting for the host to move to next phase...</p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <AssetCard
          core={playerData.asset.core}
          traits={playerData.asset.traits}
          username={playerData.username}
          web3Address={playerData.web3Address}
          uniqueId={playerData.asset.uniqueId}
          rarity={playerData.asset.rarity}
          score={playerData.score}
        />
      </div>

      <div className="glass" style={{ padding: '20px', borderRadius: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'center' }}>
        <div>
          <div className="text-xs text-dim" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Your Score</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--cyan)' }}>{playerData.score}</div>
        </div>
        <div>
          <div className="text-xs text-dim" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Rarity</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: playerData.asset.rarity === 'Legendary' ? '#fbbf24' : 'var(--purple)' }}>
            {playerData.asset.rarity || '—'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MARKET EVENT SCREEN ─────────────────────────────────────────────────────
function MarketEventScreen({ event, playerData }: { event: any; playerData: any }) {
  return (
    <div style={{ padding: '32px 20px', textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚡</div>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fbbf24', marginBottom: '8px' }}>MARKET UPDATE</h2>

      <div style={{
        background: 'rgba(251,191,36,0.08)',
        border: '1px solid rgba(251,191,36,0.3)',
        borderRadius: '14px',
        padding: '24px 20px',
        marginBottom: '28px',
      }}>
        <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fbbf24', lineHeight: 1.5 }}>
          {event?.message || 'THE MARKET IS SHIFTING...'}
        </p>
      </div>

      <p className="text-sm text-muted" style={{ marginBottom: '24px' }}>Your asset value is being re-calculated...</p>

      {playerData?.asset && (
        <AssetCard
          core={playerData.asset.core}
          traits={playerData.asset.traits}
          username={playerData.username}
          web3Address={playerData.web3Address}
          uniqueId={playerData.asset.uniqueId}
          rarity={playerData.asset.rarity}
          score={playerData.score}
        />
      )}
    </div>
  );
}

// ─── DECISION SCREEN ─────────────────────────────────────────────────────────
function DecisionScreen({ playerData, onAction }: { playerData: any; onAction: (a: string) => void }) {
  if (playerData.actionTaken) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
          {playerData.actionTaken === 'HOLD' ? '💎' : '💵'}
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '8px' }}>
          You chose to <span className="gradient-text">{playerData.actionTaken}</span>
        </h2>
        <p className="text-sm text-muted">Waiting for all players to decide...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 20px', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div className="text-xs text-dim" style={{ textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Current Value</div>
        <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }}>
          <span className="gradient-text">{(playerData.score || 0).toLocaleString()}</span>
        </div>
        <div style={{ color: 'var(--cyan)', fontWeight: 700, marginTop: '4px' }}>$AXIOS</div>
      </div>

      {playerData.asset && (
        <div style={{ marginBottom: '28px' }}>
          <AssetCard compact
            core={playerData.asset.core}
            traits={playerData.asset.traits}
            username={playerData.username}
            web3Address={playerData.web3Address}
          />
        </div>
      )}

      <div className="glass" style={{ padding: '16px 20px', borderRadius: '12px', marginBottom: '24px' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', textAlign: 'center', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text)' }}>SELL</strong> now to lock in your current value.<br />
          <strong style={{ color: 'var(--text)' }}>HOLD</strong> to gamble on the final market — value may go up or down.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <button className="btn btn-danger btn-lg" onClick={() => onAction('SELL')} style={{ flexDirection: 'column', gap: '4px', height: '80px' }}>
          <span style={{ fontSize: '1.5rem' }}>💵</span>
          <span>SELL</span>
        </button>
        <button className="btn btn-primary btn-lg" onClick={() => onAction('HOLD')} style={{ flexDirection: 'column', gap: '4px', height: '80px' }}>
          <span style={{ fontSize: '1.5rem' }}>💎</span>
          <span>HOLD</span>
        </button>
      </div>
    </div>
  );
}

// ─── LEADERBOARD SCREEN ───────────────────────────────────────────────────────
function LeaderboardScreen({ players, username, playerData, onShare }: { players: any[]; username: string; playerData: any; onShare: () => void }) {
  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const myRank = sorted.findIndex(p => p.username === username) + 1;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div style={{ padding: '32px 20px', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏆</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px' }}>
          <span className="gradient-text">FINAL RANKINGS</span>
        </h2>
        {myRank > 0 && (
          <div style={{ display: 'inline-block', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '100px', padding: '6px 16px' }}>
            <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>Your rank: #{myRank}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
        {sorted.slice(0, 10).map((p, i) => (
          <div key={p.username} style={{
            background: p.username === username ? 'rgba(0,240,255,0.08)' : i < 3 ? 'rgba(255,255,255,0.03)' : 'transparent',
            border: `1px solid ${p.username === username ? 'rgba(0,240,255,0.4)' : 'var(--border)'}`,
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: `slideIn ${0.1 + i * 0.05}s ease-out`,
          }}>
            <div style={{ width: '28px', textAlign: 'center', fontSize: i < 3 ? '1.3rem' : '1rem', fontWeight: 800, color: 'var(--text-3)', flexShrink: 0 }}>
              {i < 3 ? medals[i] : `#${i + 1}`}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {p.username}
                {p.username === username && <span style={{ marginLeft: '8px', color: 'var(--cyan)', fontSize: '0.7rem' }}>YOU</span>}
              </div>
              {p.asset && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>
                  {p.asset.core} · {p.asset.traits?.join(' + ')}
                </div>
              )}
            </div>
            <div style={{ fontWeight: 800, color: i === 0 ? '#fbbf24' : 'var(--cyan)', fontSize: '1rem', flexShrink: 0 }}>
              {(p.score || 0).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {playerData?.asset?.uniqueId && (
        <button className="btn btn-success btn-full btn-lg" onClick={onShare}>
          VIEW & SHARE YOUR ASSET 🔗
        </button>
      )}
    </div>
  );
}

// ─── REVEAL SCREEN ────────────────────────────────────────────────────────────
function RevealScreen() {
  const [revealed, setRevealed] = useState(0);
  const concepts = [
    { game: 'Your unique username/address', web3: 'Wallet / Account', emoji: '🔐' },
    { game: '$AXIOS currency',               web3: 'Token',            emoji: '🪙' },
    { game: 'Your collectible card',         web3: 'NFT',              emoji: '🖼' },
    { game: 'Creating the card',             web3: 'Minting',          emoji: '⚒' },
    { game: 'Card ownership record',         web3: 'Blockchain',       emoji: '⛓' },
    { game: 'Rules of the game',             web3: 'Smart Contract',   emoji: '📜' },
  ];

  useEffect(() => {
    if (revealed < concepts.length) {
      const t = setTimeout(() => setRevealed(r => r + 1), 1200);
      return () => clearTimeout(t);
    }
  }, [revealed]);

  return (
    <div style={{ padding: '32px 20px', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🌐</div>
        <h2 style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '12px' }}>
          YOU JUST USED<br /><span className="gradient-text">WEB3.</span>
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
        {concepts.slice(0, revealed).map((c, i) => (
          <div key={c.game} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'slideIn 0.4s ease-out',
          }}>
            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{c.emoji}</span>
            <div style={{ flex: 1 }}>
              <div className="text-sm text-muted">{c.game}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 800, color: 'var(--cyan)', fontSize: '0.9rem' }}>= {c.web3}</div>
            </div>
          </div>
        ))}
      </div>

      {revealed >= concepts.length && (
        <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
          <div className="glass" style={{ padding: '24px 20px', borderRadius: '14px', textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-2)', fontStyle: 'italic', lineHeight: 1.7 }}>
              "You didn't need to know Web3.<br />
              <strong style={{ color: 'var(--text)' }}>You just experienced it.</strong>"
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(0,240,255,0.12), rgba(168,85,247,0.12))',
            border: '1px solid rgba(0,240,255,0.35)',
            borderRadius: '16px',
            padding: '28px 20px',
            textAlign: 'center',
            marginBottom: '20px',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚀</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '10px', letterSpacing: '-0.02em' }}>
              Want to know more?
            </h3>
            <p style={{ color: 'var(--text-2)', marginBottom: '16px', lineHeight: 1.7, fontSize: '1rem' }}>
              Attend <strong style={{ color: 'var(--cyan)', fontSize: '1.05rem' }}>AXIOS Web3 Wing</strong> lectures<br />
              and learn how to build real blockchain apps.
            </p>
            <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '100px', padding: '8px 20px' }}>
              <span style={{ fontSize: '1rem' }}>⬡</span>
              <span style={{ fontWeight: 800, color: 'var(--cyan)', letterSpacing: '0.05em', fontSize: '0.9rem' }}>AXIOS · WEB3 WING · IIITL</span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', lineHeight: 1.8 }}>
              Developed with ❤️ by <strong style={{ color: 'var(--cyan)' }}>Web3 Wing</strong>, Axios · IIITL
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PLAY PAGE ───────────────────────────────────────────────────────────
export default function PlayPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  const [gamePhase, setGamePhase] = useState<GamePhase>('LOBBY');
  const [playerData, setPlayerData] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [marketEvent, setMarketEvent] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showCountdown, setShowCountdown] = useState(false);

  // Use ref for playerData so socket callbacks always have latest value without re-registering
  const playerDataRef = useRef<any>(null);
  useEffect(() => { playerDataRef.current = playerData; }, [playerData]);

  const username = localStorage.getItem('axios_username');
  const web3Address = localStorage.getItem('axios_web3Address');

  // Navigate to share page
  const handleShare = useCallback(() => {
    const asset = playerDataRef.current?.asset;
    if (asset?.uniqueId) {
      window.open(`/asset/${asset.uniqueId}`, '_blank');
    }
  }, []);

  // Handle hold/sell action — use ref so no stale closure on playerData
  const handleAction = useCallback((action: string) => {
    if (socket && playerDataRef.current) {
      socket.emit('playerAction', { roomId, username: playerDataRef.current.username, actionTaken: action });
    }
  }, [socket, roomId]);

  // Handle mint — use ref so no stale closure
  const handleMint = useCallback((asset: any) => {
    if (socket && playerDataRef.current) {
      socket.emit('mintAsset', { roomId, username: playerDataRef.current.username, asset });
    }
  }, [socket, roomId]);

  // Join room and register socket listeners
  useEffect(() => {
    if (!username || !web3Address || !roomId) {
      navigate('/join');
      return;
    }

    if (!socket || !isConnected) return;

    const onError = (msg: string) => setErrorMsg(msg);
    const onJoined = (data: any) => setPlayerData(data);
    const onPlayerList = (list: any[]) => setPlayers(list);
    // Server sends fresh personal player data when the room state changes
    const onPlayerDataUpdate = (data: any) => setPlayerData(data);

    const onGameState = (update: any) => {
      const status = typeof update === 'string' ? update : update?.status;
      const event = update?.marketEvent;
      if (status) {
        // When MINTING starts, immediately clear local asset so MintingPhase shows
        if (status === 'MINTING') {
          setShowCountdown(true);
          setPlayerData((prev: any) => prev ? { ...prev, asset: null, score: 0, actionTaken: null } : prev);
        }
        setGamePhase(status as GamePhase);
      }
      if (event) setMarketEvent(event);
    };
    const onAssetMinted = (data: any) => setPlayerData(data);
    const onActionConfirmed = (data: any) => setPlayerData(data);

    socket.on('gameError', onError);
    socket.on('joined', onJoined);
    socket.on('playerListUpdate', onPlayerList);
    socket.on('playerDataUpdate', onPlayerDataUpdate);
    socket.on('gameStateUpdate', onGameState);
    socket.on('assetMinted', onAssetMinted);
    socket.on('actionConfirmed', onActionConfirmed);

    // Emit join (handles both first join and reconnection)
    socket.emit('joinRoom', { roomId, username, web3Address });

    return () => {
      socket.off('gameError', onError);
      socket.off('joined', onJoined);
      socket.off('playerListUpdate', onPlayerList);
      socket.off('playerDataUpdate', onPlayerDataUpdate);
      socket.off('gameStateUpdate', onGameState);
      socket.off('assetMinted', onAssetMinted);
      socket.off('actionConfirmed', onActionConfirmed);
    };
  }, [socket, isConnected, roomId]);

  // Error screen
  if (errorMsg) {
    return (
      <div className="page-center" style={{ textAlign: 'center' }}>
        <div className="glass-elevated" style={{ padding: '40px 32px', maxWidth: '380px', width: '100%' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ marginBottom: '12px', color: '#f87171' }}>Oops!</h2>
          <p className="text-sm text-muted" style={{ marginBottom: '24px' }}>{errorMsg}</p>
          <button className="btn btn-primary btn-full" onClick={() => navigate('/join')}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading screen (waiting for `joined` event)
  if (!playerData) {
    return (
      <div className="page-center" style={{ textAlign: 'center' }}>
        <div>
          <div style={{ width: '48px', height: '48px', border: '3px solid rgba(0,240,255,0.2)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <p className="text-muted">Connecting to game room...</p>
          <p className="text-xs text-dim" style={{ marginTop: '8px' }}>Room: {roomId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-scroll" style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
      {/* Countdown overlay */}
      {showCountdown && (
        <CountdownOverlay onDone={() => setShowCountdown(false)} />
      )}

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(7,7,16,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="dot-online" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>@{playerData.username}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'var(--cyan)', background: 'var(--cyan-dim)', padding: '3px 10px', borderRadius: '4px' }}>{roomId}</span>
        </div>
      </div>

      {/* Phase content */}
      {gamePhase === 'LOBBY' && (
        <LobbyScreen username={playerData.username} players={players} />
      )}

      {/* Show MintingPhase only when there is NO minted asset (uniqueId = proof of mint) */}
      {gamePhase === 'MINTING' && !playerData.asset?.uniqueId && (
        <MintingPhase
          username={playerData.username}
          web3Address={playerData.web3Address}
          onMint={handleMint}
        />
      )}

      {gamePhase === 'MINTING' && playerData.asset?.uniqueId && (
        <MintedScreen playerData={playerData} />
      )}

      {gamePhase === 'MARKET_EVENT' && (
        <MarketEventScreen event={marketEvent} playerData={playerData} />
      )}

      {gamePhase === 'DECISION' && (
        <DecisionScreen playerData={playerData} onAction={handleAction} />
      )}

      {gamePhase === 'LEADERBOARD' && (
        <LeaderboardScreen players={players} username={playerData.username} playerData={playerData} onShare={handleShare} />
      )}

      {gamePhase === 'REVEAL' && (
        <RevealScreen />
      )}
    </div>
  );
}
