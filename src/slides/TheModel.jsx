import SlideFrame from '../components/SlideFrame.jsx';
import Callout from '../components/Callout.jsx';

export default function TheModel() {
  return (
    <SlideFrame topLeft="11 · Model">
      <div style={{ marginTop: 10 }}>
        <div className="eyebrow">build_mel_compact()</div>
        <h1 className="title" style={{ marginBottom: 10 }}>Mel-aware Conv1D, directly on the waveform.</h1>
        <p className="subtitle" style={{ maxWidth: 1700, marginBottom: 16 }}>
          A learnable spectral front-end <em>is</em> the model — the same tensor op the accelerator runs.
        </p>
      </div>

      {/* 3-panel pipeline: INPUT → MEL FRONT-END → BODY + HEAD */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 36px 1.6fr 36px 1fr', alignItems: 'stretch', gap: 0, marginBottom: 14 }}>

        {/* Panel 1: Input */}
        <div style={{ border: '1px solid var(--ink)', padding: '14px 18px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Input</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Raw PCM</div>
          <svg viewBox="0 0 160 60" style={{ width: '100%', height: 60, display: 'block', marginBottom: 12 }}>
            <path
              d="M0,30 Q5,15 10,32 T22,28 Q28,18 34,36 T46,26 Q52,12 58,34 T72,28 Q78,20 84,32 T96,26 Q104,14 110,34 T124,28 Q130,18 136,32 T148,26 Q154,22 160,30"
              fill="none" stroke="var(--ink)" strokeWidth="1.5"
            />
          </svg>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink-mute)', lineHeight: 1.5 }}>
            <div>8 000 samples</div>
            <div>8 kHz · int8</div>
            <div>1 s window</div>
          </div>
          <div style={{ marginTop: 14, padding: '8px 12px', background: 'var(--ink)', color: '#f4f1ea' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)' }}>shape</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500 }}>[8000, 1]</div>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: 30, fontWeight: 600 }}>→</div>

        {/* Panel 2: Mel front-end */}
        <div style={{ border: '2px solid var(--accent)', padding: '14px 18px', background: '#fff7f2' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>★ Mel front-end · conv1d_mel</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Conv1D · BN · ReLU · MaxPool</div>

          {/* Kernel grid mini preview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4, marginBottom: 10 }}>
            {Array.from({ length: 16 }, (_, i) => {
              const freq = 1 + i * 0.6;
              const amp = 14 - i * 0.35;
              let d = '';
              for (let k = 0; k < 33; k++) {
                const x = (k / 32) * 48;
                const env = Math.exp(-Math.pow((k - 16) / 11, 2));
                const y = 12 - Math.sin(k * 0.5 * freq) * env * amp;
                d += (k === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
              }
              return (
                <svg key={i} viewBox="0 0 48 24" style={{ width: '100%' }}>
                  <path d={d.trim()} fill="none" stroke="var(--accent)" strokeWidth="1.2" />
                </svg>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink)' }}>
              <div style={{ color: 'var(--ink-mute)', fontSize: 16, textTransform: 'uppercase', marginBottom: 2 }}>Filters</div>
              <div style={{ fontSize: 26, fontWeight: 500 }}>16</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink)' }}>
              <div style={{ color: 'var(--ink-mute)', fontSize: 16, textTransform: 'uppercase', marginBottom: 2 }}>Kernel</div>
              <div style={{ fontSize: 26, fontWeight: 500 }}>K=65</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink)' }}>
              <div style={{ color: 'var(--ink-mute)', fontSize: 16, textTransform: 'uppercase', marginBottom: 2 }}>Stride</div>
              <div style={{ fontSize: 26, fontWeight: 500 }}>16</div>
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: '8px 12px', background: 'var(--ink)', color: '#f4f1ea' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)' }}>in shape</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500 }}>[8000, 1]</div>
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--accent)', color: '#fff' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>out shape</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600 }}>[124, 16]</div>
            </div>
          </div>

          <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)', fontWeight: 600 }}>1 056 params · ~516 K MACs</div>
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: 30, fontWeight: 600 }}>→</div>

        {/* Panel 3: Body + Head */}
        <div style={{ border: '1px solid var(--ink)', padding: '14px 18px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Body + Head</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 600, marginBottom: 8 }}>3× Conv1D + GAP + Dense</div>

          {/* Stacked blocks visualization */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
            {[
              { label: 'Block 1 · 36 ch · pool ÷4', w: '100%' },
              { label: 'Block 2 · 36 ch · pool ÷2', w: '75%' },
              { label: 'Block 3 · 36 ch · 2× conv', w: '60%' },
            ].map((b) => (
              <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: b.w, height: 22, background: 'var(--ink)', minWidth: 40 }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', whiteSpace: 'nowrap' }}>{b.label}</div>
              </div>
            ))}
            <div style={{ height: 1, background: 'rgba(26,26,26,0.12)', margin: '4px 0' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)' }}>GAP → Dense 16 → Dropout 0.3</div>
          </div>

          <div style={{ padding: '8px 12px', background: 'var(--ink)', color: '#f4f1ea', marginBottom: 8 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)' }}>output</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500 }}>5 logits → Softmax</div>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)' }}>~14.8 K params · ~451 K MACs</div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
        {[
          { v: '~15.9 K', l: 'total params' },
          { v: '0.97 M', l: 'MACs · all int8' },
          { v: '5', l: 'output classes' },
          { v: '100 %', l: 'accelerable ops', accent: true },
        ].map((s) => (
          <div key={s.l} style={{ border: `1px solid ${s.accent ? 'var(--accent)' : 'var(--ink)'}`, padding: '10px 14px', background: s.accent ? 'var(--accent)' : 'var(--paper)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 500, color: s.accent ? '#fff' : 'var(--ink)', letterSpacing: '-0.02em' }}>{s.v}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: s.accent ? 'rgba(255,255,255,0.8)' : 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <Callout>
        Why <em>raw waveform</em>? A fixed front-end is preprocessing the accelerator can't touch. A learnable Conv1D <em>is</em> the spectral decomposition — and it's just a tensor op.
      </Callout>
    </SlideFrame>
  );
}
