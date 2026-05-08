import SlideFrame from '../components/SlideFrame.jsx';

export default function NoMFCC() {
  return (
    <SlideFrame topLeft="12 · Model">
      <div style={{ marginTop: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>Design decision · cost analysis</div>
        <h1 className="title" style={{ fontSize: 48, marginBottom: 4 }}>
          We merge front-end and body — one unified, lower-cost pipeline.
        </h1>
        <p className="subtitle" style={{ fontSize: 32, maxWidth: 1700, marginBottom: 14 }}>
          MFCC is a proven front-end. We skip it — a learnable Conv1D performs the spectral decomposition
          as part of the model itself, cutting total system MACs from ~7 M down to 0.97 M.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>

        {/* ── Left: compact MFCC recap — no animation, immediately visible, links to previous slide ── */}
        <div style={{ border: '1px solid var(--ink)', padding: '14px 18px', background: 'rgba(26,26,26,0.04)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Standard approach · two stages
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 600, marginBottom: 12 }}>MFCC + DS-CNN</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {/* Stage 1 */}
            <div style={{ padding: '10px 14px', border: '1px solid rgba(26,26,26,0.15)', background: 'var(--paper)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 3 }}>
                Stage 1 · fixed front-end
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500 }}>~1.6 M ops · CPU</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', marginTop: 3 }}>
                Frame → FFT → Mel → log → DCT
              </div>
            </div>

            <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink-mute)' }}>↓</div>

            {/* Stage 2 */}
            <div style={{ padding: '10px 14px', border: '2px solid var(--ink)', background: 'var(--paper)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', textTransform: 'uppercase', marginBottom: 3 }}>
                Stage 2 · network (reported MACs)
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500 }}>~5.4 M MACs</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', marginTop: 3 }}>
                DS-CNN-S · 94.4% · Zhang et al., 2017
              </div>
            </div>
          </div>

          {/* Proportional bar */}
          <div style={{ display: 'flex', height: 28, border: '1px solid var(--ink)', marginBottom: 8 }}>
            <div style={{
              flex: '0 0 23%',
              background: 'rgba(26,26,26,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 12, color: '#f4f1ea',
            }}>MFCC</div>
            <div style={{
              flex: '1 1 auto',
              background: 'var(--ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 12, color: '#f4f1ea',
            }}>DS-CNN  ·  5.4 M</div>
          </div>

          <div style={{ padding: '8px 12px', background: 'rgba(26,26,26,0.08)', border: '1px solid rgba(26,26,26,0.12)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', textTransform: 'uppercase' }}>Total system ops</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 500 }}>~7.0 M</div>
          </div>
        </div>

        {/* ── Right: our pipeline — animates in when slide becomes active ── */}
        <div className="anim anim-ease" style={{ border: '2px solid var(--accent)', padding: '14px 18px', background: '#fff7f2' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>
            ★ Our approach · unified pipeline
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Conv1D → CNN</div>

          {/* Single unified stage */}
          <div style={{ padding: '10px 14px', border: '2px solid var(--accent)', background: 'rgba(217,119,87,0.08)', marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 6 }}>
              One stage · front-end + body
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 15 }}>
              <div><span style={{ color: 'var(--accent)' }}>→</span> conv1d_mel · learns spectral decomposition  <span style={{ float: 'right', color: 'var(--ink)', fontWeight: 500 }}>~516 K MACs</span></div>
              <div style={{ color: 'var(--ink-mute)' }}><span style={{ color: 'var(--accent)' }}>→</span> BN · ReLU · MaxPool ÷4  <span style={{ float: 'right' }}>folded</span></div>
              <div><span style={{ color: 'var(--accent)' }}>→</span> 3× Conv1D blocks  <span style={{ float: 'right', color: 'var(--ink)', fontWeight: 500 }}>~451 K MACs</span></div>
              <div style={{ color: 'var(--ink-mute)' }}><span style={{ color: 'var(--accent)' }}>→</span> GAP → Dense 16 → Softmax</div>
            </div>
          </div>

          {/* Bar: single block */}
          <div style={{ display: 'flex', height: 28, border: '1px solid var(--accent)', marginBottom: 8 }}>
            <div style={{
              width: '100%',
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 12, color: '#fff',
            }}>unified pipeline  ·  0.97 M MACs</div>
          </div>

          <div style={{ padding: '8px 12px', background: 'var(--ink)', color: '#f4f1ea' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(244,241,234,0.6)', textTransform: 'uppercase' }}>Total system MACs</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 500 }}>0.97 M</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'rgba(244,241,234,0.7)', marginTop: 4 }}>
              Front-end and body share the same datapath — nothing runs outside the model.
            </div>
          </div>
        </div>
      </div>

      {/* ── Punchline strip — animates in after right column ── */}
      <div className="anim anim-ease" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, transitionDelay: '220ms' }}>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink)', padding: '10px 14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Standard · Zhang et al., 2017</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, color: 'var(--ink)', lineHeight: 1.4 }}>DS-CNN-S: 94.4% top-1, ~5.4 M network MACs. Front-end counted separately.</div>
        </div>
        <div style={{ background: 'var(--paper)', border: '1px solid var(--ink)', padding: '10px 14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Full system cost</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, color: 'var(--ink)', lineHeight: 1.4 }}>~5.4 M network MACs <strong>+ ~1.6 M preprocessing</strong> = ~7.0 M total system ops.</div>
        </div>
        <div style={{ background: 'var(--accent)', color: '#fff', padding: '10px 14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>★ Our approach</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, color: '#fff', lineHeight: 1.4 }}><strong>0.97 M MACs total.</strong> Front-end fused into the model — no separate preprocessing stage.</div>
        </div>
      </div>
    </SlideFrame>
  );
}
