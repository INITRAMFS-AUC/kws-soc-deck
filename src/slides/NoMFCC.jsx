import SlideFrame from '../components/SlideFrame.jsx';

export default function NoMFCC() {
  const rowBase = {
    display: 'grid',
    gridTemplateColumns: '26px 1fr 110px',
    gap: 10,
    alignItems: 'center',
    padding: '5px 8px',
  };

  return (
    <SlideFrame topLeft="11C · Model">
      <div style={{ marginTop: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>Design decision · cost analysis</div>
        <h1 className="title" style={{ fontSize: 48, marginBottom: 4 }}>We fuse front-end and body — one unified, lower-cost pipeline.</h1>
        <p className="subtitle" style={{ fontSize: 32, maxWidth: 1700, marginBottom: 10 }}>
          MFCC is a proven front-end — but it adds a separate compute stage that shares the CPU on a bare RISC-V core. A learnable Conv1D merges spectral analysis directly into the model, reducing total system MACs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>

        {/* Standard MFCC pipeline */}
        <div style={{ border: '1px solid var(--ink)', padding: '12px 18px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            Reference pipeline · Zhang et al., 2017
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 26, fontWeight: 600, marginBottom: 10 }}>PCM → MFCC → CNN</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 18 }}>
            <div style={{ ...rowBase, background: 'rgba(26,26,26,0.04)' }}>
              <span style={{ color: 'var(--ink-mute)', fontSize: 14 }}>01</span>
              <span style={{ color: 'var(--ink)' }}>Frame · window 25 ms / hop 10 ms</span>
              <span style={{ color: 'var(--ink-mute)', textAlign: 'right' }}>100 frames</span>
            </div>
            <div style={{ ...rowBase, background: 'rgba(26,26,26,0.04)' }}>
              <span style={{ color: 'var(--ink-mute)', fontSize: 14 }}>02</span>
              <span style={{ color: 'var(--ink)' }}>FFT 512-pt</span>
              <span style={{ color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>~ 460 K ops</span>
            </div>
            <div style={{ ...rowBase, background: 'rgba(26,26,26,0.04)' }}>
              <span style={{ color: 'var(--ink-mute)', fontSize: 14 }}>03</span>
              <span style={{ color: 'var(--ink)' }}>Power spectrum |·|²</span>
              <span style={{ color: 'var(--ink-mute)', textAlign: 'right' }}>~ 26 K ops</span>
            </div>
            <div style={{ ...rowBase, background: 'rgba(26,26,26,0.04)' }}>
              <span style={{ color: 'var(--ink-mute)', fontSize: 14 }}>04</span>
              <span style={{ color: 'var(--ink)' }}>Mel triangular filterbank · 40 bands</span>
              <span style={{ color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>~ 1.0 M MACs</span>
            </div>
            <div style={{ ...rowBase, background: 'rgba(26,26,26,0.04)' }}>
              <span style={{ color: 'var(--ink-mute)', fontSize: 14 }}>05</span>
              <span style={{ color: 'var(--ink)' }}>Log compression · ln(·)</span>
              <span style={{ color: 'var(--ink-mute)', textAlign: 'right' }}>~ 4 K ops</span>
            </div>
            <div style={{ ...rowBase, background: 'rgba(26,26,26,0.04)' }}>
              <span style={{ color: 'var(--ink-mute)', fontSize: 14 }}>06</span>
              <span style={{ color: 'var(--ink)' }}>DCT-II → MFCC features</span>
              <span style={{ color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>~ 130 K ops</span>
            </div>
            <div style={{ ...rowBase, background: 'var(--ink)', color: '#f4f1ea', marginTop: 6 }}>
              <span style={{ color: 'rgba(244,241,234,0.5)', fontSize: 14 }}>07</span>
              <span style={{ color: '#f4f1ea' }}>DS-CNN body (reported separately)</span>
              <span style={{ color: 'var(--accent)', fontWeight: 600, textAlign: 'right' }}>~ 5.4 M MACs</span>
            </div>
          </div>

          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(26,26,26,0.05)', border: '1px solid rgba(26,26,26,0.15)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Preprocessing cost</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, color: 'var(--ink)', fontWeight: 500, marginTop: 3 }}>~ 1.6 M ops · runs before the network</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--ink-mute)', marginTop: 3 }}>Runs on the CPU ahead of the network — adds to total system latency and power.</div>
          </div>
        </div>

        {/* Our pipeline */}
        <div style={{ border: '2px solid var(--accent)', padding: '12px 18px', background: '#fff7f2' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>
            ★ Our pipeline · front-end is the model
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 26, fontWeight: 600, marginBottom: 10 }}>PCM → Conv1D → CNN</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 18 }}>
            <div style={{ ...rowBase, background: 'rgba(217,119,87,0.08)' }}>
              <span style={{ color: 'var(--accent)', fontSize: 14 }}>01</span>
              <span style={{ color: 'var(--ink)' }}>Raw int8 PCM · zero preprocessing</span>
              <span style={{ color: 'var(--accent)', textAlign: 'right' }}>0 ops</span>
            </div>
            <div style={{ ...rowBase, background: 'rgba(217,119,87,0.08)' }}>
              <span style={{ color: 'var(--accent)', fontSize: 14 }}>02</span>
              <span style={{ color: 'var(--ink)' }}>conv1d_mel · 16 sinc filters · stride 16</span>
              <span style={{ color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>~ 516 K MACs</span>
            </div>
            <div style={{ ...rowBase, background: 'rgba(217,119,87,0.08)' }}>
              <span style={{ color: 'var(--accent)', fontSize: 14 }}>03</span>
              <span style={{ color: 'var(--ink)' }}>BN · ReLU · MaxPool ÷4</span>
              <span style={{ color: 'var(--ink-mute)', textAlign: 'right' }}>— folded —</span>
            </div>
            <div style={{ ...rowBase, background: 'var(--accent)', color: '#fff', marginTop: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>04</span>
              <span style={{ color: '#fff' }}>CNN body · 3 conv blocks</span>
              <span style={{ color: '#fff', fontWeight: 600, textAlign: 'right' }}>~ 451 K MACs</span>
            </div>
          </div>

          <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--ink)', color: '#f4f1ea' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Total system cost</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, color: '#f4f1ea', fontWeight: 500, marginTop: 3 }}>0.97 M MACs · all int8 · single pipeline</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'rgba(244,241,234,0.7)', marginTop: 3 }}>Front-end and body share the same acceleratable datapath — nothing runs outside the model.</div>
          </div>
        </div>
      </div>

      {/* Punchline strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink)', padding: '10px 14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Standard approach · Zhang et al., 2017</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 20, color: 'var(--ink)', lineHeight: 1.4 }}>DS-CNN-S: 94.4% accuracy, ~5.4 M network MACs. Front-end preprocessing counted separately.</div>
        </div>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink)', padding: '10px 14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Full system cost</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 20, color: 'var(--ink)', lineHeight: 1.4 }}>~5.4 M network MACs <strong>+ ~1.6 M preprocessing ops</strong> = ~7.0 M total system ops.</div>
        </div>
        <div style={{ background: 'var(--accent)', color: '#fff', padding: '10px 14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>★ Our approach</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 20, color: '#fff', lineHeight: 1.4 }}><strong>0.97 M MACs total.</strong> Front-end fused into the model — no separate preprocessing stage.</div>
        </div>
      </div>
    </SlideFrame>
  );
}
