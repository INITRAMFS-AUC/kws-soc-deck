import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import { getSlide } from '../content.js';

const c = getSlide('xip-cache').content;

const EASE = 'cubic-bezier(.4,0,.2,1)';
const DUR = 480;

// ── Step 0: cache topology ──────────────────────────────────────────────────
function CacheTopology({ visible }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1.2fr 1fr',
      gap: 32, alignItems: 'center', height: '100%',
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(8px)',
      transition: `opacity ${DUR}ms ${EASE}, transform ${DUR}ms ${EASE}`,
      pointerEvents: visible ? 'auto' : 'none',
    }}>
      {/* Left: 4 AHB masters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="tag" style={{ marginBottom: 4 }}>4 × AHB master</div>
        {c.masters.map((m, i) => (
          <div key={m.name} className="blk"
               style={{
                 padding: '12px 18px', height: 'auto', textAlign: 'left',
                 transitionDelay: visible ? `${80 + i * 70}ms` : '0ms',
               }}>
            <div style={{ fontSize: 20 }}>{m.name}</div>
            <div className="sub" style={{ marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Center: cache box */}
      <div style={{ position: 'relative' }}>
        <ArrowSvg dir="right" label="AHB-Lite" />
        <div className="blk accent" style={{
          padding: '28px 28px', height: 'auto',
          textAlign: 'center', borderRadius: 0,
        }}>
          <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 6 }}>ro_cache.v</div>
          <div className="sub" style={{ fontSize: 16, marginBottom: 18 }}>read-only · direct-mapped</div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
            fontSize: 15, fontFamily: 'var(--font-mono)',
          }}>
            {c.cacheSpec.map((s) => (
              <div key={s.l} style={{
                background: 'rgba(255,255,255,0.16)', padding: '10px 12px',
                textAlign: 'left',
              }}>
                <div style={{ fontWeight: 600, fontSize: 17 }}>{s.v}</div>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: QSPI flash + word_done bitmap */}
      <div style={{ position: 'relative' }}>
        <ArrowSvg dir="left" label="QSPI · 0x8000_0000" />
        <div className="blk muted" style={{ padding: '20px 20px', height: 'auto', textAlign: 'left' }}>
          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>QSPI Flash</div>
          <div className="sub">Quad-IO Read · 0xEB · 4 bits per SCK</div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div className="tag" style={{ marginBottom: 8, color: 'var(--color-accent)' }}>word_done[7:0]</div>
          <WordDoneBitmap visible={visible} />
          <div style={{
            marginTop: 10, fontSize: 14,
            color: 'var(--color-ink-soft)', lineHeight: 1.4,
          }}>{c.flashNote}</div>
        </div>
      </div>
    </div>
  );
}

function ArrowSvg({ dir, label }) {
  // Decorative arrow with label sitting above the centered cache column.
  const flip = dir === 'left';
  return (
    <div style={{
      position: 'absolute', top: -34, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      gap: 8, fontFamily: 'var(--font-mono)', fontSize: 13,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      color: 'var(--color-ink-mute)',
    }}>
      <span style={{ transform: flip ? 'scaleX(-1)' : 'none' }}>↔</span>
      <span>{label}</span>
    </div>
  );
}

