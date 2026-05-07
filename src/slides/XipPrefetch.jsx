import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import { getSlide } from '../content.js';

const c = getSlide('xip-prefetch').content;

const EASE = 'cubic-bezier(.4,0,.2,1)';

// ── Rejected: cascade chain ─────────────────────────────────────────────────
function RejectedBlock({ active }) {
  // Each chain step animates in left-to-right when this block becomes active.
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => { if (active) setAnimKey((k) => k + 1); }, [active]);

  const r = c.rejected;
  return (
    <div style={{
      border: `2px solid ${active ? '#c0392b' : 'var(--line-hairline)'}`,
      background: active
        ? 'color-mix(in oklch, #c0392b 6%, var(--color-paper))'
        : 'var(--color-paper)',
      padding: active ? '20px 24px' : '14px 24px',
      transition: `padding 380ms ${EASE}, background 380ms ${EASE}, border-color 380ms ${EASE}, opacity 380ms ${EASE}`,
      opacity: active ? 1 : 0.55,
      flex: active ? '1 1 auto' : '0 0 auto',
      display: 'flex', flexDirection: 'column', gap: 14,
      minHeight: 0, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap',
        paddingBottom: active ? 12 : 0,
        borderBottom: active ? '2px solid #c0392b' : 'none',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 13,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: '#c0392b', fontWeight: 'var(--fw-medium)',
        }}>{r.tag}</div>
        <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-ink)' }}>
          {r.head}
        </div>
        {active && <div style={{
          fontSize: 15, color: 'var(--color-ink-soft)',
        }}>{r.sub}</div>}
      </div>

      {active && (
        <div key={animKey} style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto',
          gap: 10, alignItems: 'stretch',
        }}>
          {r.chain.map((cell, i) => (
            <div key={i} style={{
              border: '1px solid #c0392b',
              background: 'color-mix(in oklch, #c0392b 8%, var(--color-paper))',
              padding: '12px 14px',
              opacity: 0,
              animation: `xip-chain-in 360ms ${EASE} ${i * 280}ms forwards`,
            }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
                {cell.name}
              </div>
              <div style={{
                fontSize: 13, color: 'var(--color-ink-soft)', marginTop: 4,
              }}>{cell.sub}</div>
            </div>
          ))}
          {/* Cascade callout */}
          <div style={{
            background: '#c0392b', color: '#fff',
            padding: '14px 18px', minWidth: 200,
            opacity: 0,
            animation: `xip-chain-in 480ms ${EASE} ${r.chain.length * 280}ms forwards`,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700,
              letterSpacing: '0.06em',
            }}>{r.cascade.head}</div>
            {r.cascade.rows.map((row) => (
              <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.v}</span>
                <span style={{ opacity: 0.85 }}>{row.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {active && (
        <div style={{
          fontSize: 14, color: 'var(--color-ink-soft)', lineHeight: 1.45,
          maxWidth: 1700,
        }}>{r.footnote}</div>
      )}
    </div>
  );
}

// ── Adopted: firmware → APB → victim buffer flow ───────────────────────────
function AdoptedBlock({ active }) {
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => { if (active) setAnimKey((k) => k + 1); }, [active]);

  const a = c.adopted;
  const accent = 'var(--color-accent)';

  // Color tints per node kind.
  const tint = {
    firmware: '#3a7bd5',
    apb:      '#3a7bd5',
    victim:   '#e0a83a',
    flash:    '#e0a83a',
  };

  return (
    <div style={{
      border: `2px solid ${active ? '#1f8a4c' : 'var(--line-hairline)'}`,
      background: active
        ? 'color-mix(in oklch, #1f8a4c 6%, var(--color-paper))'
        : 'var(--color-paper)',
      padding: active ? '20px 24px' : '14px 24px',
      transition: `padding 380ms ${EASE}, background 380ms ${EASE}, border-color 380ms ${EASE}, opacity 380ms ${EASE}`,
      opacity: active ? 1 : 0.55,
      flex: active ? '1 1 auto' : '0 0 auto',
      display: 'flex', flexDirection: 'column', gap: 14,
      minHeight: 0, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap',
        paddingBottom: active ? 12 : 0,
        borderBottom: active ? '2px solid #1f8a4c' : 'none',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 13,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: '#1f8a4c', fontWeight: 'var(--fw-medium)',
        }}>{a.tag}</div>
        <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-ink)' }}>
          {a.head}
        </div>
        {active && (
          <div style={{
            fontSize: 13, fontFamily: 'var(--font-mono)',
            color: 'var(--color-ink-mute)', letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>{a.gateNote}</div>
        )}
      </div>

      {active && (
        <div key={animKey} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr) auto',
          gap: 14, alignItems: 'stretch',
        }}>
          {a.flow.map((node, i) => (
            <div key={i} style={{
              border: `1px solid ${tint[node.kind]}`,
              background: `color-mix(in oklch, ${tint[node.kind]} 10%, var(--color-paper))`,
              padding: '12px 14px',
              opacity: 0,
              animation: `xip-chain-in 360ms ${EASE} ${i * 220}ms forwards`,
            }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
                {node.name}
              </div>
              <div style={{
                fontSize: 12, color: 'var(--color-ink-soft)',
                marginTop: 4, fontFamily: 'var(--font-mono)',
              }}>{node.sub}</div>
            </div>
          ))}
          {/* Result card */}
          <div style={{
            background: 'var(--color-ink)', color: 'var(--color-cream)',
            padding: '12px 18px', minWidth: 240,
            display: 'flex', flexDirection: 'column', gap: 6,
            opacity: 0,
            animation: `xip-chain-in 480ms ${EASE} ${a.flow.length * 220}ms forwards`,
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: accent,
            }}>Measured</div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 600,
              color: accent, letterSpacing: '-0.02em', lineHeight: 1,
            }}>{a.result.v}</div>
            <div style={{
              fontSize: 11, color: 'rgba(244,241,234,0.72)', lineHeight: 1.3,
            }}>{a.result.l}</div>
          </div>
        </div>
      )}

      {active && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto',
          gap: 14, alignItems: 'center',
        }}>
          {/* Main cache note — explicitly ⌀ "victim cannot evict main" */}
          <div style={{
            border: '1px dashed #1f8a4c',
            background: 'var(--color-paper)',
            padding: '10px 14px',
            fontSize: 13, color: 'var(--color-ink-soft)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{
              color: '#c0392b', fontFamily: 'var(--font-mono)', fontSize: 16,
            }}>⌀</span>
            <span>{a.mainCacheNote}</span>
          </div>
          <div style={{
            fontSize: 12, fontFamily: 'var(--font-mono)',
            color: 'var(--color-ink-mute)', letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>{a.next}</div>
        </div>
      )}
    </div>
  );
}

