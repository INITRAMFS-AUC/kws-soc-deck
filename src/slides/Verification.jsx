import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import { getSlide } from '../content.js';

const c = getSlide('verification').content;
const N = c.stages.length;

const ACCENT = 'var(--color-accent)';
const INK    = 'var(--color-ink)';
const MUTE   = 'var(--color-ink-mute)';
const PAPER  = 'var(--color-paper)';
const LINE   = 'var(--line-faint)';
const MONO   = 'var(--font-mono)';

function Pill({ tag, active, idx }) {
  const label = tag.split(' · ')[1] ?? tag;
  const num   = tag.split(' · ')[0] ?? '';
  return (
    <div style={{
      flex: 1, minWidth: 0,
      padding: '14px 16px',
      border: `2px solid ${active ? ACCENT : LINE}`,
      background: active ? `color-mix(in oklch, ${ACCENT} 10%, ${PAPER})` : PAPER,
      transition: 'border-color 320ms ease, background 320ms ease',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{
        fontFamily: MONO, fontSize: 12, letterSpacing: '0.16em',
        textTransform: 'uppercase', fontWeight: 700,
        color: active ? ACCENT : MUTE,
      }}>{num}</div>
      <div style={{
        fontFamily: MONO, fontSize: 16, fontWeight: 600,
        color: active ? INK : MUTE,
      }}>{label}</div>
    </div>
  );
}

function FlowBox({ text, idx }) {
  return (
    <div style={{
      padding: '20px 22px', minWidth: 0,
      border: `2px solid ${ACCENT}`,
      background: `color-mix(in oklch, ${ACCENT} 8%, ${PAPER})`,
      fontFamily: MONO, fontSize: 22, fontWeight: 600,
      color: INK, whiteSpace: 'nowrap',
      animation: `xip-fade-in 460ms ease ${idx * 110}ms both`,
    }}>{text}</div>
  );
}

function Arrow({ idx }) {
  return (
    <div style={{
      fontFamily: MONO, fontSize: 32, color: MUTE,
      animation: `xip-fade-in 360ms ease ${idx * 110 + 60}ms both`,
    }}>→</div>
  );
}

function StageCard({ s, step }) {
  return (
    <div key={step} style={{
      border: `2px solid ${INK}`,
      background: PAPER,
      padding: '32px 36px',
      display: 'flex', flexDirection: 'column', gap: 22,
      animation: 'xip-fade-in 380ms ease both',
    }}>
      <div style={{
        fontFamily: MONO, fontSize: 16, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: ACCENT, fontWeight: 700,
      }}>{s.tag}</div>

      <div style={{
        fontFamily: 'var(--font-sans)', fontSize: 40, fontWeight: 600,
        color: INK, letterSpacing: '-0.01em', lineHeight: 1.1,
      }}>{s.head}</div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        flexWrap: 'wrap',
      }}>
        {s.flow.map((step, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <FlowBox text={step} idx={i} />
            {i < s.flow.length - 1 && <Arrow idx={i} />}
          </div>
        ))}
      </div>

      <p style={{
        fontFamily: 'var(--font-sans)', fontSize: 20, lineHeight: 1.5,
        color: 'var(--color-ink-soft)', margin: 0, maxWidth: 1500,
      }}>{s.caption}</p>
    </div>
  );
}

export default function Verification() {
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
      if (fwd && step < N - 1) {
        e.preventDefault(); e.stopPropagation();
        setStep(step + 1);
      } else if (back && step > 0) {
        e.preventDefault(); e.stopPropagation();
        setStep(step - 1);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [step]);

  const s = c.stages[step];

  return (
    <SlideFrame>
      <div ref={rootRef} style={{
        display: 'flex', flexDirection: 'column',
        marginTop: 14, gap: 22,
      }}>
        <div>
          <div className="eyebrow">{c.eyebrow}</div>
          <h1 className="title" style={{ marginBottom: 0, fontSize: 46 }}>{c.title}</h1>
        </div>

        {/* Indicator strip */}
        <div style={{ display: 'flex', gap: 12 }}>
          {c.stages.map((stage, i) => (
            <Pill key={stage.tag} tag={stage.tag} active={i === step} idx={i} />
          ))}
        </div>

        {/* Stage card — remounts on step change so the fade-in retriggers */}
        <StageCard s={s} step={step} />
      </div>
    </SlideFrame>
  );
}
