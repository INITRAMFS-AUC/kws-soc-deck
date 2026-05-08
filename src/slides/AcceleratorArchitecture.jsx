import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import { getSlide } from '../content.js';

const c = getSlide('accelerator-architecture')?.content ?? {
  eyebrow: 'peris/conv1d_accel · end-to-end',
  title: 'One Conv1D layer, the way the RTL runs it.',
  footnote: '',
};

// Lit lanes (one of these at most): 'apb', 'ahb-wt', 'ahb-bias', 'ahb-in-A',
// 'ahb-in-B', 'ahb-mac-A', 'ahb-mac-B', 'ahb-wr', null.
const STEPS = [
  {
    fsm: 'S_IDLE',
    cpu: 'idle',
    bus: null,
    busy: false, irq: false,
    wtLoaded: false, bufA: null, bufB: null,
    macSide: null, writes: 0,
    cap: 'Memory laid out · 4×4 input in SRAM · 2 weight words in XIP · weights are 32-bit packed',
  },
  {
    fsm: 'S_IDLE',
    cpu: 'apb',
    bus: 'apb',
    busy: false, irq: false, regsLit: true,
    wtLoaded: false, bufA: null, bufB: null,
    macSide: null, writes: 0,
    cap: 'CPU writes 7 config registers via APB · SRC, WT, DST, BIAS, SHIFT, CFG0, CFG1',
  },
  {
    fsm: 'S_INIT',
    cpu: 'wfi',
    bus: null,
    busy: true, irq: false, regsLit: true,
    wtLoaded: false, bufA: null, bufB: null,
    macSide: null, writes: 0,
    cap: 'CTRL.START=1 → S_INIT (1c) · CPU issues WFI — pipeline halted',
  },
  {
    fsm: 'S_WT_ADDR → S_WT_DATA_W',
    cpu: 'wfi',
    bus: 'ahb-wt',
    busy: true, irq: false, regsLit: true,
    wtLoaded: 'loading', bufA: null, bufB: null,
    macSide: null, writes: 0,
    cap: 'AHB master fetches 2 weight words from XIP · 1 ADDR + 3 DATA cycles (1c r_wait skipped) → 5c',
  },
  {
    fsm: 'S_BIAS_ADDR → S_BIAS_DATA → S_SHIFT_DATA',
    cpu: 'wfi',
    bus: 'ahb-bias',
    busy: true, irq: false, regsLit: true, biasLit: true,
    wtLoaded: true, bufA: null, bufB: null,
    macSide: null, writes: 0,
    cap: 'Bias word + shift word from SRAM · 1 ADDR + 2 DATA + 2 SHIFT = 5c',
  },
  {
    fsm: 'S_IN_ADDR → S_IN_DATA · w_pos=0',
    cpu: 'wfi',
    bus: 'ahb-in-A',
    busy: true, irq: false, regsLit: true, biasLit: true,
    wtLoaded: true, bufA: 'loading', bufB: null,
    macSide: null, writes: 0,
    cap: 'First patch into BUF A · 1 ADDR + 3 DATA = 4c · one 32-bit word per cycle on AHB',
  },
  {
    fsm: 'S_MAC_OVLP · w_pos=0',
    cpu: 'wfi',
    bus: 'ahb-in-B',
    busy: true, irq: false, regsLit: true, biasLit: true,
    wtLoaded: true, bufA: 'loaded', bufB: 'loading',
    macSide: 'A', writes: 1,
    cap: 'MAC on BUF A (4 lanes) · concurrently preload BUF B · +bias · ›› shift · sat → out[0] · 7c',
  },
  {
    fsm: 'S_MAC_OVLP · w_pos=1',
    cpu: 'wfi',
    bus: 'ahb-in-A',
    busy: true, irq: false, regsLit: true, biasLit: true,
    wtLoaded: true, bufA: 'loading', bufB: 'loaded',
    macSide: 'B', writes: 2,
    cap: 'buf_sel flips → MAC on BUF B · BUF A reloads in parallel · out[1] written · 7c',
  },
  {
    fsm: 'S_MAC · w_pos=2',
    cpu: 'wfi',
    bus: null,
    busy: true, irq: false, regsLit: true, biasLit: true,
    wtLoaded: true, bufA: 'loaded', bufB: 'loaded',
    macSide: 'A', writes: 3,
    cap: 'Last patch · no preload (S_MAC, not OVLP) · out[2] written · 5c',
  },
  {
    fsm: 'S_DONE',
    cpu: 'wakes',
    bus: null,
    busy: false, irq: true, regsLit: true, biasLit: true,
    wtLoaded: true, bufA: null, bufB: null,
    macSide: null, writes: 3,
    cap: 'accel_done_irq → CPU wakes from WFI · ~34 cycles total · CPU sleeps the whole run',
  },
];
const FINAL = STEPS.length - 1;

