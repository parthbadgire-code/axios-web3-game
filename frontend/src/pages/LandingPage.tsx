import React from 'react';
import { useNavigate } from 'react-router-dom';

// Floating particle component
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{
      position: 'absolute',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(251,191,36,0.4), rgba(255,187,166,0.4))',
      filter: 'blur(1px)',
      animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
      animationDelay: `${Math.random() * 3}s`,
      ...style,
    }} />
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  const particles = Array.from({ length: 20 }, (_, i) => ({
    width: `${4 + Math.random() * 8}px`,
    height: `${4 + Math.random() * 8}px`,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    opacity: 0.3 + Math.random() * 0.5,
  }));

  return (
    <div className="page-center" style={{ overflow: 'hidden' }}>
      {/* Particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        {particles.map((p, i) => <Particle key={i} style={p} />)}
      </div>

      {/* Glowing orbs */}
      <div style={{
        position: 'fixed', top: '20%', right: '10%',
        width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '20%', left: '5%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(255,187,166,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="mobile-wrap" style={{ textAlign: 'center', animation: 'fadeIn 0.8s ease-out' }}>
        {/* Logo / Badge */}
        <div style={{ marginBottom: '24px' }}>
          <span className="badge badge-cyan" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>
            ⬡ AXIOS · WEB3 WING · ORIENTATION
          </span>
        </div>

        {/* Hero headline */}
        <h1 style={{ fontSize: 'clamp(3rem, 12vw, 5.5rem)', fontWeight: 900, lineHeight: 1, marginBottom: '8px', letterSpacing: '-0.03em' }}>
          <span className="gradient-text">AXIOS</span>
          <br />
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>WEB3</span>
        </h1>

        {/* Tagline */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', margin: '16px 0 8px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.2em', fontSize: '0.9rem' }}>
          <span>MINT</span>
          <span style={{ color: 'var(--gold)' }}>//</span>
          <span>RANK</span>
          <span style={{ color: 'var(--gold)' }}>//</span>
          <span>WIN</span>
        </div>

        <p style={{ color: 'var(--text-2)', fontSize: '1.2rem', marginBottom: '40px', fontWeight: 300 }}>
          Create. Mint. Compete.
        </p>

        {/* Main card */}
        <div className="glass-elevated" style={{ padding: '40px 32px', marginBottom: '24px' }}>
          <button
            className="btn btn-primary btn-lg btn-full animate-glow"
            onClick={() => navigate('/join')}
            style={{ fontSize: '1.1rem', marginBottom: '16px' }}
          >
            JOIN GAME →
          </button>

          <p className="text-sm text-dim">
            No Web3 knowledge required.
          </p>
        </div>

        {/* Feature dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {['🎨 Mint NFTs', '⚡ Real-time', '🏆 Compete', '🔗 Share'].map(f => (
            <span key={f} className="text-xs text-muted">{f}</span>
          ))}
        </div>

        <p style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
          Developed with ❤️ by <strong style={{ color: 'var(--gold)' }}>Web3 Wing</strong>, Axios · IIITL
        </p>
      </div>
    </div>
  );
}
