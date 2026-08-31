import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

// Generate a deterministic-looking mock Web3 address
function genAddress(): string {
  const hex = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) addr += hex[Math.floor(Math.random() * 16)];
  return addr;
}

export default function JoinPage() {
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  const [roomId, setRoomId] = useState(paramRoomId || '');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If socket is not yet connected, wait and show connecting
  useEffect(() => {
    if (socket) {
      const onError = (msg: string) => {
        setError(msg);
        setLoading(false);
      };

      const onJoined = (playerData: any) => {
        localStorage.setItem('axios_username', playerData.username);
        localStorage.setItem('axios_web3Address', playerData.web3Address);
        localStorage.setItem('axios_roomId', playerData.roomId);
        navigate(`/play/${playerData.roomId}`);
      };

      socket.on('gameError', onError);
      socket.on('joined', onJoined);

      return () => {
        socket.off('gameError', onError);
        socket.off('joined', onJoined);
      };
    }
  }, [socket, navigate]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim();
    const trimmedRoom = roomId.trim().toUpperCase();

    if (!trimmedRoom) { setError('Please enter a room code'); return; }
    if (!trimmedUser) { setError('Please choose a username'); return; }
    if (trimmedUser.length > 16) { setError('Username must be 16 characters max'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUser)) { setError('Only letters, numbers, and underscores allowed'); return; }

    if (!socket || !isConnected) {
      setError('Not connected to server. Please refresh.');
      return;
    }

    const web3Address = genAddress();
    setLoading(true);
    socket.emit('joinRoom', { roomId: trimmedRoom, username: trimmedUser, web3Address });

    // Timeout fallback
    setTimeout(() => {
      setLoading(false);
      // If still on this page, something went wrong
    }, 10000);
  };

  return (
    <div className="page-center">
      <div className="mobile-wrap" style={{ animation: 'fadeIn 0.5s ease-out' }}>
        {/* Back link */}
        <button
          onClick={() => navigate('/')}
          className="btn text-sm"
          style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.8rem' }}
        >
          ← Back
        </button>

        <div className="glass-elevated" style={{ padding: '40px 32px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎮</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Enter <span className="gradient-text">the Game</span>
            </h1>
            <p className="text-sm text-muted">Join the live session with your room code</p>
          </div>

          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Room Code */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)' }}>
                Room Code
              </label>
              <input
                type="text"
                className="input mono"
                placeholder="AXIOS-7F42"
                value={roomId}
                onChange={e => setRoomId(e.target.value.toUpperCase())}
                maxLength={20}
                readOnly={!!paramRoomId}
                style={{ fontSize: '1.2rem', letterSpacing: '0.1em', opacity: paramRoomId ? 0.7 : 1 }}
              />
              {paramRoomId && (
                <p className="text-xs text-muted" style={{ marginTop: '6px' }}>Auto-filled from your invite link</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)' }}>
                Choose Your Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="0xNinja, PixelParth, BlockBuster..."
                value={username}
                onChange={e => setUsername(e.target.value)}
                maxLength={16}
                autoFocus
              />
              <p className="text-xs text-muted" style={{ marginTop: '6px' }}>
                {username.length}/16 · Letters, numbers, underscores only
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#f87171',
                fontSize: '0.9rem',
                animation: 'fadeIn 0.3s ease-out',
              }}>
                ⚠ {error}
              </div>
            )}

            {/* Connection status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isConnected ? 'var(--energy)' : 'var(--text-3)' }}>
              <span className={isConnected ? 'dot-online' : 'dot-offline'} />
              {isConnected ? 'Server connected' : 'Connecting to server...'}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading || !isConnected}
            >
              {loading ? (
                <>
                  <span className="animate-spin" style={{ display: 'inline-block', borderRadius: '50%', width: '16px', height: '16px', border: '2px solid rgba(0,240,255,0.3)', borderTopColor: 'var(--cyan)' }} />
                  JOINING...
                </>
              ) : 'JOIN NOW →'}
            </button>
          </form>

          <hr className="divider" style={{ margin: '24px 0' }} />
          <p className="text-xs text-dim" style={{ textAlign: 'center' }}>
            A mock Web3 address will be auto-generated for you.<br />No wallet or crypto needed.
          </p>
        </div>
      </div>
    </div>
  );
}
