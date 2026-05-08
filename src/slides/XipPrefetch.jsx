import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import { getSlide } from '../content.js';

const c = getSlide('xip-prefetch').content;

const EASE = 'cubic-bezier(.4,0,.2,1)';

// ── Address space — fixed line addresses so memory rows and cache rows
// share the same visual format (addr · label) and the user can see a
// specific line travel from one side to the other.
const ADDR = {
  'code A':       '0x8000_0000',
  'code A+1':     '0x8000_0020',
  'code A+2':     '0x8000_0040',
  'weights W':    '0x8000_4000',
  'weights W+1':  '0x8000_4020',
  'weights W+2':  '0x8000_4040',
  'weights W+3':  '0x8000_4060',
};
const lineKey = (region, line) => `${region === 'code' ? 'code' : 'weights'} ${line}`;

// Each event has a `kind` that decides what the slot badge says (MISS,
// PREFETCH) and whether the slot is being evicted on landing.
//
// Naive: every demand miss provokes a prefetch of line + 1. The prefetch
// lands in whatever slot the address maps to — so it can evict a hot line.
//   t=0    DEMAND code A           → MISS at slot 0
//   t=1100 PREFETCH (auto) code A+1 → MISS at slot 1
//   t=2400 DEMAND weights W        → MISS at slot 1 (evicts A+1)
//   t=3500 PREFETCH (auto) weights W+1 → MISS at slot 2 (evicts hot line)
const NAIVE_TIMELINE = [
  { at:    0, kind: 'demand',    target: 'cache0', region: 'code',    line: 'A'   },
  { at: 1100, kind: 'prefetch',  target: 'cache1', region: 'code',    line: 'A+1' },
  { at: 2400, kind: 'evict',     target: 'cache1', region: 'weights', line: 'W'   },
  { at: 3500, kind: 'evict-pf',  target: 'cache2', region: 'weights', line: 'W+1' },
];

// NNoM-aware: weight access lands in main cache; the accelerator's own
// side-band then pulls the next weight line into a dedicated prefetch slot.
// No main-cache slot is ever evicted by a prefetch.
//   t=0    DEMAND weights W        → MISS at slot 2 (main cache)
//   t=1500 PREFETCH weights W+1    → MISS at prefetch slot (no eviction)
const NNOM_TIMELINE = [
  { at:    0, kind: 'demand',    target: 'cache2', region: 'weights', line: 'W'   },
  { at: 1500, kind: 'prefetch',  target: 'pf',     region: 'weights', line: 'W+1' },
];

// ── Memory line — used in both the cache and the flash columns so the
// two read as different views of the same data structure.
function MemLine({ addr, label, accent, dashed, dimmed, evicted, tag }) {
  return (
    <div style={{
      position: 'relative',
      border: `1px ${dashed ? 'dashed' : 'solid'} ${accent ? 'var(--color-accent)' : 'var(--line-hairline)'}`,
      background: accent
        ? 'color-mix(in oklch, var(--color-accent) 8%, var(--color-paper))'
        : 'var(--color-paper)',
      padding: '10px 14px', height: '100%',
      display: 'flex', alignItems: 'center', gap: 14,
      opacity: dimmed ? 0.45 : 1,
      transition: 'opacity 240ms, border-color 240ms, background 240ms',
      overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--color-ink-mute)', letterSpacing: '0.06em',
        minWidth: 110,
      }}>{addr}</div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 15,
        color: label ? 'var(--color-ink)' : 'var(--color-ink-mute)',
        fontStyle: label ? 'normal' : 'italic',
        opacity: label ? 1 : 0.6,
        flex: 1,
      }}>{label || '—'}</div>
      {tag && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          background: 'var(--color-accent)', color: '#fff',
          padding: '2px 6px',
        }}>{tag}</div>
      )}
      {evicted != null && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(192,57,43,0.22)',
          opacity: 0,
          animation: `xip-evict-flash 380ms ${EASE} ${evicted}ms`,
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
}

