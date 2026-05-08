import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import MacShareBar from '../components/MacShareBar.jsx';

/* ─────────────────────────────────────────────────────────────────────────────
 * Combined slide 11.
 *
 * Three intra-slide phases (advanced with ArrowRight, regressed with
 * ArrowLeft, same trick as VoiceEverywhere's `reveal`):
 *   P0 — 3-panel MFCC pipeline. A "data packet" walks: Input (Raw PCM) →
 *        each of the 6 MFCC step rows individually → DS-CNN (Predict).
 *   P1 — Two big summary cards side-by-side. Standard MFCC + DS-CNN total
 *        (~7 M ops) vs Our Model unified pipeline (0.97 M MACs).
 *   P2 — Standard card slides off; Our Model expands to full slide width
 *        with three big components (Front-end / Body / Head) and the
 *        share-of-MACs bar at the bottom (FLIP source for slide 12).
 * ───────────────────────────────────────────────────────────────────────── */

const PHASE_FADE_MS = 520;
const PHASE_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

/* Packet timing (P0 only). */
const DWELL_MS = 1300;          // how long the packet sits at each stop
const OFFSTAGE_MS = 600;         // gap at end of cycle before looping
const PACKET_GLIDE_MS = 320;     // smooth slide between MFCC step rows
const PACKET_FADE_MS = 280;

/* ── 9 stops · 0=Input, 1–6=MFCC steps, 7=DS-CNN, 8=offstage gap ── */
const STOPS = [
  { kind: 'input',  label: 'PCM',     shape: '[8000, 1]',  detail: 'int8 · 8 kHz' },          // 0
  { kind: 'mfcc',   row: 0, label: 'Frame',   shape: '100 × 200',  detail: '25 ms / 10 ms' }, // 1
  { kind: 'mfcc',   row: 1, label: 'FFT',     shape: '[100, 257]', detail: '~460 K mults' },  // 2
  { kind: 'mfcc',   row: 2, label: 'Power',   shape: '[100, 257]', detail: '~26 K ops' },     // 3
  { kind: 'mfcc',   row: 3, label: 'Mel',     shape: '[100, 40]',  detail: '~1.0 M MACs' },   // 4
  { kind: 'mfcc',   row: 4, label: 'log',     shape: '[100, 40]',  detail: '~4 K ops' },      // 5
  { kind: 'mfcc',   row: 5, label: 'DCT-II',  shape: '[100, 13]',  detail: '~130 K ops' },    // 6
  { kind: 'cnn',    label: 'Predict', shape: '11 logits',  detail: 'argmax → keyword' },      // 7
  { kind: 'gap' }, // 8
];

const MFCC_ROWS = [
  ['Frame + Hamming window', '25 ms / 10 ms hop', '100 frames'],
  ['FFT 512-pt',             '',                  '~460 K mults'],
  ['Power spectrum |·|²',    '',                  '~26 K ops'],
  ['Mel filterbank',         '40 triangular bands','~1.0 M MACs'],
  ['log compression',        'ln(·)',             '~4 K ops'],
  ['DCT-II',                 '→ MFCC features',   '~130 K ops'],
];

