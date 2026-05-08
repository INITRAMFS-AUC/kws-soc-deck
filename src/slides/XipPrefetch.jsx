import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import { getSlide } from '../content.js';

const c = getSlide('xip-prefetch').content;

// ── Access pattern ──────────────────────────────────────────────────────────
// Eight requests in a tight loop. Direct-mapped 4-slot cache with the
// canonical addr&3 mapping:
//   T0, W0 → slot 0   (collide)
//   T1, W1 → slot 1   (collide)
//   W2     → slot 2
//   W3     → slot 3
// Each step represents one request; the snapshot rows record the cache
// state right *after* the request resolves.
const ACCESS = ['T0', 'T1', 'W0', 'W1', 'W2', 'W3', 'T0', 'T1'];
const SLOT_COUNT = 4;

// Colors per cell state.
const COLOR_EMPTY      = 'var(--color-paper)';
const COLOR_VALID_BG   = '#3a7bd5';                   // blue — line is in cache
const COLOR_VALID_FG   = '#ffffff';
const COLOR_PF_BG      = '#f2c94c';                   // yellow — just prefetched
const COLOR_PF_FG      = 'var(--color-ink)';

// Naive: every demand miss provokes a +1 prefetch, dropped into whatever
// slot the next address maps to. Slots get clobbered when a colliding line
// is fetched. Snapshots are state *after* the request.
const NAIVE_STEPS = [
  { req: 'T0', slots: ['T0', 'T1', '—',  '—' ], pf: 1, cap: 'miss + pf' },
  { req: 'T1', slots: ['T0', 'T1', '—',  '—' ],         cap: 'hit (pf won)' },
  { req: 'W0', slots: ['W0', 'W1', '—',  '—' ], pf: 1, cap: 'miss + pf · evicts T0/T1' },
  { req: 'W1', slots: ['W0', 'W1', '—',  '—' ],         cap: 'hit due to pf' },
  { req: 'W2', slots: ['W0', 'W1', 'W2', 'W3'], pf: 3, cap: 'miss + pf' },
  { req: 'W3', slots: ['W0', 'W1', 'W2', 'W3'],         cap: 'hit due to pf' },
  { req: 'T0', slots: ['T0', 'T1', 'W2', 'W3'], pf: 1, cap: 'miss + pf · evicts W0/W1' },
  { req: 'T1', slots: ['T0', 'T1', 'W2', 'W3'],         cap: 'hit due to pf' },
];

// NNoM-aware: only cold misses on T0 / T1. After T1, an APB hint
// (PREFETCH_BASE = W0, LEN = 4) pre-loads W0..W3 into a separate victim
// buffer in the background — the main 4-slot cache is left untouched.
const NNOM_STEPS = [
  { req: 'T0', slots: ['T0', '—', '—', '—'],           victim: null,        cap: 'miss' },
  { req: 'T1', slots: ['T0', 'T1', '—', '—'],          victim: null,        cap: 'miss · APB hint queued' },
  { req: 'W0', slots: ['T0', 'T1', '—', '—'],          victim: 'W0..W3', victimPf: true, cap: 'hit (victim)' },
  { req: 'W1', slots: ['T0', 'T1', '—', '—'],          victim: 'W0..W3', cap: 'hit (victim)' },
  { req: 'W2', slots: ['T0', 'T1', '—', '—'],          victim: 'W0..W3', cap: 'hit (victim)' },
  { req: 'W3', slots: ['T0', 'T1', '—', '—'],          victim: 'W0..W3', cap: 'hit (victim)' },
  { req: 'T0', slots: ['T0', 'T1', '—', '—'],          victim: 'W0..W3', cap: 'hit (main)' },
  { req: 'T1', slots: ['T0', 'T1', '—', '—'],          victim: 'W0..W3', cap: 'hit (main)' },
];

const SLOT_BOX = { w: 110, h: 84 };

// ── Cache slot: white empty / blue valid / yellow just-prefetched ──────────
function Slot({ idx, label, isPf }) {
  const empty = label === '—' || !label;
  const bg = empty ? COLOR_EMPTY : isPf ? COLOR_PF_BG : COLOR_VALID_BG;
  const fg = empty ? 'var(--color-ink-mute)' : isPf ? COLOR_PF_FG : COLOR_VALID_FG;
  return (
    <div style={{
      width: SLOT_BOX.w, height: SLOT_BOX.h,
      border: `1px solid ${empty ? 'var(--line-hairline)' : 'transparent'}`,
      background: bg, color: fg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)',
      transition: 'background 320ms ease, color 320ms ease, border-color 320ms ease',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 6, left: 8,
        fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: empty ? 'var(--color-ink-mute)' : 'rgba(255,255,255,0.7)',
      }}>slot {idx}</div>
      <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>{empty ? '—' : label}</div>
      {isPf && !empty && (
        <div style={{
          position: 'absolute', bottom: 4, right: 6,
          fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: COLOR_PF_FG, fontWeight: 700,
        }}>pf</div>
      )}
    </div>
  );
}

