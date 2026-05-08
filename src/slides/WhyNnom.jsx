import SlideFrame from '../components/SlideFrame.jsx';

/* ─────────────────────────────────────────────────────────────────────────────
 * Slide 13 — bridge from "Mel Compact at 93.5 % float" (slide 12 leaderboard)
 * to "post-training quantization, KL-divergence calibrated" (slide 14).
 *
 * The slide has two beats: a definition of NNoM up top (so the audience
 * knows what the runtime IS before we say why we picked it), then three
 * cards naming the three properties that make it the right fit for our
 * chip — power-of-2 INT8, a ping-pong static activation buffer, and Keras
 * codegen instead of an interpreter. Verbose detail in speaker notes.
 * ───────────────────────────────────────────────────────────────────────── */

const CARDS = [
  {
    eyebrow: 'Layer-wise INT8 · power-of-2 scales',
    big:    'shift',
    bigLabel: 'not divide',
    claim:  'INT8 weights, INT32 accumulators, scales restricted to powers of two — requantize is a bit-shift, not an idiv. No soft-float helpers from libgcc, no FPU needed.',
  },
  {
    eyebrow: 'Ping-pong activation buffer',
    big:    '0 malloc',
    bigLabel: 'static, sized at compile time',
    claim:  'NNoM ping-pongs activations between two static buffers sized for the worst layer. No C runtime, no tensor-arena to grow — what links is what runs.',
  },
  {
    eyebrow: 'Keras → C with one Python call',
    big:    '1 line',
    bigLabel: 'nnom_generate_model(model)',
    claim:  'Trained Keras model → weights.h, linked straight into firmware. Onboard pre-compiled — zero interpreter loss at runtime.',
  },
];

export default function WhyNnom() {
  return (
    <SlideFrame topLeft="13 · Model">
      <div style={{ marginTop: 36 }}>
        <div className="eyebrow">NNoM · int8 inference runtime for MCUs</div>
        <h1 className="title" style={{ marginBottom: 10 }}>A lightweight neural-network library built for microcontrollers.</h1>
        <p className="subtitle" style={{ maxWidth: 1700, marginBottom: 32 }}>
          <strong>NNoM (Neural Network on Microcontroller)</strong> is a high-level inference library that turns a trained Keras model into bare-metal C. No interpreter, no malloc, no C runtime. Layer-wise INT8 quantization throughout — built for the chip we built (Hazard3 RV32IMAC · 36 MHz · 64 KB SRAM · no FPU).
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
