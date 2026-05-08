import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import Callout from '../components/Callout.jsx';
import { getSlide } from '../content.js';

const c = getSlide('we-did').content;

// Indexes of pillars whose constraint card walks in on each right-arrow.
// Order: 01 Open RISC-V core → 03 HW-aware model → 05 One open toolchain.
const CONSTRAINT_ORDER = [0, 2, 4];

// Typewriter (erase divergent tail, then type toward `target`). Same
// pattern as KwsNlp's useTypewriter / VoiceEverywhere's title flip.
function useTypewriter(target, { eraseMs = 18, typeMs = 38 } = {}) {
  const [text, setText] = useState(target);
  useEffect(() => {
    if (text === target) return;
    let common = 0;
    while (common < text.length && common < target.length &&
           text[common] === target[common]) common++;
    const erasing = text.length > common;
    const next = erasing ? text.slice(0, -1) : target.slice(0, text.length + 1);
    const id = setTimeout(() => setText(next), erasing ? eraseMs : typeMs);
    return () => clearTimeout(id);
  }, [text, target, eraseMs, typeMs]);
  return [text, text !== target];
}

const EASE = 'cubic-bezier(.4,0,.2,1)';

function Pillar({ p, active, anyActive }) {
  const con = p.constraint;
  // Active pillar grows 3× vs idle ones; while *some* pillar is active, the
  // idle ones shrink slightly so the layout breathes.
  const flexWeight = active ? 3 : 1;
  const minWidth   = active ? 360 : 130;
  return (
    <div
      className="specimen"
      style={{
        position: 'relative',
        border: `2px solid ${active ? 'var(--color-accent)' : 'var(--line-faint)'}`,
        background: active
          ? 'color-mix(in oklch, var(--color-accent) 8%, var(--color-paper))'
          : 'var(--color-paper)',
        flex: `${flexWeight} 1 0`,
        minWidth,
        transition: `flex 480ms ${EASE}, min-width 480ms ${EASE}, ` +
                    'border-color 380ms ease, background 380ms ease',
        gap: 12, overflow: 'hidden',
      }}
    >
      <div className="head" style={{ color: active ? 'var(--color-accent)' : undefined }}>
        {p.head}
      </div>
      <div className="lede" style={{ fontSize: 24 }}>{p.lede}</div>
      <p style={{ fontSize: 19 }}>{p.body}</p>
      {con && (
        <div style={{
          marginTop: 6,
          maxHeight: active ? 320 : 0,
          opacity: active ? 1 : 0,
          overflow: 'hidden',
          transition: `max-height 540ms ${EASE} ${active ? '120ms' : '0ms'}, ` +
                      `opacity 380ms ease ${active ? '180ms' : '0ms'}`,
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{
            paddingTop: 12,
            borderTop: '1px solid var(--color-accent)',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 13,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--color-accent)', marginBottom: 6,
            }}>{con.tag}</div>
            <div style={{
              fontSize: 22, fontWeight: 600, color: 'var(--color-ink)',
              marginBottom: 6,
            }}>{con.head}</div>
            <p style={{ fontSize: 17, lineHeight: 1.45, color: 'var(--color-ink-soft)' }}>
              {con.body}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WeDid() {
  // Step 0 = base view; steps 1..3 each highlight one pillar with its
  // constraint card. Step 1 also retypes the title.
  const [step, setStep] = useState(0);
  const rootRef = useRef(null);

  // Title swaps between two strings via typewriter — once the user advances
  // past step 0, the constraint variant stays for the rest of the slide.
  const titleTarget = step === 0 ? c.titleInitial : c.titleConstraints;
  const [titleText, titleTyping] = useTypewriter(titleTarget);

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
      if (fwd && step < 3) {
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

  // Which pillar (if any) is the active constraint card right now.
  const activePillarIdx = step > 0 ? CONSTRAINT_ORDER[step - 1] : null;

  return (
    <SlideFrame>
      <div ref={rootRef}>
        <div style={{ marginTop: 30 }}>
          <div className="eyebrow">{c.eyebrow}</div>
          <h1 className="title" style={{ maxWidth: 1700, marginBottom: 50 }}>
            {titleText}
            <span aria-hidden style={{
              display: 'inline-block', marginLeft: 4,
              color: 'var(--color-accent)', fontWeight: 'var(--fw-regular)',
              opacity: titleTyping ? 1 : 0,
              animation: titleTyping ? 'vx-blink 700ms steps(2, end) infinite' : 'none',
            }}>|</span>
          </h1>
        </div>
        <div style={{
          display: 'flex', gap: 24,
          marginBottom: 40, alignItems: 'stretch',
        }}>
          {c.pillars.map((p, i) => (
            <Pillar key={p.head} p={p}
                    active={i === activePillarIdx}
                    anyActive={activePillarIdx != null} />
          ))}
        </div>
        <Callout>{c.callout}</Callout>
      </div>
    </SlideFrame>
  );
}
