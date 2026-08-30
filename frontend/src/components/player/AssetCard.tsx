import React from 'react';

interface AssetCardProps {
  core: string;
  traits: string[];
  username: string;
  web3Address: string;
  uniqueId?: string;
  rarity?: string;
  score?: number;
  compact?: boolean;
}

const CORE_CONFIG: Record<string, { color: string; glow: string; shape: string; emoji: string }> = {
  FIRE:   { color: '#ff6230', glow: 'rgba(255,98,48,0.5)',   shape: 'polygon(50% 0%, 0% 100%, 100% 100%)', emoji: '🔥' },
  ICE:    { color: '#38bdf8', glow: 'rgba(56,189,248,0.5)',  shape: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', emoji: '❄' },
  VOID:   { color: '#a855f7', glow: 'rgba(168,85,247,0.5)',  shape: 'none', emoji: '🌑' },
  ENERGY: { color: '#4ade80', glow: 'rgba(74,222,128,0.5)',  shape: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', emoji: '⚡' },
};

const TRAIT_EMOJI: Record<string, string> = {
  Shades: '🕶', Crown: '👑', Halo: '✨', Wings: '🦋',
  'Cyber Armor': '🛡', Dragon: '🐉', 'Pixel Aura': '🌈', Glitch: '⚡',
};

const RARITY_CONFIG: Record<string, { color: string; label: string }> = {
  Common:    { color: '#94a3b8', label: 'COMMON' },
  Uncommon:  { color: '#4ade80', label: 'UNCOMMON' },
  Rare:      { color: '#38bdf8', label: 'RARE' },
  Epic:      { color: '#a855f7', label: 'EPIC' },
  Legendary: { color: '#fbbf24', label: 'LEGENDARY' },
};

export default function AssetCard({ core, traits, username, web3Address, uniqueId, rarity, score, compact }: AssetCardProps) {
  const cfg = CORE_CONFIG[core] || CORE_CONFIG.VOID;
  const rar = RARITY_CONFIG[rarity || 'Common'];
  const shortAddr = web3Address ? `${web3Address.slice(0, 6)}...${web3Address.slice(-4)}` : '';

  return (
    <div
      id="asset-card"
      style={{
        background: `linear-gradient(145deg, rgba(15,15,25,0.95) 0%, rgba(5,5,15,1) 100%)`,
        border: `1.5px solid ${cfg.color}40`,
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: `0 0 40px ${cfg.glow}30, 0 20px 60px rgba(0,0,0,0.6)`,
        width: '100%',
        aspectRatio: compact ? 'auto' : '3/4',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Top accent line */}
      <div style={{ height: '3px', background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }} />

      {/* Visual area */}
      {!compact && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: `radial-gradient(ellipse at center, ${cfg.glow}25 0%, transparent 70%)`,
          minHeight: '180px',
        }}>
          {/* Background orbs */}
          <div style={{
            position: 'absolute', width: '200px', height: '200px',
            background: `radial-gradient(circle, ${cfg.color}15 0%, transparent 70%)`,
            borderRadius: '50%',
          }} />

          {/* Core visual */}
          <div
            className="animate-float"
            style={{
              width: compact ? '60px' : '100px',
              height: compact ? '60px' : '100px',
              background: `radial-gradient(circle at 35% 35%, ${cfg.color}cc, ${cfg.color}44)`,
              borderRadius: core === 'VOID' ? '12px' : '50%',
              clipPath: cfg.shape !== 'none' ? cfg.shape : undefined,
              boxShadow: `0 0 40px ${cfg.glow}, inset 0 0 20px rgba(255,255,255,0.1)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: compact ? '1.5rem' : '2.5rem',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {cfg.emoji}
          </div>

          {/* Trait badges floating */}
          {traits.map((t, i) => (
            <div key={t} style={{
              position: 'absolute',
              top: i === 0 ? '16px' : undefined,
              bottom: i === 1 ? '16px' : undefined,
              right: '16px',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              border: `1px solid rgba(255,255,255,0.15)`,
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              animation: 'fadeIn 0.5s ease-out',
            }}>
              {TRAIT_EMOJI[t] || '◆'} {t.toUpperCase()}
            </div>
          ))}

          {/* Rarity badge */}
          {rarity && (
            <div style={{
              position: 'absolute', top: '16px', left: '16px',
              fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em',
              color: rar.color, background: `${rar.color}18`,
              border: `1px solid ${rar.color}50`,
              borderRadius: '100px', padding: '4px 10px',
            }}>
              ◆ {rar.label}
            </div>
          )}
        </div>
      )}

      {/* Info footer */}
      <div style={{
        padding: compact ? '12px 16px' : '20px',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${cfg.color}20`,
      }}>
        {/* Asset ID + score row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: compact ? '8px' : '12px' }}>
          {uniqueId ? (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: cfg.color, letterSpacing: '0.05em' }}>
              #{uniqueId.split('-').slice(1).join('-')}
            </span>
          ) : (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'var(--text-3)' }}>UNISSUED</span>
          )}
          {score !== undefined && (
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: cfg.color }}>
              {score.toLocaleString()} pts
            </span>
          )}
        </div>

        {/* Owner row — prominent username + full address */}
        <div style={{ marginBottom: compact ? '6px' : '10px', padding: compact ? '6px 0' : '8px 0', borderTop: `1px solid ${cfg.color}20`, borderBottom: `1px solid ${cfg.color}20` }}>
          <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-3)', marginBottom: '3px' }}>Owner</div>
          <div style={{ fontSize: compact ? '1rem' : '1.15rem', fontWeight: 900, letterSpacing: '-0.01em', marginBottom: '4px' }}>@{username}</div>
          {/* Full wallet address split into two lines for readability */}
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: cfg.color, opacity: 0.7, letterSpacing: '0.04em', lineHeight: 1.6, wordBreak: 'break-all' }}>
            {web3Address ? `${web3Address.slice(0, 21)}` : ''}
            <br />
            {web3Address ? `${web3Address.slice(21)}` : ''}
          </div>
        </div>

        {/* Core + traits summary */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {cfg.emoji} {core}
          </span>
          {traits.map(t => (
            <span key={t} style={{ fontSize: '0.65rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>
              · {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
