import SlideFrame from '../components/SlideFrame.jsx';

const comparisonRows = [
  {
    aspect: 'Front-end',
    standard: 'Fixed MFCC / log-mel spectrogram (not learnable)',
    ours: <><strong>Learnable sinc filterbank</strong> · adapts during training</>,
  },
  {
    aspect: 'Domain',
    standard: '2D spectrogram image · [time, freq]',
    ours: <><strong>1D waveform throughout</strong> · no 2D convolutions</>,
  },
  {
    aspect: 'Conv type',
    standard: 'Depthwise-separable 2D (DS-CNN)',
    ours: <><strong>Plain 1D convolutions</strong> · single op the accelerator runs</>,
  },
  {
    aspect: 'Input',
    standard: 'Pre-computed float MFCC features',
    ours: <><strong>Raw int8 PCM</strong> · zero preprocessing on device</>,
  },
  {
    aspect: 'Pooling',
    standard: 'Strided conv or average pool',
    ours: <><strong>MaxPool</strong> after each block</>,
  },
  {
    aspect: 'Classifier',
    standard: 'GAP → Softmax (direct)',
    ours: <>GAP → <strong>Dense 16 → Dropout 0.3</strong> → Softmax</>,
  },
  {
    aspect: 'Size',
    standard: 'DS-CNN-S ≈ 25 K params · DS-CNN-L ≈ 420 K',
    ours: <><strong>~16 K params</strong> · smaller than DS-CNN-S</>,
  },
];

export default function LiteratureComparison() {
  return (
    <SlideFrame topLeft="13 · Model">
      <div style={{ marginTop: 36 }}>
        <div className="eyebrow">How this model is different</div>
        <h1 className="title" style={{ marginBottom: 12 }}>Standard KWS, axis by axis — and where we diverge.</h1>
        <p className="subtitle" style={{ maxWidth: 1700, marginBottom: 28 }}>
          Most published KWS networks (DS-CNN, MobileNet-derived) are 2D convs over a fixed log-mel spectrogram. We stay on the waveform, learn the front-end, keep the body simple — and quantise it INT8 for NNoM.
        </p>
      </div>

      <div style={{ border: '1px solid var(--ink)', background: 'var(--paper)', marginBottom: 22 }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--ink)', background: 'var(--ink)', color: '#f4f1ea' }}>
          <div style={{ padding: '12px 22px', fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Aspect</div>
          <div style={{ padding: '12px 22px', fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', borderLeft: '1px solid rgba(244,241,234,0.2)' }}>Standard KWS · DS-CNN, MobileNet</div>
          <div style={{ padding: '12px 22px', fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', borderLeft: '1px solid rgba(244,241,234,0.2)', background: 'var(--accent)', color: '#fff' }}>★ This model</div>
        </div>

        {/* Rows */}
        {comparisonRows.map((row, i) => (
          <div
            key={row.aspect}
            style={{
              display: 'grid',
              gridTemplateColumns: '200px 1fr 1fr',
              borderBottom: i < comparisonRows.length - 1 ? '1px solid rgba(26,26,26,0.1)' : 'none',
            }}
          >
            <div style={{ padding: '11px 22px', fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink)', fontWeight: 600, letterSpacing: '0.04em', borderRight: '1px solid rgba(26,26,26,0.1)' }}>
              {row.aspect}
            </div>
            <div style={{ padding: '11px 22px', fontFamily: 'var(--font-sans)', fontSize: 20, color: 'var(--ink-mute)', lineHeight: 1.4, borderRight: '1px solid rgba(26,26,26,0.1)' }}>
              {row.standard}
            </div>
            <div style={{ padding: '11px 22px', fontFamily: 'var(--font-sans)', fontSize: 20, color: 'var(--ink)', lineHeight: 1.4, background: '#fff7f2' }}>
              {row.ours}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.1fr', gap: 18, marginBottom: 6 }}>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink)', padding: '16px 20px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Closest · SincNet</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, color: 'var(--ink)', lineHeight: 1.4 }}>
            Ravanelli '18. Learnable sinc filters on raw waveform — but at <strong>full resolution then pools</strong>.
          </div>
        </div>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink)', padding: '16px 20px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Closest · LEAF</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, color: 'var(--ink)', lineHeight: 1.4 }}>
            Google '21. Gabor filters + <strong>learnable</strong> pooling — heavier and not cleanly INT8-quantisable.
          </div>
        </div>
        <div style={{ background: 'var(--accent)', color: '#fff', padding: '16px 22px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>★ This model</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, color: '#fff', lineHeight: 1.4 }}>
            <strong>Stride 16 fused into the filter</strong> — 16× compute saving up front. Plain MaxPool. NNoM-quantisable INT8 without accuracy collapse.
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
