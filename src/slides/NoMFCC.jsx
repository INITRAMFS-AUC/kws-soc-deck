import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import MacShareBar from '../components/MacShareBar.jsx';

/* Slide-11 MFCC box left edge ≈ 396 px inside the 1720 px content area
 *   ( cols: 0.7fr · 36 px · 1.6fr · 36 px · 0.9fr  →  396.5 px )
 * Slide-12 left column left edge ≈ 0 px inside the same area.
 * The morph animates the slide-12 box from 396 px back to 0 px so it reads
 * as the slide-11 MFCC box flying into its slot here. */
const MORPH_DX = 396;

/* Phase timing — the whole sequence runs in ~1100 ms, well under the
 *  ~5 s of the previous typewriter. */
const T_HOLD   = 60;    // hold at slide-11 position so cross-fade settles
const T_MOVE   = 460;   // box slides left
const T_FADE   = 220;   // slide-11 content fades out
const T_POP    = 360;   // big summary numbers spring in
const T_REST   = 200;   // right column + punchline strip stagger

export default function NoMFCC() {
  const rootRef = useRef(null);

  /* Phases:
   *   'hold'   — box pinned at slide-11 coords, slide-11 content visible
   *   'move'   — box translates to slide-12 coords (slide-11 content still in)
   *   'swap'   — slide-11 content fades out, summary numbers prepare to pop
   *   'pop'    — big summary numbers spring in; right column + punchline rise
   *   'done'   — final resting state
   */
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

    // First-mount deep-link case — if we're already active, skip morph.
    const mySection = rootRef.current?.closest('section');
    if (mySection?.hasAttribute('data-deck-active')) setPhase('done');

    return () => {
      document.removeEventListener('slidechange', onSlideChange);
      clearTimers();
    };
  }, []);

  /* Box transform: pinned right when 'hold', sliding when 'move', settled after. */
  const isHolding   = phase === 'hold';
  const isMoving    = phase === 'move';
  const showPipeline = phase === 'hold' || phase === 'move';
  const showSummary  = phase === 'pop'  || phase === 'done';
  const showRest     = phase === 'done';

  const boxTransform = isHolding ? `translateX(${MORPH_DX}px)` : 'translateX(0)';
  const boxTransition = isMoving
    ? `transform ${T_MOVE}ms cubic-bezier(0.4, 0, 0.2, 1)`
    : 'none';

  return (
    <SlideFrame topLeft="12 · Model">
      <div ref={rootRef} style={{ marginTop: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Design decision · cost analysis</div>
        <h1 className="title" style={{ fontSize: 48, marginBottom: 8 }}>
          We merge front-end and body — one unified, lower-cost pipeline.
        </h1>
        <p className="subtitle" style={{ fontSize: 32, maxWidth: 1700, marginBottom: 16 }}>
          MFCC is a proven front-end. We skip it — a learnable Conv1D performs the spectral decomposition
          as part of the model itself, cutting total system MACs from ~7 M down to 0.97 M.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>

        {/* ── Left: the morphing box ── */}
        <div style={{
          border: '1px solid var(--ink)',
          padding: '14px 18px',
          background: 'rgba(26,26,26,0.04)',
          transform: boxTransform,
          transition: boxTransition,
          willChange: 'transform',
          /* Both content variants stack in the same grid cell so they can
             cross-fade without layout shift. */
          display: 'grid',
          gridTemplateRows: 'auto auto 1fr auto',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Standard approach · two stages
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 600, marginBottom: 12 }}>MFCC + DS-CNN</div>

          {/* Stack zone — both views render in the same grid cell. */}
          <div style={{ display: 'grid', gridTemplateAreas: '"a"', alignItems: 'stretch' }}>

            {/* Pipeline view (echoes slide 11) — visible during hold + move */}
            <div style={{
              gridArea: 'a',
              opacity: showPipeline ? 1 : 0,
              transition: `opacity ${T_FADE}ms var(--anim-ease)`,
              pointerEvents: showPipeline ? 'auto' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: 16,
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
                  gridTemplateColumns: '1fr 110px',
                  gap: 8,
                  padding: '5px 10px',
                  background: 'rgba(26,26,26,0.05)',
                }}>
                  <span>{label}</span>
                  <span style={{ textAlign: 'right', color: 'var(--ink-mute)' }}>{cost}</span>
                </div>
              ))}
            </div>

            {/* Summary view — pops in after the morph */}
            <div style={{
              gridArea: 'a',
              opacity: showSummary ? 1 : 0,
              transform: showSummary ? 'scale(1)' : 'scale(0.78)',
              transformOrigin: 'center center',
              transition: showSummary
                ? `opacity ${T_POP}ms cubic-bezier(0.34, 1.56, 0.64, 1), transform ${T_POP}ms cubic-bezier(0.34, 1.56, 0.64, 1)`
                : 'none',
              pointerEvents: showSummary ? 'auto' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              alignItems: 'stretch',
              justifyContent: 'center',
              padding: '4px 0',
            }}>
              {/* Big total */}
              <div style={{
                textAlign: 'center',
                padding: '18px 16px',
                background: 'var(--paper)',
                border: '1px solid rgba(26,26,26,0.18)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 96,
                  fontWeight: 500,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  color: 'var(--ink)',
                }}>
                  ~7.0 M
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  color: 'var(--ink-mute)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginTop: 6,
                }}>
                  total system ops
                </div>
              </div>

              {/* Two-column breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ padding: '10px 14px', border: '1px solid rgba(26,26,26,0.18)', background: 'var(--paper)', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em' }}>~1.6 M</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', textTransform: 'uppercase', marginTop: 3 }}>MFCC preproc · CPU</div>
                </div>
                <div style={{ padding: '10px 14px', border: '1px solid rgba(26,26,26,0.18)', background: 'var(--paper)', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em' }}>~5.4 M</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', textTransform: 'uppercase', marginTop: 3 }}>DS-CNN · network</div>
                </div>
              </div>

              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: 'var(--ink-mute)',
                textAlign: 'center',
                marginTop: 2,
              }}>
                Zhang et al., 2017 · 94.4% on Speech Commands
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: our pipeline. Held back until the morph + pop completes. ── */}
        <div style={{
          border: '2px solid var(--accent)',
          padding: '14px 18px',
          background: '#fff7f2',
          opacity: showRest ? 1 : 0,
          transform: showRest ? 'none' : 'translateY(20px)',
          transition: 'opacity 360ms var(--anim-ease), transform 360ms var(--anim-ease)',
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

      {/* ── Punchline strip — also held back. ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
        opacity: showRest ? 1 : 0,
        transform: showRest ? 'none' : 'translateY(20px)',
        transition: 'opacity 360ms var(--anim-ease) 100ms, transform 360ms var(--anim-ease) 100ms',
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

      <MacShareBar focus="balanced" annotate="introduces the 53 / 47 split — see next two slides" />
    </SlideFrame>
  );
}