const ACCENT = 'var(--color-accent)';
const INK    = 'var(--color-ink)';
const MUTE   = 'var(--color-ink-mute)';
const PAPER  = 'var(--color-paper)';
const LINE   = 'var(--line-hairline)';
const MONO   = 'var(--font-mono)';

// ── CPU box — big, single-line instruction ───────────────────────────────
function CpuBox({ s }) {
  const halted = s.cpu === 'wfi';
  const wakes  = s.cpu === 'wakes';
  return (
    <div style={{
      width: 280, padding: 22,
      border: `2px solid ${halted ? LINE : INK}`,
      background: halted ? PAPER : 'var(--color-bg)',
      opacity: halted ? 0.5 : 1,
      transition: 'opacity 320ms ease, border-color 320ms ease',
    }}>
      <div style={{
        fontFamily: MONO, fontSize: 14, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: MUTE, marginBottom: 18,
      }}>CPU · Hazard3</div>
      <div style={{
        fontFamily: MONO, fontSize: 36, fontWeight: 700,
        color: halted ? MUTE : INK, letterSpacing: '-0.01em',
      }}>
        {s.cpu === 'apb'   ? 'APB →' :
         s.cpu === 'wfi'   ? 'wfi'   :
         s.cpu === 'wakes' ? 'mret'  :
                             'idle'}
      </div>
    </div>
  );
}

// ── Accel box — minimal: title row, FSM line, 3 buffers, 1 MAC pill ──────
const REGS = ['SRC', 'WT', 'DST', 'BIAS', 'SHIFT', 'CFG0', 'CFG1'];

function Buffer({ label, state, content, side }) {
  const macFiring = side && state === 'loaded' && side === 'mac';
  const lit  = state === 'loading' || macFiring;
  const done = state === 'loaded';
  return (
    <div style={{
      flex: 1, padding: '16px 18px',
      border: `2px solid ${lit ? ACCENT : LINE}`,
      background: lit ? `color-mix(in oklch, ${ACCENT} 12%, ${PAPER})`
                       : done ? 'var(--color-bg-deep)' : PAPER,
      transition: 'background 280ms ease, border-color 280ms ease',
    }}>
      <div style={{
        fontFamily: MONO, fontSize: 13, letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: lit ? ACCENT : MUTE, marginBottom: 8,
      }}>{label}{state === 'loading' ? ' · loading' : ''}</div>
      <div style={{
        fontFamily: MONO, fontSize: 20, fontWeight: 600,
        color: state == null ? MUTE : INK,
      }}>{content}</div>
    </div>
  );
}

