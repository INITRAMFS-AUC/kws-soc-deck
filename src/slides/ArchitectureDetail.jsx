import SlideFrame from '../components/SlideFrame.jsx';

const tableRows = [
  {
    layer: 'Input',
    detail: 'raw 8 kHz int8 waveform · peak-normalised → float32',
    output: '[8000, 1]',
    params: '',
  },
  {
    layer: 'conv1d_mel',
    detail: 'Conv1D · 65 taps · stride 16 · 16 filters · sinc+Hamming init · BN · ReLU · MaxPool ÷4',
    output: '[124, 16]',
    params: '1 056',
    accent: true,
  },
  {
    layer: 'Block 1 · Conv1D',
    detail: '36 ch · K=3 · BN · ReLU · MaxPool ÷4',
    output: '[31, 36]',
    params: '',
  },
  {
    layer: 'Block 2 · Conv1D',
    detail: '36 ch · K=3 · BN · ReLU · MaxPool ÷2',
    output: '[15, 36]',
    params: '',
  },
  {
    layer: 'Block 3 · 2× Conv1D',
    detail: '36 ch · K=3 · BN · ReLU · stacked depth, no pool',
    output: '[15, 36]',
    params: '',
  },
  {
    layer: 'global_avg_pool',
    detail: 'collapses time axis → channel vector',
    output: '[36]',
    params: '',
  },
  {
    layer: 'dense_fc · dropout',
    detail: '36 → 16 · ReLU · dropout p = 0.3',
    output: '[16]',
    params: '',
  },
  {
    layer: 'dense_out',
    detail: '16 → 11 · Softmax',
    output: '[11]',
    params: '',
  },
];

const stats = [
  { value: '~15.9 K', label: 'total params', accent: false },
  { value: '0.97 M', label: 'MACs · all int8', accent: false },
  { value: '11', label: 'output classes', accent: false },
  { value: '1D only', label: 'no 2D convolutions', accent: true },
];

export default function ArchitectureDetail() {
  return (
    <SlideFrame topLeft="12 · Model">
      <div style={{ marginTop: 40 }}>
        <div className="eyebrow">Mel-compact architecture</div>
        <h1 className="title" style={{ marginBottom: 40 }}>Layer-by-layer breakdown.</h1>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid var(--ink)', background: 'var(--paper)', marginBottom: 36 }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr 140px 100px',
          background: 'var(--ink)',
          color: '#f4f1ea',
          fontFamily: 'var(--font-mono)',
        }}>
          <div style={{ padding: '10px 18px', fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Layer</div>
          <div style={{ padding: '10px 18px', fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', borderLeft: '1px solid rgba(244,241,234,0.15)' }}>Detail</div>
          <div style={{ padding: '10px 18px', fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', borderLeft: '1px solid rgba(244,241,234,0.15)' }}>Output</div>
          <div style={{ padding: '10px 18px', fontSize: 16, letterSpacing: '0.08em', textTransform: 'uppercase', borderLeft: '1px solid rgba(244,241,234,0.15)' }}>Params</div>
        </div>

        {/* Rows */}
        {tableRows.map((row, i) => (
          <div
            key={row.layer}
            style={{
              display: 'grid',
              gridTemplateColumns: '200px 1fr 140px 100px',
              borderBottom: i < tableRows.length - 1 ? '1px solid rgba(26,26,26,0.1)' : 'none',
              background: row.accent ? '#fff7f2' : 'transparent',
            }}
          >
            <div style={{
              padding: '11px 18px',
              fontFamily: 'var(--font-mono)',
              fontSize: 18,
              color: row.accent ? 'var(--accent)' : 'var(--ink)',
              fontWeight: row.accent ? 600 : 500,
              borderRight: '1px solid rgba(26,26,26,0.1)',
            }}>
              {row.layer}
            </div>
            <div style={{
              padding: '11px 18px',
              fontFamily: 'var(--font-mono)',
              fontSize: 18,
              color: 'var(--ink-mute)',
              lineHeight: 1.4,
              borderRight: '1px solid rgba(26,26,26,0.1)',
            }}>
              {row.detail}
            </div>
            <div style={{
              padding: '11px 18px',
              fontFamily: 'var(--font-mono)',
              fontSize: 18,
              color: row.accent ? 'var(--accent)' : 'var(--ink)',
              fontWeight: row.accent ? 600 : 400,
              borderRight: '1px solid rgba(26,26,26,0.1)',
            }}>
              {row.output}
            </div>
            <div style={{
              padding: '11px 18px',
              fontFamily: 'var(--font-mono)',
              fontSize: 18,
              color: row.accent ? 'var(--accent)' : 'var(--ink-mute)',
              fontWeight: row.accent ? 600 : 400,
            }}>
              {row.params}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 30 }}>
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              border: `1px solid ${s.accent ? 'var(--accent)' : 'var(--ink)'}`,
              padding: '18px 22px',
              background: s.accent ? 'var(--accent)' : 'var(--paper)',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 44,
              fontWeight: 500,
              color: s.accent ? '#fff' : 'var(--ink)',
              letterSpacing: '-0.02em',
              marginBottom: 6,
            }}>
              {s.value}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 16,
              color: s.accent ? 'rgba(255,255,255,0.8)' : 'var(--ink-mute)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
