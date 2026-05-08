import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import { getSlide } from '../content.js';

const c = getSlide('register-map')?.content ?? {
  eyebrow: 'CPU baseline vs accelerator',
  title: 'Same convolution. Two clocks.',
  footer: '',
};

const ACCENT = 'var(--color-accent)';
const COOL   = 'var(--color-accent-cool)';
const RED    = '#c0392b';
const INK    = 'var(--color-ink)';
const MUTE   = 'var(--color-ink-mute)';
const PAPER  = 'var(--color-paper)';
const LINE   = 'var(--line-hairline)';
const MONO   = 'var(--font-mono)';

// One scalar MAC iteration on Hazard3, build with MUL_FAST=0 / MULDIV_UNROLL=1.
// Each iteration ≈ 37 cycles · 8 MACs/output · 3 outputs + setup ≈ ~880 cycles.
const CPU_PROGRAM = [
  'lb   t0, 0(s0)      ; load input byte',
  'lb   t1, 0(s1)      ; load weight byte',
  'mul  t2, t0, t1     ; ~32 cycles (UNROLL=1)',
  'add  a0, a0, t2',
  'addi s0, s0, 1',
  'addi s1, s1, 1',
  'bne  s0, s8, .L1    ; loop body × 8 per output',
  'sra  a0, a0, t3     ; shift',
  'andi a0, a0, 0xff   ; saturate',
  'sb   a0, 0(s2)      ; store output byte',
];

// Accelerator FSM trace, with cycle costs from the RTL (AHB: one word/cycle).
// 5 + 5 + 4 + 7 + 7 + 5 + 1 = 34 cycles total.
const ACCEL_TRACE = [
  { fsm: 'S_INIT → S_WT_DATA_W',  desc: '2 weight words from XIP',      cycles: 5 },
  { fsm: 'S_BIAS_DATA / SHIFT',   desc: 'bias + shift from SRAM',       cycles: 5 },
  { fsm: 'S_IN_DATA · w_pos=0',   desc: 'first patch → BUF A',          cycles: 4 },
  { fsm: 'S_MAC_OVLP · w_pos=0',  desc: 'MAC A · preload B · out[0]',   cycles: 7 },
  { fsm: 'S_MAC_OVLP · w_pos=1',  desc: 'MAC B · preload A · out[1]',   cycles: 7 },
  { fsm: 'S_MAC · w_pos=2',       desc: 'MAC A · no preload · out[2]',  cycles: 5 },
  { fsm: 'S_DONE',                desc: 'accel_done_irq → CPU',         cycles: 1 },
];

// Per-step view of the side-by-side. Each step advances both clocks.
// CPU clock counts from 0 → 880. Accel clock counts from 0 → 34 then stops.
// `cpuPC` indexes into CPU_PROGRAM (which line is "current").
// `accelStage` indexes into ACCEL_TRACE (which trace row is "current"),
// or -1 = not started, ACCEL_TRACE.length = done.
const RUN_STEPS = [
  { cpuCycles:   0, cpuPC: -1, accelCycles:  0, accelStage: -1,
    cap: 'Idle. Press → to run both.',  cpuDone: false, accelDone: false },
  { cpuCycles:  37, cpuPC:  2, accelCycles: 14, accelStage:  3,
    cap: 'CPU mid 1st MAC (~32 c mul).  Accel: MAC on BUF A, BUF B preloading in parallel.',
    cpuDone: false, accelDone: false },
  { cpuCycles: 294, cpuPC:  9, accelCycles: 28, accelStage:  5,
    cap: 'CPU finished output[0] (~293 c, 8 MACs).  Accel: starting last MAC for out[2].',
    cpuDone: false, accelDone: false },
  { cpuCycles: 587, cpuPC:  6, accelCycles: 34, accelStage:  6,
    cap: 'CPU mid output[1].  Accel: IRQ fired — done in 34 cycles, sleeping.',
    cpuDone: false, accelDone: true },
  { cpuCycles: 880, cpuPC:  9, accelCycles: 34, accelStage:  6,
    cap: 'CPU finally done at ~880 c.  Accel was idle for ~846 cycles.',
    cpuDone: true,  accelDone: true },
];