// ── Access-pattern bar (the "x axis"): 8 cells with the current request lit ─
function AccessAxis({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--color-ink-mute)', minWidth: 80,
      }}>request →</div>
      {ACCESS.map((r, i) => {
        const active = i === step;
        const past = i < step;
        return (
          <div key={i} style={{
            width: 56, height: 36,
            border: `1px solid ${active ? 'var(--color-accent)' : 'var(--line-hairline)'}`,
            background: active ? 'var(--color-accent)'
                       : past ? 'var(--color-bg-deep)' : 'var(--color-paper)',
            color: active ? '#fff' : past ? 'var(--color-ink-mute)' : 'var(--color-ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600,
            transition: 'background 240ms ease, color 240ms ease, border-color 240ms ease',
          }}>{r}</div>
        );
      })}
    </div>
  );
}

// ── One cache lane (Naive or NNoM) ─────────────────────────────────────────
// `step` is the lane-local 0..7 step, or null when the lane is waiting its
// turn (initial empty state). `running` controls the highlighting.
function Lane({ kind, step, running }) {
  const isNnom = kind === 'nnom';
  const STEPS = isNnom ? NNOM_STEPS : NAIVE_STEPS;
  const idle = step == null;
  const cur = idle
    // Idle lane: all slots empty, no active request, neutral caption.
    ? { req: null, slots: ['—', '—', '—', '—'], victim: null, cap: isNnom ? 'waiting…' : 'waiting…' }
    : STEPS[Math.min(step, STEPS.length - 1)];

  // Victim buffer width spans the four slots so it reads as one wide line.
  const fourWide = SLOT_BOX.w * 4 + 12 * 3;

  // Show the APB hint badge on the NNoM lane during the step where the
  // victim buffer first fills (step 2 / step index 2).
  const showApbHint = isNnom && step === 2;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 18,
      opacity: idle && !running ? 0.42 : 1,
      transition: 'opacity 400ms ease',
    }}>
      {/* Lane title */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 13,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          color: isNnom ? 'var(--color-accent)' : 'var(--color-ink-mute)',
        }}>{isNnom ? '02 · NNoM-aware Prefetch' : '01 · Naive Prefetch'}</div>
        <div style={{
          fontSize: 14, color: 'var(--color-ink-mute)',
        }}>direct-mapped · 4 slots{isNnom ? ' + victim buffer' : ''}</div>
        {running && (
          <div style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-mono)', fontSize: 11,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              width: 8, height: 8, background: 'var(--color-accent)',
              borderRadius: '50%',
              animation: 'xip-status-blink 700ms steps(2, end) infinite',
            }} />
            running
          </div>
        )}
      </div>

      {/* Access pattern axis */}
      <AccessAxis step={idle ? -1 : step} />

      {/* Cache slot row */}
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--color-ink-mute)', marginBottom: 6,
        }}>main cache · addr & 0x3 → slot</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {Array.from({ length: SLOT_COUNT }).map((_, i) => (
            <Slot key={i} idx={i}
                  label={cur.slots[i]}
                  isPf={cur.pf === i} />
          ))}
        </div>
      </div>

      {/* Victim buffer — NNoM only */}
      {isNnom && (
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--color-accent)', marginBottom: 6,
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          }}>
            <span>victim buffer · isolated · 4 lines</span>
            {showApbHint && (
              <span style={{
                background: 'var(--color-accent)', color: '#fff',
                padding: '3px 8px', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.12em',
                animation: 'xip-badge-in 1100ms ease forwards',
              }}>APB hint · PREFETCH_BASE=W0 · LEN=4</span>
            )}
          </div>
          <div style={{
            width: fourWide, height: SLOT_BOX.h,
            border: `1px ${cur.victim ? 'solid' : 'dashed'} ${cur.victim ? 'transparent' : 'var(--color-accent)'}`,
            background: cur.victim
              ? (cur.victimPf ? COLOR_PF_BG : COLOR_VALID_BG)
              : 'var(--color-paper)',
            color: cur.victim
              ? (cur.victimPf ? COLOR_PF_FG : COLOR_VALID_FG)
              : 'var(--color-ink-mute)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600,
            transition: 'background 320ms ease, color 320ms ease, border-color 320ms ease',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 6, left: 10,
              fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: cur.victim ? 'rgba(255,255,255,0.75)' : 'var(--color-ink-mute)',
            }}>victim</div>
            <span>{cur.victim ?? '— empty'}</span>
          </div>
        </div>
      )}

      {/* Caption — what just happened */}
      <div style={{
        height: 60,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        background: 'var(--color-paper)',
        border: '1px solid var(--line-hairline)',
        borderLeft: `3px solid ${
          idle ? 'var(--color-ink-mute)'
          : cur.cap.startsWith('hit') ? '#3a7bd5'
          : cur.cap.startsWith('miss') ? 'var(--color-ink)'
          : 'var(--color-accent)'
        }`,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--color-ink-mute)',
        }}>{idle ? '— / 8' : `step ${step + 1} / 8 · req ${cur.req}`}</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600,
          color: 'var(--color-ink)',
        }}>{cur.cap}</span>
      </div>
    </div>
  );
}

