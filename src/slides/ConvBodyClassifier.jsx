import SlideFrame from '../components/SlideFrame.jsx';

const stackBlock = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 10,
};

export default function ConvBodyClassifier() {
  const gap36Dots = Array.from({ length: 36 }, (_, i) => (
    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ink)' }} />
  ));

  const dense16Dots = Array.from({ length: 16 }, (_, i) => (
    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />
  ));

  return (
    <SlideFrame topLeft="13 · Model">
      <div style={{ marginTop: 40 }}>
        <div className="eyebrow">From mel features to a class</div>
        <h1 className="title" style={{ marginBottom: 14 }}>Three plain 1D conv blocks, then collapse.</h1>
        <p className="subtitle" style={{ maxWidth: 1700, marginBottom: 60 }}>
          No depthwise-separable, no 2D — plain Conv1D · BN · ReLU · MaxPool throughout. GAP and a thin dense head turn 36 channels into 5 logits.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, marginBottom: 30 }}>

        {/* Conv blocks */}
        <div style={{ flex: 1.7, border: '1px solid var(--ink)', padding: 24, background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 34, fontWeight: 600, marginBottom: 8 }}>Conv1D blocks ×3</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--ink-mute)', marginBottom: 32 }}>
            36 channels · K=3 · BN · ReLU · MaxPool · plain (not depthwise-separable)
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: 12, height: 180 }}>

            {/* Block 1 */}
            <div style={{ ...stackBlock }}>
              <div style={{ position: 'relative', width: 90, height: 130 }}>
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.12, transform: 'translate(6px,-6px)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.25, transform: 'translate(3px,-3px)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--ink)', marginTop: 4 }}>Block 1 · 31 × 36</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent)', fontWeight: 600 }}>pool ↓4×</div>
            </div>

            {/* Block 2 */}
            <div style={{ ...stackBlock }}>
              <div style={{ position: 'relative', width: 54, height: 130 }}>
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.12, transform: 'translate(6px,-6px)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.25, transform: 'translate(3px,-3px)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--ink)', marginTop: 4 }}>Block 2 · 15 × 36</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent)', fontWeight: 600 }}>pool ↓2×</div>
            </div>

            {/* Block 3 */}
            <div style={{ ...stackBlock }}>
              <div style={{ position: 'relative', width: 42, height: 130 }}>
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.12, transform: 'translate(6px,-6px)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)', opacity: 0.25, transform: 'translate(3px,-3px)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'var(--ink)' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--ink)', marginTop: 4 }}>Block 3 · 15 × 36</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink-mute)' }}>2× conv · no pool</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', fontSize: 36, padding: '0 14px' }}>→</div>

        {/* GAP + Dense */}
        <div style={{ flex: 1, border: '1px solid var(--ink)', padding: 30, background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 34, fontWeight: 600, marginBottom: 8 }}>GAP → Dense 16</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--ink-mute)', marginBottom: 32 }}>
            15×36 → 36 → 16 · ReLU · dropout p=0.3
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 7px)', gap: 4 }}>
                {gap36Dots}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink-mute)', marginTop: 10, textAlign: 'center' }}>36 GAP outputs</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, color: 'var(--ink-mute)' }}>↓</div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 7px)', gap: 4 }}>
                {dense16Dots}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink-mute)', marginTop: 10, textAlign: 'center' }}>Dense 16 · ReLU</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', fontSize: 36, padding: '0 14px' }}>→</div>

        {/* Softmax */}
        <div style={{ flex: 1.1, border: '1px solid var(--ink)', padding: 30, background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 34, fontWeight: 600, marginBottom: 8 }}>Softmax · 5 classes</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--ink-mute)', marginBottom: 24 }}>Dense 16 → 5 · L2</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'var(--font-mono)', fontSize: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 38px', gap: 10, alignItems: 'center' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>yes</span>
              <div style={{ height: 12, background: 'var(--accent)', width: '92%' }} />
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>.92</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 38px', gap: 10, alignItems: 'center' }}>
              <span style={{ color: 'var(--ink-mute)' }}>no</span>
              <div style={{ height: 12, background: 'var(--ink)', opacity: 0.32, width: '5%' }} />
              <span style={{ color: 'var(--ink-mute)' }}>.05</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 38px', gap: 10, alignItems: 'center' }}>
              <span style={{ color: 'var(--ink-mute)' }}>up</span>
              <div style={{ height: 12, background: 'var(--ink)', opacity: 0.18, width: '1.5%' }} />
              <span style={{ color: 'var(--ink-mute)' }}>.01</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 38px', gap: 10, alignItems: 'center' }}>
              <span style={{ color: 'var(--ink-mute)' }}>down</span>
              <div style={{ height: 12, background: 'var(--ink)', opacity: 0.18, width: '1.5%' }} />
              <span style={{ color: 'var(--ink-mute)' }}>.01</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 38px', gap: 10, alignItems: 'center' }}>
              <span style={{ color: 'var(--ink-mute)' }}>_unk_</span>
              <div style={{ height: 12, background: 'var(--ink)', opacity: 0.14, width: '0.6%' }} />
              <span style={{ color: 'var(--ink-mute)' }}>.00</span>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--accent)', marginTop: 22, fontWeight: 600 }}>argmax → "yes"</div>
        </div>
      </div>

      <p className="body" style={{ maxWidth: 1700, fontSize: 28, marginBottom: 0 }}>
        Plain 1D convolutions — deliberately simpler than DS-CNN. Standard KWS networks use depthwise-separable 2D convs on a spectrogram. We stay 1D throughout, NNoM-quantisable INT8, ~16K params total.
      </p>
    </SlideFrame>
  );
}