export default function StandardMFCC() {
  const rootRef = useRef(null);
  const [phase, setPhase] = useState(0);
  const [stopIdx, setStopIdx] = useState(0);

  /* Phase navigation. Intercept Arrow keys only when our intra-slide steps
     still have somewhere to go; otherwise fall through to the deck-stage. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const section = rootRef.current?.closest('section');
      if (!section?.hasAttribute('data-deck-active')) return;
      const fwd  = e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Spacebar';
      const back = e.key === 'ArrowLeft'  || e.key === 'PageUp';
      if (fwd && phase < 2) {
        e.preventDefault(); e.stopPropagation();
        setPhase(p => p + 1);
      } else if (back && phase > 0) {
        e.preventDefault(); e.stopPropagation();
        setPhase(p => p - 1);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [phase]);

  /* Reset phase on slidechange. Forward from prev → P0; back from next → P2. */
  useEffect(() => {
    const onSlideChange = (e) => {
      const mySection = rootRef.current?.closest('section');
      if (!mySection) return;
      const becameActive = e.detail.slide === mySection;
      const cameFromNext = e.detail.previousIndex === e.detail.index + 1;
      if (becameActive) setPhase(cameFromNext ? 2 : 0);
    };
    document.addEventListener('slidechange', onSlideChange);
    return () => document.removeEventListener('slidechange', onSlideChange);
  }, []);

  /* Packet cycle — only runs in P0. */
  useEffect(() => {
    if (phase !== 0) return;
    let timer = null;
    let cancelled = false;
    let current = 0;
    const tick = () => {
      if (cancelled) return;
      setStopIdx(current);
      const dwell = STOPS[current].kind === 'gap' ? OFFSTAGE_MS : DWELL_MS;
      current = (current + 1) % STOPS.length;
      timer = setTimeout(tick, dwell);
    };
    tick();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [phase]);

  const cur = STOPS[stopIdx];

  return (
    <SlideFrame topLeft="11 · Model">
      <div ref={rootRef} style={{ marginTop: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          {phase < 2 ? 'Industry baseline · then ours' : '★ Our model'}
        </div>
        <h1 className="title" style={{ fontSize: 48, marginBottom: 8 }}>
          {phase === 0 && 'Standard KWS: fixed MFCC front-end feeds the network.'}
          {phase === 1 && 'Side by side: MFCC + DS-CNN  vs.  unified Conv1D model.'}
          {phase === 2 && 'One unified pipeline — front-end is the model.'}
        </h1>
        <p className="subtitle" style={{ fontSize: 28, maxWidth: 1700, marginBottom: 18 }}>
          {phase === 0 && 'The dominant approach on Google Speech Commands — Zhang et al., 2017. Two stages, ~7 M ops total.'}
          {phase === 1 && 'Their two-stage system: ~7 M ops. Our unified pipeline: 0.97 M MACs.'}
          {phase === 2 && '0.97 M MACs total, all int8, one acceleratable datapath. Three main components.'}
        </p>
      </div>

      {/* Stage area — three phase layouts stacked, opacity-toggled. */}
      <div style={{ position: 'relative', flex: 1 }}>
        <PhaseLayer active={phase === 0}>
          <P0Pipeline cur={cur} />
        </PhaseLayer>
        <PhaseLayer active={phase === 1}>
          <P1Compare />
        </PhaseLayer>
        <PhaseLayer active={phase === 2}>
          <P2Expanded />
        </PhaseLayer>
      </div>

      {/* Citation footer — visible only in P0 and P1; in P2 the share bar
          replaces it. */}
      <div style={{
        marginTop: 12,
        padding: '10px 14px',
        border: '1px solid rgba(26,26,26,0.15)',
        background: 'rgba(26,26,26,0.03)',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        color: 'var(--ink-mute)',
        lineHeight: 1.5,
        opacity: phase === 2 ? 0 : 1,
        transition: 'opacity 400ms ease',
        pointerEvents: phase === 2 ? 'none' : 'auto',
      }}>
        Y. Zhang et al., "Hello Edge: Keyword Spotting on Microcontrollers," <em>arXiv:1711.07128</em>, 2017 — DS-CNN-S configuration, Google Speech Commands v1.
      </div>
    </SlideFrame>
  );
}

/* ───────── Phase layer wrapper. All three stack in the same area; only the
   active one is visible and interactive. ───────── */

function PhaseLayer({ active, children }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      opacity: active ? 1 : 0,
      transition: `opacity ${PHASE_FADE_MS}ms ${PHASE_EASE}`,
      pointerEvents: active ? 'auto' : 'none',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {children}
    </div>
  );
}

/* ─────────────────────────── P0 — 3-panel pipeline ───────────────────────── */

function P0Pipeline({ cur }) {
  const inputActive = cur.kind === 'input' ? cur : null;
  const cnnActive   = cur.kind === 'cnn'   ? cur : null;
  const mfccRow     = cur.kind === 'mfcc'  ? cur.row : null;
  const mfccData    = cur.kind === 'mfcc'  ? cur : null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '0.75fr 40px 1.6fr 40px 0.95fr',
      alignItems: 'stretch',
      gap: 0,
      flex: 1,
    }}>
      <InputPanel data={inputActive} />
      <Arrow />
      <MfccPanel rowIdx={mfccRow} data={mfccData} />
      <Arrow />
      <CnnPanel data={cnnActive} />
    </div>
  );
}

function Arrow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 30, color: 'var(--ink-mute)' }}>→</div>
  );
}