// Final comparison card.
const TABLE_ROWS = [
  ['MULs per cycle',                      '< 1',           '4'],
  ['Cycles per single MAC',               '~37',           '~0.25 peak'],
  ['Effective MACs per cycle',            '~0.027',        '~0.7 sustained'],
  ['Toy example · 24 MACs · 3 outputs',   '~880 cycles',   '~34 cycles'],
  ['Real model · mel_compact_4blk_ch36 (~5M MACs)',
                                          '195,486,215  (5.43 s)',
                                          '4,644,544  (0.129 s)'],
];

const FINAL_STEP = RUN_STEPS.length; // last step shows the table
const TOTAL = RUN_STEPS.length + 1;  // 6 total steps

const CPU_MAX_CYCLES = 880;

// ── CPU pane ─────────────────────────────────────────────────────────────
function CpuPane({ s }) {
  const busy = s.cpuPC >= 0 && !s.cpuDone;
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
      position: 'relative',
      border: `2px solid ${LINE}`,
      background: 'var(--color-bg)',
      boxShadow: busy ? `inset 0 0 0 3px ${RED}` : 'none',
      transition: 'box-shadow 280ms ease',
    }}>
      <div style={{
        padding: '14px 20px', borderBottom: `1px solid ${LINE}`,
        background: PAPER,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          fontFamily: MONO, fontSize: 13, letterSpacing: '0.16em',
          textTransform: 'uppercase', fontWeight: 700, color: INK,
        }}>WITHOUT accelerator</div>
        <div style={{ fontFamily: MONO, fontSize: 12, color: MUTE }}>
          CPU runs the convolution scalar
        </div>
        <div style={{
          marginLeft: 'auto',
          fontFamily: MONO, fontSize: 13, letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: s.cpuDone ? COOL : s.cpuPC >= 0 ? RED : MUTE,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: s.cpuDone ? COOL :
                        s.cpuPC >= 0 ? RED : 'var(--color-bg-deep)',
            animation: s.cpuPC >= 0 && !s.cpuDone
              ? 'xip-status-blink 500ms steps(2, end) infinite' : 'none',
          }} />
          {s.cpuDone ? 'done' : s.cpuPC >= 0 ? 'busy' : 'idle'}
        </div>
      </div>

      {/* Instruction stream */}
      <div style={{ padding: 18, flex: 1, overflow: 'hidden' }}>
        {CPU_PROGRAM.map((line, i) => {
          const active = i === s.cpuPC;
          return (
            <div key={i} style={{
              padding: '6px 10px',
              fontFamily: MONO, fontSize: 16,
              color: active ? '#fff' : i < s.cpuPC ? MUTE : INK,
              background: active ? RED : 'transparent',
              opacity: s.cpuPC < 0 ? 0.35 : 1,
              transition: 'background 240ms ease, color 240ms ease, opacity 240ms ease',
              whiteSpace: 'pre',
            }}>{line}</div>
          );
        })}
      </div>

      {/* Cycle counter */}
      <div style={{
        padding: '14px 20px', borderTop: `1px solid ${LINE}`,
        background: PAPER,
        display: 'flex', alignItems: 'baseline', gap: 14,
      }}>
        <span style={{
          fontFamily: MONO, fontSize: 12, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: MUTE,
        }}>cycles</span>
        <span style={{
          fontFamily: MONO, fontSize: 30, fontWeight: 700, color: RED,
        }}>{s.cpuCycles.toLocaleString()}</span>
        <span style={{
          marginLeft: 'auto',
          fontFamily: MONO, fontSize: 12, color: MUTE,
        }}>~37 cycles / MAC · 8 MACs / output · 3 outputs · MUL_FAST=0</span>
      </div>
    </div>
  );
}

