import SlideFrame from '../components/SlideFrame.jsx';

export default function DataGap() {
  return (
    <SlideFrame topLeft="15 · Model">
      <div style={{ marginTop: 40 }}>
        <div className="eyebrow">The real-world gap</div>
        <h1 className="title" style={{ marginBottom: 20, maxWidth: 1700 }}>
          GSC accuracy doesn't transfer to a real microphone — until you fix it.
        </h1>
      </div>

      {/* Before / After panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>

        {/* Before */}
        <div style={{ border: '2px solid var(--ink)', padding: '22px 26px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>
            Before · GSC-trained model on real INMP441 audio
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32, marginBottom: 18 }}>
            {/* GSC bar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 600, color: 'var(--ink)' }}>90 %</div>
              <div style={{ width: 64, height: 120, background: 'var(--ink)' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', textTransform: 'uppercase' }}>GSC test</div>
            </div>

            {/* Arrow */}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, color: 'var(--ink-mute)', marginBottom: 60 }}>→</div>

            {/* INMP441 bar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 600, color: '#c44' }}>62 %</div>
              <div style={{ width: 64, height: 74, background: '#c44' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', textTransform: 'uppercase' }}>INMP441</div>
            </div>
          </div>

          <div style={{ padding: '10px 14px', background: 'rgba(204,68,68,0.08)', border: '1px solid #c44' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: '#c44', fontWeight: 600 }}>−28 pts drop</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, color: 'var(--ink-mute)', marginTop: 2 }}>
              Microphone frequency response + analog front-end coloring → distribution shift the model never saw.
            </div>
          </div>
        </div>

        {/* After */}
        <div style={{ border: '2px solid var(--accent)', padding: '22px 26px', background: '#fff7f2' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>
            ★ After · fine-tuned + peak-normalized
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32, marginBottom: 18 }}>
            {/* GSC bar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 600, color: 'var(--ink)' }}>90 %</div>
              <div style={{ width: 64, height: 120, background: 'var(--ink)' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', textTransform: 'uppercase' }}>GSC test</div>
            </div>

            {/* Arrow */}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, color: 'var(--ink-mute)', marginBottom: 60 }}>→</div>

            {/* INMP441 bar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 600, color: 'var(--accent)' }}>90 %</div>
              <div style={{ width: 64, height: 120, background: 'var(--accent)' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', textTransform: 'uppercase' }}>INMP441</div>
            </div>
          </div>

          <div style={{ padding: '10px 14px', background: 'var(--ink)', color: '#f4f1ea' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent)', fontWeight: 600 }}>0 pts degradation</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, color: 'rgba(244,241,234,0.7)', marginTop: 2 }}>
              Fine-tune on 10 % INMP441 recordings + peak-normalize both sets. Gap closes completely.
            </div>
          </div>
        </div>
      </div>

      {/* Fix specimen cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div style={{ border: '1px solid var(--ink)', padding: '16px 20px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Fix 1 · peak normalization</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, color: 'var(--ink)', lineHeight: 1.5 }}>
            Divide every waveform by its peak absolute value before training and on device.
            Removes microphone gain variation. Free — no extra params, no extra ops.
          </div>
          <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--ink)', background: 'rgba(26,26,26,0.05)', padding: '6px 10px' }}>
            x ← x / max(|x|)
          </div>
        </div>
        <div style={{ border: '1px solid var(--ink)', padding: '16px 20px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Fix 2 · domain fine-tuning</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, color: 'var(--ink)', lineHeight: 1.5 }}>
            Record 50 utterances per class with the INMP441. Mix 10 % into the training set.
            Three fine-tune epochs on the blended corpus — accuracy recovers to GSC baseline.
          </div>
          <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent)', background: 'rgba(217,119,87,0.08)', padding: '6px 10px' }}>
            GSC 90 % + INMP441 10 % → 90 % on both
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
