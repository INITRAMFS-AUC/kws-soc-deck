import SlideFrame from '../components/SlideFrame.jsx';

/* ─────────────────────────────────────────────────────────────────────────────
 * Slide 13 — bridge from "Mel Compact at 93.5 % float" (slide 12 leaderboard)
 * to "post-training quantization, KL-divergence calibrated" (slide 14). The
 * audience needs to know what runtime is going to execute the int8 model on
 * our SoC, and why that runtime is NNoM. Three constraints, three cards;
 * verbose detail in speaker notes.
 * ───────────────────────────────────────────────────────────────────────── */

const CARDS = [
  {
    eyebrow: 'Hazard3 has no float unit',
    big:    'INT8 only',
    bigLabel: 'weights · activations · scales',
    claim:  'Power-of-2 scales fold to a shift — no idiv, no soft-float helpers from libgcc.',
  },
  {
    eyebrow: '64 KB SRAM, no malloc',
    big:    '64 KB',
    bigLabel: 'fits NNoM\'s static buffer',
    claim:  'Tensors declared at compile time. No tensor arena to size, no fragmentation in 64 KB.',
  },
  {
    eyebrow: 'Keras → weights.h → firmware',
    big:    'weights.h',
    bigLabel: 'linked into firmware',
    claim:  'nnom_generate_model emits C. Same bytes run on host harness and on SoC, bit-identical.',
  },
];

export default function WhyNnom() {
  return (
    <SlideFrame topLeft="13 · Model">
      <div style={{ marginTop: 36 }}>
        <div className="eyebrow">Float in training · int8 on the chip</div>
        <h1 className="title" style={{ marginBottom: 10 }}>We need an int8 runtime that fits the chip we built.</h1>
        <p className="subtitle" style={{ maxWidth: 1700, marginBottom: 38 }}>
          Hazard3 RV32IMAC · 36 MHz · 64 KB SRAM · no FPU. NNoM is the only embedded runtime that satisfies all three without ceremony.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28, marginBottom: 32 }}>
        {CARDS.map((c) => (
          <div key={c.big} style={{
            border: '1px solid var(--ink)',
            background: 'var(--paper)',
            padding: '28px 30px 26px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 28 }}>
              {c.eyebrow}
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 96, fontWeight: 500, letterSpacing: '-0.04em', color: 'var(--ink)', lineHeight: 0.95 }}>{c.big}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 10, marginBottom: 24 }}>{c.bigLabel}</div>

            <div style={{ flex: 1 }} />
            <div style={{ borderTop: '1px solid rgba(26,26,26,0.18)', paddingTop: 14, fontFamily: 'var(--font-sans)', fontSize: 21, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.4 }}>
              {c.claim}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--accent)',
        color: '#fff',
        padding: '26px 32px',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 32,
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>★ Why NNoM, not …</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 600 }}>Open source — and small enough to patch.</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 36, justifyContent: 'center' }}>
          {[
            { v: '~16 K',   l: 'params · the model fits' },
            { v: '1 .h',    l: 'file · deploy artifact' },
            { v: '0',       l: 'runtime malloc' },
          ].map((x) => (
            <div key={x.l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 50, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1 }}>{x.v}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 6 }}>{x.l}</div>
            </div>
          ))}
        </div>

        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, color: 'rgba(255,255,255,0.95)', maxWidth: 320, lineHeight: 1.4, textAlign: 'right' }}>
          Next: how we calibrate the int8 scales — <strong>KL-divergence PTQ</strong>.
        </div>
      </div>
    </SlideFrame>
  );
}
