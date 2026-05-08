import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';

/* ─────────────────────────────────────────────────────────────────────────────
 * Combined slide 11 — eight intra-slide phases stepped with ArrowRight.
 *
 *   P0 — Three boxes (Input · MFCC · DS-CNN) at full width. A "data packet"
 *        walks: Input centred → each of the 6 MFCC step rows in turn →
 *        DS-CNN centred → off-stage → loop.
 *   P1 — Side-by-side summary cards. Standard ~7 M ops vs. ours 0.97 M MACs.
 *   P2 — Our model takes over. Three component cards: Front-end · Body · Head.
 *   P3 — Front-end zoom (kernels + sliding window).
 *   P4 — Three components again (return to overview).
 *   P5 — Body zoom (3 conv blocks with detailed shapes + pool ratios).
 *   P6 — Three components again.
 *   P7 — Head zoom (GAP → Dense 16 → Softmax over 11 classes).
 * ───────────────────────────────────────────────────────────────────────── */

const PHASE_MOTION_MS = 820;
const PHASE_FADE_MS   = 520;
const PHASE_EASE      = 'cubic-bezier(0.16, 1, 0.3, 1)';

const DWELL_MS         = 1300;
const OFFSTAGE_MS      = 600;
const PACKET_GLIDE_MS  = 280;
const PACKET_FADE_MS   = 240;

const MAX_PHASE = 7;

const STOPS = [
  { kind: 'input',        label: 'PCM',     shape: '[8000, 1]',  detail: 'int8 · 8 kHz' },
  { kind: 'mfcc', row: 0, label: 'Frame',   shape: '100 × 200',  detail: '25 ms / 10 ms' },
  { kind: 'mfcc', row: 1, label: 'FFT',     shape: '[100, 257]', detail: '~460 K mults' },
  { kind: 'mfcc', row: 2, label: 'Power',   shape: '[100, 257]', detail: '~26 K ops' },
  { kind: 'mfcc', row: 3, label: 'Mel',     shape: '[100, 40]',  detail: '~1.0 M MACs' },
  { kind: 'mfcc', row: 4, label: 'log',     shape: '[100, 40]',  detail: '~4 K ops' },
  { kind: 'mfcc', row: 5, label: 'DCT-II',  shape: '[100, 13]',  detail: '~130 K ops' },
  { kind: 'cnn',  row: 0 },
  { kind: 'cnn',  row: 1 },
  { kind: 'cnn',  row: 2 },
  { kind: 'cnn',  row: 3 },
  { kind: 'gap' },
];

const MFCC_ROWS = [
  ['Frame + Hamming window', '25 ms / 10 ms hop',  '100 frames'],
  ['FFT 512-pt',             '',                   '~460 K mults'],
  ['Power spectrum |·|²',    '',                   '~26 K ops'],
  ['Mel filterbank',         '40 triangular bands','~1.0 M MACs'],
  ['log compression',        'ln(·)',              '~4 K ops'],
  ['DCT-II',                 '→ MFCC features',    '~130 K ops'],
];

/* DS-CNN-S layers from Zhang et al., 2017 — sized for the comparison
   slide. The "Predict" packet overlays the LAST row so the data flow
   (MFCC → DS-CNN → logits) reads as one continuous ribbon. */
const DSCNN_ROWS = [
  ['Conv2D · 64 · 10×4', 'BN · ReLU'],
  ['DS-Conv block ×4',   '64 ch · 3×3 + 1×1'],
  ['Global AvgPool',     '49×10×64 → 64'],
  ['Dense → Softmax',    '64 → 11'],
];

const SOFTMAX_CLASSES = [
  { label: 'yes',       w: '92%',  prob: '.92',  accent: true },
  { label: 'no',        w: '4.0%', prob: '.04' },
  { label: 'up',        w: '1.2%', prob: '.01' },
  { label: 'down',      w: '0.8%', prob: '.01' },
  { label: 'left',      w: '0.5%', prob: '.01' },
  { label: 'right',     w: '0.4%', prob: '.00' },
  { label: 'on',        w: '0.4%', prob: '.00' },
  { label: 'off',       w: '0.3%', prob: '.00' },
  { label: 'stop',      w: '0.2%', prob: '.00' },
  { label: 'go',        w: '0.1%', prob: '.00' },
  { label: '_unknown_', w: '0.1%', prob: '.00' },
];

const TR_BOX = `left ${PHASE_MOTION_MS}ms ${PHASE_EASE}, width ${PHASE_MOTION_MS}ms ${PHASE_EASE}, transform ${PHASE_MOTION_MS}ms ${PHASE_EASE}, opacity ${PHASE_FADE_MS}ms ease`;

const ZOOM_PHASES = new Set([3, 5, 7]);
const isOverviewPhase = (p) => p >= 2 && !ZOOM_PHASES.has(p);
const isFrontExpanded = (p) => p === 3;
const isBodyExpanded  = (p) => p === 5;
const isHeadExpanded  = (p) => p === 7;

