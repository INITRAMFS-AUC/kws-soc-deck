import SlideFrame from '../components/SlideFrame.jsx';

/* ─────────────────────────────────────────────────────────────────────────────
 * Slide 12 — bridge from "this is our model" to "here's how we score against
 * the published KWS leaderboard". The detailed prose now lives in speaker
 * notes (see content.js → 'lit-comparison'); on screen we keep four cards
 * with one hero number and one claim each.
 * ───────────────────────────────────────────────────────────────────────── */

const WORKS = [
  {
    title: 'SincNet',
    cite:  'Ravanelli · 2018',
    big:   '~22 M',
    bigLabel: 'total params',
    claim: 'Float · no stride fusion',
  },
  {
    title: 'LEAF',
    cite:  'Zeghidour, Google · 2021',
    big:   '~80 K',
    bigLabel: 'front-end params',
    claim: 'Float · learnable pool, not INT8-able',
  },
  {
    title: 'M5 / M11',
    cite:  'Dai · 2017',
    big:   '~558 K',
    bigLabel: 'total params (M5)',
    claim: 'No fixed front-end · learn from scratch',
  },
];

export default function LiteratureComparison() {
  return (
    <SlideFrame topLeft="12 · Model">
      <div style={{ marginTop: 36 }}>
        <div className="eyebrow">Closest related work · by the numbers</div>
        <h1 className="title" style={{ marginBottom: 10 }}>The learnable-front-end family on raw audio.</h1>
        <p className="subtitle" style={{ maxWidth: 1700, marginBottom: 38 }}>
          Same idea — different deployment target.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28, marginBottom: 32 }}>
        {WORKS.map((w) => (
          <div key={w.title} style={{
            border: '1px solid var(--ink)',
            background: 'var(--paper)',
            padding: '28px 30px 26px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 36, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.1 }}>{w.title}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--ink-mute)', marginTop: 4, marginBottom: 32 }}>{w.cite}</div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 110, fontWeight: 500, letterSpacing: '-0.04em', color: 'var(--ink)', lineHeight: 0.95 }}>{w.big}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 10, marginBottom: 28 }}>{w.bigLabel}</div>

            <div style={{ flex: 1 }} />
            <div style={{ borderTop: '1px solid rgba(26,26,26,0.18)', paddingTop: 14, fontFamily: 'var(--font-sans)', fontSize: 22, color: 'var(--ink)', fontWeight: 500 }}>
              {w.claim}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--accent)',
        color: '#fff',
        padding: '26px 32px',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 32,
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>★ Ours</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 32, fontWeight: 600 }}>Stride-fused sinc</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 36, justifyContent: 'center' }}>
          {[
            { v: '~16 K', l: 'total params' },
            { v: '16×',  l: 'compute saving up front' },
            { v: 'INT8', l: 'end-to-end · NNoM' },
          ].map((x) => (
            <div key={x.l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 56, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1 }}>{x.v}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 6 }}>{x.l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, color: 'rgba(255,255,255,0.95)', maxWidth: 320, lineHeight: 1.4, textAlign: 'right' }}>
          Same family. <strong>Built for a 36 MHz RV32IMAC.</strong>
        </div>
      </div>
    </SlideFrame>
  );
}