/* ── Input panel — packet centered card-style. ── */
function InputPanel({ data }) {
  return (
    <div style={{ position: 'relative', border: '1px solid var(--ink)', padding: '24px 26px', background: 'var(--paper)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Input</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 32, fontWeight: 600, marginBottom: 14 }}>Raw PCM</div>
      <svg viewBox="0 0 160 50" style={{ width: '100%', height: 60, display: 'block', marginBottom: 16 }}>
        <path d="M0,25 Q5,12 10,28 T22,24 Q28,14 34,32 T46,22 Q52,8 58,30 T72,24 Q78,16 84,28 T96,22 Q104,10 110,30 T124,24 Q130,14 136,28 T148,22 Q154,18 160,25"
          fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      </svg>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink-mute)', lineHeight: 1.7 }}>
        <div>8 000 samples</div>
        <div>8 kHz · 1 s window</div>
        <div>int8 · zero pre-emph</div>
      </div>
      <CenterPacket data={data} />
    </div>
  );
}

/* ── DS-CNN panel — packet centered card-style. ── */
function CnnPanel({ data }) {
  return (
    <div style={{ position: 'relative', border: '2px solid var(--ink)', padding: '24px 26px', background: 'var(--paper)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Stage 2 · Network</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 32, fontWeight: 600, marginBottom: 14 }}>DS-CNN</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
        {[100, 78, 60, 46].map((w, i) => (
          <div key={i} style={{ width: `${w}%`, height: 18, background: 'var(--ink)' }} />
        ))}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink-mute)', lineHeight: 1.6 }}>
        <div>Learned weights</div>
        <div>2-D depthwise-sep</div>
        <div>over Mel features</div>
      </div>
      <CenterPacket data={data} />
    </div>
  );
}

/* ── MFCC panel — packet snaps to active row, glides between rows. ── */
function MfccPanel({ rowIdx, data }) {
  const rowRefs = useRef([]);
  const [rowMetrics, setRowMetrics] = useState(MFCC_ROWS.map(() => null));
  /* Hold the last visible row index so the packet keeps its position while
     fading out (no awkward slide-to-zero on exit). Updates only when a new
     row becomes active. */
  const [renderedRow, setRenderedRow] = useState(null);
  const [renderedData, setRenderedData] = useState(null);

  useLayoutEffect(() => {
    setRowMetrics(rowRefs.current.map(el => el ? { top: el.offsetTop, height: el.offsetHeight } : null));
  }, []);

  useEffect(() => {
    if (rowIdx !== null) {
      setRenderedRow(rowIdx);
      setRenderedData(data);
    }
  }, [rowIdx, data]);

  const visible = rowIdx !== null;
  const metric = renderedRow !== null ? rowMetrics[renderedRow] : null;

  return (
    <div style={{ position: 'relative', border: '1px solid var(--ink)', padding: '24px 26px', background: 'rgba(26,26,26,0.04)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        Stage 1 · Fixed front-end
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 32, fontWeight: 600, marginBottom: 16 }}>MFCC</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {MFCC_ROWS.map(([a, b, c], i) => (
          <div key={i} ref={el => (rowRefs.current[i] = el)} style={{
            display: 'grid', gridTemplateColumns: '1fr 110px',
            gap: 8, padding: '6px 10px',
            background: 'rgba(26,26,26,0.05)',
            fontFamily: 'var(--font-mono)', fontSize: 17,
          }}>
            <span style={{ color: 'var(--ink)' }}>
              {a}{b ? <span style={{ color: 'var(--ink-mute)' }}> · {b}</span> : ''}
            </span>
            <span style={{ color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>{c}</span>
          </div>
        ))}
      </div>

      {/* Row-shaped packet that slides between active rows. */}
      <div style={{
        position: 'absolute',
        left: 26,
        right: 26,
        top: metric ? metric.top : 0,
        height: metric ? metric.height : 0,
        opacity: visible && metric ? 1 : 0,
        transition: `top ${PACKET_GLIDE_MS}ms ${PHASE_EASE}, opacity ${PACKET_FADE_MS}ms ${PHASE_EASE}`,
        background: 'var(--ink)',
        color: '#f4f1ea',
        boxShadow: '0 6px 18px rgba(0,0,0,0.28)',
        zIndex: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 14px',
        pointerEvents: 'none',
      }}>
        {renderedData && (
          <>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              fontWeight: 600,
              minWidth: 80,
            }}>
              {renderedData.label}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 16,
              fontWeight: 500,
              flex: 1,
            }}>
              {renderedData.shape}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              color: 'rgba(244,241,234,0.65)',
            }}>
              {renderedData.detail}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* Card-style packet centered inside its parent (Input / DS-CNN). */
function CenterPacket({ data }) {
  const visible = !!data;
  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: visible ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -45%) scale(0.92)',
      opacity: visible ? 1 : 0,
      transition: `opacity 480ms ${PHASE_EASE}, transform 480ms ${PHASE_EASE}`,
      pointerEvents: 'none',
      zIndex: 4,
      minWidth: 240,
      padding: '14px 20px',
      background: 'var(--ink)',
      color: '#f4f1ea',
      boxShadow: '0 14px 36px rgba(0,0,0,0.28)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 6,
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>
        {data?.label || ' '}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 500, letterSpacing: '-0.01em' }}>
        {data?.shape || ' '}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(244,241,234,0.6)' }}>
        {data?.detail || ' '}
      </span>
    </div>
  );
}