function ourBoxGeo(phase) {
  if (phase === 0) return { left: '51%', width: '49%', transform: 'translateX(115%)', opacity: 0 };
  if (phase === 1) return { left: '51%', width: '49%', transform: 'translateX(0)',    opacity: 1 };
  return                  { left: '0%',  width: '100%',transform: 'translateX(0)',    opacity: 1 };
}

function cardPositions(phase) {
  if (phase === 3) return {
    front: { left: '0%',   width: '100%', opacity: 1 },
    body:  { left: '110%', width: '32%',  opacity: 0 },
    head:  { left: '120%', width: '32%',  opacity: 0 },
  };
  if (phase === 5) return {
    front: { left: '-50%', width: '32%',  opacity: 0 },
    body:  { left: '0%',   width: '100%', opacity: 1 },
    head:  { left: '110%', width: '32%',  opacity: 0 },
  };
  if (phase === 7) return {
    front: { left: '-60%', width: '32%',  opacity: 0 },
    body:  { left: '-30%', width: '32%',  opacity: 0 },
    head:  { left: '0%',   width: '100%', opacity: 1 },
  };
  /* P2, P4, P6 — overview */
  return {
    front: { left: '0%',  width: '32%', opacity: 1 },
    body:  { left: '34%', width: '32%', opacity: 1 },
    head:  { left: '68%', width: '32%', opacity: 1 },
  };
}