export default function XipPrefetch() {
  // 0 = rejected first (set up the problem), 1 = adopted (the win)
  const [step, setStep] = useState(0);
  const rootRef = useRef(null);

  useEffect(() => {
    const onSlideChange = (e) => {
      const here = rootRef.current?.closest('section');
      if (!here) return;
      if (e.detail?.slide !== here) setStep(0);
    };
    document.addEventListener('slidechange', onSlideChange);
    return () => document.removeEventListener('slidechange', onSlideChange);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const section = rootRef.current?.closest('section');
      if (!section?.hasAttribute('data-deck-active')) return;
      const fwd  = e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Spacebar';
      const back = e.key === 'ArrowLeft'  || e.key === 'PageUp';
      if (fwd && step < 1) {
        e.preventDefault(); e.stopPropagation();
        setStep(1);
      } else if (back && step > 0) {
        e.preventDefault(); e.stopPropagation();
        setStep(0);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [step]);

  return (
    <SlideFrame>
      <div ref={rootRef} style={{
        display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0,
      }}>
        <div style={{ marginTop: 30 }}>
          <div className="eyebrow">{c.eyebrow}</div>
          <h1 className="title" style={{ marginBottom: 14 }}>{c.title}</h1>
          <p className="body" style={{ maxWidth: 1700, marginBottom: 24 }}>
            {c.sub}
          </p>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 16,
          flex: 1, minHeight: 0,
        }}>
          {/* Step 0 keeps REJECTED expanded (the failed attempt sets up the problem),
              step 1 expands ADOPTED (the fix). */}
          <RejectedBlock active={step === 0} />
          <AdoptedBlock  active={step === 1} />
        </div>
      </div>
    </SlideFrame>
  );
}
