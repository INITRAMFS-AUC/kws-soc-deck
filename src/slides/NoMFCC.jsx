import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import MacShareBar from '../components/MacShareBar.jsx';

/* The text the audience already saw on slide 11 (the MFCC pipeline detail).
 * On entry to slide 12, this appears in the recap box, then is backspaced
 * and replaced with a compact summary letter-by-letter. The illusion is that
 * the slide-11 box "morphed" here and condensed itself. */
const DETAILED = [
  'Frame · 25 ms / 10 ms hop · 100 frames',
  'FFT 512-pt          · ~460 K mults',
  'Power |·|²          · ~26 K ops',
  'Mel filterbank 40   · ~1.0 M MACs',
  'log compression     · ~4 K ops',
  'DCT-II → MFCCs      · ~130 K ops',
].join('\n');

const SUMMARY = [
  'MFCC preprocessing  · ~1.6 M ops',
  '   (CPU, before the network runs)',
  '',
  'DS-CNN body         · ~5.4 M MACs',
  '   (Zhang et al., 2017 · 94.4%)',
].join('\n');

/* Typewriter speeds — fast enough to feel snappy, slow enough to read. */
const ERASE_MS = 9;
const TYPE_MS  = 22;

export default function NoMFCC() {
  const rootRef = useRef(null);
  const [text, setText]   = useState(SUMMARY);   // safe default for non-sequential entry
  const [target, setTarget] = useState(SUMMARY);
  const [phase, setPhase] = useState('idle');    // 'idle' | 'morphing' | 'done'

  /* When the user steps into this slide from slide 11 (previousIndex === index-1),
   * seed the box with the detailed text and animate down to the summary. Any
   * other entry path (initial load, jump, back-nav) skips straight to the
   * summary so the slide is always immediately legible. */
  useEffect(() => {
    const onSlideChange = (e) => {
      const mySection = rootRef.current?.closest('section');
      if (!mySection) return;
      const becameActive = e.detail.slide === mySection;
      const cameFromPrev = e.detail.previousIndex === e.detail.index - 1;

      if (becameActive && cameFromPrev) {
        setText(DETAILED);
        setTarget(SUMMARY);
        setPhase('morphing');
      } else if (becameActive) {
        setText(SUMMARY);
        setTarget(SUMMARY);
        setPhase('done');
      } else {
        // leaving — reset for next entry
        setPhase('idle');
      }
    };
    document.addEventListener('slidechange', onSlideChange);

    // If this slide is already active on first mount (deep-link / initial load),
    // skip straight to summary.
    const mySection = rootRef.current?.closest('section');
    if (mySection?.hasAttribute('data-deck-active')) {
      setPhase('done');
    }
    return () => document.removeEventListener('slidechange', onSlideChange);
  }, []);

  /* Typewriter: erase divergent tail, then type forward. Same shape as the
   * VoiceEverywhere hook so the cadence matches the rest of the deck. */
  useEffect(() => {
    if (phase !== 'morphing') return;
    if (text === target) {
      setPhase('done');
      return;
    }
    let common = 0;
    while (common < text.length && common < target.length &&
           text[common] === target[common]) common++;
    const erasing = text.length > common;
    const next = erasing ? text.slice(0, -1) : target.slice(0, text.length + 1);
    const id = setTimeout(() => setText(next), erasing ? ERASE_MS : TYPE_MS);
    return () => clearTimeout(id);
  }, [text, target, phase]);

  const showRest = phase === 'done';
  const caretOn  = phase === 'morphing';

  return (
    <SlideFrame topLeft="12 · Model">
      <div ref={rootRef} style={{ marginTop: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>Design decision · cost analysis</div>
        <h1 className="title" style={{ fontSize: 48, marginBottom: 4 }}>
          We merge front-end and body — one unified, lower-cost pipeline.
        </h1>
        <p className="subtitle" style={{ fontSize: 32, maxWidth: 1700, marginBottom: 14 }}>
          MFCC is a proven front-end. We skip it — a learnable Conv1D performs the spectral decomposition
          as part of the model itself, cutting total system MACs from ~7 M down to 0.97 M.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>

        {/* ── Left: morph-recap of slide 11. Static box, animated text. ── */}
        <div style={{ border: '1px solid var(--ink)', padding: '14px 18px', background: 'rgba(26,26,26,0.04)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Standard approach · two stages
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 600, marginBottom: 10 }}>MFCC + DS-CNN</div>

          {/* The typewriter target. Fixed minHeight prevents layout jiggle as
              the multi-line string shrinks during the erase phase. */}
          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            lineHeight: 1.55,
            color: 'var(--ink)',
            margin: 0,
            padding: '10px 14px',
            background: 'var(--paper)',
            border: '1px solid rgba(26,26,26,0.15)',
            minHeight: 218,
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
          }}>
            {text}
            {caretOn && <span className="vx-caret vx-caret--blink" style={{ color: 'var(--accent)' }}>▍</span>}
          </pre>

          {/* Total system box — fades in only after the typewriter finishes. */}
          <div style={{
            marginTop: 10,
            padding: '8px 12px',
            background: 'rgba(26,26,26,0.08)',
            border: '1px solid rgba(26,26,26,0.12)',
            opacity: showRest ? 1 : 0,
            transform: showRest ? 'none' : 'translateY(8px)',
            transition: 'opacity 360ms var(--anim-ease), transform 360ms var(--anim-ease)',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', textTransform: 'uppercase' }}>Total system ops</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 500 }}>~7.0 M</div>
          </div>
        </div>

        {/* ── Right: our pipeline. Held back until typewriter finishes. ── */}
        <div style={{
          border: '2px solid var(--accent)',
          padding: '14px 18px',
          background: '#fff7f2',
          opacity: showRest ? 1 : 0,
          transform: showRest ? 'none' : 'translateY(18px)',
          transition: 'opacity 480ms var(--anim-ease), transform 480ms var(--anim-ease)',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>
            ★ Our approach · unified pipeline
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Conv1D → CNN</div>

          <div style={{ padding: '10px 14px', border: '2px solid var(--accent)', background: 'rgba(217,119,87,0.08)', marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 6 }}>
              One stage · front-end + body
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: 'var(--accent)' }}>→</span> conv1d_mel · learnable spectral</span>
                <span style={{ color: 'var(--ink)', fontWeight: 500 }}>~516 K MACs</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-mute)' }}>
                <span><span style={{ color: 'var(--accent)' }}>→</span> BN · ReLU · MaxPool ÷4</span>
                <span>folded</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: 'var(--accent)' }}>→</span> 3 × Conv1D blocks</span>
                <span style={{ color: 'var(--ink)', fontWeight: 500 }}>~451 K MACs</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-mute)' }}>
                <span><span style={{ color: 'var(--accent)' }}>→</span> GAP → Dense 16 → Softmax</span>
                <span>—</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '8px 12px', background: 'var(--ink)', color: '#f4f1ea' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(244,241,234,0.6)', textTransform: 'uppercase' }}>Total system MACs</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 500 }}>0.97 M</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'rgba(244,241,234,0.7)', marginTop: 4 }}>
              Front-end and body share the same datapath — nothing runs outside the model.
            </div>
          </div>
        </div>
      </div>

      {/* ── Punchline strip — held back too. ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
        opacity: showRest ? 1 : 0,
        transform: showRest ? 'none' : 'translateY(18px)',
        transition: 'opacity 480ms var(--anim-ease) 120ms, transform 480ms var(--anim-ease) 120ms',
      }}>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink)', padding: '10px 14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Standard · Zhang et al., 2017</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, color: 'var(--ink)', lineHeight: 1.4 }}>DS-CNN-S: 94.4% top-1, ~5.4 M network MACs. Front-end counted separately.</div>
        </div>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink)', padding: '10px 14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Full system cost</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, color: 'var(--ink)', lineHeight: 1.4 }}>~5.4 M network MACs <strong>+ ~1.6 M preprocessing</strong> = ~7.0 M total system ops.</div>
        </div>
        <div style={{ background: 'var(--accent)', color: '#fff', padding: '10px 14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>★ Our approach</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, color: '#fff', lineHeight: 1.4 }}><strong>0.97 M MACs total.</strong> Front-end fused into the model — no separate preprocessing stage.</div>
        </div>
      </div>

      {/* ── Persistent share-of-MACs bar. Re-renders identically on slides 13
           and 14 with different focus, so the slide cross-fade reads as one
           bar travelling through the section. ── */}
      <MacShareBar focus="balanced" annotate="introduces the 53 / 47 split — see next two slides" />
    </SlideFrame>
  );
}
