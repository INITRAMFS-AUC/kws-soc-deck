import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import MacShareBar from '../components/MacShareBar.jsx';

/* Slide-11 MFCC box left edge ≈ 396 px inside the 1720 px content area
 *   ( cols: 0.75fr · 40 px · 1.6fr · 40 px · 0.95fr  →  ~398 px )
 * Slide-12 left column left edge ≈ 0 px inside the same area.
 * The morph animates the slide-12 box from 396 px back to 0 px so it reads
 * as the slide-11 MFCC box flying into its slot here. */
const MORPH_DX = 396;

/* Phase timing — slow, smooth, no overshoot. Total ~1.9 s. */
const T_HOLD   = 120;
const T_MOVE   = 820;
const T_FADE   = 320;
const T_POP    = 540;
const T_REST   = 240;

/* Easing — smooth ease-out-quint. No overshoot, no bounce. */
const EASE_MOVE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_POP  = 'cubic-bezier(0.22, 1, 0.36, 1)';

export default function NoMFCC() {
  const rootRef = useRef(null);

  const [phase, setPhase] = useState('done');

  useEffect(() => {
    const timers = [];
    const clearTimers = () => { timers.forEach(clearTimeout); timers.length = 0; };

    const onSlideChange = (e) => {
      const mySection = rootRef.current?.closest('section');
      if (!mySection) return;
      const becameActive = e.detail.slide === mySection;
      const cameFromPrev = e.detail.previousIndex === e.detail.index - 1;

      clearTimers();

      if (becameActive && cameFromPrev) {
        setPhase('hold');
        timers.push(setTimeout(() => setPhase('move'), T_HOLD));
        timers.push(setTimeout(() => setPhase('swap'), T_HOLD + T_MOVE));
        timers.push(setTimeout(() => setPhase('pop'),  T_HOLD + T_MOVE + T_FADE));
        timers.push(setTimeout(() => setPhase('done'), T_HOLD + T_MOVE + T_FADE + T_POP));
      } else if (becameActive) {
        setPhase('done');
      }
    };
    document.addEventListener('slidechange', onSlideChange);

    const mySection = rootRef.current?.closest('section');
    if (mySection?.hasAttribute('data-deck-active')) setPhase('done');

    return () => {
      document.removeEventListener('slidechange', onSlideChange);
      clearTimers();
    };
  }, []);

  const isHolding   = phase === 'hold';
  const isMoving    = phase === 'move';
  const showPipeline = phase === 'hold' || phase === 'move';
  const showSummary  = phase === 'pop'  || phase === 'done';
  const showRest     = phase === 'done';

  const boxTransform = isHolding ? `translateX(${MORPH_DX}px)` : 'translateX(0)';
  const boxTransition = isMoving ? `transform ${T_MOVE}ms ${EASE_MOVE}` : 'none';

  return (
    <SlideFrame topLeft="12 · Model">
      <div ref={rootRef} style={{ marginTop: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Design decision · cost analysis</div>
        <h1 className="title" style={{ fontSize: 48, marginBottom: 8 }}>
          We merge front-end and body — one unified, lower-cost pipeline.
        </h1>
        <p className="subtitle" style={{ fontSize: 30, maxWidth: 1700, marginBottom: 22 }}>
          MFCC is a proven front-end. We skip it — a learnable Conv1D performs the spectral decomposition
          as part of the model itself, cutting total system MACs from ~7 M down to 0.97 M.
        </p>
      </div>

      {/* Two big boxes filling the rest of the slide. No punchline strip. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1, alignItems: 'stretch' }}>

        {/* ── Left: the morphing box ── */}
        <div style={{
          border: '1px solid var(--ink)',
          padding: '22px 28px',
          background: 'rgba(26,26,26,0.04)',
          transform: boxTransform,
          transition: boxTransition,
          willChange: 'transform',
          display: 'grid',
          gridTemplateRows: 'auto auto 1fr',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Standard approach · two stages
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 30, fontWeight: 600, marginBottom: 18 }}>MFCC + DS-CNN</div>

          {/* Both content variants share one cell so they cross-fade in place. */}
          <div style={{ display: 'grid', gridTemplateAreas: '"a"', alignItems: 'stretch' }}>

            {/* Pipeline view (echoes slide 11) — visible during hold + move */}
            <div style={{
              gridArea: 'a',
              opacity: showPipeline ? 1 : 0,
              transition: `opacity ${T_FADE}ms ${EASE_POP}`,
              pointerEvents: showPipeline ? 'auto' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: 18,
              justifyContent: 'center',
            }}>
              {[
                ['Frame · 25 ms / 10 ms hop',     '100 frames'],
                ['FFT 512-pt',                    '~460 K mults'],
                ['Power spectrum |·|²',           '~26 K ops'],
                ['Mel filterbank · 40 bands',     '~1.0 M MACs'],
                ['log compression',               '~4 K ops'],
                ['DCT-II → MFCCs',                '~130 K ops'],
              ].map(([label, cost]) => (
                <div key={label} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 130px',
                  gap: 10,
                  padding: '8px 14px',
                  background: 'rgba(26,26,26,0.05)',
                }}>
                  <span>{label}</span>
                  <span style={{ textAlign: 'right', color: 'var(--ink-mute)' }}>{cost}</span>
                </div>
              ))}
            </div>

            {/* Summary view — fades and scales in after the morph (no bounce). */}
            <div style={{
              gridArea: 'a',
              opacity: showSummary ? 1 : 0,
              transform: showSummary ? 'scale(1)' : 'scale(0.92)',
              transformOrigin: 'center center',
              transition: showSummary
                ? `opacity ${T_POP}ms ${EASE_POP}, transform ${T_POP}ms ${EASE_POP}`
                : 'none',
              pointerEvents: showSummary ? 'auto' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              alignItems: 'stretch',
              justifyContent: 'center',
              padding: '4px 0',
            }}>
              {/* Big total */}
              <div style={{
                textAlign: 'center',
                padding: '28px 16px',
                background: 'var(--paper)',
                border: '1px solid rgba(26,26,26,0.18)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 132,
                  fontWeight: 500,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  color: 'var(--ink)',
                }}>
                  ~7.0 M
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 16,
                  color: 'var(--ink-mute)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  marginTop: 10,
                }}>
                  total system ops
                </div>
              </div>

              {/* Two-column breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ padding: '16px 18px', border: '1px solid rgba(26,26,26,0.18)', background: 'var(--paper)', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 52, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>~1.6 M</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', textTransform: 'uppercase', marginTop: 6 }}>MFCC preproc · CPU</div>
                </div>
                <div style={{ padding: '16px 18px', border: '1px solid rgba(26,26,26,0.18)', background: 'var(--paper)', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 52, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>~5.4 M</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', textTransform: 'uppercase', marginTop: 6 }}>DS-CNN · network</div>
                </div>
              </div>

              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                color: 'var(--ink-mute)',
                textAlign: 'center',
              }}>
                Zhang et al., 2017 · 94.4% on Speech Commands
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: our pipeline. Held back until the morph completes. ── */}
        <div style={{
          border: '2px solid var(--accent)',
          padding: '22px 28px',
          background: '#fff7f2',
          opacity: showRest ? 1 : 0,
          transform: showRest ? 'none' : 'translateY(20px)',
          transition: `opacity 480ms ${EASE_POP}, transform 480ms ${EASE_POP}`,
          display: 'grid',
          gridTemplateRows: 'auto auto auto auto 1fr auto',
          gap: 0,
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>
            ★ Our approach · unified pipeline
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 30, fontWeight: 600, marginBottom: 18 }}>Conv1D → CNN</div>

          {/* Pipeline detail */}
          <div style={{ padding: '14px 18px', border: '2px solid var(--accent)', background: 'rgba(217,119,87,0.08)', marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10 }}>
              One stage · front-end + body
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontFamily: 'var(--font-mono)', fontSize: 18 }}>
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

          {/* Total system MACs */}
          <div style={{ padding: '14px 18px', background: 'var(--ink)', color: '#f4f1ea', marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'rgba(244,241,234,0.6)', textTransform: 'uppercase' }}>Total system MACs</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em' }}>0.97 M</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'rgba(244,241,234,0.7)', marginTop: 4 }}>
              Front-end and body share one datapath — nothing runs outside the model.
            </div>
          </div>

          {/* spacer pushes the share bar to the box's bottom */}
          <div />

          {/* ── Share-of-MACs bar — INSIDE the Our approach box.
                Marked with data-shared-bar so slide 13 can FLIP-morph it
                from this position down to the bottom of slide 13 on advance. ── */}
          <div data-shared-bar="mac-share">
            <MacShareBar focus="balanced" inline label="Share of total MACs · 0.97 M" annotate="next two slides break this down" />
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
