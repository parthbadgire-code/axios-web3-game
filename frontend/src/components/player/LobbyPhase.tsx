
export default function LobbyPhase({ players }: { players: any[] }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2 style={{ marginBottom: '10px' }}>YOU'RE IN</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>WAITING FOR THE HOST...</p>
      
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '2rem', color: 'var(--accent-cyan)' }}>{players.length}</h3>
        <p style={{ color: 'var(--text-secondary)' }}>PLAYERS JOINED</p>
      </div>
    </div>
  );
}
