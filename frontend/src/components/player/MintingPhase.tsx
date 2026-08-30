import React, { useState, useEffect, useRef } from 'react';
import AssetCard from './AssetCard';

const CORES = [
  { name: 'ICE', emoji: '❄', cost: 0, desc: 'Cool & calculated' },
  { name: 'FIRE', emoji: '🔥', cost: 0, desc: 'Aggressive & bold' },
  { name: 'VOID', emoji: '🌑', cost: 0, desc: 'Mysterious & rare' },
  { name: 'ENERGY', emoji: '⚡', cost: 0, desc: 'Fast & electric' },
];

const TRAITS = [
  { name: 'Shades',       cost: 10, rarity: 'Common',    emoji: '🕶' },
  { name: 'Halo',         cost: 20, rarity: 'Uncommon',  emoji: '✨' },
  { name: 'Crown',        cost: 20, rarity: 'Uncommon',  emoji: '👑' },
  { name: 'Pixel Aura',   cost: 25, rarity: 'Uncommon',  emoji: '🌈' },
  { name: 'Wings',        cost: 30, rarity: 'Rare',      emoji: '🦋' },
  { name: 'Cyber Armor',  cost: 40, rarity: 'Rare',      emoji: '🛡' },
  { name: 'Dragon',       cost: 50, rarity: 'Epic',      emoji: '🐉' },
  { name: 'Glitch',       cost: 70, rarity: 'Legendary', emoji: '⚡' },
];

const RARITY_COLORS: Record<string, string> = {
  Common: '#94a3b8',
  Uncommon: '#4ade80',
  Rare: '#38bdf8',
  Epic: '#a855f7',
  Legendary: '#fbbf24',
};

interface MintingPhaseProps {
  username: string;
  web3Address: string;
  onMint: (asset: { core: string; traits: string[] }) => void;
}

type MintStep = 'select' | 'confirm' | 'minting';

