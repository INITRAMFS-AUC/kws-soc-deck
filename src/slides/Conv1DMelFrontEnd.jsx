import { useEffect, useRef } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';

/* ─────────────────────────────────────────────────────────────────────────────
 * Slide 12 — Conv1D Mel Front-End zoom.
 *
 * Cross-slide motion: when the user advances from slide 11 (in P2) to this
 * slide, the entire slide content emerges from slide 11's "Front-end" card.
 * We FLIP-morph: capture the source box's bbox via the data-flip-source
 * attribute, set this slide's wrapper to that exact position via
 * translate+scale, then release to identity over a smooth ease-out.
 * ─────────────────────────────────────────────────────────────────────── */

const FLIP_MS    = 920;
const FLIP_EASE  = 'cubic-bezier(0.16, 1, 0.3, 1)';

function generateKernelPath(i) {
  const freq = 1 + i * 0.6;
  const amp = 16 - i * 0.4;
  let path = '';
  for (let k = 0; k < 65; k++) {
    const x = (k / 64) * 100;
    const env = Math.exp(-Math.pow((k - 32) / 22, 2));
    const y = 24 - Math.sin(k * 0.5 * freq) * env * amp;
    path += (k === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
  }
  return path.trim();
}

export default function Conv1DMelFrontEnd() {
  const kernels = Array.from({ length: 16 }, (_, i) => {
    const label = 'k' + (i < 10 ? '0' + i : String(i));
    const path = generateKernelPath(i);
    return { label, path };
  });

  const rootRef = useRef(null);
  const flipRef = useRef(null);

  useEffect(() => {
    let resetTimer = null;

    const onSlideChange = (e) => {
      const mySection = rootRef.current?.closest('section');
      if (!mySection) return;
      const becameActive = e.detail.slide === mySection;
      const cameFromPrev = e.detail.previousIndex === e.detail.index - 1;

      clearTimeout(resetTimer);

      if (becameActive && cameFromPrev) {
        /* Find slide 11's Front-end card in the previous section. */
        const prevSection = e.detail.previousSlide;
        const fromBox = prevSection?.querySelector('[data-flip-source="frontend"]');
        const toBox   = flipRef.current;
        if (fromBox && toBox) {
          const fromRect = fromBox.getBoundingClientRect();
          /* Force the wrapper to its natural position so we can measure it. */
          toBox.style.transition = 'none';
          toBox.style.transform  = '';
          const toRect = toBox.getBoundingClientRect();

          const dx = fromRect.left - toRect.left;
          const dy = fromRect.top  - toRect.top;
          const sx = fromRect.width  / toRect.width;
          const sy = fromRect.height / toRect.height;

          toBox.style.transformOrigin = '0 0';
          toBox.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
          /* Keep the wrapper invisible during the FLIP set-up so the user
             doesn't see it flash at the natural position before snapping
             to the source bbox. */
          toBox.style.opacity = '0';
          toBox.getBoundingClientRect();   // force reflow

          toBox.style.transition = `transform ${FLIP_MS}ms ${FLIP_EASE}, opacity 280ms ease`;
          toBox.style.transform  = '';
          toBox.style.opacity    = '1';

          resetTimer = setTimeout(() => {
            if (toBox) {
              toBox.style.transition = '';
              toBox.style.transform  = '';
              toBox.style.opacity    = '';
            }
          }, FLIP_MS + 50);
        }
      } else if (becameActive) {
        /* Non-sequential entry — just clear any leftover inline styles. */
        if (flipRef.current) {
          flipRef.current.style.transition = '';
          flipRef.current.style.transform  = '';
          flipRef.current.style.opacity    = '';
        }
      }
    };

    document.addEventListener('slidechange', onSlideChange);
    return () => {
      document.removeEventListener('slidechange', onSlideChange);
      clearTimeout(resetTimer);
    };
  }, []);

  return (
    <SlideFrame topLeft="12 · Model">
      {/* Whole-slide FLIP target. The header + kernel grid + sliding window
          all live inside so the entire slide appears to expand out of the
          slide-11 Front-end card. */}
      <div ref={rootRef} style={{ display: 'contents' }}>
        <div ref={flipRef} style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          willChange: 'transform, opacity',
        }}>
          <div style={{ marginTop: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>★ Accelerator target</div>
            <h1 className="title" style={{ fontSize: 48, marginBottom: 8 }}>Learnable sinc filterbank — the front-end <em>is</em> a Conv1D.</h1>
            <p className="subtitle" style={{ maxWidth: 1700, marginBottom: 14 }}>
              16 sinc-bandpass kernels, Hamming-windowed, mel-initialized 50 Hz–4 kHz. K=65, stride=16 — a 2 ms frame shift fused into the filter.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.2fr', gap: 28, alignItems: 'start' }}>

            {/* Left: kernel grid */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                What the 16 kernels look like
              </div>
              <div style={{ border: '1px solid var(--ink)', background: 'var(--paper)', padding: '14px 18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px 16px' }}>
                  {kernels.map(({ label, path }) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <svg viewBox="0 0 100 48" style={{ width: '100%', height: 44 }}>
                        <path d={path} fill="none" stroke="var(--ink)" strokeWidth="1.4" />
                      </svg>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.04em' }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', marginTop: 10, textAlign: 'center', letterSpacing: '0.04em' }}>
                  low frequency ← mel scale → high frequency
                </div>
              </div>
              <p style={{ marginTop: 10, fontSize: 22, lineHeight: 1.42, color: 'var(--ink-soft)' }}>
                Each kernel is initialized as a Hamming-windowed sinc bandpass:{' '}
                <span style={{ fontFamily: 'var(--font-mono)' }}>h_i(n) = [sinc(2 f_h n) − sinc(2 f_l n)] · hamming(n)</span>,
                where f_l, f_h are the mel-band edges. The filters then adapt freely during training.
              </p>
            </div>

            {/* Right: sliding window + stats */}
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Sliding K=65, stride 16
              </div>
              <div style={{ border: '1px solid var(--ink)', background: 'var(--paper)', padding: '14px 24px 14px 24px' }}>
                <svg viewBox="0 0 600 130" style={{ width: '100%', height: 120 }}>
                  <defs>
                    <marker id="arrow12" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                      <path d="M 0 0 L 10 5 L 0 10 Z" fill="var(--accent)" />
                    </marker>
                  </defs>
                  <path
                    d="M0,80 Q15,55 30,90 T70,75 Q90,40 110,100 T160,60 Q180,30 200,100 T260,70 Q290,40 320,95 T380,75 Q410,55 440,90 T500,75 Q540,65 600,80"
                    fill="none" stroke="var(--ink)" strokeWidth="1.2"
                  />
                  <rect x="20" y="35" width="80" height="70" fill="var(--accent)" opacity="0.18" stroke="var(--accent)" strokeWidth="1.2" />
                  <text x="60" y="125" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--ink-mute)">t = 0</text>
                  <rect x="40" y="35" width="80" height="70" fill="var(--accent)" opacity="0.12" stroke="var(--accent)" strokeWidth="0.8" strokeDasharray="3 3" />
                  <text x="80" y="125" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--ink-mute)">+16</text>
                  <rect x="60" y="35" width="80" height="70" fill="var(--accent)" opacity="0.08" stroke="var(--accent)" strokeWidth="0.6" strokeDasharray="3 3" />
                  <text x="100" y="125" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--ink-mute)">+32</text>
                  <line x1="20" y1="20" x2="100" y2="20" stroke="var(--accent)" strokeWidth="1.5" markerEnd="url(#arrow12)" />
                  <text x="60" y="14" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="13" fill="var(--accent)" fontWeight="600">window slides</text>
                </svg>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 8, paddingTop: 10, borderTop: '1px solid rgba(26,26,26,0.12)' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.02em' }}>8000</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>samples in</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.02em' }}>496 → 124</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>frames · after pool 4×</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 500, color: 'var(--accent)', letterSpacing: '-0.02em' }}>1056</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>params · 16×65 + bias</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--ink-mute)' }}>
                → expanded from the <strong style={{ color: 'var(--accent)' }}>front-end</strong> box on slide 11 · 53 % of total MACs
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