/* ──────────────────────── P1 — two big summary cards ──────────────────────── */

function P1Compare() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flex: 1 }}>
      <SummaryCard
        eyebrow="Standard approach · two stages"
        headline="MFCC + DS-CNN"
        bigNumber="~7.0 M"
        bigLabel="total system ops"
        breakdown={[
          { value: '~1.6 M', label: 'MFCC preproc · CPU' },
          { value: '~5.4 M', label: 'DS-CNN · network' },
        ]}
        footer="Zhang et al., 2017 · 94.4% on Speech Commands"
      />
      <SummaryCard
        eyebrow="★ Our model · unified pipeline"
        headline="Conv1D → CNN"
        bigNumber="0.97 M"
        bigLabel="total system MACs"
        breakdown={[
          { value: '~516 K', label: 'conv1d_mel' },
          { value: '~451 K', label: '3 conv blocks' },
        ]}
        footer="all int8 · one acceleratable datapath"
        accent
      />
    </div>
  );
}

function SummaryCard({ eyebrow, headline, bigNumber, bigLabel, breakdown, footer, accent }) {
  return (
    <div style={{
      border: accent ? '2px solid var(--accent)' : '1px solid var(--ink)',
      background: accent ? '#fff7f2' : 'rgba(26,26,26,0.04)',
      padding: '24px 28px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 16,
        color: accent ? 'var(--accent)' : 'var(--ink-mute)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 8,
        fontWeight: accent ? 600 : 500,
      }}>{eyebrow}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 32, fontWeight: 600, marginBottom: 22 }}>{headline}</div>

      {/* Big total */}
      <div style={{
        textAlign: 'center',
        padding: '24px 16px',
        background: 'var(--paper)',
        border: '1px solid rgba(26,26,26,0.18)',
        marginBottom: 16,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 120,
          fontWeight: 500,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          color: 'var(--ink)',
        }}>{bigNumber}</div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          color: 'var(--ink-mute)',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          marginTop: 10,
        }}>{bigLabel}</div>
      </div>

      {/* Two-cell breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        {breakdown.map((b, i) => (
          <div key={i} style={{ padding: '14px 16px', border: '1px solid rgba(26,26,26,0.18)', background: 'var(--paper)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>{b.value}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', textTransform: 'uppercase', marginTop: 5 }}>{b.label}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Footer */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        color: 'var(--ink-mute)',
        textAlign: 'center',
      }}>
        {footer}
      </div>
    </div>
  );
}

/* ──────────────── P2 — Our Model expanded · 3 main components ──────────────── */

function P2Expanded() {
  return (
    <div style={{
      flex: 1,
      border: '2px solid var(--accent)',
      background: '#fff7f2',
      padding: '24px 28px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>
        ★ Our model · unified pipeline
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 32, fontWeight: 600, marginBottom: 18 }}>
        Conv1D learns the spectral front-end · 0.97 M MACs total
      </div>

      {/* Three components in equal-width cards. */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 32px 1fr 32px 1fr',
        alignItems: 'stretch',
        gap: 0,
        flex: 1,
        marginBottom: 16,
      }}>
        <FrontEndCard />
        <BigArrow />
        <BodyCard />
        <BigArrow />
        <HeadCard />
      </div>

      {/* FLIP source for slide 12. */}
      <div data-shared-bar="mac-share">
        <MacShareBar
          focus="balanced"
          inline
          label="Share of total MACs · 0.97 M"
          annotate="next slide breaks down the front-end · then the body + head"
        />
      </div>
    </div>
  );
}

function BigArrow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 28, color: 'var(--accent)' }}>→</div>
  );
}

