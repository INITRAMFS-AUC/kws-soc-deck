import SlideFrame from '../components/SlideFrame.jsx';

/* ─────────────────────────────────────────────────────────────────────────────
 * Slide 13 — bridge from "Mel Compact at 93.5 % float" (slide 12) to "post-
 * training quantization" (slide 14). Says what NNoM is, what we use it for,
 * and the three things it does well that matter for our chip. Verbose detail
 * lives in speaker notes.
 * ───────────────────────────────────────────────────────────────────────── */

const CARDS = [
  {
    head: 'INT8 only',
    body: 'Power-of-2 scales fold requantize to a bit-shift, not a divide. No FPU needed.',
  },
  {
    head: 'Ping-pong buffer',
    body: 'Two static activation buffers reused across layers. No malloc, no runtime — fits in 64 KB.',
  },
  {
    head: 'Codegen, not interpret',
    body: 'Keras → weights.h in one Python call. Linked into firmware, zero interpreter overhead.',
  },
];

export default function WhyNnom() {
  return (
    <SlideFrame topLeft="13 · Model">
      <div style={{ marginTop: 60 }}>
        <div className="eyebrow">What is NNoM</div>
        <h1 className="title" style={{ marginBottom: 16 }}>Neural Network on Microcontroller.</h1>
        <p className="subtitle" style={{ maxWidth: 1500, marginBottom: 80 }}>
          A lightweight library that compiles a trained Keras model into bare-metal int8 C. We use it to deploy <strong>Mel Compact</strong> onto our Hazard3 SoC — no FPU, 64 KB SRAM, no runtime.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
        {CARDS.map((c) => (
          <div key={c.head} style={{
            border: '1px solid var(--ink)',
            background: 'var(--paper)',
            padding: '40px 36px',
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
          }}>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 44,
              fontWeight: 600,
              color: 'var(--ink)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}>{c.head}</div>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 22,
              color: 'var(--ink-mute)',
              lineHeight: 1.5,
            }}>{c.body}</div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
