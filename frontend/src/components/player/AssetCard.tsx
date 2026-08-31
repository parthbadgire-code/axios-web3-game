
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
  FIRE:   { color: '#ea580c', glow: 'rgba(234, 88, 12, 0.7)',    shape: 'polygon(50% 0%, 0% 100%, 100% 100%)', emoji: '🔥' },
  ICE:    { color: '#a7f3d0', glow: 'rgba(167, 243, 208, 0.7)',  shape: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', emoji: '❄' },
  VOID:   { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.7)',   shape: 'none', emoji: '🌑' },
  ENERGY: { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.7)',   shape: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', emoji: '⚡' },
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

  return (
    <div
      id="asset-card"
      style={{
        background: `linear-gradient(145deg, #181514 0%, #080605 100%)`,
        border: `2px solid ${cfg.color}30`,
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: `0 20px 50px -10px ${cfg.glow}20, inset 0 2px 10px rgba(255,255,255,0.05), inset 0 -2px 15px ${cfg.color}10`,
        width: '100%',
        aspectRatio: compact ? 'auto' : '3/4',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transform: 'translateZ(0)', /* Hardware acceleration */
      }}
    >
      {/* ── BACKGROUND NOISE TEXTURE ── */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none', mixBlendMode: 'overlay',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
      }} />

      {/* ── HOLOGRAPHIC SWEEP ── */}
      <div style={{
        position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', pointerEvents: 'none', zIndex: 20,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
        transform: 'skewX(-20deg)',
        animation: 'holographicSweep 6s infinite ease-in-out',
      }} />

      {/* ── TOP ACCENT BORDER ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`, zIndex: 10 }} />

      {/* ── VISUAL AREA ── */}
      {!compact && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '240px',
        }}>
          {/* Radial Core Glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(circle at center, ${cfg.glow}25 0%, transparent 60%)`,
          }} />

          {/* Hexagon Grid Pattern Overlay */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.15,
            backgroundImage: `radial-gradient(${cfg.color} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)'
          }} />

          {/* Core Emoji / Shape */}
          <div
            className="animate-float"
            style={{
              width: '130px',
              height: '130px',
              background: `linear-gradient(135deg, ${cfg.color}ff, ${cfg.color}40)`,
              borderRadius: core === 'VOID' ? '30px' : '50%',
              clipPath: cfg.shape !== 'none' ? cfg.shape : undefined,
              boxShadow: `0 0 80px ${cfg.glow}, inset 0 0 40px rgba(255,255,255,0.4), inset 0 5px 10px rgba(255,255,255,0.3)`,
              border: `2px solid rgba(255,255,255,0.2)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4.5rem',
              position: 'relative',
              zIndex: 10,
              filter: `drop-shadow(0px 20px 30px ${cfg.glow})`
            }}
          >
            {cfg.emoji}
          </div>

          {/* Watermark */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            width: '100%',
            textAlign: 'center',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 900,
            fontSize: '2.8rem',
            letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.025)',
            WebkitTextStroke: '1px rgba(255,255,255,0.04)',
            whiteSpace: 'nowrap',
            zIndex: 1,
            pointerEvents: 'none'
          }}>
            AXIOS WEB3 WING · IIITL
          </div>

          {/* Trait Badges */}
          <div style={{ position: 'absolute', right: '16px', top: '16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 15 }}>
            {traits.map((t) => (
              <div key={t} style={{
                background: 'rgba(5,3,2,0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${cfg.color}50`,
                borderLeft: `4px solid ${cfg.color}`,
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: 'var(--text)',
                textTransform: 'uppercase',
                boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1.1rem' }}>{TRAIT_EMOJI[t] || '◆'}</span>
                {t}
              </div>
            ))}
          </div>

          {/* Rarity Badge */}
          {rarity && (
            <div style={{
              position: 'absolute', left: '16px', top: '16px',
              fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.15em',
              color: rar.color, background: `${rar.color}15`,
              border: `1px solid ${rar.color}50`,
              borderRadius: '8px', padding: '8px 16px',
              zIndex: 15, boxShadow: `0 0 20px ${rar.color}30`,
              backdropFilter: 'blur(8px)'
            }}>
              {rar.label}
            </div>
          )}
        </div>
      )}

      {/* ── INFO FOOTER ── */}
      <div style={{
        padding: compact ? '16px' : '24px 24px 20px',
        background: 'rgba(10,8,7,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: `1px solid ${cfg.color}30`,
        position: 'relative',
        zIndex: 10
      }}>
        {/* Score Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: compact ? '12px' : '16px' }}>
          {uniqueId ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', background: cfg.color, borderRadius: '50%', boxShadow: `0 0 10px ${cfg.color}` }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: cfg.color, letterSpacing: '0.1em' }}>
                #{uniqueId.split('-').slice(1).join('-')}
              </span>
            </div>
          ) : (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'var(--text-3)' }}>UNISSUED</span>
          )}
          {score !== undefined && (
            <div style={{
              background: `linear-gradient(90deg, transparent, ${cfg.color}15)`,
              padding: '6px 16px', borderRadius: '100px', borderRight: `2px solid ${cfg.color}`,
              fontSize: '1.2rem', fontWeight: 900, color: '#fff', textShadow: `0 0 15px ${cfg.glow}`
            }}>
              {score.toLocaleString()} <span style={{ fontSize: '0.7rem', color: cfg.color, opacity: 0.8 }}>PTS</span>
            </div>
          )}
        </div>

        {/* Owner Block */}
        <div style={{ 
          background: 'rgba(255,255,255,0.02)', 
          border: '1px solid rgba(255,255,255,0.05)', 
          borderRadius: '16px', 
          padding: '16px', 
          marginBottom: '16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-3)', marginBottom: '6px' }}>Owner</div>
            <div style={{ fontSize: compact ? '1.1rem' : '1.4rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff' }}>@{username}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: cfg.color, opacity: 0.6, letterSpacing: '0.05em', lineHeight: 1.6 }}>
              {web3Address ? `${web3Address.slice(0, 21)}` : ''}
              <br />
              {web3Address ? `${web3Address.slice(21)}` : ''}
            </div>
          </div>
        </div>

        {/* Footer Brand Line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: cfg.color, letterSpacing: '0.05em' }}>
              {core}
            </span>
          </div>
          <div style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--text-3)' }}>
            AXIOS // WEB3 // IIITL
          </div>
        </div>
      </div>
    </div>
  );
}
