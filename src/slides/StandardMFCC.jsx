import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';

/* The data packet animation cycles through 4 stops at fixed dwell times.
 * Stops 0–2 are the three pipeline stations. Stop 3 is the off-stage gap
 * between cycles where the packet has dropped off the right edge before
 * re-emerging at the left for the next loop. */
const FLOW_STOPS = [
  { left: '11.0%',  label: 'PCM',  shape: '[8000, 1]',  detail: 'int8 · 8 kHz' },
  { left: '49.5%',  label: 'MFCC', shape: '[100, 40]',  detail: '~1.6 M ops' },
  { left: '88.0%',  label: 'CNN',  shape: '5 logits',   detail: '~5.4 M MACs' },
  { left: '88.0%',  label: '',     shape: '',           detail: '', hidden: true },
];

const DWELL_MS = [1500, 1500, 1500, 700]; // ms held at each stop

export default function StandardMFCC() {
  const rootRef = useRef(null);
  const [stop, setStop] = useState(0);

  /* Drive the packet only while the slide is on stage. We listen to
   * slidechange — start the cycle when this section becomes active, stop
   * the timers when it leaves so we're not running animation work for
   * off-screen slides. */
  useEffect(() => {
    let timer = null;
    let cancelled = false;
    let current = 0;

    const tick = () => {
      if (cancelled) return;
      setStop(current);
      const dwell = DWELL_MS[current];
      current = (current + 1) % FLOW_STOPS.length;
      timer = setTimeout(tick, dwell);
    };

    const start = () => {
      cancelled = false;
      current = 0;
      tick();
    };
    const stop = () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };

    const onSlideChange = (e) => {
      const mySection = rootRef.current?.closest('section');
      if (!mySection) return;
      if (e.detail.slide === mySection) start();
      else stop();
    };

    document.addEventListener('slidechange', onSlideChange);

    // First-mount: if we're already active, start immediately.
    const mySection = rootRef.current?.closest('section');
    if (mySection?.hasAttribute('data-deck-active')) start();

    return () => {
      document.removeEventListener('slidechange', onSlideChange);
      stop();
    };
  }, []);

  const cur = FLOW_STOPS[stop];

  return (
    <SlideFrame topLeft="11 · Model">
      <div ref={rootRef} style={{ marginTop: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Industry baseline</div>
        <h1 className="title" style={{ fontSize: 48, marginBottom: 8 }}>
          Standard KWS: fixed MFCC front-end feeds the network.
        </h1>
        <p className="subtitle" style={{ fontSize: 32, maxWidth: 1700, marginBottom: 18 }}>
          The dominant approach on the Google Speech Commands benchmark uses a fixed spectral transform before the network — a well-established two-stage pipeline described by Zhang et al. (2017).
        </p>
      </div>

      {/* 3-panel pipeline — relatively positioned so the data packet can
          float over the panels. Bigger now that the framing strip is gone. */}
      <div style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '0.75fr 40px 1.6fr 40px 0.95fr',
        alignItems: 'stretch',
        gap: 0,
        marginBottom: 22,
      }}>

        {/* Input */}
        <div style={{ border: '1px solid var(--ink)', padding: '20px 22px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Input</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 30, fontWeight: 600, marginBottom: 12 }}>Raw PCM</div>

          {/* Tiny waveform sketch */}
          <svg viewBox="0 0 160 50" style={{ width: '100%', height: 56, display: 'block', marginBottom: 14 }}>
            <path
              d="M0,25 Q5,12 10,28 T22,24 Q28,14 34,32 T46,22 Q52,8 58,30 T72,24 Q78,16 84,28 T96,22 Q104,10 110,30 T124,24 Q130,14 136,28 T148,22 Q154,18 160,25"
              fill="none" stroke="var(--ink)" strokeWidth="1.5"
            />
          </svg>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink-mute)', lineHeight: 1.7 }}>
            <div>8 000 samples</div>
            <div>8 kHz · 1 s window</div>
            <div>int8 · zero pre-emph</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 30, color: 'var(--ink-mute)' }}>→</div>

        {/* MFCC front-end */}
        <div style={{ border: '1px solid var(--ink)', padding: '20px 22px', background: 'rgba(26,26,26,0.04)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Stage 1 · Fixed front-end
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 30, fontWeight: 600, marginBottom: 14 }}>MFCC</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[
              ['Frame + Hamming window', '25 ms / 10 ms hop', '100 frames'],
              ['FFT 512-pt',             '',                  '~460 K mults'],
              ['Power spectrum |·|²',    '',                  '~26 K ops'],
              ['Mel filterbank',         '40 triangular bands','~1.0 M MACs'],
              ['log compression',        'ln(·)',             '~4 K ops'],
              ['DCT-II',                 '→ MFCC features',   '~130 K ops'],
            ].map(([a, b, c]) => (
              <div key={a} style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 8, padding: '5px 10px', background: 'rgba(26,26,26,0.05)', fontFamily: 'var(--font-mono)', fontSize: 17 }}>
                <span style={{ color: 'var(--ink)' }}>
                  {a}{b ? <span style={{ color: 'var(--ink-mute)' }}> · {b}</span> : ''}
                </span>
                <span style={{ color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 30, color: 'var(--ink-mute)' }}>→</div>

        {/* CNN body */}
        <div style={{ border: '2px solid var(--ink)', padding: '20px 22px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Stage 2 · Network</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 30, fontWeight: 600, marginBottom: 12 }}>DS-CNN</div>

          {/* Stack-of-blocks sketch */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            {[
              { w: '100%', h: 16 },
              { w: '78%',  h: 16 },
              { w: '60%',  h: 16 },
              { w: '46%',  h: 16 },
            ].map((b, i) => (
              <div key={i} style={{ width: b.w, height: b.h, background: 'var(--ink)' }} />
            ))}
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink-mute)', lineHeight: 1.6 }}>
            <div>Learned weights</div>
            <div>2-D depthwise-sep</div>
            <div>over Mel features</div>
          </div>
        </div>

        {/* ── Traveling data packet — loops Input → MFCC → DS-CNN with the
             current data shape on its face. Uses CSS transitions on `left`
             and `opacity` so the slide between stations is smooth. ── */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '100%',                       // sits just below the panels
            left: cur.left,
            transform: 'translate(-50%, 6px)',
            transition: 'left 600ms cubic-bezier(0.65, 0, 0.35, 1), opacity 280ms ease-in-out',
            opacity: cur.hidden ? 0 : 1,
            pointerEvents: 'none',
            zIndex: 4,
            minWidth: 200,
            padding: '10px 16px',
            background: 'var(--ink)',
            color: '#f4f1ea',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            opacity: 0.95,
          }}>
            {cur.label || ' '}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: '-0.01em',
          }}>
            {cur.shape || ' '}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'rgba(244,241,234,0.55)',
          }}>
            {cur.detail || ' '}
          </span>
        </div>
      </div>

      {/* Spacer — lifts the citation off the bottom and gives the packet
          headroom under the panels. */}
      <div style={{ flex: 1 }} />

      {/* Citation footer */}
      <div style={{
        padding: '12px 16px',
        border: '1px solid rgba(26,26,26,0.15)',
        background: 'rgba(26,26,26,0.03)',
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        color: 'var(--ink-mute)',
        lineHeight: 1.5,
      }}>
        Y. Zhang et al., "Hello Edge: Keyword Spotting on Microcontrollers," <em>arXiv:1711.07128</em>, 2017 — DS-CNN-S configuration, Google Speech Commands v1.
      </div>
    </SlideFrame>
  );
}
