import SlideFrame from '../components/SlideFrame.jsx';
import MacShareBar from '../components/MacShareBar.jsx';

const stackBlock = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
};

/* All 11 Speech-Commands-style classes plus the unknown bucket.
 * Probabilities are illustrative — `yes` dominates, the rest are small. */
const SOFTMAX_CLASSES = [
  { label: 'yes',       w: '92%',  prob: '.92',  accent: true },
  { label: 'no',        w: '4.0%', prob: '.04' },
  { label: 'up',        w: '1.2%', prob: '.01' },
  { label: 'down',      w: '0.8%', prob: '.01' },
  { label: 'left',      w: '0.5%', prob: '.01' },
  { label: 'right',     w: '0.4%', prob: '.00' },
  { label: 'on',        w: '0.4%', prob: '.00' },
  { label: 'off',       w: '0.3%', prob: '.00' },
  { label: 'stop',      w: '0.2%', prob: '.00' },
  { label: 'go',        w: '0.1%', prob: '.00' },
  { label: '_unknown_', w: '0.1%', prob: '.00' },
];

export default function ConvBodyClassifier() {
  const gap36Dots = Array.from({ length: 36 }, (_, i) => (
    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ink)' }} />
  ));

  const dense16Dots = Array.from({ length: 16 }, (_, i) => (
    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />
  ));

  return (
    <SlideFrame topLeft="13 · Model">
      <div style={{ marginTop: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>From mel features to a class</div>
        <h1 className="title" style={{ fontSize: 48, marginBottom: 6 }}>Three plain 1D conv blocks, then collapse.</h1>
        <p className="subtitle" style={{ fontSize: 32, maxWidth: 1700, marginBottom: 16 }}>
          No depthwise-separable, no 2D — plain Conv1D · BN · ReLU · MaxPool throughout. GAP and a thin dense head turn 36 channels into 11 logits.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, marginBottom: 12 }}>

        {/* Conv blocks · 31/15/15 frame ratio reflected in 90/44/44 widths. */}
        <div style={{ flex: 1.4, border: '1px solid var(--ink)', padding: '14px 16px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 600, marginBottom: 6 }}>Conv1D blocks ×3</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink-mute)', marginBottom: 18 }}>
            36 channels · K=3 · BN · ReLU · MaxPool · plain (not depthwise-separable)
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: 12, height: 150 }}>

            {/* Block 1 — output 31 × 36 (widest) */}
            <div style={{ ...stackBlock }}>
              <div style={{ position: 'relative', width: 90, height: 130 }}>
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.12, transform: 'translate(6px,-6px)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.25, transform: 'translate(3px,-3px)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink)', marginTop: 4 }}>Block 1 · 31 × 36</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)', fontWeight: 600 }}>pool ↓4×</div>
            </div>

            {/* Block 2 — output 15 × 36 */}
            <div style={{ ...stackBlock }}>
              <div style={{ position: 'relative', width: 44, height: 130 }}>
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.12, transform: 'translate(6px,-6px)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.25, transform: 'translate(3px,-3px)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink)', marginTop: 4 }}>Block 2 · 15 × 36</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)', fontWeight: 600 }}>pool ↓2×</div>
            </div>

            {/* Block 3 — output 15 × 36 (no pool, double conv) */}
            <div style={{ ...stackBlock }}>
              <div style={{ position: 'relative', width: 44, height: 130 }}>
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.12, transform: 'translate(6px,-6px)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.25, transform: 'translate(3px,-3px)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink)', marginTop: 4 }}>Block 3 · 15 × 36</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)' }}>2× conv · no pool</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', fontSize: 32, padding: '0 10px' }}>→</div>

        {/* GAP + Dense */}
        <div style={{ flex: 0.9, border: '1px solid var(--ink)', padding: '14px 16px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 600, marginBottom: 6 }}>GAP → Dense 16</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', marginBottom: 16 }}>
            15 × 36 → 36 → 16 · ReLU · dropout p=0.3
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 7px)', gap: 4 }}>
                {gap36Dots}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', marginTop: 8, textAlign: 'center' }}>36 GAP outputs</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, color: 'var(--ink-mute)' }}>↓</div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 7px)', gap: 4 }}>
                {dense16Dots}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', marginTop: 8, textAlign: 'center' }}>Dense 16 · ReLU</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', fontSize: 32, padding: '0 10px' }}>→</div>

        {/* Softmax · 11 classes */}
        <div style={{ flex: 1.3, border: '1px solid var(--ink)', padding: '14px 16px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 600, marginBottom: 6 }}>Softmax · 11 classes</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', marginBottom: 12 }}>Dense 16 → 11 · L2</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 17 }}>
            {SOFTMAX_CLASSES.map((c) => (
              <div key={c.label} style={{ display: 'grid', gridTemplateColumns: '88px 1fr 32px', gap: 8, alignItems: 'center' }}>
                <span style={{ color: c.accent ? 'var(--accent)' : 'var(--ink-mute)', fontWeight: c.accent ? 600 : 400 }}>{c.label}</span>
                <div style={{
                  height: 9,
                  background: c.accent ? 'var(--accent)' : 'var(--ink)',
                  opacity: c.accent ? 1 : 0.22,
                  width: c.w,
                  minWidth: 2,
                }} />
                <span style={{ color: c.accent ? 'var(--accent)' : 'var(--ink-mute)', textAlign: 'right', fontWeight: c.accent ? 600 : 400 }}>{c.prob}</span>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent)', marginTop: 14, fontWeight: 600 }}>argmax → "yes"</div>
        </div>
      </div>

      <p className="body" style={{ maxWidth: 1700, fontSize: 20, marginBottom: 0 }}>
        Plain 1D convolutions — deliberately simpler than DS-CNN. Standard KWS networks use depthwise-separable 2D convs on a spectrogram. We stay 1D throughout, NNoM-quantisable INT8, ~16 K params total.
      </p>

      {/* Same persistent bar as slides 11 P2 + 12 — body segment foregrounded. */}
      <MacShareBar focus="body" annotate="↑ this slide explains the 47% segment" />
    </SlideFrame>
  );
}