export default function StandardMFCC() {
  const rootRef = useRef(null);
  const [phase, setPhase]     = useState(0);
  const [stopIdx, setStopIdx] = useState(0);
  /* Bumped on every becameActive — used as a useEffect dep so the packet
     cycle restarts from raw PCM (stop 0) every time the slide is opened,
     not from wherever it happened to be when the user last left. */
  const [cycleKey, setCycleKey] = useState(0);

  /* Phase navigation. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const section = rootRef.current?.closest('section');
      if (!section?.hasAttribute('data-deck-active')) return;
      const fwd  = e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Spacebar';
      const back = e.key === 'ArrowLeft'  || e.key === 'PageUp';
      if (fwd && phase < MAX_PHASE) {
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

  /* Reset phase on slidechange. */
  useEffect(() => {
    const onSlideChange = (e) => {
      const mySection = rootRef.current?.closest('section');
      if (!mySection) return;
      const becameActive = e.detail.slide === mySection;
      const cameFromNext = e.detail.previousIndex === e.detail.index + 1;
      if (becameActive) {
        setPhase(cameFromNext ? MAX_PHASE : 0);
        setStopIdx(0);
        setCycleKey(k => k + 1);
      }
    };
    document.addEventListener('slidechange', onSlideChange);
    return () => document.removeEventListener('slidechange', onSlideChange);
  }, []);

  /* Packet cycle — only runs in P0. cycleKey is in deps so re-entering
     the slide always restarts the walk from stop 0 (raw PCM). */
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
  }, [phase, cycleKey]);

  const cur = STOPS[stopIdx];

  const heading = (() => {
    if (phase === 0) return {
      eyebrow: 'Industry baseline',
      title:   'Standard KWS: fixed MFCC front-end feeds the network.',
      sub:     'The dominant approach on Google Speech Commands — Zhang et al., 2017. Two stages, ~7 M ops total.',
    };
    if (phase === 1) return {
      eyebrow: 'Industry baseline · then ours',
      title:   'Side by side: MFCC + DS-CNN  vs.  unified Conv1D model.',
      sub:     'Their two-stage system: ~7 M ops. Our unified pipeline: 0.97 M MACs.',
    };
    if (phase === 3) return {
      eyebrow: '★ Mel Compact · Front-end zoom',
      title:   'Learnable mel filterbank — the front-end is a Conv1D.',
      sub:     '16 learnable mel filters · K=65 · stride 16 · 1 056 params · ~516 K MACs (53 % of total).',
    };
    if (phase === 5) return {
      eyebrow: '★ Mel Compact · Body zoom',
      title:   'Three plain 1D conv blocks — feature extractor.',
      sub:     '36 channels · K=3 · BN · ReLU · MaxPool. Pool 4× then 2× then ×1. ~451 K MACs (47 % of total).',
    };
    if (phase === 7) return {
      eyebrow: '★ Mel Compact · Head zoom',
      title:   'GAP → Dense 16 → Softmax over 11 keywords.',
      sub:     '36 GAP outputs collapse the time axis · Dense 16 with dropout p=0.3 · Softmax to 11 logits · ~656 MACs.',
    };
    /* P2, P4, P6 — three components overview */
    return {
      eyebrow: '★ Mel Compact',
      title:   'One unified pipeline — three components.',
      sub:     '0.97 M MACs total, all int8, one acceleratable datapath.',
    };
  })();

  const pos = cardPositions(phase);

  return (
    <SlideFrame topLeft="10 · Model">
      <div ref={rootRef} style={{ marginTop: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>{heading.eyebrow}</div>
        <h1 className="title" style={{ fontSize: 42, marginBottom: 6 }}>{heading.title}</h1>
        <p className="subtitle" style={{ fontSize: 22, maxWidth: 1700, marginBottom: 10 }}>{heading.sub}</p>
      </div>

      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>

        {/* P0 panels: Input · MFCC · DS-CNN */}
        <Box style={{
          left: '0%', width: '22%',
          opacity: phase === 0 ? 1 : 0,
          transform: phase === 0 ? 'translateX(0)' : 'translateX(-30%)',
          transition: TR_BOX,
        }}>
          <InputContent active={cur.kind === 'input' ? cur : null} />
        </Box>
        <Arrow style={{ left: '22%', opacity: phase === 0 ? 1 : 0 }} />
        <Arrow style={{ left: '70%', opacity: phase === 0 ? 1 : 0 }} />

        <Box style={{
          left:  phase === 0 ? '24%' : '0%',
          width: phase === 0 ? '46%' : '49%',
          transform: phase >= 2 ? 'translateX(-115%)' : 'translateX(0)',
          opacity: phase >= 2 ? 0 : 1,
          transition: TR_BOX,
        }}>
          <FadeView active={phase === 0}>
            <MfccPipelineContent rowIdx={cur.kind === 'mfcc' ? cur.row : null} />
          </FadeView>
          <FadeView active={phase === 1}>
            <SummaryCard
              eyebrow="Standard approach · two stages"
              headline="MFCC + DS-CNN"
              bigNumber="~7.0 M"
              bigLabel="total system ops"
              breakdown={[
                { value: '~1.6 M', label: 'MFCC preproc · CPU' },
                { value: '~5.4 M', label: 'DS-CNN · network' },
              ]}
              accelerator={[
                { label: 'MFCC accelerator', sub: 'separate DSP block needed for the front-end' },
                { label: 'DS-CNN accelerator', sub: 'separate NN engine needed for the body' },
              ]}
              footer="Zhang et al., 2017 · 94.4 % on Speech Commands"
            />
          </FadeView>
        </Box>

        <Box style={{
          left: '72%', width: '28%',
          opacity: phase === 0 ? 1 : 0,
          transform: phase === 0 ? 'translateX(0)' : 'translateX(30%)',
          transition: TR_BOX,
        }}>
          <CnnContent rowIdx={cur.kind === 'cnn' ? cur.row : null} />
        </Box>

        {/* Our-model container: P1 summary · P2/P4/P6 three-cards · P3/P5/P7 zooms. */}
        <Box style={{
          ...ourBoxGeo(phase),
          transition: TR_BOX,
        }}>
          <FadeView active={phase === 1}>
            <SummaryCard
              eyebrow="★ Our approach · unified pipeline"
              headline="Mel Compact"
              bigNumber="0.97 M"
              bigLabel="total system MACs"
              breakdown={[
                { value: '~516 K', label: 'conv1d_mel' },
                { value: '~451 K', label: '3 conv blocks' },
              ]}
              accelerator={[
                { label: '★ One Conv1D accelerator', sub: 'front-end and body run end-to-end on the same unit', accent: true },
              ]}
              footer="all int8 · one acceleratable datapath"
              accent
            />
          </FadeView>

          <FadeView active={phase >= 2}>
            <ThreeCardsLayer phase={phase} pos={pos} />
          </FadeView>
        </Box>
      </div>

      <div style={{
        marginTop: 8,
        padding: '8px 14px',
        border: '1px solid rgba(26,26,26,0.15)',
        background: 'rgba(26,26,26,0.03)',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        color: 'var(--ink-mute)',
        lineHeight: 1.5,
        opacity: phase < 2 ? 1 : 0,
        height: phase < 2 ? 'auto' : 0,
        overflow: 'hidden',
        transition: 'opacity 400ms ease',
        pointerEvents: phase < 2 ? 'auto' : 'none',
      }}>
        Y. Zhang et al., "Hello Edge: Keyword Spotting on Microcontrollers," <em>arXiv:1711.07128</em>, 2017 — DS-CNN-S configuration, Google Speech Commands v1.
      </div>
    </SlideFrame>
  );
}

/* ── 3-card layer: Front-end · Body · Head, individually positioned per phase. */
function ThreeCardsLayer({ phase, pos }) {
  return (
    <div style={{
      position: 'relative',
      height: '100%',
      width: '100%',
      border: '2px solid var(--accent)',
      background: '#fff7f2',
      padding: '14px 20px 18px',
      boxSizing: 'border-box',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
        ★ Mel Compact · unified pipeline · 0.97 M MACs total
      </div>

      <div style={{ position: 'relative', flex: 1, height: 'calc(100% - 30px)' }}>
        <CardBox geo={pos.front}>
          <FadeView active={!ZOOM_PHASES.has(phase)}><FrontEndCompact /></FadeView>
          <FadeView active={isFrontExpanded(phase)}><FrontEndExpanded /></FadeView>
        </CardBox>

        <CardBox geo={pos.body}>
          <FadeView active={!ZOOM_PHASES.has(phase)}><BodyCompact /></FadeView>
          <FadeView active={isBodyExpanded(phase)}><BodyExpanded /></FadeView>
        </CardBox>

        <CardBox geo={pos.head}>
          <FadeView active={!ZOOM_PHASES.has(phase)}><HeadCompact /></FadeView>
          <FadeView active={isHeadExpanded(phase)}><HeadExpanded /></FadeView>
        </CardBox>
      </div>
    </div>
  );
}

/* ── Outer wrapper for an absolutely-positioned box. ── */
function Box({ style, children }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0, bottom: 0,
      willChange: 'left, width, transform, opacity',
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardBox({ geo, children }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0, bottom: 0,
      ...geo,
      transition: TR_BOX,
      willChange: 'left, width, opacity',
    }}>
      {children}
    </div>
  );
}

function FadeView({ active, children }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      opacity: active ? 1 : 0,
      transition: `opacity ${PHASE_FADE_MS}ms ease`,
      pointerEvents: active ? 'auto' : 'none',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {children}
    </div>
  );
}