// ── Accel pane ───────────────────────────────────────────────────────────
function AccelPane({ s }) {
  const busy = s.accelStage >= 0 && !s.accelDone;
  const lit  = busy || s.accelDone;
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
      position: 'relative',
      border: `2px solid ${LINE}`,
      background: 'var(--color-bg)',
      boxShadow: lit ? `inset 0 0 0 3px ${ACCENT}` : 'none',
      transition: 'box-shadow 280ms ease',
    }}>
      <div style={{
        padding: '14px 20px', borderBottom: `1px solid ${LINE}`,
        background: PAPER,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          fontFamily: MONO, fontSize: 13, letterSpacing: '0.16em',
          textTransform: 'uppercase', fontWeight: 700, color: INK,
        }}>WITH accelerator</div>
        <div style={{ fontFamily: MONO, fontSize: 12, color: MUTE }}>
          CPU sleeps on WFI · accel does the work
        </div>
        <div style={{
          marginLeft: 'auto',
          fontFamily: MONO, fontSize: 13, letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: s.accelDone ? COOL : s.accelStage >= 0 ? ACCENT : MUTE,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: s.accelDone ? COOL :
                        s.accelStage >= 0 ? ACCENT : 'var(--color-bg-deep)',
            animation: s.accelStage >= 0 && !s.accelDone
              ? 'xip-status-blink 500ms steps(2, end) infinite' : 'none',
          }} />
          {s.accelDone ? 'done' : s.accelStage >= 0 ? 'busy' : 'idle'}
        </div>
      </div>

      {/* Trace */}
      <div style={{ padding: 18, flex: 1, overflow: 'hidden' }}>
        {ACCEL_TRACE.map((row, i) => {
          const active = i === s.accelStage;
          const past   = i < s.accelStage;
          return (
            <div key={i} style={{
              padding: '6px 10px',
              fontFamily: MONO, fontSize: 16,
              display: 'flex', gap: 14, alignItems: 'baseline',
              background: active ? ACCENT : 'transparent',
              color: active ? '#fff' : past ? MUTE : INK,
              opacity: s.accelStage < 0 ? 0.35 : 1,
              transition: 'background 240ms ease, color 240ms ease, opacity 240ms ease',
            }}>
              <span style={{ minWidth: 140, fontWeight: 600 }}>{row.fsm}</span>
              <span style={{ flex: 1 }}>{row.desc}</span>
              <span style={{
                fontSize: 13,
                color: active ? 'rgba(255,255,255,0.85)' : MUTE,
              }}>{row.cycles}c</span>
            </div>
          );
        })}
      </div>

      {/* Cycle counter */}
      <div style={{
        padding: '14px 20px', borderTop: `1px solid ${LINE}`,
        background: PAPER,
        display: 'flex', alignItems: 'baseline', gap: 14,
      }}>
        <span style={{
          fontFamily: MONO, fontSize: 12, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: MUTE,
        }}>cycles</span>
        <span style={{
          fontFamily: MONO, fontSize: 30, fontWeight: 700, color: ACCENT,
        }}>{s.accelCycles.toLocaleString()}</span>
        <span style={{
          marginLeft: 'auto',
          fontFamily: MONO, fontSize: 12, color: MUTE,
        }}>AHB 1 word/cycle · MAC overlapped with preload</span>
      </div>
    </div>
  );
}

// ── Time bar ─────────────────────────────────────────────────────────────
function TimeBar({ cycles, color, label }) {
  const pct = Math.min(100, (cycles / CPU_MAX_CYCLES) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        minWidth: 130,
        fontFamily: MONO, fontSize: 12, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: MUTE,
      }}>{label}</div>
      <div style={{
        flex: 1, height: 18, background: 'var(--color-bg-deep)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: color,
          transition: 'width 600ms cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
      <div style={{
        minWidth: 110, textAlign: 'right',
        fontFamily: MONO, fontSize: 16, fontWeight: 700, color,
      }}>{cycles.toLocaleString()} c</div>
    </div>
  );
}

