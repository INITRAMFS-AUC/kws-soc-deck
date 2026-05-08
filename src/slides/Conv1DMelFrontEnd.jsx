import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import MacShareBar from '../components/MacShareBar.jsx';

/* Cross-slide FLIP morph: when the user advances from slide 12 to this
 * slide, the share-of-MACs bar inside slide 12's "Our approach" box flies
 * down to the bottom of this slide and the rest of this slide reveals
 * after it lands. We capture slide-12's bar bbox at slidechange, set the
 * bar here to that exact position via a translate+scale transform, then
 * release to identity with a smooth cubic ease-out. */
const FLIP_MS = 900;
const FLIP_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const REVEAL_DELAY_MS = 380;   // when the kernels + sliding window start
const REVEAL_MS = 480;

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
  const barRef  = useRef(null);
  const [revealed, setRevealed] = useState(true);  // safe default for non-sequential entry

  useEffect(() => {
    let revealTimer = null;
    let resetTimer  = null;

    const onSlideChange = (e) => {
      const mySection = rootRef.current?.closest('section');
      if (!mySection) return;
      const becameActive = e.detail.slide === mySection;
      const cameFromPrev = e.detail.previousIndex === e.detail.index - 1;

      clearTimeout(revealTimer);
      clearTimeout(resetTimer);

      if (becameActive && cameFromPrev) {
        const prevSection = e.detail.previousSlide;
        const fromBar = prevSection?.querySelector('[data-shared-bar="mac-share"]');
        const toBar   = barRef.current;

        if (fromBar && toBar) {
          // Hide rest of slide while the bar is in flight.
          setRevealed(false);

          // FLIP — measure first/last positions, invert with transform, play.
          const fromRect = fromBar.getBoundingClientRect();

          // Force the bar to render at its natural position so we can measure it.
          toBar.style.transition = 'none';
          toBar.style.transform  = '';
          const toRect = toBar.getBoundingClientRect();

          const dx = fromRect.left - toRect.left;
          const dy = fromRect.top  - toRect.top;
          const sx = fromRect.width  / toRect.width;
          const sy = fromRect.height / toRect.height;

          toBar.style.transformOrigin = '0 0';
          toBar.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
          toBar.getBoundingClientRect();   // force reflow before transitioning back
          toBar.style.transition = `transform ${FLIP_MS}ms ${FLIP_EASE}`;
          toBar.style.transform = '';      // animate to identity = natural position

          // Reveal kernels + sliding window once the bar is on its way.
          revealTimer = setTimeout(() => setRevealed(true), REVEAL_DELAY_MS);
          // After the morph fully completes, drop the inline transition so
          // future renders aren't fighting it.
          resetTimer  = setTimeout(() => {
            if (toBar) { toBar.style.transition = ''; toBar.style.transform = ''; }
          }, FLIP_MS + 50);
        } else {
          setRevealed(true);
        }
      } else if (becameActive) {
        setRevealed(true);
        if (barRef.current) {
          barRef.current.style.transition = '';
          barRef.current.style.transform = '';
        }
      } else {
        // leaving — reset for next forward entry
        if (barRef.current) {
          barRef.current.style.transition = '';
          barRef.current.style.transform = '';
        }
      }
    };

    document.addEventListener('slidechange', onSlideChange);
    return () => {
      document.removeEventListener('slidechange', onSlideChange);
      clearTimeout(revealTimer);
      clearTimeout(resetTimer);
    };
  }, []);

  const restStyle = {
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'none' : 'translateY(12px)',
    transition: `opacity ${REVEAL_MS}ms ${FLIP_EASE}, transform ${REVEAL_MS}ms ${FLIP_EASE}`,
  };

  return (
    <SlideFrame topLeft="13 · Model">
      <div ref={rootRef} style={{ marginTop: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>★ Accelerator target</div>
        <h1 className="title" style={{ fontSize: 48, marginBottom: 8 }}>Learnable sinc filterbank — the front-end <em>is</em> a Conv1D.</h1>
        <p className="subtitle" style={{ maxWidth: 1700, marginBottom: 14 }}>
          16 sinc-bandpass kernels, Hamming-windowed, mel-initialized 50 Hz–4 kHz. K=65, stride=16 — a 2 ms frame shift fused into the filter.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.2fr', gap: 28, alignItems: 'start', ...restStyle }}>

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

        </div>
      </div>

      {/* Persistent share-of-MACs bar — when entering from slide 12 the bar
          flies in from inside slide-12's "Our approach" box (FLIP morph in
          the useEffect above) and lands here. The wrapper div is the FLIP
          target; we set transform on it imperatively. */}
      <div ref={barRef} data-shared-bar="mac-share" style={{ marginTop: 'auto', willChange: 'transform' }}>
        <MacShareBar focus="frontend" inline annotate="↑ this slide explains the 53% segment" />
      </div>
    </SlideFrame>
  );
}