function Arrow({ style }) {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '2%',
      textAlign: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 30,
      color: 'var(--ink-mute)',
      transition: 'opacity 400ms ease',
      pointerEvents: 'none',
      ...style,
    }}>→</div>
  );
}

/* ───────── Input panel ───────── */
function InputContent({ active }) {
  return (
    <div style={{ position: 'relative', height: '100%', border: '1px solid var(--ink)', padding: '20px 22px', background: 'var(--paper)', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Input</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 30, fontWeight: 600, marginBottom: 14 }}>Raw PCM</div>
      <svg viewBox="0 0 160 50" style={{ width: '100%', height: 60, display: 'block', marginBottom: 14 }}>
        <path d="M0,25 Q5,12 10,28 T22,24 Q28,14 34,32 T46,22 Q52,8 58,30 T72,24 Q78,16 84,28 T96,22 Q104,10 110,30 T124,24 Q130,14 136,28 T148,22 Q154,18 160,25"
          fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      </svg>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 17, color: 'var(--ink-mute)', lineHeight: 1.7 }}>
        <div>8 000 samples</div>
        <div>8 kHz · 1 s window</div>
      </div>
      <CenterPacket data={active} />
    </div>
  );
}

/* ───────── DS-CNN panel — same inline-inversion pattern as MFCC. */
function CnnContent({ rowIdx }) {
  return (
    <div style={{ position: 'relative', height: '100%', border: '2px solid var(--ink)', padding: '20px 22px', background: 'var(--paper)', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Stage 2 · Network</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 30, fontWeight: 600, marginBottom: 14 }}>DS-CNN</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
        {DSCNN_ROWS.map(([a, b], i) => {
          const isActive = rowIdx === i;
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              gap: 8, padding: '6px 10px',
              background: isActive ? 'var(--ink)' : 'rgba(26,26,26,0.05)',
              fontFamily: 'var(--font-mono)', fontSize: 15,
              transition: 'background 320ms ease',
              boxShadow: isActive ? '0 6px 18px rgba(0,0,0,0.28)' : 'none',
              position: 'relative',
              zIndex: isActive ? 2 : 1,
            }}>
              <span style={{ color: isActive ? '#f4f1ea' : 'var(--ink)', transition: 'color 320ms ease' }}>{a}</span>
              <span style={{ color: isActive ? 'rgba(244,241,234,0.7)' : 'var(--ink-mute)', textAlign: 'right', transition: 'color 320ms ease' }}>{b}</span>
            </div>
          );
        })}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', lineHeight: 1.55 }}>
        Depthwise-separable 2-D conv<br />over Mel features · ~5.4 M MACs
      </div>
    </div>
  );
}

/* ───────── MFCC pipeline content ─────────
   The packet IS the row — when `rowIdx` matches, that row inverts to dark
   (cream text on ink background) with a soft drop-shadow. Rendering the
   highlight inline rather than via an absolutely-positioned overlay
   guarantees the packet aligns with its row by construction (no
   measurement, no scale-transform pitfalls, no useLayoutEffect race).
   ───────────────────────────────────────── */
