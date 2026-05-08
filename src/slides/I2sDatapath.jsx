import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import { getSlide } from '../content.js';

const c = getSlide('i2s-datapath').content;

const DEPTH = 8;
const HALF  = 4;
const ARRIVAL_MS = 850;   // gap between successive int32 arrivals in the accumulator
const PACK_MS    = 1000;  // duration of the pack collapse (stage → FIFO slot)
const IRQ_MS     = 1700;  // dwell on the half-full IRQ before flush
const FLUSH_MS   = 950;   // FIFO drain duration
const STAGE_ROW_H = 28;
const SLOT_H      = 42;
const COL_W       = 340;

// One row of the accumulator above the FIFO: empty, just-landed (snap-in),
// or in the middle of being packed downward.
function StageCell({ filled, isLanding, isPacking, animKey }) {
  return (
    <div style={{
      position: 'relative', height: STAGE_ROW_H, overflow: 'hidden',
      background: 'color-mix(in oklch, var(--color-ink) 4%, var(--color-paper))',
    }}>
      {!filled && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--color-ink-mute)', opacity: 0.4,
        }}>—</div>
      )}
      {filled && (
        <div
          key={animKey}
          style={{
            position: 'absolute', inset: 3,
            background: 'color-mix(in oklch, var(--color-accent) 86%, var(--color-ink))',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 14px',
            fontFamily: 'var(--font-mono)',
            animation: isPacking
              ? `i2s-stage-pack-out ${PACK_MS}ms ease-in forwards`
              : isLanding
                ? `i2s-int32-snap 380ms cubic-bezier(.2,.9,.25,1.2)`
                : 'none',
          }}>
          <span style={{
            fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
            opacity: 0.78,
          }}>sample</span>
          <span style={{ fontSize: 16, fontWeight: 600 }}>int32</span>
        </div>
      )}
    </div>
  );
}

// One slot in the FIFO column: empty, currently being packed-into (4 int8
// lanes emerging in stagger), settled, glowing during IRQ, or flushing.
function FifoSlot({ filled, isPackingTarget, isInterrupt, isFlushing, animKey }) {
  return (
    <div style={{
      position: 'relative', height: SLOT_H, overflow: 'hidden',
      background: 'var(--color-paper)',
    }}>
      {!filled && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 12,
          color: 'var(--color-ink-mute)', opacity: 0.45,
        }}>—</div>
      )}
      {filled && (
        <div
          key={animKey}
          style={{
            position: 'absolute', inset: 4,
            display: 'flex', gap: 2,
            animation: isFlushing
              ? `i2s-flush-out ${FLUSH_MS}ms ease-in forwards`
              : 'none',
          }}>
          {[0, 1, 2, 3].map((j) => (
            <div key={j} style={{
              flex: 1,
              background: 'var(--color-accent)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.06em',
              opacity: isPackingTarget ? 0 : 1,
              animation: [
                isPackingTarget && `i2s-int8-emerge 540ms cubic-bezier(.2,.9,.25,1.05) ${260 + j * 90}ms forwards`,
                isInterrupt && 'i2s-irq-glow 900ms ease-in-out infinite',
              ].filter(Boolean).join(', '),
            }}>int8</div>
          ))}
        </div>
      )}
    </div>
  );
}

