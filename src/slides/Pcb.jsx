import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import Callout from '../components/Callout.jsx';
import { getSlide } from '../content.js';

const c = getSlide('pcb').content;
const EASE = 'cubic-bezier(.4,0,.2,1)';

export default function Pcb() {
  // 0 = schematic / design view, 1 = actual fabricated board photo
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

  const designSrc = `${import.meta.env.BASE_URL}${c.imageSrc}`;
  const actualSrc = `${import.meta.env.BASE_URL}${c.actualImageSrc}`;

  return (
    <SlideFrame slideStyle={{ paddingRight: 60 }}>
      <div ref={rootRef} style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60,
        height: '100%', alignItems: 'start', paddingTop: 8,
      }}>
        <div style={{ position: 'relative', height: 720 }}>
          <div className="eyebrow">{c.eyebrow}</div>
          <h1 className="title" style={{ marginBottom: 24 }}>{c.title}</h1>

          {/* Both panes share the same absolute box so the layout never
              reflows during the crossfade — only opacity + transform change. */}
          <div style={{ position: 'relative', height: 540 }}>
            {/* Step 0 — design narrative */}
            <div style={{
              position: 'absolute', inset: 0,
              opacity: step === 0 ? 1 : 0,
              transform: step === 0 ? 'translateY(0)' : 'translateY(-6px)',
              transition: `opacity 600ms ${EASE}, transform 600ms ${EASE}`,
              pointerEvents: step === 0 ? 'auto' : 'none',
              willChange: 'opacity, transform',
            }}>
              <p className="body" style={{ marginBottom: 24 }}
                 dangerouslySetInnerHTML={{ __html: c.bodyOneHTML }} />
              <p className="body" style={{ marginBottom: 30 }}>{c.bodyTwo}</p>
              <Callout style={{ fontSize: 22, padding: '18px 24px' }}>{c.callout}</Callout>
            </div>

            {/* Step 1 — peripheral list */}
            <div style={{
              position: 'absolute', inset: 0,
              opacity: step === 1 ? 1 : 0,
              transition: `opacity 600ms ${EASE} 80ms`,
              pointerEvents: step === 1 ? 'auto' : 'none',
              willChange: 'opacity',
            }}>
              <p className="body" style={{ marginBottom: 24 }}>{c.peripheralsLede}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {(c.peripherals || []).map((p, i) => (
                  <li key={p.name} style={{
                    display: 'flex', alignItems: 'baseline', gap: 16,
                    padding: '14px 0',
                    borderTop: i === 0 ? '1px solid var(--line-hairline)' : 'none',
                    borderBottom: '1px solid var(--line-hairline)',
                    opacity: step === 1 ? 1 : 0,
                    transform: step === 1 ? 'translateX(0)' : 'translateX(-10px)',
                    transition:
                      `opacity 520ms ${EASE} ${220 + i * 90}ms, ` +
                      `transform 520ms ${EASE} ${220 + i * 90}ms`,
                    willChange: 'opacity, transform',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 12,
                      letterSpacing: '0.14em', color: 'var(--color-accent)',
                      minWidth: 28,
                    }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-ink)' }}>
                      {p.name}
                    </span>
                    <span style={{
                      fontSize: 16, color: 'var(--color-ink-mute)',
                      marginLeft: 'auto', textAlign: 'right',
                    }}>
                      {p.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{
            marginTop: 24,
            fontFamily: 'var(--font-mono)', fontSize: 13,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--color-ink-mute)',
          }}>
            {step === 0 ? '→ see fabricated board' : '← schematic   ·   → next slide'}
          </div>
        </div>

        {/* Image stage — schematic and actual photo crossfade in place. */}
        <div style={{
          position: 'relative',
          background: 'var(--color-bg)',
          border: '1px solid var(--line-hairline)',
          height: 760, overflow: 'hidden',
        }}>
          {/* Step indicator */}
          <div style={{
            position: 'absolute', top: 12, left: 14, zIndex: 2,
            fontFamily: 'var(--font-mono)', fontSize: 12,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: '#fff', background: 'var(--color-ink)',
            padding: '4px 10px',
          }}>
            {step === 0 ? '01 · Design' : '02 · Fabricated'}
          </div>
          {/* KiCad layout — fit naturally; cross-fades to fabricated photo. */}
          <img src={designSrc} alt={c.imageAlt}
               style={{
                 position: 'absolute', inset: 0,
                 width: '100%', height: '100%',
                 objectFit: 'contain', objectPosition: 'center',
                 opacity: step === 0 ? 1 : 0,
                 transition: `opacity 700ms ${EASE}`,
               }} />
          {/* Actual fabricated board + label callouts — emerges from a
              slightly zoomed-in pre-state into its natural scale, in
              lockstep with the design's zoom-out fade, so the two appear
              to morph into each other. */}
          <div style={{
            position: 'absolute', inset: 0,
            opacity: step === 1 ? 1 : 0,
            transform: step === 1 ? 'scale(1)' : 'scale(0.7)',
            transformOrigin: 'center center',
            transition:
              `opacity 700ms ${EASE} 120ms, ` +
              `transform 900ms ${EASE} 120ms`,
            pointerEvents: step === 1 ? 'auto' : 'none',
          }}>
            <img src={actualSrc} alt={c.actualImageAlt}
                 style={{
                   position: 'absolute', inset: 0,
                   width: '100%', height: '100%',
                   objectFit: 'cover', objectPosition: 'center',
                 }} />
            {/* Connector lines (SVG overlay) */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none"
                 style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {(c.labels || []).map((l, i) => (
                <g key={i}>
                  <line x1={l.pill.x} y1={l.pill.y} x2={l.target.x} y2={l.target.y}
                        stroke="var(--color-accent)" strokeWidth="0.25" />
                  <circle cx={l.target.x} cy={l.target.y} r="0.7"
                          fill="var(--color-accent)" />
                </g>
              ))}
            </svg>
            {/* Pill labels */}
            {(c.labels || []).map((l, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${l.pill.x}%`, top: `${l.pill.y}%`,
                transform: `translate(${l.pill.x > 50 ? '-100%' : '0'}, -50%)`,
                background: 'var(--color-ink)', color: 'var(--color-cream)',
                fontFamily: 'var(--font-mono)', fontSize: 13,
                letterSpacing: '0.06em', whiteSpace: 'nowrap',
                padding: '6px 10px',
                borderLeft: l.pill.x <= 50 ? '3px solid var(--color-accent)' : 'none',
                borderRight: l.pill.x >  50 ? '3px solid var(--color-accent)' : 'none',
              }}>{l.text}</div>
            ))}
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
