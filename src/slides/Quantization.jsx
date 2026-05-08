import SlideFrame from '../components/SlideFrame.jsx';

const ptqSteps = [
  {
    num: '01',
    title: 'Train float32 model',
    body: 'Standard Keras training. No quantization-aware tricks.',
  },
  {
    num: '02',
    title: 'Collect activation histograms',
    body: 'Run 1024 calibration samples. Capture per-tensor distribution at every layer output.',
  },
  {
    num: '03',
    title: 'KL-divergence threshold search',
    body: 'For each tensor, sweep candidate clip thresholds. Pick the one that minimises D_KL(P_float ‖ Q_int8).',
  },
  {
    num: '04',
    title: 'Per-tensor int8 quantization',
    body: 'Weights and activations → int8 with power-of-2 scales. BN folded into preceding conv. Bias kept int32.',
  },
  {
    num: '05',
    title: 'Emit weights.h',
    body: 'nnom_generate_model → C header. Linked into firmware. Same weights run on host and on SoC.',
  },
];

const accuracyBars = [
  { label: 'float32', value: '92.4 %', pct: 92.4, accent: false, dim: false },
  { label: 'int8 min-max', value: '86.1 %', pct: 86.1, accent: false, dim: true },
  { label: 'int8 KLD', value: '90.0 %', pct: 90.0, accent: true, dim: false },
];

export default function Quantization() {
  return (
    <SlideFrame topLeft="13 · Model">
      <div style={{ marginTop: 36 }}>
        <div className="eyebrow">From float32 to int8</div>
        <h1 className="title" style={{ marginBottom: 12 }}>Post-training quantization, KL-divergence calibrated.</h1>
        <p className="subtitle" style={{ maxWidth: 1700, marginBottom: 32 }}>
          No QAT. No fine-tune. Train in float, calibrate on a held-out batch, ship int8 — and watch the accuracy.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 28, marginBottom: 22 }}>

        {/* PTQ pipeline */}
        <div style={{ border: '1px solid var(--ink)', background: 'var(--paper)', padding: '24px 28px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 14 }}>PTQ pipeline · NNoM</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {ptqSteps.map((step, i) => (
              <div
                key={step.num}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr',
                  gap: 14,
                  alignItems: 'flex-start',
                  padding: '12px 14px',
                  background: i % 2 === 0 ? 'rgba(26,26,26,0.03)' : 'transparent',
                  borderBottom: i < ptqSteps.length - 1 ? '1px solid rgba(26,26,26,0.08)' : 'none',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', paddingTop: 2 }}>{step.num}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--ink)', fontWeight: 600, marginBottom: 3 }}>{step.title}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, color: 'var(--ink-mute)', lineHeight: 1.4 }}>{step.body}</div>
                </div>
              </div>
            ))}
          </div>

          {/* KLD note */}
          <div style={{ marginTop: 18, padding: '14px 16px', background: '#fff7f2', border: '1px solid var(--accent)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Why KLD over min-max</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, color: 'var(--ink)', lineHeight: 1.5 }}>
              Min-max is dominated by outliers — one large activation collapses the int8 dynamic range for everyone else. KLD finds the clip threshold that preserves the shape of the distribution, accepting saturation on the tail.
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Accuracy bars */}
          <div style={{ border: '1px solid var(--ink)', background: 'var(--paper)', padding: '22px 26px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 16 }}>Top-1 accuracy · 5-class</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {accuracyBars.map((bar) => (
                <div key={bar.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 18, marginBottom: 5 }}>
                    <span style={{ color: bar.accent ? 'var(--accent)' : 'var(--ink-mute)', fontWeight: bar.accent ? 600 : 400 }}>{bar.label}</span>
                    <span style={{ color: bar.accent ? 'var(--accent)' : (bar.dim ? 'var(--ink-mute)' : 'var(--ink)'), fontWeight: bar.accent ? 600 : 400 }}>{bar.value}</span>
                  </div>
                  <div style={{ height: 20, background: 'rgba(26,26,26,0.08)', position: 'relative' }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, height: '100%',
                      width: `${bar.pct}%`,
                      background: bar.accent ? 'var(--accent)' : (bar.dim ? 'rgba(26,26,26,0.35)' : 'var(--ink)'),
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(26,26,26,0.1)', fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink-mute)' }}>
              float → int8 drop <span style={{ color: 'var(--accent)', fontWeight: 600 }}>−2.4 pts</span>
            </div>
          </div>

          {/* Takeaway */}
          <div style={{ background: 'var(--ink)', color: '#f4f1ea', padding: '18px 24px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>The takeaway</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, lineHeight: 1.4 }}>
              2.4 pts is the price of running on int8 silicon with no FP unit. KLD recovers ~4 pts vs naive min-max for free.
            </div>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