function VerticalFifo({ active }) {
  // Phase machine:
  //   accumulating → packing → (more entries needed) → accumulating
  //                          → (HALF reached)        → irq → flushing → restart
  // `stagedCount` is samples in the accumulator (0..4); `fifoCount` is packed
  // entries committed to the FIFO (0..HALF). `cycle` re-keys animations on
  // restart so keyframes fire cleanly.
  const [phase, setPhase] = useState('accumulating');
  const [stagedCount, setStagedCount] = useState(0);
  const [fifoCount, setFifoCount] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!active) return;
    let timer;
    if (phase === 'accumulating') {
      if (stagedCount >= 4) { setPhase('packing'); return; }
      timer = setTimeout(() => setStagedCount((n) => n + 1), ARRIVAL_MS);
    } else if (phase === 'packing') {
      timer = setTimeout(() => {
        const next = fifoCount + 1;
        setFifoCount(next);
        setStagedCount(0);
        setPhase(next >= HALF ? 'irq' : 'accumulating');
      }, PACK_MS);
    } else if (phase === 'irq') {
      timer = setTimeout(() => setPhase('flushing'), IRQ_MS);
    } else if (phase === 'flushing') {
      timer = setTimeout(() => {
        setFifoCount(0);
        setStagedCount(0);
        setCycle((k) => k + 1);
        setPhase('accumulating');
      }, FLUSH_MS);
    }
    return () => clearTimeout(timer);
  }, [active, phase, stagedCount, fifoCount]);

  return (
    <div style={{ width: COL_W, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'var(--color-ink)', color: 'var(--color-cream)',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--color-accent)', whiteSpace: 'nowrap',
        }}>Audio pipeline</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          opacity: 0.72, whiteSpace: 'nowrap',
        }}>4 × int32 → 4 × int8</span>
      </div>

      {/* Inflow caption */}
      <div style={{
        height: 30, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--color-ink-mute)',
      }}>
        I²S RX · int32 in
        <span style={{
          position: 'absolute', right: 0, top: 4,
          fontSize: 18, color: 'var(--color-accent)',
        }}>↓</span>
      </div>

      {/* Accumulator: 4 int32 samples stack here before packing. */}
      <div style={{
        position: 'relative',
        border: '1px solid var(--line-hairline)',
      }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            borderTop: i === 0 ? 'none' : '1px solid var(--line-hairline)',
          }}>
            <StageCell
              filled={i < stagedCount}
              isLanding={phase === 'accumulating' && i === stagedCount - 1}
              isPacking={phase === 'packing'}
              animKey={`${cycle}-${fifoCount}-${i}-${phase === 'packing' ? 'pack' : 'fill'}`}
            />
          </div>
        ))}
      </div>

      {/* Pack arrow — pulses while phase==='packing' */}
      <div style={{
        height: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        fontFamily: 'var(--font-mono)', fontSize: 11,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: phase === 'packing' ? 'var(--color-accent)' : 'var(--color-ink-mute)',
        opacity: phase === 'packing' ? 1 : 0.55,
        transition: 'color 200ms ease, opacity 200ms ease',
      }}>
        <span style={{
          fontSize: 18,
          animation: phase === 'packing'
            ? `i2s-pack-arrow ${PACK_MS}ms ease-in-out`
            : 'none',
        }}>↓</span>
        <span>pack · int32 → int8</span>
      </div>

      {/* FIFO column */}
      <div style={{
        position: 'relative',
        border: phase === 'irq'
          ? '2px solid var(--color-accent)'
          : '1px solid var(--line-hairline)',
        transition: 'border-color 200ms ease',
      }}>
        {Array.from({ length: DEPTH }).map((_, i) => {
          // During flushing, the four packed slots fade out together.
          // During packing, the target slot index === fifoCount is filling.
          const filled = phase === 'flushing' ? i < HALF :
                         phase === 'packing'  ? i <= fifoCount :
                         i < fifoCount;
          const isPackingTarget = phase === 'packing' && i === fifoCount;
          const isInterrupt = phase === 'irq' && filled;
          const isFlushing  = phase === 'flushing' && filled;
          return (
            <div key={i} style={{
              borderTop: i === 0 ? 'none' : '1px solid var(--line-hairline)',
            }}>
              <FifoSlot
                filled={filled}
                isPackingTarget={isPackingTarget}
                isInterrupt={isInterrupt}
                isFlushing={isFlushing}
                animKey={`${cycle}-${i}`}
              />
            </div>
          );
        })}

        {/* Half-full boundary */}
        <div style={{
          position: 'absolute', left: -12, right: -12,
          top: `calc(${HALF} * ${SLOT_H}px)`,
          height: 0,
          borderTop: phase === 'irq'
            ? '2px dashed var(--color-accent)'
            : '1px dashed color-mix(in oklch, var(--color-accent) 38%, transparent)',
          transition: 'border-color 200ms ease',
          pointerEvents: 'none',
        }} />

        {/* IRQ side annotation — sits to the LEFT of the column so it stays
            inside the slide. */}
        <div style={{
          position: 'absolute',
          right: 'calc(100% + 14px)',
          top: `calc(${HALF - 1} * ${SLOT_H}px)`,
          height: SLOT_H,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          alignItems: 'flex-end', gap: 2,
          opacity: phase === 'irq' ? 1 : 0.22,
          transition: 'opacity 200ms ease',
          whiteSpace: 'nowrap',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--color-accent)', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 6,
            animation: phase === 'irq'
              ? 'i2s-irq-flash 700ms steps(2, end) infinite'
              : 'none',
          }}>
            IRQ →
            <span style={{
              width: 9, height: 9, background: 'var(--color-accent)',
              borderRadius: '50%',
            }} />
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--color-ink-soft)',
          }}>fifo_half_full</div>
        </div>
      </div>

      {/* Outflow */}
      <div style={{
        height: 30, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: phase === 'flushing' ? 'var(--color-accent)' : 'var(--color-ink-mute)',
        transition: 'color 200ms ease',
      }}>
        <span style={{
          position: 'absolute', left: 0, top: -2,
          fontSize: 18, color: 'inherit',
        }}>↓</span>
        DMA flush · SRAM ring
      </div>
    </div>
  );
}

