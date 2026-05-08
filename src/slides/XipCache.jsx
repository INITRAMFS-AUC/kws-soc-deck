import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import { getSlide } from '../content.js';

const c = getSlide('xip-cache').content;

const EASE = 'cubic-bezier(.4,0,.2,1)';
const DUR = 480;


// ── Step 1: Critical-Word-First timeline ─────────────────────────────────────
const MS_PER_CYCLE = 28; // animation playback rate — visible but not slow

const ROW_HEIGHT = 110;       // matched height for both fetch rows
const NAIVE_INK = 'var(--color-ink-mute)';

function FetchRow({ animKey, kind, label, sub, releaseAt, timeline }) {
  const requestedT = timeline.find((c) => c.requested)?.t;
  const accentColor = kind === 'cwf' ? 'var(--color-accent)' : 'var(--color-ink)';
  const tintBg = kind === 'cwf'
    ? 'color-mix(in oklch, var(--color-accent) 8%, var(--color-paper))'
    : 'color-mix(in oklch, var(--color-ink) 4%, var(--color-paper))';
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '180px 1fr 240px',
      gap: 22, alignItems: 'stretch', minHeight: ROW_HEIGHT,
    }}>
      {/* Row label */}
      <div style={{
        border: `2px solid ${accentColor}`,
        background: tintBg,
        padding: '14px 18px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6,
        minHeight: ROW_HEIGHT, boxSizing: 'border-box',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 12,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: accentColor, fontWeight: 'var(--fw-medium)',
        }}>{label}</div>
        <div style={{
          fontSize: 13, color: 'var(--color-ink-soft)', lineHeight: 1.35,
        }}>{sub}</div>
      </div>

      {/* 8 cells */}
      <div key={animKey} style={{
        display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
        gap: 6, position: 'relative', minHeight: ROW_HEIGHT,
      }}>
        {timeline.map((cell) => {
          const isReq = cell.requested;
          const afterRelease = kind === 'cwf' && cell.t > releaseAt;
          // Foreground (CPU-visible) cells use solid colors; background-fetched
          // cells (CWF after release) use a hatched/lighter look to read as
          // "fill continues out of band".
          const fill = isReq && kind === 'cwf' ? 'var(--color-accent)'
                     : kind === 'naive' ? 'var(--color-ink)'
                     : afterRelease ? 'var(--color-bg-deep)'
                     : 'var(--color-ink)';
          const labelColor = isReq && kind === 'cwf' ? '#fff'
                           : kind === 'naive' ? 'var(--color-cream)'
                           : afterRelease ? 'var(--color-ink)'
                           : 'var(--color-cream)';
          return (
            <div key={cell.w} style={{
              position: 'relative',
              border: '1px solid var(--line-hairline)',
              background: 'var(--color-paper)',
              padding: '12px 6px', textAlign: 'center',
              overflow: 'hidden', minHeight: ROW_HEIGHT,
            }}>
              {/* Background fill bar */}
              <div style={{
                position: 'absolute', inset: 0,
                background: fill, opacity: 0,
                animation: `xip-cell-fill 220ms ${EASE} ${cell.t * MS_PER_CYCLE}ms forwards`,
              }} />
              {/* Pre-fill label (dark on paper) */}
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 2, pointerEvents: 'none', color: 'var(--color-ink)',
                animation: `xip-cell-label-out 180ms ${EASE} ${cell.t * MS_PER_CYCLE + 120}ms forwards`,
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600 }}>{cell.w}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-mute)' }}>t = {cell.t}</span>
              </div>
              {/* Post-fill label (contrast color on filled bg) */}
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 2, pointerEvents: 'none', color: labelColor, opacity: 0,
                animation: `xip-cell-label-in 220ms ${EASE} ${cell.t * MS_PER_CYCLE + 120}ms forwards`,
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600 }}>{cell.w}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, opacity: 0.85 }}>t = {cell.t}</span>
              </div>
            </div>
          );
        })}
        {/* Vertical release marker — drops down at the release cycle. */}
        <div key={`marker-${animKey}`} style={{
          position: 'absolute',
          left: `calc(${(releaseAt / 84) * 100}% )`,
          top: -6, bottom: -6, width: 2,
          background: 'var(--color-accent)',
          opacity: 0,
          animation: `xip-marker-drop 420ms ${EASE} ${releaseAt * MS_PER_CYCLE}ms forwards`,
        }}>
          <div style={{
            position: 'absolute', top: -22, left: -42, width: 86,
            textAlign: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 11,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-accent)', whiteSpace: 'nowrap',
          }}>release · t = {releaseAt}</div>
        </div>
      </div>

      {/* Status pill — STALLED → RELEASED */}
      <div key={`pill-${animKey}`} style={{
        position: 'relative',
        background: 'var(--color-paper)',
        border: '1px solid var(--line-hairline)',
        padding: '14px 18px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        gap: 6, overflow: 'hidden',
        minHeight: ROW_HEIGHT, boxSizing: 'border-box',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--color-ink-mute)',
        }}>CPU bus</div>
        <div style={{ position: 'relative', height: 30 }}>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--color-ink)', fontWeight: 600, fontSize: 18,
            fontFamily: 'var(--font-mono)',
            animation: `xip-status-out 240ms ${EASE} ${releaseAt * MS_PER_CYCLE}ms forwards`,
          }}>
            <span style={{ width: 10, height: 10, background: NAIVE_INK, borderRadius: 2,
                           animation: 'xip-status-blink 700ms steps(2, end) infinite' }} />
            STALLED
          </div>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--color-accent)', fontWeight: 600, fontSize: 18,
            fontFamily: 'var(--font-mono)', opacity: 0,
            animation: `xip-status-in 280ms ${EASE} ${releaseAt * MS_PER_CYCLE}ms forwards`,
          }}>
            <span style={{ width: 10, height: 10, background: 'var(--color-accent)', borderRadius: 2 }} />
            RELEASED
          </div>
        </div>
        <div style={{
          fontSize: 12, color: 'var(--color-ink-soft)',
          fontFamily: 'var(--font-mono)',
        }}>
          released at <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>t = {releaseAt}</span>
          {kind === 'cwf' && requestedT != null && (
            <span style={{ color: 'var(--color-ink-mute)' }}> · then background fill</span>
          )}
        </div>
      </div>
    </div>
  );
}