/* Component 1 · Front-end — sinc kernel sketches + stats. */
function FrontEndCard() {
  // Re-use the kernel-sketch math from Conv1DMelFrontEnd.jsx — only 4 of them
  // for the small overview tile.
  const paths = Array.from({ length: 4 }, (_, i) => {
    const freq = 1 + i * 1.4;
    const amp  = 14 - i * 0.5;
    let d = '';
    for (let k = 0; k < 65; k++) {
      const x = (k / 64) * 100;
      const env = Math.exp(-Math.pow((k - 32) / 22, 2));
      const y = 22 - Math.sin(k * 0.5 * freq) * env * amp;
      d += (k === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
    }
    return d.trim();
  });
  return (
    <div style={{ border: '2px solid var(--accent)', background: 'rgba(217,119,87,0.10)', padding: '20px 22px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Front-end</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 600, margin: '6px 0 14px' }}>conv1d_mel</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 14px', marginBottom: 14 }}>
        {paths.map((d, i) => (
          <svg key={i} viewBox="0 0 100 44" style={{ width: '100%', height: 40 }}>
            <path d={d} fill="none" stroke="var(--accent)" strokeWidth="1.6" />
          </svg>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink)', lineHeight: 1.55 }}>
        <div>16 sinc-bandpass</div>
        <div>K=65 · stride 16</div>
        <div>1 056 params</div>
      </div>
      <div style={{
        marginTop: 12,
        padding: '10px 12px',
        background: 'var(--accent)',
        color: '#fff',
        fontFamily: 'var(--font-mono)',
        fontSize: 18,
        fontWeight: 600,
        textAlign: 'center',
      }}>
        ~516 K MACs · 53 %
      </div>
    </div>
  );
}

/* Component 2 · Body — 3D-stacked block sketch + stats. */
function BodyCard() {
  return (
    <div style={{ border: '1px solid var(--ink)', background: 'var(--paper)', padding: '20px 22px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Body</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 600, margin: '6px 0 14px' }}>3 × Conv1D</div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 130, marginBottom: 14 }}>
        {[
          { w: 70, label: '31 × 36' },
          { w: 36, label: '15 × 36' },
          { w: 36, label: '15 × 36' },
        ].map((b, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ position: 'relative', width: b.w, height: 110 }}>
              <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.12, transform: 'translate(5px,-5px)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.25, transform: 'translate(2.5px,-2.5px)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)' }}>{b.label}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink)', lineHeight: 1.55 }}>
        <div>36 channels · K=3</div>
        <div>BN · ReLU · pool</div>
        <div>~16 K params</div>
      </div>
      <div style={{
        marginTop: 12,
        padding: '10px 12px',
        background: 'var(--ink)',
        color: '#f4f1ea',
        fontFamily: 'var(--font-mono)',
        fontSize: 18,
        fontWeight: 600,
        textAlign: 'center',
      }}>
        ~451 K MACs · 47 %
      </div>
    </div>
  );
}

/* Component 3 · Head — softmax bar sketch + stats. */
function HeadCard() {
  return (
    <div style={{ border: '1px solid var(--ink)', background: 'var(--paper)', padding: '20px 22px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Head</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 600, margin: '6px 0 14px' }}>GAP → Dense → Softmax</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {[
          { label: 'yes',   w: '92%', accent: true },
          { label: 'no',    w: '6%' },
          { label: 'go',    w: '2%' },
          { label: 'left',  w: '1%' },
          { label: '...',   w: '0.5%' },
        ].map((b, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 32px', gap: 8, alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 14 }}>
            <span style={{ color: b.accent ? 'var(--accent)' : 'var(--ink-mute)', fontWeight: b.accent ? 600 : 400 }}>{b.label}</span>
            <div style={{ height: 9, background: b.accent ? 'var(--accent)' : 'var(--ink)', opacity: b.accent ? 1 : 0.2, width: b.w }} />
            <span style={{ color: b.accent ? 'var(--accent)' : 'var(--ink-mute)', textAlign: 'right' }}>{b.accent ? '.92' : ''}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink)', lineHeight: 1.55 }}>
        <div>Dense 16 · ReLU</div>
        <div>Softmax → 11 logits</div>
        <div>~16 K params total</div>
      </div>
      <div style={{
        marginTop: 12,
        padding: '10px 12px',
        background: 'var(--ink)',
        color: '#f4f1ea',
        fontFamily: 'var(--font-mono)',
        fontSize: 18,
        fontWeight: 600,
        textAlign: 'center',
      }}>
        ~656 MACs · &lt;0.1 %
      </div>
    </div>
  );
}
