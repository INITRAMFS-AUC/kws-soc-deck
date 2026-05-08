import SlideFrame from '../components/SlideFrame.jsx';

export default function StandardMFCC() {
  return (
    <SlideFrame topLeft="11 · Model">
      <div style={{ marginTop: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Industry baseline</div>
        <h1 className="title" style={{ fontSize: 48, marginBottom: 8 }}>
          Standard KWS: fixed MFCC front-end feeds the network.
        </h1>
        <p className="subtitle" style={{ fontSize: 32, maxWidth: 1700, marginBottom: 16 }}>
          The dominant approach on the Google Speech Commands benchmark uses a fixed spectral transform before the network — a well-established two-stage pipeline described by Zhang et al. (2017).
        </p>
      </div>

      {/* 3-panel pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 36px 1.6fr 36px 0.9fr', alignItems: 'stretch', gap: 0, marginBottom: 16 }}>

        {/* Input */}
        <div style={{ border: '1px solid var(--ink)', padding: '14px 18px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Input</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Raw PCM</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--ink-mute)', lineHeight: 1.7 }}>
            <div>8 000 samples</div>
            <div>8 kHz · 1 s</div>
          </div>
          <div style={{ marginTop: 10, padding: '6px 10px', background: 'var(--ink)', color: '#f4f1ea' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(244,241,234,0.6)' }}>shape</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 500 }}>[8000, 1]</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 26, color: 'var(--ink-mute)' }}>→</div>

        {/* MFCC front-end */}
        <div style={{ border: '1px solid var(--ink)', padding: '14px 18px', background: 'rgba(26,26,26,0.04)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Stage 1 · Fixed front-end
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 600, marginBottom: 10 }}>MFCC</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[
              ['Frame + Hamming window', '25 ms / 10 ms hop', '100 frames'],
              ['FFT 512-pt', '', '~460 K mults'],
              ['Power spectrum |·|²', '', '~26 K ops'],
              ['Mel filterbank', '40 triangular bands', '~1.0 M MACs'],
              ['Log compression', 'ln(·)', '~4 K ops'],
              ['DCT-II', '→ MFCC features', '~130 K ops'],
            ].map(([a, b, c]) => (
              <div key={a} style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8, padding: '4px 8px', background: 'rgba(26,26,26,0.05)', fontFamily: 'var(--font-mono)', fontSize: 15 }}>
                <span style={{ color: 'var(--ink)' }}>{a}{b ? <span style={{ color: 'var(--ink-mute)' }}> · {b}</span> : ''}</span>
                <span style={{ color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>{c}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ padding: '6px 10px', background: 'rgba(26,26,26,0.08)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)' }}>out shape</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 500 }}>[100, 40]</div>
            </div>
            <div style={{ padding: '6px 10px', background: 'rgba(26,26,26,0.08)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)' }}>subtotal</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 500 }}>~1.6 M ops</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 26, color: 'var(--ink-mute)' }}>→</div>

        {/* CNN body */}
        <div style={{ border: '2px solid var(--ink)', padding: '14px 18px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Stage 2 · Network</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>DS-CNN</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--ink-mute)', lineHeight: 1.7 }}>
            <div>Learned weights</div>
            <div>2D convolutions</div>
            <div>over Mel features</div>
          </div>
          <div style={{ marginTop: 10, padding: '6px 10px', background: 'var(--ink)', color: '#f4f1ea' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)' }}>reported MACs</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 500 }}>~5.4 M</div>
          </div>
          <div style={{ marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)' }}>94.4% top-1</div>
        </div>
      </div>

      {/* 3-card framing strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div style={{ border: '1px solid var(--ink)', padding: '10px 14px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6, fontWeight: 600 }}>Well established</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, color: 'var(--ink)', lineHeight: 1.4 }}>MFCC has decades of speech-processing research behind it. Dedicated DSP accelerators exist on many commercial SoCs.</div>
        </div>
        <div style={{ border: '1px solid var(--ink)', padding: '10px 14px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6, fontWeight: 600 }}>Two separate stages</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, color: 'var(--ink)', lineHeight: 1.4 }}>Front-end and network are independent compute stages. On a bare RISC-V without a DSP, both share the same CPU budget.</div>
        </div>
        <div style={{ border: '1px solid var(--ink)', padding: '10px 14px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6, fontWeight: 600 }}>Benchmark practice</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, color: 'var(--ink)', lineHeight: 1.4 }}>Published MAC counts typically cover the network. MFCC is treated as preprocessing and reported separately or omitted.</div>
        </div>
      </div>

      {/* Citation */}
      <div style={{ padding: '8px 14px', border: '1px solid rgba(26,26,26,0.15)', background: 'rgba(26,26,26,0.03)', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', lineHeight: 1.5 }}>
        Y. Zhang et al., "Hello Edge: Keyword Spotting on Microcontrollers," <em>arXiv:1711.07128</em>, 2017 — DS-CNN-S configuration, Google Speech Commands v1.
      </div>
    </SlideFrame>
  );
}