// ── Comparison table card (final step) ───────────────────────────────────
function ComparisonCard() {
  return (
    <div style={{
      flex: 1, padding: 32,
      background: 'var(--color-bg)',
      border: `2px solid ${INK}`,
      display: 'flex', flexDirection: 'column', gap: 22,
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 16,
      }}>
        <div style={{
          fontFamily: MONO, fontSize: 13, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: ACCENT, fontWeight: 700,
        }}>The numbers</div>
        <div style={{ fontSize: 18, color: MUTE }}>
          measured on the Hazard3 SoC, conv1d_accel RTL
        </div>
      </div>

      <table style={{
        width: '100%', borderCollapse: 'collapse',
        fontFamily: MONO, fontSize: 18,
      }}>
        <thead>
          <tr>
            <th style={{
              textAlign: 'left', padding: '14px 18px',
              background: INK, color: 'var(--color-cream)',
              fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase', fontSize: 13,
            }}>Metric</th>
            <th style={{
              textAlign: 'right', padding: '14px 18px',
              background: INK, color: RED,
              fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase', fontSize: 13,
              minWidth: 280,
            }}>CPU only</th>
            <th style={{
              textAlign: 'right', padding: '14px 18px',
              background: INK, color: ACCENT,
              fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase', fontSize: 13,
              minWidth: 280,
            }}>With accelerator</th>
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map((row, i) => (
            <tr key={i}>
              <td style={{
                padding: '14px 18px',
                borderBottom: `1px solid ${LINE}`,
                color: INK,
              }}>{row[0]}</td>
              <td style={{
                padding: '14px 18px',
                borderBottom: `1px solid ${LINE}`,
                color: INK, textAlign: 'right',
              }}>{row[1]}</td>
              <td style={{
                padding: '14px 18px',
                borderBottom: `1px solid ${LINE}`,
                color: INK, textAlign: 'right',
              }}>{row[2]}</td>
            </tr>
          ))}
          <tr style={{
            background: `color-mix(in oklch, ${ACCENT} 18%, ${PAPER})`,
            animation: 'xip-fade-in 600ms ease forwards',
          }}>
            <td style={{
              padding: '20px 18px', fontWeight: 700, fontSize: 22,
            }}>Real model · speedup</td>
            <td style={{
              padding: '20px 18px', textAlign: 'right',
              color: MUTE, fontSize: 18,
            }}>baseline</td>
            <td style={{
              padding: '20px 18px', textAlign: 'right',
              color: ACCENT, fontWeight: 700, fontSize: 32,
              letterSpacing: '-0.01em',
            }}>42×</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function RegisterMap() {
  const [step, setStep] = useState(0);
  const rootRef = useRef(null);

  useEffect(() => {
    const onSlideChange = (e) => {
      const here = rootRef.current?.closest('section');
      if (!here) return;
      if (e.detail?.slide === here) setStep(0);
    };
    document.addEventListener('slidechange', onSlideChange);
    return () => document.removeEventListener('slidechange', onSlideChange);
  }, []);

  // Right/left arrow scrubs only — no auto-advance.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const section = rootRef.current?.closest('section');
      if (!section?.hasAttribute('data-deck-active')) return;
      const fwd  = e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Spacebar';
      const back = e.key === 'ArrowLeft'  || e.key === 'PageUp';
      if (fwd && step < TOTAL - 1) {
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

  const isFinal = step === FINAL_STEP;
  const s = isFinal ? RUN_STEPS[RUN_STEPS.length - 1] : RUN_STEPS[step];

  return (
    <SlideFrame>
      <div ref={rootRef} style={{
        display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0,
        marginTop: 14, gap: 18,
      }}>
        <div>
          <div className="eyebrow">{c.eyebrow}</div>
          <h1 className="title" style={{ marginBottom: 0, fontSize: 46 }}>{c.title}</h1>
        </div>

        {/* Crossfade between race view and comparison card */}
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
          {/* Race view */}
          <div style={{
            position: 'absolute', inset: 0,
            opacity: isFinal ? 0 : 1,
            transform: isFinal ? 'translateY(-6px)' : 'translateY(0)',
            transition: 'opacity 480ms ease, transform 480ms ease',
            pointerEvents: isFinal ? 'none' : 'auto',
            display: 'flex', flexDirection: 'column', gap: 18, minHeight: 0,
          }}>
            <div style={{ display: 'flex', gap: 22, flex: 1, minHeight: 0 }}>
              <CpuPane s={s} />
              <AccelPane s={s} />
            </div>

            {/* Time bars */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 10,
              padding: '16px 22px',
              background: PAPER, border: `1px solid ${LINE}`,
            }}>
              <TimeBar cycles={s.cpuCycles}   color={RED}    label="CPU clock" />
              <TimeBar cycles={s.accelCycles} color={ACCENT} label="Accel clock" />
            </div>

            {/* Caption */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 18,
              padding: '14px 18px',
              background: PAPER,
              border: `1px solid ${LINE}`,
              borderLeft: `4px solid ${INK}`,
            }}>
              <span style={{
                fontFamily: MONO, fontSize: 12, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: MUTE, minWidth: 110,
              }}>step {step + 1} / {RUN_STEPS.length}</span>
              <span style={{
                fontFamily: MONO, fontSize: 18, fontWeight: 600, color: INK,
              }}>{s.cap}</span>
              <span style={{
                marginLeft: 'auto',
                fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: MUTE,
              }}>→ next step</span>
            </div>
          </div>

          {/* Final comparison card */}
          <div style={{
            position: 'absolute', inset: 0,
            opacity: isFinal ? 1 : 0,
            transform: isFinal ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 480ms ease 80ms, transform 480ms ease 80ms',
            pointerEvents: isFinal ? 'auto' : 'none',
            display: 'flex', flexDirection: 'column',
          }}>
            <ComparisonCard />
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