function AccelBox({ s }) {
  const macActive = s.macSide != null;
  return (
    <div style={{
      flex: 1, minWidth: 0,
      border: `3px solid ${s.busy ? ACCENT : INK}`,
      background: 'var(--color-bg)',
      transition: 'border-color 320ms ease',
    }}>
      {/* Header — name + FSM + busy light */}
      <div style={{
        padding: '16px 22px', borderBottom: `1px solid ${LINE}`,
        background: PAPER,
        display: 'flex', alignItems: 'center', gap: 22,
      }}>
        <div style={{
          fontFamily: MONO, fontSize: 16, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: INK,
        }}>conv1d_accel</div>
        <div style={{
          fontFamily: MONO, fontSize: 18, fontWeight: 600,
          color: s.busy ? ACCENT : MUTE, marginLeft: 'auto',
        }}>{s.fsm}</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: MONO, fontSize: 13, letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: s.busy ? ACCENT : MUTE,
        }}>
          <span style={{
            width: 12, height: 12, borderRadius: '50%',
            background: s.busy ? ACCENT : 'var(--color-bg-deep)',
            animation: s.busy ? 'xip-status-blink 700ms steps(2, end) infinite' : 'none',
          }} />
          {s.busy ? 'busy' : 'idle'}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Registers row */}
        <div>
          <div style={{
            fontFamily: MONO, fontSize: 12, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: MUTE, marginBottom: 8,
          }}>7 config registers</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {REGS.map((r) => (
              <div key={r} style={{
                flex: 1, padding: '10px 8px', textAlign: 'center',
                fontFamily: MONO, fontSize: 13, fontWeight: 600,
                background: s.regsLit ? 'var(--color-bg-deep)' : PAPER,
                color: s.regsLit ? INK : MUTE,
                border: `1px solid ${s.bus === 'apb' ? ACCENT : LINE}`,
                transition: 'background 240ms ease, color 240ms ease, border-color 240ms ease',
              }}>{r}</div>
            ))}
          </div>
        </div>

        {/* Buffers row */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Buffer label="wt_buf"
                  state={s.wtLoaded === 'loading' ? 'loading' : s.wtLoaded ? 'loaded' : null}
                  content={s.wtLoaded ? '[w0, w1]' : '— empty'} />
          <Buffer label="BUF A · in_buf0"
                  state={s.bufA}
                  side={s.macSide === 'A' ? 'mac' : null}
                  content={s.bufA === 'loading' ? '…' :
                           s.bufA === 'loaded' ? '[i0, i1]' :
                           '— empty'} />
          <Buffer label="BUF B · in_buf1"
                  state={s.bufB}
                  side={s.macSide === 'B' ? 'mac' : null}
                  content={s.bufB === 'loading' ? '…' :
                           s.bufB === 'loaded' ? '[i2, i3]' :
                           '— empty'} />
        </div>

        {/* MAC pill */}
        <div style={{
          padding: '18px 22px',
          background: macActive ? `color-mix(in oklch, ${ACCENT} 14%, ${PAPER})` : PAPER,
          border: `2px solid ${macActive ? ACCENT : LINE}`,
          transition: 'background 280ms ease, border-color 280ms ease',
          display: 'flex', alignItems: 'center', gap: 18,
        }}>
          <div style={{
            fontFamily: MONO, fontSize: 16, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: macActive ? ACCENT : MUTE,
          }}>4 × int8 MAC</div>
          <div style={{
            fontFamily: MONO, fontSize: 18, color: macActive ? INK : MUTE,
            marginLeft: 'auto',
          }}>
            {macActive ? `→ acc · +bias · ›› shift · sat int8 → out[${s.writes - 1}]` : '— idle'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Memory column — SRAM (input + outputs) and XIP (weights) ─────────────
function Memories({ s }) {
  const inputLit  = s.bus === 'ahb-in-A' || s.bus === 'ahb-in-B';
  const biasLit   = s.bus === 'ahb-bias';
  const wtLit     = s.bus === 'ahb-wt';
  return (
    <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* SRAM */}
      <div style={{
        border: `2px solid ${inputLit || biasLit ? ACCENT : LINE}`,
        background: 'var(--color-bg)',
        transition: 'border-color 280ms ease',
      }}>
        <div style={{
          padding: '12px 16px', borderBottom: `1px solid ${LINE}`,
          fontFamily: MONO, fontSize: 13, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: MUTE,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>SRAM</span>
          <span>0x0000_0000</span>
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['i0', 'i1', 'i2', 'i3'].map((w) => (
              <div key={w} style={{
                flex: 1, padding: '10px 0', textAlign: 'center',
                fontFamily: MONO, fontSize: 14, fontWeight: 600,
                background: inputLit ? `color-mix(in oklch, ${ACCENT} 14%, ${PAPER})` : PAPER,
                border: `1px solid ${inputLit ? ACCENT : LINE}`,
                color: INK,
                transition: 'background 240ms ease, border-color 240ms ease',
              }}>{w}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 1, 2].map((i) => {
              const written = s.writes > i;
              const justWritten = written && s.writes - 1 === i && s.bus !== 'apb';
              return (
                <div key={i} style={{
                  flex: 1, padding: '10px 0', textAlign: 'center',
                  fontFamily: MONO, fontSize: 14, fontWeight: 600,
                  background: written ? `color-mix(in oklch, ${ACCENT} 22%, ${PAPER})` : PAPER,
                  border: `1px solid ${justWritten ? ACCENT : written ? ACCENT : LINE}`,
                  color: written ? INK : MUTE,
                  transition: 'background 280ms ease, border-color 280ms ease',
                }}>out[{i}]{written ? ' ✓' : ''}</div>
              );
            })}
          </div>
        </div>
      </div>

      {/* XIP */}
      <div style={{
        border: `2px solid ${wtLit ? ACCENT : LINE}`,
        background: 'var(--color-bg)',
        transition: 'border-color 280ms ease',
      }}>
        <div style={{
          padding: '12px 16px', borderBottom: `1px solid ${LINE}`,
          fontFamily: MONO, fontSize: 13, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: MUTE,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>XIP Flash</span>
          <span>0x8000_0000</span>
        </div>
        <div style={{ padding: 16, display: 'flex', gap: 6 }}>
          {['w0', 'w1'].map((w) => (
            <div key={w} style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              fontFamily: MONO, fontSize: 14, fontWeight: 600,
              background: wtLit ? `color-mix(in oklch, ${ACCENT} 14%, ${PAPER})` : PAPER,
              border: `1px solid ${wtLit ? ACCENT : LINE}`,
              color: INK,
              transition: 'background 240ms ease, border-color 240ms ease',
            }}>{w}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Bus indicator — single big horizontal arrow on top of the diagram ───
function BusBar({ s }) {
  const apb = s.bus === 'apb';
  const ahb = s.bus && s.bus.startsWith('ahb');
  const label =
    s.bus === 'apb'      ? 'APB · CPU writes config' :
    s.bus === 'ahb-wt'   ? 'AHB · accel master fetches weights' :
    s.bus === 'ahb-bias' ? 'AHB · accel master fetches bias / shift' :
    s.bus === 'ahb-in-A' ? 'AHB · accel master fetches input → BUF A' :
    s.bus === 'ahb-in-B' ? 'AHB · accel master fetches input → BUF B' :
    s.bus === 'ahb-wr'   ? 'AHB · accel master writes output byte' :
    s.irq                ? 'IRQ · accel_done_irq → CPU' :
                            '— bus idle';
  const lit = apb || ahb || s.irq;
  const color = s.irq ? ACCENT : ahb ? ACCENT : apb ? 'var(--color-accent-cool)' : MUTE;
  return (
    <div style={{
      padding: '14px 20px',
      border: `2px solid ${lit ? color : LINE}`,
      background: lit ? `color-mix(in oklch, ${color} 10%, ${PAPER})` : PAPER,
      transition: 'background 280ms ease, border-color 280ms ease',
      display: 'flex', alignItems: 'center', gap: 18,
    }}>
      <div style={{
        fontFamily: MONO, fontSize: 14, letterSpacing: '0.16em',
        textTransform: 'uppercase', fontWeight: 700,
        color: lit ? color : MUTE, minWidth: 70,
      }}>BUS</div>
      <div style={{
        fontFamily: MONO, fontSize: 18, fontWeight: 600,
        color: lit ? INK : MUTE,
      }}>{label}</div>
    </div>
  );
}

export default function AcceleratorArchitecture() {
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

  const s = STEPS[step];

  return (
    <SlideFrame>
      <div ref={rootRef} style={{
        display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0,
        marginTop: 14, gap: 22,
      }}>
        <div>
          <div className="eyebrow">{c.eyebrow}</div>
          <h1 className="title" style={{ marginBottom: 0, fontSize: 46 }}>{c.title}</h1>
        </div>

        <BusBar s={s} />

        <div style={{
          display: 'flex', alignItems: 'stretch', gap: 28,
          flex: 1, minHeight: 0,
        }}>
          <CpuBox s={s} />
          <AccelBox s={s} />
          <Memories s={s} />
        </div>

        {/* Caption */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          padding: '18px 22px',
          background: PAPER,
          border: `1px solid ${LINE}`,
          borderLeft: `4px solid ${s.busy ? ACCENT : INK}`,
        }}>
          <span style={{
            fontFamily: MONO, fontSize: 13,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: MUTE, minWidth: 110,
          }}>step {step + 1} / {STEPS.length}</span>
          <span style={{
            fontFamily: MONO, fontSize: 20, fontWeight: 600,
            color: INK,
          }}>{s.cap}</span>
          <span style={{
            marginLeft: 'auto',
            fontFamily: MONO, fontSize: 12, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: MUTE,
          }}>
            {step === 0     ? '→ next step' :
             step === FINAL ? '← back   ·   → next slide' :
                              '← back   ·   → next step'}
          </span>
        </div>
      </div>
    </SlideFrame>
  );
}