export default function MintingPhase({ username, web3Address, onMint }: MintingPhaseProps) {
  const [core, setCore] = useState('VOID');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [step, setStep] = useState<MintStep>('select');
  const [mintStep, setMintStep] = useState(0);

  // Use refs to always capture the LATEST values in the animation effect (fixes stale closure)
  const coreRef = useRef(core);
  const traitsRef = useRef(selectedTraits);
  const onMintRef = useRef(onMint);
  useEffect(() => { coreRef.current = core; }, [core]);
  useEffect(() => { traitsRef.current = selectedTraits; }, [selectedTraits]);
  useEffect(() => { onMintRef.current = onMint; }, [onMint]);

  const spent = selectedTraits.reduce((acc, t) => {
    const trait = TRAITS.find(x => x.name === t);
    return acc + (trait?.cost ?? 0);
  }, 0);
  const remaining = 100 - spent;

  const MINT_STEPS = ['GENERATING...', 'VERIFYING...', 'MINTING...', 'MINTED ✓'];

  // Animate minting steps — uses refs so it always fires with current core/traits
  useEffect(() => {
    if (step === 'minting') {
      let i = 0;
      const timer = setInterval(() => {
        i++;
        setMintStep(i);
        if (i >= MINT_STEPS.length - 1) {
          clearInterval(timer);
          setTimeout(() => onMintRef.current({ core: coreRef.current, traits: traitsRef.current }), 600);
        }
      }, 700);
      return () => clearInterval(timer);
    }
  }, [step]);

  const toggleTrait = (name: string) => {
    if (selectedTraits.includes(name)) {
      setSelectedTraits(prev => prev.filter(t => t !== name));
    } else {
      if (selectedTraits.length >= 2) return;
      const trait = TRAITS.find(t => t.name === name);
      if (trait && remaining >= trait.cost) {
        setSelectedTraits(prev => [...prev, name]);
      }
    }
  };

  // ── MINTING ANIMATION ─────────────────────────────────────────────────────
  if (step === 'minting') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '32px', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{
          width: '80px', height: '80px',
          border: '3px solid rgba(0,240,255,0.2)',
          borderTopColor: 'var(--cyan)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />

        <div>
          <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', letterSpacing: '0.15em', marginBottom: '16px', textTransform: 'uppercase' }}>
            {MINT_STEPS.slice(0, mintStep + 1).map((s, i) => (
              <span key={s} style={{ display: 'block', color: i === mintStep ? 'var(--cyan)' : 'var(--text-3)', transition: 'all 0.3s', fontWeight: i === mintStep ? 700 : 400 }}>
                {i === mintStep ? '→ ' : '✓ '}{s}
              </span>
            ))}
          </p>
        </div>

        <div className="glass" style={{ padding: '12px 20px', borderRadius: '8px' }}>
          <p className="text-xs text-muted">Writing to blockchain simulation...</p>
        </div>
      </div>
    );
  }

  // ── CONFIRM STEP ─────────────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <div style={{ padding: '24px 20px', animation: 'fadeIn 0.4s ease-out' }}>
        <button onClick={() => setStep('select')} className="btn text-sm" style={{ marginBottom: '24px', padding: '8px 14px', fontSize: '0.8rem' }}>
          ← Edit
        </button>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Confirm & Mint</h2>
        <p className="text-sm text-muted" style={{ marginBottom: '24px' }}>Once minted, your asset is locked for this round.</p>

        <div style={{ marginBottom: '24px' }}>
          <AssetCard core={core} traits={selectedTraits} username={username} web3Address={web3Address} />
        </div>

        <div className="glass" style={{ padding: '16px 20px', borderRadius: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="text-sm text-muted">Total spent</span>
            <span style={{ fontWeight: 700 }}>{spent} $AXIOS</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-sm text-muted">Remaining</span>
            <span style={{ fontWeight: 700, color: 'var(--energy)' }}>{remaining} $AXIOS</span>
          </div>
        </div>

        <button className="btn btn-primary btn-lg btn-full animate-glow" onClick={() => setStep('minting')}>
          MINT ASSET 🎨
        </button>
      </div>
    );
  }

  // ── MAIN SELECTION ────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '0 0 40px', animation: 'fadeIn 0.4s ease-out' }}>
      {/* Balance bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(7,7,16,0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div className="text-xs text-dim" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Balance</div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
            100 <span style={{ color: 'var(--cyan)', fontSize: '0.75rem' }}>$AXIOS</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="text-xs text-dim" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Remaining</div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: remaining < 20 ? '#f87171' : remaining < 40 ? '#fbbf24' : 'var(--energy)' }}>
            {remaining} <span style={{ fontSize: '0.75rem' }}>$AXIOS</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Live preview card */}
        <div style={{ marginBottom: '28px' }}>
          <AssetCard core={core} traits={selectedTraits} username={username} web3Address={web3Address} />
        </div>

        {/* STEP 1: Choose Core */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            1. Choose Core
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {CORES.map(c => (
              <button
                key={c.name}
                onClick={() => setCore(c.name)}
                style={{
                  background: core === c.name ? 'var(--bg-card-h)' : 'var(--bg-card)',
                  border: `1.5px solid ${core === c.name ? 'rgba(0,240,255,0.5)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  padding: '14px 12px',
                  cursor: 'pointer',
                  color: 'var(--text)',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(8px)',
                  outline: 'none',
                }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{c.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.05em' }}>{c.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '2px' }}>{c.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 2: Choose Traits */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
              2. Choose Traits
            </h3>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{selectedTraits.length}/2</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {TRAITS.map(t => {
              const isSelected = selectedTraits.includes(t.name);
              const canAfford = remaining >= t.cost || isSelected;
              const isMaxed = selectedTraits.length >= 2 && !isSelected;
              const disabled = !canAfford || isMaxed;
              const rarityColor = RARITY_COLORS[t.rarity];

              return (
                <div
                  key={t.name}
                  onClick={() => !disabled && toggleTrait(t.name)}
                  style={{
                    background: isSelected ? 'rgba(0,240,255,0.06)' : disabled ? 'rgba(255,255,255,0.02)' : 'var(--bg-card)',
                    border: `1px solid ${isSelected ? 'rgba(0,240,255,0.4)' : 'var(--border)'}`,
                    borderRadius: '12px',
                    padding: '14px 16px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.4 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{t.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.7rem', color: rarityColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.rarity}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: isSelected ? 'var(--cyan)' : 'var(--text-2)' }}>
                      {t.cost}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>$AXIOS</div>
                  </div>
                  {isSelected && (
                    <div style={{ width: '20px', height: '20px', background: 'var(--cyan)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#000', fontWeight: 900, flexShrink: 0 }}>
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mint button */}
        <button
          className="btn btn-primary btn-lg btn-full"
          disabled={selectedTraits.length === 0}
          onClick={() => setStep('confirm')}
        >
          REVIEW & MINT →
        </button>

        <p className="text-xs text-dim" style={{ textAlign: 'center', marginTop: '12px' }}>
          $AXIOS is in-game currency with no real monetary value.
        </p>
      </div>
    </div>
  );
}
