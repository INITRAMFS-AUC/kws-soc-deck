import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import { getSlide } from '../content.js';

const c = getSlide('empowerment').content;

const ACCENT = 'var(--color-accent)';
const INK    = 'var(--color-ink)';
const MUTE   = 'var(--color-ink-mute)';
const PAPER  = 'var(--color-paper)';
const LINE   = 'var(--line-faint)';
const MONO   = 'var(--font-mono)';
const EASE   = 'cubic-bezier(.4,0,.2,1)';

function Pillar({ p, active }) {
  const flexWeight = active ? 3 : 1;
  const minWidth   = active ? 420 : 160;
  return (
    <div style={{
      flex: `${flexWeight} 1 0`,
      minWidth,
      padding: active ? '36px 38px' : '32px 28px',
      border: `2px solid ${active ? ACCENT : LINE}`,
      background: active
        ? `color-mix(in oklch, ${ACCENT} 8%, ${PAPER})`
        : PAPER,
      display: 'flex', flexDirection: 'column', gap: 18,
      overflow: 'hidden',
      transition:
        `flex 480ms ${EASE}, min-width 480ms ${EASE}, ` +
        `padding 380ms ease, border-color 380ms ease, background 380ms ease`,
    }}>
      <div style={{
        fontFamily: MONO, fontSize: 18,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color: active ? ACCENT : MUTE, fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>{p.tag}</div>

      <div style={{
        fontSize: active ? 44 : 36, fontWeight: 600, color: INK,
        letterSpacing: '-0.01em', lineHeight: 1.12,
        transition: `font-size 380ms ease`,
      }}>{p.head}</div>

      <p style={{
        fontSize: 24, lineHeight: 1.5,
        color: 'var(--color-ink-soft)', margin: 0,
        maxHeight: active ? 600 : 0,
        opacity: active ? 1 : 0,
        transition:
          `max-height 540ms ${EASE} ${active ? '120ms' : '0ms'}, ` +
          `opacity 380ms ease ${active ? '180ms' : '0ms'}`,
      }}>{p.body}</p>

      {p.stats && (
        <div style={{
          marginTop: 'auto', paddingTop: 22,
          borderTop: `1px solid ${ACCENT}`,
          display: 'flex', gap: 36, flexWrap: 'wrap',
          maxHeight: active ? 600 : 0,
          opacity: active ? 1 : 0,
          overflow: 'hidden',
          transition:
            `max-height 540ms ${EASE} ${active ? '160ms' : '0ms'}, ` +
            `opacity 380ms ease ${active ? '220ms' : '0ms'}`,
        }}>
          {p.stats.map((s) => (
            <div key={s.label} style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: MONO, fontSize: 36, fontWeight: 700,
                color: ACCENT, letterSpacing: '-0.02em', lineHeight: 1,
              }}>{s.value}</div>
              <div style={{
                fontFamily: MONO, fontSize: 14,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: MUTE, marginTop: 8, lineHeight: 1.35,
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Empowerment() {
  const [step, setStep] = useState(0);
  const rootRef = useRef(null);
  const N = c.pillars.length;

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
      if (fwd && step < N) {
        e.preventDefault(); e.stopPropagation();
        setStep(step + 1);
      } else if (back && step > 0) {
        e.preventDefault(); e.stopPropagation();
        setStep(step - 1);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [step, N]);

  const activeIdx = step > 0 ? step - 1 : null;

  return (
    <SlideFrame>
      <div ref={rootRef}>
        <div style={{ marginTop: 30 }}>
          <div className="eyebrow">{c.eyebrow}</div>
          <h1 className="title" style={{ marginBottom: 44, maxWidth: 1700 }}>
            {c.title}
          </h1>
        </div>

        <div style={{
          display: 'flex', gap: 24,
          alignItems: 'stretch',
        }}>
          {c.pillars.map((p, i) => (
            <Pillar key={p.tag} p={p} active={i === activeIdx} />
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}
