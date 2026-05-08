import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import { getSlide } from '../content.js';

const c = getSlide('kws-nlp').content;

const USE_CASES = [
  { head: '',                                   sub: '' },
  { head: 'Keyword Spotting Usecase',           sub: 'detected "hey siri"' },
  { head: 'Natural Language Processing Usecase', sub: 'NLP processing on cloud' },
];

const CAPTIONS = [
  c.wakePhrase,
  c.wakePhrase,
  'What are the best restaurants in Alexandria?',
];

function SiriOrb({ active, processing }) {
  return (
    <div className={`siri-stage ${active ? 'siri-stage--active' : ''} ${processing ? 'siri-stage--processing' : ''}`} aria-hidden>
      {/* Drop-shadow aura behind the orb — extends beyond the orb mask. */}
      <div className="siri-aura">
        <span className="siri-aura-blob siri-aura-blob--a" />
        <span className="siri-aura-blob siri-aura-blob--b" />
        <span className="siri-aura-blob siri-aura-blob--c" />
      </div>

      <div className={`siri-orb ${active ? 'siri-orb--active' : ''}`}>
        {/* Blurry background haze — slow, big, soft */}
        <span className="siri-haze siri-haze--a" />
        <span className="siri-haze siri-haze--b" />
        <span className="siri-haze siri-haze--c" />
        {/* Sharper foreground blobs — vibrant, faster, wavier */}
        <span className="siri-blob siri-blob--a" />
        <span className="siri-blob siri-blob--b" />
        <span className="siri-blob siri-blob--c" />
        <span className="siri-blob siri-blob--d" />
        <span className="siri-blob siri-blob--e" />
        <span className="siri-orb-rim" />
      </div>
    </div>
  );
}

// Typewriter that erases divergent tail of `current` then types toward `target`.
function useTypewriter(target, { eraseMs = 18, typeMs = 25 } = {}) {
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

export default function KwsNlp() {
  const [step, setStep] = useState(0);
  const rootRef = useRef(null);
  const active = step >= 1;

  const [headText, headTyping] = useTypewriter(USE_CASES[step].head);
  const [subText,  subTyping]  = useTypewriter(USE_CASES[step].sub, { eraseMs: 18, typeMs: 25 });

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
      if (fwd && step < 2) {
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

  return (
    <SlideFrame>
      <div ref={rootRef} className="kws-root">
        <div style={{ marginTop: 40 }}>
          <div className="eyebrow">{c.eyebrow}</div>
          <h1 className="title" style={{ fontSize: 78, maxWidth: 1700, marginBottom: 50 }}>
            {c.title}
          </h1>
        </div>

        <div className="kws-grid">
          <div>
            <p className="body kws-body">{c.body}</p>

            <div style={{ marginTop: 48, minHeight: 200 }}>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 64, fontWeight: 700, fontStyle: 'italic',
                color: 'var(--color-ink)', letterSpacing: '-0.02em',
                lineHeight: 1.08, minHeight: '1.2em',
              }}>
                {headText}
                <span aria-hidden style={{
                  display: 'inline-block', marginLeft: 6,
                  color: 'var(--color-accent)', fontStyle: 'normal',
                  fontWeight: 'var(--fw-regular)',
                  opacity: headTyping ? 1 : 0,
                  animation: headTyping ? 'vx-blink 700ms steps(2, end) infinite' : 'none',
                }}>|</span>
              </div>
              <div style={{
                marginTop: 18, fontSize: 30,
                fontFamily: 'var(--font-mono)', color: 'var(--color-ink-soft)',
                letterSpacing: '0.04em', minHeight: '1.4em',
                fontWeight: 'var(--fw-medium)',
              }}>
                {subText}
                <span aria-hidden style={{
                  display: 'inline-block', marginLeft: 4,
                  color: 'var(--color-accent)',
                  opacity: subTyping ? 1 : 0,
                  animation: subTyping ? 'vx-blink 700ms steps(2, end) infinite' : 'none',
                }}>|</span>
              </div>
            </div>
          </div>

          <div className="kws-siri">
            <SiriOrb active={active} processing={step === 2} />
            <div className={`siri-caption ${active ? 'siri-caption--show' : ''}`}
                 style={{ maxWidth: 520, textAlign: 'center', fontSize: step === 2 ? 24 : 30 }}>
              {CAPTIONS[step]}
            </div>
          </div>
        </div>

        <div className="vx-hint" aria-hidden>
          {step === 0 ? '→ wake Siri'
            : step === 1 ? '→ ask Siri'
            : '← back   ·   → next slide'}
        </div>
      </div>
    </SlideFrame>
  );
}