// Layout constants — keep cache and gutter row-aligned.
const COL_GAP        = 10;
const HEADER_HEIGHT  = 22;     // approx mono 12px + line-height
const SLOT_HEIGHT    = 46;     // matches MemLine padding + min-height
const PF_HEADER_HT   = 32;     // header + small margin to PF slot

function MemoryModel({ mode, animKey }) {
  const isNnom = mode === 'nnom';
  const events = isNnom ? NNOM_TIMELINE : NAIVE_TIMELINE;

  // Resolve final cache contents at end of sequence.
  const slotState = { cache0: null, cache1: null, cache2: null, cache3: null, pf: null };
  const slotEvictedAt = { cache0: null, cache1: null, cache2: null, cache3: null };
  events.forEach((e) => {
    if (!e.target) return;
    if (e.kind === 'evict' || e.kind === 'evict-pf') slotEvictedAt[e.target] = e.at;
    const isPf = e.kind === 'prefetch' || e.kind === 'evict-pf';
    slotState[e.target] = { region: e.region, line: e.line, at: e.at, prefetched: isPf };
  });

  const slots = ['cache0', 'cache1', 'cache2', 'cache3'];
  const eventForSlot = (slot) => events.find((e) => e.target === slot);

  // A row in the cache column — fixed height so the gutter rows align.
  const cacheRow = (slot) => {
    const s = slotState[slot];
    const label = s ? lineKey(s.region, s.line) : null;
    return (
      <div key={`${animKey}-${slot}`} style={{
        height: SLOT_HEIGHT, position: 'relative',
        opacity: s ? 0 : 1,
        animation: s ? `xip-fade-in 260ms ${EASE} ${s.at + 600}ms forwards` : 'none',
      }}>
        {s ? (
          <MemLine
            addr={ADDR[label]}
            label={label}
            accent={s.prefetched}
            dashed={s.prefetched}
            evicted={slotEvictedAt[slot]}
            tag={s.prefetched ? 'PF' : null}
          />
        ) : (
          <MemLine addr="—" label={null} />
        )}
      </div>
    );
  };

  // A gutter row matching a cache row — hosts the badge + fly block aimed
  // at that exact slot. Empty rows render a spacer so vertical alignment
  // stays exact.
  const gutterRow = (slot) => {
    const e = eventForSlot(slot);
    return (
      <div key={`${animKey}-g-${slot}`} style={{
        height: SLOT_HEIGHT, position: 'relative', overflow: 'visible',
      }}>
        {e && <GutterEvent event={e} />}
      </div>
    );
  };

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 90px 1fr',
      gap: 16, alignItems: 'stretch', height: '100%',
    }}>
      {/* CACHE — left column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: COL_GAP, minHeight: 0 }}>
        <div style={{
          height: HEADER_HEIGHT,
          fontFamily: 'var(--font-mono)', fontSize: 12,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--color-ink-mute)',
        }}>Cache · 4 slots · direct-map</div>

        {slots.map(cacheRow)}

        {/* Prefetch slot — only present in NNoM mode */}
        {isNnom && (
          <>
            <div style={{
              height: PF_HEADER_HT, marginTop: 4,
              fontFamily: 'var(--font-mono)', fontSize: 12,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--color-accent)',
              display: 'flex', alignItems: 'flex-end',
            }}>Prefetch slot · NNoM-only · isolated</div>
            <div key={`${animKey}-pf-row`} style={{
              height: SLOT_HEIGHT, position: 'relative',
              opacity: slotState.pf ? 0 : 1,
              animation: slotState.pf ? `xip-fade-in 260ms ${EASE} ${slotState.pf.at + 600}ms forwards` : 'none',
            }}>
              <MemLine
                addr={slotState.pf ? ADDR[lineKey(slotState.pf.region, slotState.pf.line)] : '—'}
                label={slotState.pf ? lineKey(slotState.pf.region, slotState.pf.line) : null}
                accent dashed
                tag="PF"
              />
            </div>
          </>
        )}
      </div>

      {/* GUTTER — same row structure as cache, so each event row aligns
          horizontally with its target cache slot. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: COL_GAP, minHeight: 0 }}>
        <div style={{ height: HEADER_HEIGHT }} aria-hidden />
        {slots.map(gutterRow)}
        {isNnom && (
          <>
            <div style={{ height: PF_HEADER_HT, marginTop: 4 }} aria-hidden />
            <div key={`${animKey}-g-pf`} style={{
              height: SLOT_HEIGHT, position: 'relative', overflow: 'visible',
            }}>
              {eventForSlot('pf') && <GutterEvent event={eventForSlot('pf')} />}
            </div>
          </>
        )}
      </div>

      {/* FLASH — right column. Same MemLine style so cache and memory read
          as the same data structure. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: COL_GAP, minHeight: 0 }}>
        <div style={{
          height: HEADER_HEIGHT,
          fontFamily: 'var(--font-mono)', fontSize: 12,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--color-ink-mute)',
        }}>QSPI flash · 0x8000_0000</div>

        <MemLine addr={ADDR['code A']}      label="code A" />
        <MemLine addr={ADDR['code A+1']}    label="code A+1" />
        <MemLine addr={ADDR['code A+2']}    label="code A+2" dimmed />

        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--color-accent)', marginTop: 6,
        }}>weights[] · sequential</div>

        <MemLine addr={ADDR['weights W']}   label="weights W"   accent />
        <MemLine addr={ADDR['weights W+1']} label="weights W+1" accent />
        <MemLine addr={ADDR['weights W+2']} label="weights W+2" accent dimmed />
      </div>
    </div>
  );
}

// One gutter event — phase badge above the slot row, fly block from right
// → left across the same row. Both sit inside a row container that already
// has the right vertical position.
function GutterEvent({ event }) {
  const isPrefetch = event.kind === 'prefetch' || event.kind === 'evict-pf';
  const isEvict    = event.kind === 'evict' || event.kind === 'evict-pf';
  return (
    <>
      <PhaseBadge isPrefetch={isPrefetch} isEvict={isEvict} delay={event.at} />
      <FlyBlock accent={isPrefetch}
                delay={event.at + 350}
                label={lineKey(event.region, event.line)}
                kind={event.kind} />
    </>
  );
}

// Block of "data" that flies from the right (flash side) to the left (cache
// side). Wrapper positions us at the target row; we just animate horizontally.
function FlyBlock({ accent, delay, label, kind }) {
  const isPrefetch = kind === 'prefetch' || kind === 'evict-pf';
  const color = accent ? 'var(--color-accent)' : 'var(--color-ink)';
  return (
    <>
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0,
        height: 0, borderTop: `1px ${isPrefetch ? 'dashed' : 'solid'} ${color}`,
        opacity: 0,
        animation: `xip-fade-in 200ms ${EASE} ${delay}ms forwards`,
      }} />
      <div style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        right: 0,
        background: color, color: '#fff',
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
        padding: '4px 8px', whiteSpace: 'nowrap',
        opacity: 0,
        animation: `xip-fly 720ms ${EASE} ${delay}ms forwards`,
      }}>{label}</div>
    </>
  );
}

// Phase badge — labels the cache-side event (MISS or PREFETCH) above the
// arrow path. Eviction events get a red wash to read distinctly from a
// cold miss.
function PhaseBadge({ isPrefetch, isEvict, delay }) {
  const label = isPrefetch ? 'PREFETCH' : 'MISS';
  const bg = isPrefetch
    ? 'var(--color-accent)'
    : isEvict ? '#c0392b' : 'var(--color-ink)';
  return (
    <div style={{
      position: 'absolute', top: '50%', left: 0,
      transform: 'translateY(-50%) translateY(-22px)',
      display: 'flex', alignItems: 'center', gap: 6,
      pointerEvents: 'none',
      opacity: 0,
      animation: `xip-badge-in 360ms ${EASE} ${delay}ms forwards`,
    }}>
      <div style={{
        background: bg, color: '#fff',
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        padding: '3px 7px',
      }}>{label}</div>
    </div>
  );
}

// ── Left side: prominent step header + one-liner + result ──────────────────
function StepCopy({ step, animKey }) {
  const naive = {
    n: '01',
    head: 'Naive Prefetch',
    line: 'On every miss, also fetch line + 1 — every prefetch evicts whatever was in its slot.',
    badge: { v: '+9 % @ NL=256 · +46 % @ NL=64', l: 'reverted · eviction cascade' },
    badgeKind: 'bad',
  };
  const nnom = {
    n: '02',
    head: 'NNoM-aware Prefetch',
    line: "The accelerator already knows each Conv1D weight scan's base + length — pull next line into a dedicated slot.",
    badge: { v: '−1.29 %', l: 'CYCLES_INFER · adopted' },
    badgeKind: 'good',
  };
  const cur = step === 0 ? naive : nnom;

  return (
    <div key={`${animKey}-copy`} style={{
      display: 'flex', flexDirection: 'column', gap: 28,
      maxWidth: 700, height: '100%',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 18,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color: cur.badgeKind === 'good' ? 'var(--color-accent)' : 'var(--color-ink-mute)',
      }}>{cur.n} · Prefetch</div>

      <h2 style={{
        margin: 0, fontSize: 84, fontWeight: 700,
        letterSpacing: '-0.025em', lineHeight: 0.98,
        color: 'var(--color-ink)',
      }}>{cur.head}<span style={{ color: 'var(--color-accent)' }}>.</span></h2>

      <p className="body" style={{ fontSize: 26, lineHeight: 1.4, maxWidth: 680 }}>
        {cur.line}
      </p>

      <div style={{
        marginTop: 'auto',
        background: cur.badgeKind === 'good' ? 'var(--color-ink)' : 'color-mix(in oklch, #c0392b 12%, var(--color-paper))',
        color: cur.badgeKind === 'good' ? 'var(--color-cream)' : 'var(--color-ink)',
        border: cur.badgeKind === 'good' ? 'none' : '2px solid #c0392b',
        padding: '18px 24px',
        display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 12,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: cur.badgeKind === 'good' ? 'var(--color-accent)' : '#c0392b',
        }}>Measured</div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 600,
          color: cur.badgeKind === 'good' ? 'var(--color-accent)' : '#c0392b',
        }}>{cur.badge.v}</div>
        <div style={{
          fontSize: 14, opacity: cur.badgeKind === 'good' ? 0.78 : 0.85, lineHeight: 1.35,
          flex: '1 1 240px',
        }}>{cur.badge.l}</div>
      </div>
    </div>
  );
}

export default function XipPrefetch() {
  const [step, setStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const rootRef = useRef(null);

  useEffect(() => { setAnimKey((k) => k + 1); }, [step]);

  useEffect(() => {
    const onSlideChange = (e) => {
      const here = rootRef.current?.closest('section');
      if (!here) return;
      if (e.detail?.slide === here) {
        setStep(0);
        setAnimKey((k) => k + 1);
      }
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

  return (
    <SlideFrame>
      <div ref={rootRef} style={{
        display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0,
      }}>
        <div style={{ marginTop: 30, marginBottom: 30 }}>
          <div className="eyebrow">{c.eyebrow}</div>
          <h1 className="title" style={{ marginBottom: 0, fontSize: 48 }}>{c.title}</h1>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1.2fr',
          gap: 56, flex: 1, minHeight: 0,
        }}>
          <StepCopy step={step} animKey={animKey} />
          <MemoryModel mode={step === 0 ? 'naive' : 'nnom'} animKey={animKey} />
        </div>
      </div>
    </SlideFrame>
  );
}