function MfccPipelineContent({ rowIdx }) {
  return (
    <div style={{ position: 'relative', height: '100%', border: '1px solid var(--ink)', padding: '20px 22px', background: 'rgba(26,26,26,0.04)', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Stage 1 · Fixed front-end
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 30, fontWeight: 600, marginBottom: 14 }}>MFCC</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {MFCC_ROWS.map(([a, b, c], i) => {
          const isActive = rowIdx === i;
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 110px',
              gap: 8, padding: '6px 10px',
              background: isActive ? 'var(--ink)' : 'rgba(26,26,26,0.05)',
              fontFamily: 'var(--font-mono)', fontSize: 17,
              transition: 'background 320ms ease',
              boxShadow: isActive ? '0 6px 18px rgba(0,0,0,0.28)' : 'none',
              position: 'relative',
              zIndex: isActive ? 2 : 1,
            }}>
              <span style={{ color: isActive ? '#f4f1ea' : 'var(--ink)', transition: 'color 320ms ease' }}>
                {a}
                {b ? <span style={{ color: isActive ? 'rgba(244,241,234,0.7)' : 'var(--ink-mute)', transition: 'color 320ms ease' }}> · {b}</span> : ''}
              </span>
              <span style={{ color: isActive ? '#f4f1ea' : 'var(--ink)', fontWeight: 500, textAlign: 'right', transition: 'color 320ms ease' }}>{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── P1 side-by-side summary cards. The accelerator row at the
   bottom is the visual contrast: standard stack needs two separate
   accelerators (one per stage), ours runs end-to-end on one. */
function SummaryCard({ eyebrow, headline, bigNumber, bigLabel, breakdown, accelerator, footer, accent }) {
  return (
    <div style={{
      height: '100%',
      border: accent ? '2px solid var(--accent)' : '1px solid var(--ink)',
      background: accent ? '#fff7f2' : 'rgba(26,26,26,0.04)',
      padding: '24px 28px',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: accent ? 'var(--accent)' : 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: accent ? 600 : 500 }}>{eyebrow}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 30, fontWeight: 600, marginBottom: 18 }}>{headline}</div>

      {/* Big-number card: takes most of the slack so the card has no
          empty space below the accelerator row. Grows with flex 2.4. */}
      <div style={{
        flex: '2.4 1 0',
        minHeight: 0,
        textAlign: 'center',
        padding: '18px 16px',
        background: 'var(--paper)',
        border: '1px solid rgba(26,26,26,0.18)',
        marginBottom: 14,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 110, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--ink)' }}>{bigNumber}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 12 }}>{bigLabel}</div>
      </div>

      {/* Breakdown grid: also flexes a little so cells stretch. */}
      <div style={{ flex: '1 1 0', minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        {breakdown.map((b, i) => (
          <div key={i} style={{
            padding: '14px 16px',
            border: '1px solid rgba(26,26,26,0.18)',
            background: 'var(--paper)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>{b.value}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', textTransform: 'uppercase', marginTop: 6 }}>{b.label}</div>
          </div>
        ))}
      </div>

      {/* Accelerator row — also flexes so its boxes grow to absorb any
          remaining slack and the card has no dead space at the bottom. */}
      {accelerator && (
        <div style={{ flex: '1 1 0', minHeight: 0, display: 'grid', gridTemplateColumns: `repeat(${accelerator.length}, 1fr)`, gap: 10, marginBottom: 12 }}>
          {accelerator.map((a, i) => {
            const a_accent = a.accent;
            return (
              <div key={i} style={{
                padding: '14px 16px',
                border: a_accent ? '2px solid var(--accent)' : '1.5px solid #c44',
                background: a_accent ? 'rgba(217,119,87,0.10)' : 'rgba(204,68,68,0.06)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 6,
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 700,
                  color: a_accent ? 'var(--accent)' : '#c44',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>{a.label}</div>
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 16,
                  color: 'var(--ink)',
                  lineHeight: 1.35,
                }}>{a.sub}</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', textAlign: 'center' }}>{footer}</div>
    </div>
  );
}

/* ───────── Front-end compact card (overview phases). */
function FrontEndCompact() {
  const paths = sincPaths(4);
  return (
    <div style={{ height: '100%', border: '2px solid var(--accent)', background: 'rgba(217,119,87,0.10)', padding: '18px 20px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Front-end</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 26, fontWeight: 600, margin: '4px 0 12px' }}>conv1d_mel</div>

      {/* Image area — flex:1 + minHeight:0 so the 2x2 SVG grid actually
          fills whatever vertical space is left after the heading and footer. */}
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '10px 14px', marginBottom: 14 }}>
        {paths.map((d, i) => (
          <svg key={i} viewBox="0 0 100 44" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
            <path d={d} fill="none" stroke="var(--accent)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          </svg>
        ))}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--ink)', lineHeight: 1.55 }}>
        <div>16 learnable mel</div>
        <div>K=65 · stride 16</div>
        <div>1 056 params</div>
      </div>
      <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--accent)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 600, textAlign: 'center' }}>
        ~516 K MACs · 53 %
      </div>
    </div>
  );
}

/* ───────── Front-end EXPANDED — animated sliding window on the left,
   big-number stride/pool cards on the right. */
function FrontEndExpanded() {
  return (
    <div style={{ height: '100%', border: '2px solid var(--accent)', background: 'rgba(217,119,87,0.06)', padding: '16px 22px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Front-end · zoom · learnable mel filterbank</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 17, color: 'var(--ink-mute)' }}>conv1d_mel · K=65 · 1 056 params · ~516 K MACs (53 %)</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: 22, alignItems: 'stretch', flex: 1, minHeight: 0 }}>
        {/* Left — animated sliding-window over the raw waveform. */}
        <SlidingWindowViz />


        {/* Right — 2x2 big-number cards: stride · pool · combined downsample · params/MACs. */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 19, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            What stride and pool buy us
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 14, flex: 1, minHeight: 0 }}>
            <BigNumCard
              big="stride 16"
              label="fused into the kernel"
              body="One conv op gives the bandpass and the 16× downsample. Free."
              accent
            />
            <BigNumCard
              big="pool 4×"
              label="MaxPool right after"
              body="Another 4× drop in time resolution before the body sees a thing."
            />
            <BigNumCard
              big="64×"
              label="combined downsample"
              body="8 000 raw samples collapse to 124 frames before any conv block runs."
              accent
            />
            <BigNumCard
              big="1 056"
              label="params · 16×65 + bias"
              body="The whole front-end fits in a kilobyte of weights — and lands ~516 K MACs (53 % of the model)."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── Sliding-window animation for the front-end zoom.
   A long waveform sits at the top of the panel; a K=65 window box
   slides left → right in stride-16 steps. As it lands on each step,
   a 16-tall column of mel-feature bars pops in below — building up a
   feature map cell by cell. Loop with a brief pause at the end. ── */

const SW_STEPS      = 12;       // visible window positions (real model has 124)
const SW_STEP_MS    = 520;      // dwell per position (= window+features animate)
const SW_END_PAUSE  = 1200;     // hold the full feature map for a beat
const SW_RESET_MS   = 320;      // fade-out before the next loop

/* Deterministic 12×16 magnitude grid — looks varied without re-rendering
   different values on every paint. */
const SW_MAGS = Array.from({ length: SW_STEPS }, (_, t) =>
  Array.from({ length: 16 }, (_, m) => {
    const a = Math.sin((t * 1.7 + m * 0.9) * 0.6) * 0.5 + 0.5;
    const b = Math.sin((t * 0.6 - m * 1.3) * 0.4) * 0.5 + 0.5;
    return 0.25 + 0.7 * (a * 0.6 + b * 0.4);
  })
);

function SlidingWindowViz() {
  /* `step` runs through 0..SW_STEPS-1 (window slides), then SW_STEPS
     (hold full grid), then SW_STEPS+1 (fade out → reset). */
  const [step, setStep] = useState(0);

  useEffect(() => {
    let timer;
    const tick = () => {
      setStep((s) => {
        const next = s + 1;
        if (next > SW_STEPS + 1) return 0;
        return next;
      });
      const dwell =
        step === SW_STEPS ? SW_END_PAUSE :
        step === SW_STEPS + 1 ? SW_RESET_MS :
        SW_STEP_MS;
      timer = setTimeout(tick, dwell);
    };
    timer = setTimeout(tick, SW_STEP_MS);
    return () => clearTimeout(timer);
  }, [step]);

  const inSlide  = step < SW_STEPS;
  const inHold   = step === SW_STEPS;
  const inReset  = step === SW_STEPS + 1;
  const windowAt = inSlide ? step : SW_STEPS - 1;
  const featuresShown = inReset ? 0 : Math.min(step + 1, SW_STEPS);

  /* Geometry — the SVG / feature row share an x-axis mapping: each step
     occupies 1/SW_STEPS of the panel width. Window box width = 2/SW_STEPS
     so it visibly spans more than one stride (K=65 vs stride 16). */
  const stepFrac = 100 / SW_STEPS;
  const windowLeftPct = windowAt * stepFrac;
  const windowWidthPct = stepFrac * 2.2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
        Sliding the window over raw audio
      </div>

      <div style={{
        position: 'relative',
        border: '1px solid var(--ink)',
        background: 'var(--paper)',
        padding: '14px 18px 12px',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Waveform with the sliding window box. */}
        <div style={{ position: 'relative', height: 110, flex: '0 0 auto' }}>
          <svg viewBox="0 0 600 110" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
            <path
              d="M0,55 Q15,30 30,65 T70,50 Q90,15 110,75 T160,35 Q180,5 200,75 T260,45 Q290,15 320,70 T380,50 Q410,30 440,65 T500,50 Q540,40 600,55"
              fill="none" stroke="var(--ink)" strokeWidth="1.6"
            />
          </svg>

          {/* Sliding window — accent box overlays the waveform. */}
          <div style={{
            position: 'absolute',
            top: -2,
            bottom: -2,
            left: `${windowLeftPct}%`,
            width: `${windowWidthPct}%`,
            background: 'rgba(217,119,87,0.18)',
            border: '1.5px solid var(--accent)',
            transition: `left ${SW_STEP_MS - 100}ms cubic-bezier(0.16, 1, 0.3, 1), opacity 220ms ease`,
            opacity: inReset ? 0 : 1,
            pointerEvents: 'none',
          }}>
            <div style={{
              position: 'absolute',
              top: -22,
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--accent)',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}>K=65</div>
          </div>
        </div>

        {/* Connector arrow + extract caption. */}
        <div style={{
          height: 22,
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          color: 'var(--accent)',
          textAlign: 'center',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginTop: 6,
          fontWeight: 600,
          opacity: inSlide || inHold ? 1 : 0,
          transition: 'opacity 220ms ease',
        }}>
          ↓ extract 16 features
        </div>

        {/* Feature map — one column per window position, 16 mel-band cells per column. */}
        <div style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${SW_STEPS}, 1fr)`,
          gap: 3,
          alignItems: 'stretch',
          marginTop: 4,
        }}>
          {Array.from({ length: SW_STEPS }, (_, t) => {
            const visible = t < featuresShown;
            const isFresh = inSlide && t === windowAt;
            return (
              <div key={t} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                opacity: visible ? 1 : 0,
                transform: visible
                  ? (isFresh ? 'scale(1.04)' : 'scale(1)')
                  : 'scale(0.78) translateY(6px)',
                transition: `opacity 280ms ease, transform 280ms cubic-bezier(0.16, 1, 0.3, 1)`,
                transformOrigin: 'top center',
              }}>
                {SW_MAGS[t].map((m, b) => (
                  <div key={b} style={{
                    flex: 1,
                    minHeight: 3,
                    background: isFresh ? 'var(--accent)' : 'var(--ink)',
                    opacity: 0.18 + 0.78 * m,
                    transition: 'background 320ms ease',
                  }} />
                ))}
              </div>
            );
          })}
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          color: 'var(--ink-mute)',
          marginTop: 10,
          textAlign: 'center',
          letterSpacing: '0.04em',
        }}>
          K=65 window · stride 16 · 124 frames out · 16 mel bands per frame
        </div>
      </div>
    </div>
  );
}

function BigNumCard({ big, label, body, accent }) {
  return (
    <div style={{
      border: accent ? '1px solid var(--accent)' : '1px solid var(--ink)',
      background: 'var(--paper)',
      padding: '18px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      minHeight: 0,
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 52,
        fontWeight: 500,
        letterSpacing: '-0.03em',
        lineHeight: 1.05,
        color: accent ? 'var(--accent)' : 'var(--ink)',
      }}>{big}</div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        color: 'var(--ink-mute)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 4,
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 18,
        color: 'var(--ink)',
        lineHeight: 1.4,
      }}>{body}</div>
    </div>
  );
}

/* ───────── Body compact card (overview phases). */
function BodyCompact() {
  return (
    <div style={{ height: '100%', border: '1px solid var(--ink)', background: 'var(--paper)', padding: '18px 20px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Body</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 26, fontWeight: 600, margin: '4px 0 12px' }}>3 × Conv1D</div>

      {/* Image area — fills the vertical space between title and stats. */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', marginBottom: 14, paddingBottom: 4 }}>
        {[
          { w: 96, hPct: 100, label: '31 × 36' },
          { w: 48, hPct: 60,  label: '15 × 36' },
          { w: 48, hPct: 60,  label: '15 × 36' },
        ].map((b, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', width: b.w, height: `${b.hPct}%`, maxHeight: '88%' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.12, transform: 'translate(7px,-7px)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.25, transform: 'translate(3.5px,-3.5px)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)' }}>{b.label}</div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--ink)', lineHeight: 1.55 }}>
        <div>36 channels · K=3</div>
        <div>BN · ReLU · pool</div>
        <div>~16 K params</div>
      </div>
      <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--ink)', color: '#f4f1ea', fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 600, textAlign: 'center' }}>
        ~451 K MACs · 47 %
      </div>
    </div>
  );
}

/* ───────── Body EXPANDED — just the 3 conv blocks blown up. */
function BodyExpanded() {
  const blocks = [
    { w: 220, h: 320, label: 'Block 1', shape: '31 × 36', conv: 'Conv1D · K=3 · 36 ch', pool: 'MaxPool ↓4×',  poolAccent: true,  cost: '~250 K MACs' },
    { w: 110, h: 320, label: 'Block 2', shape: '15 × 36', conv: 'Conv1D · K=3 · 36 ch', pool: 'MaxPool ↓2×',  poolAccent: true,  cost: '~120 K MACs' },
    { w: 110, h: 320, label: 'Block 3', shape: '15 × 36', conv: '2× Conv1D · K=3 · 36', pool: 'no pool',      poolAccent: false, cost: '~80 K MACs'  },
  ];
  return (
    <div style={{ height: '100%', border: '2px solid var(--ink)', background: 'var(--paper)', padding: '14px 22px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Body · zoom</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)' }}>3 × Conv1D · 36 channels · BN · ReLU · MaxPool · plain (not depthwise-separable)</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-evenly', flex: 1, minHeight: 0, gap: 30, paddingBottom: 24 }}>
        {blocks.map((b, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink)', fontWeight: 600 }}>{b.label}</div>
            <div style={{ position: 'relative', width: b.w, height: b.h }}>
              <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.12, transform: 'translate(10px,-10px)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.25, transform: 'translate(5px,-5px)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', textAlign: 'center', color: '#f4f1ea', fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 500, letterSpacing: '0.06em' }}>
                {b.shape}
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink)', textAlign: 'center', lineHeight: 1.5 }}>
              <div>{b.conv}</div>
              <div style={{ color: b.poolAccent ? 'var(--accent)' : 'var(--ink-mute)', fontWeight: b.poolAccent ? 600 : 400 }}>{b.pool}</div>
              <div style={{ color: 'var(--ink-mute)', marginTop: 2 }}>{b.cost}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--ink)', color: '#f4f1ea', fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, textAlign: 'center', letterSpacing: '0.04em' }}>
        ~451 K MACs · 47 % of total · plain Conv1D, NNoM-quantisable INT8
      </div>
    </div>
  );
}

/* ───────── Head compact card (overview phases). */
function HeadCompact() {
  const bars = [
    { label: 'yes',   w: '92%', accent: true },
    { label: 'no',    w: '6%' },
    { label: 'go',    w: '2%' },
    { label: 'left',  w: '1%' },
    { label: '...',   w: '0.5%' },
  ];
  return (
    <div style={{ height: '100%', border: '1px solid var(--ink)', background: 'var(--paper)', padding: '18px 20px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Head</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 26, fontWeight: 600, margin: '4px 0 12px' }}>GAP → Dense → Softmax</div>

      {/* Image area — fills the vertical space; bars stretch to fill height. */}
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateRows: `repeat(${bars.length}, 1fr)`, gap: 6, marginBottom: 14 }}>
        {bars.map((b, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 38px', gap: 10, alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 15 }}>
            <span style={{ color: b.accent ? 'var(--accent)' : 'var(--ink-mute)', fontWeight: b.accent ? 600 : 400 }}>{b.label}</span>
            <div style={{ height: '60%', maxHeight: 24, background: b.accent ? 'var(--accent)' : 'var(--ink)', opacity: b.accent ? 1 : 0.2, width: b.w }} />
            <span style={{ color: b.accent ? 'var(--accent)' : 'var(--ink-mute)', textAlign: 'right' }}>{b.accent ? '.92' : ''}</span>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--ink)', lineHeight: 1.55 }}>
        <div>Dense 16 · ReLU</div>
        <div>Softmax → 11 logits</div>
        <div>~16 K params total</div>
      </div>
      <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--ink)', color: '#f4f1ea', fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 600, textAlign: 'center' }}>
        ~656 MACs · &lt;0.1 %
      </div>
    </div>
  );
}

/* ───────── Head EXPANDED — full GAP → Dense → Softmax 11 visualization. */
function HeadExpanded() {
  return (
    <div style={{ height: '100%', border: '2px solid var(--ink)', background: 'var(--paper)', padding: '14px 22px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Head · zoom</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)' }}>GAP · Dense 16 · Softmax 11 · ~656 MACs · ~16 K params total</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, flex: 1, minHeight: 0 }}>

        {/* GAP */}
        <div style={{ flex: 0.9, border: '1px solid var(--ink)', padding: '12px 14px', background: 'rgba(26,26,26,0.03)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Global Avg Pool</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', marginBottom: 12 }}>15 × 36 → 36</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center', minHeight: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 12px)', gap: 5 }}>
              {Array.from({ length: 36 }, (_, i) => (
                <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--ink)' }} />
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', textAlign: 'center' }}>
              36 channels<br />time-axis collapsed
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', fontSize: 26, padding: '0 8px' }}>→</div>

        {/* Dense 16 */}
        <div style={{ flex: 0.9, border: '1px solid var(--ink)', padding: '12px 14px', background: 'rgba(26,26,26,0.03)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Dense 16</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', marginBottom: 12 }}>36 → 16 · ReLU · dropout p=0.3</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center', minHeight: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 12px)', gap: 5 }}>
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)' }} />
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', textAlign: 'center' }}>
              16 hidden units<br />L2 = 1e-4
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', fontSize: 26, padding: '0 8px' }}>→</div>

        {/* Softmax 11 */}
        <div style={{ flex: 1.6, border: '1px solid var(--ink)', padding: '12px 16px', background: 'rgba(26,26,26,0.03)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Softmax · 11 classes</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', marginBottom: 8 }}>Dense 16 → 11 · L2 = 1e-4</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 14, flex: 1, minHeight: 0, justifyContent: 'center' }}>
            {SOFTMAX_CLASSES.map((c) => (
              <div key={c.label} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 36px', gap: 10, alignItems: 'center' }}>
                <span style={{ color: c.accent ? 'var(--accent)' : 'var(--ink-mute)', fontWeight: c.accent ? 600 : 400 }}>{c.label}</span>
                <div style={{ height: 10, background: c.accent ? 'var(--accent)' : 'var(--ink)', opacity: c.accent ? 1 : 0.22, width: c.w, minWidth: 2 }} />
                <span style={{ color: c.accent ? 'var(--accent)' : 'var(--ink-mute)', textAlign: 'right', fontWeight: c.accent ? 600 : 400 }}>{c.prob}</span>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)', marginTop: 8, fontWeight: 600, textAlign: 'center' }}>argmax → "yes"</div>
        </div>
      </div>
    </div>
  );
}

/* Card-style packet centred inside Input / DS-CNN. */
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
      minWidth: 220,
      padding: '14px 20px',
      background: 'var(--ink)',
      color: '#f4f1ea',
      boxShadow: '0 14px 36px rgba(0,0,0,0.28)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 6,
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>{data?.label || ' '}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em' }}>{data?.shape || ' '}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(244,241,234,0.6)' }}>{data?.detail || ' '}</span>
    </div>
  );
}

function sincPaths(n) {
  return Array.from({ length: n }, (_, i) => {
    const freq = 1 + i * (n === 4 ? 1.4 : 0.6);
    const amp  = (n === 4 ? 14 : 16) - i * (n === 4 ? 0.5 : 0.4);
    let d = '';
    for (let k = 0; k < 65; k++) {
      const x = (k / 64) * 100;
      const env = Math.exp(-Math.pow((k - 32) / 22, 2));
      const y = (n === 4 ? 22 : 24) - Math.sin(k * 0.5 * freq) * env * amp;
      d += (k === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
    }
    return d.trim();
  });
}
