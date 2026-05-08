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
    <SlideFrame topLeft="11B · Model">
      <div style={{ marginTop: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>The cost most papers don't report</div>
        <h1 className="title" style={{ fontSize: 48, marginBottom: 4 }}>We ditched MFCC. The "cheap" front-end isn't cheap.</h1>
        <p className="subtitle" style={{ fontSize: 32, maxWidth: 1700, marginBottom: 10 }}>
          Standard KWS papers report network MACs and call it done. The MFCC pipeline running underneath them is doing more arithmetic than the network — and it's float, and it's not accelerable.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>

        {/* Standard MFCC pipeline */}
        <div style={{ border: '1px solid var(--ink)', padding: '12px 18px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            Standard pipeline · the literature
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 26, fontWeight: 600, marginBottom: 10 }}>PCM → MFCC → CNN</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 18 }}>
            <div style={{ ...rowBase, background: 'rgba(26,26,26,0.04)' }}>
              <span style={{ color: 'var(--ink-mute)', fontSize: 16 }}>01</span>
              <span style={{ color: 'var(--ink)' }}>Frame · window 25 ms / hop 10 ms</span>
              <span style={{ color: 'var(--ink-mute)', textAlign: 'right' }}>100 frames</span>
            </div>
            <div style={{ ...rowBase, background: 'rgba(26,26,26,0.04)' }}>
              <span style={{ color: 'var(--ink-mute)', fontSize: 16 }}>02</span>
              <span style={{ color: 'var(--ink)' }}>FFT 512-pt · float</span>
              <span style={{ color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>~ 460 K ops</span>
            </div>
            <div style={{ ...rowBase, background: 'rgba(26,26,26,0.04)' }}>
              <span style={{ color: 'var(--ink-mute)', fontSize: 16 }}>03</span>
              <span style={{ color: 'var(--ink)' }}>Power spectrum |·|²</span>
              <span style={{ color: 'var(--ink-mute)', textAlign: 'right' }}>~ 26 K ops</span>
            </div>
            <div style={{ ...rowBase, background: 'rgba(26,26,26,0.04)' }}>
              <span style={{ color: 'var(--ink-mute)', fontSize: 16 }}>04</span>
              <span style={{ color: 'var(--ink)' }}>Mel triangular filterbank · 40 bands</span>
              <span style={{ color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>~ 1.0 M MACs</span>
            </div>
            <div style={{ ...rowBase, background: 'rgba(26,26,26,0.04)' }}>
              <span style={{ color: 'var(--ink-mute)', fontSize: 16 }}>05</span>
              <span style={{ color: 'var(--ink)' }}>log(·) · 4 K float ops</span>
              <span style={{ color: 'var(--ink-mute)', textAlign: 'right' }}>~ 4 K ops</span>
            </div>
            <div style={{ ...rowBase, background: 'rgba(26,26,26,0.04)' }}>
              <span style={{ color: 'var(--ink-mute)', fontSize: 16 }}>06</span>
              <span style={{ color: 'var(--ink)' }}>DCT-II → MFCC features</span>
              <span style={{ color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>~ 130 K ops</span>
            </div>
            <div style={{ ...rowBase, background: 'var(--ink)', color: '#f4f1ea', marginTop: 6 }}>
              <span style={{ color: 'rgba(244,241,234,0.5)', fontSize: 16 }}>07</span>
              <span style={{ color: '#f4f1ea' }}>CNN body (advertised)</span>
              <span style={{ color: 'var(--accent)', fontWeight: 600, textAlign: 'right' }}>~ 5 M MACs</span>
            </div>
          </div>

          <div style={{ marginTop: 10, padding: '8px 12px', background: '#fff7f2', border: '1px solid var(--accent)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Hidden cost</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, color: 'var(--ink)', fontWeight: 500, marginTop: 3 }}>~ 1.6 M float ops · every inference</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--ink-mute)', marginTop: 3 }}>No accelerator can run this. Float. Branchy. Not quantisable.</div>
          </div>
        </div>

        {/* Our pipeline */}
        <div style={{ border: '2px solid var(--accent)', padding: '12px 18px', background: '#fff7f2' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>
            ★ Our pipeline · the model IS the front-end
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 26, fontWeight: 600, marginBottom: 10 }}>PCM → Conv1D → CNN</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 18 }}>
            <div style={{ ...rowBase, background: 'rgba(217,119,87,0.08)' }}>
              <span style={{ color: 'var(--accent)', fontSize: 16 }}>01</span>
              <span style={{ color: 'var(--ink)' }}>Raw int8 PCM · zero preprocessing</span>
              <span style={{ color: 'var(--accent)', textAlign: 'right' }}>0 ops</span>
            </div>
            <div style={{ ...rowBase, background: 'rgba(217,119,87,0.08)' }}>
              <span style={{ color: 'var(--accent)', fontSize: 16 }}>02</span>
              <span style={{ color: 'var(--ink)' }}>conv1d_mel · 16 sinc filters · stride 16</span>
              <span style={{ color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>~ 516 K MACs</span>
            </div>
            <div style={{ ...rowBase, background: 'rgba(217,119,87,0.08)' }}>
              <span style={{ color: 'var(--accent)', fontSize: 16 }}>03</span>
              <span style={{ color: 'var(--ink)' }}>BN · ReLU · MaxPool ÷4</span>
              <span style={{ color: 'var(--ink-mute)', textAlign: 'right' }}>— folded —</span>
            </div>
            <div style={{ ...rowBase, background: 'var(--accent)', color: '#fff', marginTop: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16 }}>04</span>
              <span style={{ color: '#fff' }}>CNN body · 3 conv blocks</span>
              <span style={{ color: '#fff', fontWeight: 600, textAlign: 'right' }}>~ 451 K MACs</span>
            </div>
          </div>

          <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--ink)', color: '#f4f1ea' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Total cost</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, color: '#f4f1ea', fontWeight: 500, marginTop: 3 }}>0.97 M MACs · all int8 · 100 % accelerable</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'rgba(244,241,234,0.7)', marginTop: 3 }}>Every op the firmware does is an op the accelerator can take.</div>
          </div>
        </div>
      </div>

      {/* Punchline strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink)', padding: '10px 14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>What gets reported</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 20, color: 'var(--ink)', lineHeight: 1.4 }}>"Our DS-CNN runs at 5 M MACs." (network only)</div>
        </div>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink)', padding: '10px 14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>What actually runs</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 20, color: 'var(--ink)', lineHeight: 1.4 }}>5 M MACs <strong>+ ~1.6 M float ops</strong> for the MFCC the CPU can't skip.</div>
        </div>
        <div style={{ background: 'var(--accent)', color: '#fff', padding: '10px 14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>★ What we run</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 20, color: '#fff', lineHeight: 1.4 }}><strong>0.97 M MACs total.</strong> One op type. One datatype. Honest number.</div>
        </div>
      </div>
    </SlideFrame>
  );
}