// Animated bitmap: 8 cells light up sequentially while step 0 is visible.
function WordDoneBitmap({ visible }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{
          height: 22,
          background: 'var(--color-paper)',
          border: '1px solid var(--line-hairline)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'var(--color-accent)',
            opacity: visible ? 1 : 0,
            animation: visible ? `xip-bit-flash 2.4s ${EASE} ${i * 220}ms infinite` : 'none',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--color-ink-mute)', mixBlendMode: 'multiply',
          }}>{i}</div>
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Critical-Word-First timeline ─────────────────────────────────────
function CwfTimeline({ visible }) {
  // The animation runs each time `visible` flips true — the timeline
  // re-keys on visibility so the CSS animations restart.
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => { if (visible) setAnimKey((k) => k + 1); }, [visible]);

  const TIMELINE_END = 84; // last word arrival
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(8px)',
      transition: `opacity ${DUR}ms ${EASE}, transform ${DUR}ms ${EASE}`,
      pointerEvents: visible ? 'auto' : 'none',
      display: 'flex', flexDirection: 'column', gap: 18, height: '100%',
    }}>
      {/* Heading row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap' }}>
        <div style={{
          fontSize: 32, fontWeight: 600, letterSpacing: '-0.01em',
          color: 'var(--color-ink)',
        }}>{c.cwfHeading}</div>
        <div style={{ fontSize: 18, color: 'var(--color-ink-soft)' }}>{c.cwfSub}</div>
      </div>

      {/* Word-fill cells */}
      <div key={animKey} style={{
        display: 'grid', gridTemplateColumns: 'repeat(8, 1fr) auto',
        gap: 8, alignItems: 'stretch',
      }}>
        {c.timeline.map((cell, i) => {
          const fillDelay = (cell.t / TIMELINE_END) * 1800; // ms scaled
          const isReq = cell.requested;
          return (
            <div key={cell.w} style={{
              position: 'relative',
              border: '1px solid var(--line-hairline)',
              background: 'var(--color-paper)',
              padding: '14px 10px', textAlign: 'center',
              overflow: 'hidden',
            }}>
              {/* Fill bar */}
              <div style={{
                position: 'absolute', inset: 0,
                background: isReq ? 'var(--color-accent)' : 'var(--color-bg-deep)',
                opacity: 0,
                animation: `xip-cell-fill 480ms ${EASE} ${fillDelay}ms forwards`,
              }} />
              <div style={{ position: 'relative' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600,
                  color: isReq ? '#fff' : 'var(--color-ink)',
                  mixBlendMode: 'normal',
                  position: 'relative', zIndex: 1,
                }}>{cell.w}</div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 13,
                  color: isReq ? 'rgba(255,255,255,0.85)' : 'var(--color-ink-mute)',
                  marginTop: 4, position: 'relative', zIndex: 1,
                }}>t = {cell.t}</div>
              </div>
            </div>
          );
        })}
        <div style={{
          alignSelf: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 13,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'var(--color-ink-mute)', paddingLeft: 14, maxWidth: 160,
        }}>← word the CPU asked for</div>
      </div>

      {/* Compare strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {c.compare.map((cmp) => {
          const accent = cmp.kind === 'cwf';
          return (
            <div key={cmp.kind} style={{
              border: `2px solid ${accent ? 'var(--color-accent)' : 'var(--color-ink-mute)'}`,
              background: accent
                ? 'color-mix(in oklch, var(--color-accent) 12%, var(--color-paper))'
                : 'var(--color-paper)',
              padding: '14px 18px',
              display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600,
                color: accent ? 'var(--color-accent)' : 'var(--color-ink)',
                whiteSpace: 'nowrap',
              }}>{cmp.cyc} cyc</div>
              <div style={{
                fontSize: 18, fontWeight: 600,
                color: 'var(--color-ink)',
              }}>{cmp.label}</div>
              <div style={{
                fontSize: 15, color: 'var(--color-ink-soft)',
                flex: '1 1 280px', minWidth: 0,
              }}>{cmp.body}</div>
            </div>
          );
        })}
      </div>

      {/* Fix cards + result strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 18 }}>
        {c.fixes.map((f) => (
          <div key={f.tag} style={{
            border: '1px solid var(--line-hairline)',
            background: 'color-mix(in oklch, var(--color-accent) 5%, var(--color-paper))',
            borderLeft: '3px solid var(--color-accent)',
            padding: '14px 18px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--color-accent)',
            }}>{f.tag}</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)' }}>
              {f.head}
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-ink-soft)', lineHeight: 1.4 }}>
              {f.body}
            </div>
            <div style={{
              fontSize: 13, fontFamily: 'var(--font-mono)',
              color: 'var(--color-ink)', marginTop: 4,
            }}>→ {f.fix}</div>
          </div>
        ))}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 14,
          padding: '14px 22px',
          background: 'var(--color-ink)', color: 'var(--color-cream)',
          minWidth: 280,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 12,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--color-accent)',
          }}>Measured</div>
          {c.results.map((r) => (
            <div key={r.l}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 32,
                fontWeight: 600, letterSpacing: '-0.02em',
                color: 'var(--color-accent)',
              }}>{r.v}</div>
              <div style={{
                fontSize: 12, color: 'rgba(244,241,234,0.7)',
                marginTop: 2, lineHeight: 1.3,
              }}>{r.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function XipCache() {
  // 0 = cache topology, 1 = CWF timeline
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
          <h1 className="title" style={{ marginBottom: 28 }}>{c.title}</h1>
        </div>
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <CacheTopology visible={step === 0} />
          </div>
          <div style={{ position: 'absolute', inset: 0 }}>
            <CwfTimeline visible={step === 1} />
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