function CwfTimeline({ visible }) {
  // The animation runs each time `visible` flips true — the timeline
  // re-keys on visibility so the CSS animations restart.
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => { if (visible) setAnimKey((k) => k + 1); }, [visible]);

  const requestedT = c.timeline.find((cell) => cell.requested)?.t ?? 32;
  const lastT = c.timeline[c.timeline.length - 1]?.t ?? 84;

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(8px)',
      transition: `opacity ${DUR}ms ${EASE}, transform ${DUR}ms ${EASE}`,
      pointerEvents: visible ? 'auto' : 'none',
      display: 'flex', flexDirection: 'column', gap: 28, height: '100%',
    }}>
      {/* Heading row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap' }}>
        <div style={{
          fontSize: 32, fontWeight: 600, letterSpacing: '-0.01em',
          color: 'var(--color-ink)',
        }}>{c.cwfHeading}</div>
        <div style={{ fontSize: 18, color: 'var(--color-ink-soft)' }}>{c.cwfSub}</div>
      </div>

      {/* Two animated fetch rows: naive then CWF. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        <FetchRow
          animKey={animKey}
          kind="naive"
          label="Naive cache"
          sub="bus stalls until the whole 8-word line lands."
          releaseAt={lastT}
          timeline={c.timeline}
        />
        <FetchRow
          animKey={animKey}
          kind="cwf"
          label="CWF cache"
          sub="bus released the moment the requested word lands; rest of the line fills in the background."
          releaseAt={requestedT}
          timeline={c.timeline}
        />
      </div>

      {/* Result strip — measured numbers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 18,
      }}>
        {c.results.map((r) => (
          <div key={r.l} style={{
            background: 'var(--color-ink)', color: 'var(--color-cream)',
            padding: '14px 22px',
            display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--color-accent)',
            }}>Measured</div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 600,
              letterSpacing: '-0.02em', color: 'var(--color-accent)',
            }}>{r.v}</div>
            <div style={{
              fontSize: 13, color: 'rgba(244,241,234,0.72)',
              flex: '1 1 240px', minWidth: 0, lineHeight: 1.35,
            }}>{r.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function XipCache() {
  // Drive the timeline's animation off the slide's active state — flipping
  // visible from false→true re-keys CwfTimeline so the cell-fill keyframes
  // restart each time we enter the slide.
  const [active, setActive] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const here = rootRef.current?.closest('section');
    if (here?.hasAttribute('data-deck-active')) setActive(true);

    const onSlideChange = (e) => {
      const here = rootRef.current?.closest('section');
      if (!here) return;
      setActive(e.detail?.slide === here);
    };
    document.addEventListener('slidechange', onSlideChange);
    return () => document.removeEventListener('slidechange', onSlideChange);
  }, []);

  return (
    <SlideFrame>
      <div ref={rootRef} style={{
        display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0,
      }}>
        <div style={{ marginTop: 30 }}>
          <div className="eyebrow">{c.eyebrow}</div>
          <h1 className="title" style={{ marginBottom: 28 }}>{c.title}</h1>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <CwfTimeline visible={active} />
        </div>
      </div>
    </SlideFrame>
  );
}
