import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import AssetCard from '../components/player/AssetCard';

export default function AssetSharePage() {
  const { uniqueId } = useParams<{ uniqueId: string }>();
  const [assetData, setAssetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
    fetch(`${url}/api/asset/${uniqueId}`)
      .then(r => { if (!r.ok) throw new Error('Asset not found'); return r.json(); })
      .then(data => setAssetData(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [uniqueId]);

  const downloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#07070f',
        scale: 3, // High-res
        useCORS: true,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${uniqueId}.png`;
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="page-center" style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(251,191,36,0.2)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
        <p className="text-muted">Loading asset...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-center" style={{ textAlign: 'center' }}>
        <div className="glass-elevated" style={{ padding: '40px', maxWidth: '360px', width: '100%' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
          <h2 style={{ marginBottom: '12px' }}>Asset Not Found</h2>
          <p className="text-sm text-muted" style={{ marginBottom: '24px' }}>{error}</p>
          <Link to="/" className="btn btn-primary btn-full" style={{ textDecoration: 'none' }}>Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-scroll">
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(7,7,16,0.95)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span className="gradient-text" style={{ fontWeight: 900, fontSize: '1.1rem' }}>AXIOS WEB3</span>
        </Link>
        <span className="badge badge-cyan">Digital Asset</span>
      </div>

      <div className="page-center" style={{ paddingTop: '40px', paddingBottom: '60px', alignItems: 'flex-start' }}>
        <div className="mobile-wrap" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '8px' }}>
              <span className="gradient-text">AXIOS ASSET</span>
            </h1>
            <p className="text-sm text-muted">A digital collectible minted during the AXIOS Web3 Wing orientation.</p>
          </div>

          {/* The card (captured by html2canvas) */}
          <div ref={cardRef} style={{ padding: '20px', background: '#07070f', borderRadius: '20px', marginBottom: '24px' }}>
            <AssetCard
              core={assetData.core}
              traits={assetData.traits || []}
              username={assetData.username}
              web3Address={assetData.web3Address}
              uniqueId={assetData.uniqueId}
              rarity={assetData.rarity}
              score={assetData.score}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={downloadImage}
              disabled={downloading}
            >
              {downloading ? (
                <><span className="animate-spin" style={{ display: 'inline-block', borderRadius: '50%', width: '16px', height: '16px', border: '2px solid rgba(251,191,36,0.3)', borderTopColor: 'var(--gold)' }} /> Generating...</>
              ) : '⬇ Download as Image'}
            </button>
            <button className="btn btn-full" onClick={copyLink}>
              {copied ? '✓ Link Copied!' : '🔗 Copy Share Link'}
            </button>
          </div>

          {/* Web3 context */}
          <div className="glass" style={{ padding: '20px', borderRadius: '14px', textAlign: 'center' }}>
            <p className="text-xs text-dim" style={{ lineHeight: 1.7 }}>
              This asset was "minted" during the <strong style={{ color: 'var(--text-2)' }}>AXIOS Web3 Wing Orientation</strong>.<br />
              Want to learn how to build real NFTs and blockchain apps?<br />
              <strong style={{ color: 'var(--gold)' }}>Join AXIOS Web3 Wing lectures! 🚀</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
