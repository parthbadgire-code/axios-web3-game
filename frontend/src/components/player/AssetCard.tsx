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
  FIRE:   { color: '#ea580c', glow: 'rgba(234, 88, 12, 0.6)',    shape: 'polygon(50% 0%, 0% 100%, 100% 100%)', emoji: '🔥' },
  ICE:    { color: '#a7f3d0', glow: 'rgba(167, 243, 208, 0.6)',  shape: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', emoji: '❄' },
  VOID:   { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)',   shape: 'none', emoji: '🌑' },
  ENERGY: { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.6)',   shape: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', emoji: '⚡' },
};

const TRAIT_EMOJI: Record<string, string> = {
  Shades: '🕶', Crown: '👑', Halo: '✨', Wings: '🦋',
  'Cyber Armor': '🛡', Dragon: '🐉', 'Pixel Aura': '🌈', Glitch: '⚡',
};

const RARITY_CONFIG: Record<string, { color: string; label: string }> = {
  Common:    { color: '#94a3b8', label: 'COMMON' },
  Uncommon:  { color: '#a7f3d0', label: 'UNCOMMON' },
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
        background: `linear-gradient(160deg, #1f1a18 0%, #0a0807 100%)`,
        border: `2px solid ${cfg.color}50`,
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: `0 10px 40px ${cfg.glow}20, inset 0 2px 20px rgba(255,255,255,0.05)`,
        width: '100%',
        aspectRatio: compact ? 'auto' : '3/4',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transform: 'translateZ(0)', /* Force hardware acceleration */
      }}
    >
      {/* Top Glass Highlight */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)', pointerEvents: 'none', zIndex: 5 }} />

      {/* Visual area */}
      {!compact && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: `radial-gradient(circle at center, ${cfg.glow}30 0%, transparent 75%)`,
          minHeight: '220px',
        }}>
          {/* Subtle Grid Pattern Overlay */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.1,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
          }} />

          {/* Core visual / Emoji with giant glow */}
          <div
            className="animate-float"
            style={{
              width: '120px',
              height: '120px',
              background: `radial-gradient(circle at 30% 30%, ${cfg.color}ee, ${cfg.color}40)`,
              borderRadius: core === 'VOID' ? '20px' : '50%',
              clipPath: cfg.shape !== 'none' ? cfg.shape : undefined,
              boxShadow: `0 0 60px ${cfg.glow}, inset 0 0 30px rgba(255,255,255,0.2)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
              position: 'relative',
              zIndex: 10,
              filter: 'drop-shadow(0px 20px 20px rgba(0,0,0,0.5))'
            }}
          >
            {cfg.emoji}
          </div>

          {/* AXIOS WATERMARK */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            width: '100%',
            textAlign: 'center',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 900,
            fontSize: '2.5rem',
            letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.03)',
            whiteSpace: 'nowrap',
            zIndex: 1,
            pointerEvents: 'none'
          }}>
            AXIOS WEB3 WING · IIITL
          </div>

          {/* Trait badges floating */}
          {traits.map((t, i) => (
            <div key={t} style={{
              position: 'absolute',
              top: i === 0 ? '20px' : undefined,
              bottom: i === 1 ? '40px' : undefined,
              right: '20px',
              background: 'rgba(20,15,13,0.7)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${cfg.color}60`,
              borderRadius: '12px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'var(--text)',
              animation: 'fadeIn 0.5s ease-out',
              zIndex: 15,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              {TRAIT_EMOJI[t] || '◆'} {t.toUpperCase()}
            </div>
          ))}

          {/* Rarity badge */}
          {rarity && (
            <div style={{
              position: 'absolute', top: '20px', left: '20px',
              fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.15em',
              color: rar.color, background: `${rar.color}20`,
              border: `1px solid ${rar.color}60`,
              borderRadius: '12px', padding: '6px 14px',
              zIndex: 15, boxShadow: `0 0 15px ${rar.color}40`
            }}>
              {rar.label}
            </div>
          )}
        </div>
      )}

      {/* Info footer */}
      <div style={{
        padding: compact ? '16px' : '24px',
        background: 'rgba(10,8,7,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: `1px solid ${cfg.color}30`,
        position: 'relative',
        zIndex: 10
      }}>
        {/* Asset ID + score row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: compact ? '12px' : '16px' }}>
          {uniqueId ? (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: cfg.color, letterSpacing: '0.05em', background: `${cfg.color}15`, padding: '4px 8px', borderRadius: '6px' }}>
              #{uniqueId.split('-').slice(1).join('-')}
            </span>
          ) : (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'var(--text-3)' }}>UNISSUED</span>
          )}
          {score !== undefined && (
            <span style={{ fontSize: '1rem', fontWeight: 900, color: cfg.color, textShadow: `0 0 10px ${cfg.glow}` }}>
              {score.toLocaleString()} PTS
            </span>
          )}
        </div>

        {/* Owner row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', padding: '12px 0', borderTop: `1px solid rgba(255,255,255,0.05)`, borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
          <div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: '4px' }}>Owner</div>
            <div style={{ fontSize: compact ? '1.1rem' : '1.3rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text)' }}>@{username}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: cfg.color, opacity: 0.8, letterSpacing: '0.05em', lineHeight: 1.6, textAlign: 'right' }}>
              {web3Address ? `${web3Address.slice(0, 21)}` : ''}
              <br />
              {web3Address ? `${web3Address.slice(21)}` : ''}
            </div>
          </div>
        </div>

        {/* Brand / Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {core}
            </span>
            {traits.map(t => (
              <span key={t} style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 600 }}>
                · {t}
              </span>
            ))}
          </div>
          
          <div style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-3)' }}>
            AXIOS // WEB3 // IIITL
          </div>
        </div>
      </div>
    </div>
  );
}