const STEPS = [
  {
    n: '01 · Packing',
    title: 'int32 → 4 × int8',
    sub: 'Quantize int32 samples into int8 and pack them into one int32 word.',
  },
  {
    n: '02 · DMA flushing',
    title: 'Half-full IRQ → DMA → SRAM',
    sub: 'On half-full the FIFO fires an IRQ; DMA drains all packed words into the SRAM ring buffer.',
  },
];

const CONFIGS = [
  { head: 'int16 packing', sub: 'or no packing / no quantization' },
  { head: 'up to 3× HW downsampling' },
  { head: 'mono or stereo', sub: '2 mic channels' },
];

function StepBlock({ idx, step, n, title, sub }) {
  const selected = idx === step;
  return (
    <div style={{
      position: 'relative',
      borderLeft: `${selected ? 6 : 3}px solid ${
        selected ? 'var(--color-accent)'
                 : 'color-mix(in oklch, var(--color-accent) 30%, transparent)'
      }`,
      padding: selected ? '18px 24px' : '6px 18px',
      background: selected
        ? 'color-mix(in oklch, var(--color-accent) 7%, var(--color-paper))'
        : 'transparent',
      opacity: selected ? 1 : 0.42,
      transition: 'padding 240ms ease, background 240ms ease, opacity 240ms ease, border-left-width 240ms ease',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: selected ? 13 : 11,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: selected ? 'var(--color-accent)' : 'var(--color-ink-mute)',
        marginBottom: selected ? 10 : 4,
        fontWeight: selected ? 700 : 500,
      }}>{n}</div>
      <div style={{
        fontSize: selected ? 32 : 18,
        fontWeight: 600, color: 'var(--color-ink)',
        letterSpacing: '-0.01em',
        marginBottom: selected ? 8 : 2,
        lineHeight: 1.15,
        transition: 'font-size 240ms ease',
      }}>{title}</div>
      <div style={{
        fontSize: selected ? 16 : 13,
        color: 'var(--color-ink-soft)',
        lineHeight: 1.5,
        maxWidth: 560,
      }}>{sub}</div>
    </div>
  );
}

function LeftPane({ step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {STEPS.map((s, i) => (
        <StepBlock key={i} idx={i} step={step} {...s} />
      ))}

      {/* I²S controller configurations — secondary panel */}
      <div style={{
        marginTop: 10,
        paddingTop: 22,
        borderTop: '1px solid var(--line-hairline)',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--color-ink-mute)', marginBottom: 14,
        }}>I²S controller · configurations</div>
        <ul style={{
          listStyle: 'none', padding: 0, margin: 0,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {CONFIGS.map((cfg) => (
            <li key={cfg.head} style={{
              display: 'flex', alignItems: 'baseline', gap: 12,
            }}>
              <span style={{
                width: 6, height: 6,
                background: 'var(--color-accent)', borderRadius: '50%',
                flexShrink: 0, transform: 'translateY(-2px)',
              }} />
              <div>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 14,
                  color: 'var(--color-ink)', fontWeight: 600,
                }}>{cfg.head}</span>
                {cfg.sub && (
                  <span style={{
                    fontSize: 13, color: 'var(--color-ink-soft)', marginLeft: 8,
                  }}>· {cfg.sub}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function I2sDatapath() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const rootRef = useRef(null);

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

  // Right-arrow advances the highlighted step (Packing → DMA flushing); the
  // deck's normal slide-step navigation only fires when we don't intercept.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const section = rootRef.current?.closest('section');
      if (!section?.hasAttribute('data-deck-active')) return;
      const fwd  = e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Spacebar';
      const back = e.key === 'ArrowLeft'  || e.key === 'PageUp';
      if (fwd && step < STEPS.length - 1) {
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
      <div ref={rootRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <div style={{ marginTop: 28 }}>
          <div className="eyebrow">{c.eyebrow}</div>
          <h1 className="title" style={{ marginBottom: 28 }}>{c.title}</h1>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 80,
          flex: 1, minHeight: 0,
          alignItems: 'start',
          paddingRight: 24,
        }}>
          <LeftPane step={step} />
          <VerticalFifo active={active} />
        </div>
      </div>
    </SlideFrame>
  );
}
