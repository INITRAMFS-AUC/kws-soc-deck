import SlideFrame from '../components/SlideFrame.jsx';

/* ─────────────────────────────────────────────────────────────────────────────
 * Slide 14 — bridge from "NNoM is our runtime" (slide 13) to "post-training
 * quantization" (slide 15). NNoM runs whatever model we hand it, but the
 * model is only as good as the data it trained on. We collected our own —
 * 4 000 samples on the real INMP441, deliberately diverse across people and
 * environments, so the int8 weights we ship are calibrated to what the chip
 * will actually hear. Detail in speaker notes.
 * ───────────────────────────────────────────────────────────────────────── */

const CARDS = [
  {
    head: 'Different people',
    body: 'Voices, accents, distances vary. No single-speaker overfit — the model has to handle the next person walking up to the mic.',
  },
  {
    head: 'Different environments',
    body: 'Quiet rooms, noisy rooms, near-field, far-field. The acoustics the model trains on match what it will hear in the field.',
  },
  {
    head: 'Same hardware path',
    body: 'Recorded through the exact INMP441 and PCB the firmware reads from. Whatever the analog path adds is already in training, not a surprise on deployment.',
  },
];

export default function OurData() {
  return (
    <SlideFrame topLeft="14 · Model">
      <div style={{ marginTop: 60 }}>
        <div className="eyebrow">Our dataset</div>
        <h1 className="title" style={{ marginBottom: 16 }}>We recorded <strong style={{ color: 'var(--accent)' }}>4 000 samples</strong> on the real mic.</h1>
        <p className="subtitle" style={{ maxWidth: 1500, marginBottom: 80 }}>
          GSC is studio audio in controlled conditions — real deployment isn't. To make <strong>Mel Compact</strong> generalize beyond the benchmark, the training data has to look like what the chip will actually hear.
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
              fontSize: 38,
              fontWeight: 600,
              color: 'var(--ink)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}>{c.head}</div>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 21,
              color: 'var(--ink-mute)',
              lineHeight: 1.5,
            }}>{c.body}</div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
