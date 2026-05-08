import SlideFrame from '../components/SlideFrame.jsx';

/* ─────────────────────────────────────────────────────────────────────────────
 * Slide 12 — bridge from "this is our model" (slide 11) to "here's how we
 * compare against KWS literature" (slide 13).
 *
 * The previous version had a big aspect-by-aspect comparison table with
 * standard KWS — but every row of that table is already covered by the walk
 * on slide 11. Instead this slide narrows in on the closest related work:
 * the *learnable waveform* family (SincNet, LEAF) and a representative
 * *raw-waveform CNN* (Dai's M-series). A few remarks per paper, not a wall
 * of cells. This is the bridge: now we're clear about who we are most like
 * and what we change → next slide compares us against general KWS models on
 * accuracy / params / MACs.
 * ───────────────────────────────────────────────────────────────────────── */

const WORKS = [
  {
    title: 'SincNet',
    cite:  'Ravanelli & Bengio · 2018',
    tag:   'Learnable sinc · raw waveform',
    body:  'Same idea — sinc bandpass filters as the first conv layer, kernel parameters reduced to two learnable cutoffs per filter. Built for speaker ID, runs at full waveform resolution then pools downstream. No stride fusion, no INT8 path.',
    diffLabel: 'What we change',
    diff:  'Stride 16 fused into the kernel — one op gives both the bandpass and the 16× downsample. Quantized to INT8 end-to-end.',
  },
  {
    title: 'LEAF',
    cite:  'Zeghidour et al. · Google · 2021',
    tag:   'Learnable Gabor + per-channel pooling',
    body:  'Gabor filters with learnable centre / bandwidth, plus a fully learnable per-channel pooling layer (PCEN-style). Aimed at general audio understanding. Heavier compute and float-only — the learnable pooling is not cleanly INT8-quantisable.',
    diffLabel: 'What we change',
    diff:  'Plain MaxPool · plain BN · everything NNoM-quantisable. ~16 K params total vs LEAF\'s ~80 K front-end alone.',
  },
  {
    title: 'M5 / M11',
    cite:  'Dai et al. · 2017',
    tag:   'Raw-waveform 1D CNN',
    body:  'Pure 1D conv stack on raw audio — no fixed front-end at all. Model learns from scratch with K = 80 first-layer kernels and 5–11 conv blocks. ~558 K (M5) to ~1.79 M (M11) params, no INT8 deployment story.',
    diffLabel: 'What we change',
    diff:  'Sinc-init front-end gives a strong inductive bias instead of learning from scratch. ~35× fewer parameters than M5 at comparable accuracy.',
  },
];

export default function LiteratureComparison() {
  return (
    <SlideFrame topLeft="12 · Model">
      <div style={{ marginTop: 36 }}>
        <div className="eyebrow">Closest related work</div>
        <h1 className="title" style={{ marginBottom: 12 }}>Sinc &amp; raw-waveform classifiers — and what we change.</h1>
        <p className="subtitle" style={{ maxWidth: 1700, marginBottom: 28 }}>
          The standard-KWS comparison (DS-CNN, MobileNet on log-mel spectrograms) is already covered by slide 11. Here we sit next to the learnable-front-end family on raw audio — three papers, one remark each.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 22, marginBottom: 22 }}>
        {WORKS.map((w) => (
          <div key={w.title} style={{
            border: '1px solid var(--ink)',
            background: 'var(--paper)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 30, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{w.title}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', marginBottom: 4 }}>{w.cite}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 14 }}>{w.tag}</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, color: 'var(--ink-mute)', lineHeight: 1.45, marginBottom: 16 }}>
              {w.body}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ borderTop: '1px solid rgba(26,26,26,0.15)', paddingTop: 12 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>★ {w.diffLabel}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, color: 'var(--ink)', lineHeight: 1.45 }}>{w.diff}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--accent)', color: '#fff', padding: '18px 26px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>★ Bridge</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, lineHeight: 1.4 }}>
          Same family — learnable filterbank on raw waveform. Different deployment target: a 36 MHz RV32IMAC with INT8 weights and one acceleratable Conv1D op throughout. Next: how we score against the general KWS leaderboard.
        </div>
      </div>
    </SlideFrame>
  );
}