// ── Tally ────────────────────────────────────────────────────────────────
function Tally({ kind }) {
  const isNnom = kind === 'nnom';
  return (
    <div style={{
      marginTop: 14,
      background: isNnom ? 'var(--color-ink)' : 'color-mix(in oklch, #c0392b 10%, var(--color-paper))',
      color: isNnom ? 'var(--color-cream)' : 'var(--color-ink)',
      border: isNnom ? 'none' : '2px solid #c0392b',
      padding: '14px 18px',
      display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: isNnom ? 'var(--color-accent)' : '#c0392b',
      }}>Total</div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600,
        color: isNnom ? 'var(--color-accent)' : '#c0392b',
      }}>{isNnom ? '2 demand misses' : '4 demand misses'}</div>
      <div style={{
        fontSize: 13, opacity: isNnom ? 0.78 : 0.85, lineHeight: 1.35,
        flex: '1 1 220px',
      }}>
        {isNnom
          ? '+ 1 background prefetch (4 lines into victim) · main cache untouched'
          : '4 useless prefetches · cascade evictions on each W ↔ T swap'}
      </div>
    </div>
  );
}

// Total playback: 8 steps for naive (0..7), then 8 steps for NNoM (8..15).
// While naive plays, NNoM sits idle. Once naive finishes, NNoM kicks off and
// naive freezes at its final state for the rest of the slide.
const NAIVE_LEN = 8;
const NNOM_LEN  = 8;
const TOTAL     = NAIVE_LEN + NNOM_LEN; // 16
const FINAL     = TOTAL - 1;            // 15

export default function XipPrefetch() {
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(false);
  const rootRef = useRef(null);

  // Lane-local step indexes derived from the master step.
  const naiveStep = step < NAIVE_LEN ? step : NAIVE_LEN - 1;
  const nnomStep  = step < NAIVE_LEN ? null : step - NAIVE_LEN;
  const naiveRunning = step < NAIVE_LEN;
  const nnomRunning  = step >= NAIVE_LEN && step < TOTAL;

  // Track slide-active state.
  useEffect(() => {
    const here = rootRef.current?.closest('section');
    if (here?.hasAttribute('data-deck-active')) setActive(true);
    const onSlideChange = (e) => {
      const here = rootRef.current?.closest('section');
      if (!here) return;
      const isActive = e.detail?.slide === here;
      setActive(isActive);
      if (isActive) setStep(0);
    };
    document.addEventListener('slidechange', onSlideChange);
    return () => document.removeEventListener('slidechange', onSlideChange);
  }, []);

  // Auto-advance. A longer pause sits between the two lanes so the audience
  // can register that naive finished before NNoM starts.
  useEffect(() => {
    if (!active) return;
    if (step >= FINAL) return;
    // Step from NAIVE_LEN - 1 (final naive) → NAIVE_LEN (first NNoM) gets a
    // longer hold so the comparison reads cleanly.
    const isHandover = step === NAIVE_LEN - 1;
    const delay = isHandover ? 2500 : 1500;
    const id = setTimeout(() => setStep((s) => Math.min(s + 1, FINAL)), delay);
    return () => clearTimeout(id);
  }, [active, step]);

  // Right/left arrow scrubs through the master step.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const section = rootRef.current?.closest('section');
      if (!section?.hasAttribute('data-deck-active')) return;
      const fwd  = e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Spacebar';
      const back = e.key === 'ArrowLeft'  || e.key === 'PageUp';
      if (fwd && step < FINAL) {
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
      <div ref={rootRef} style={{
        display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0,
      }}>
        <div style={{ marginTop: 30, marginBottom: 28 }}>
          <div className="eyebrow">{c.eyebrow}</div>
          <h1 className="title" style={{ marginBottom: 0, fontSize: 48 }}>{c.title}</h1>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 56, flex: 1, minHeight: 0,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Lane kind="naive" step={naiveStep} running={naiveRunning} />
            <Tally kind="naive" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Lane kind="nnom" step={nnomStep} running={nnomRunning} />
            <Tally kind="nnom" />
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
