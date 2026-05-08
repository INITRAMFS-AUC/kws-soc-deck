import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';

/* ─────────────────────────────────────────────────────────────────────────────
 * Slide 14 — INMP441 transfer gap, three intra-slide phases.
 *
 *   P0 — Just the two top before/after panels. Bars grow from 0 % to target on
 *        slide entry, staggered (left bar then right bar).
 *   P1 — Two "fix" specimen cards fade up into the bottom row.
 *   P2 — The two fix cards cross-fade out and one wide "frequency response"
 *        box takes their place: our INMP441 is flat across the 8 kHz band so
 *        the gap was a level shift, not spectral distortion.
 *
 * All accuracies on this slide are int8 (the deployed model). Bar labels say
 * "GSC int8" / "INMP441 int8" so the audience never confuses these with the
 * float numbers on slide 12.
 * ───────────────────────────────────────────────────────────────────────── */

const MAX_PHASE = 2;
const BAR_DUR_MS = 900;
const BAR_EASE   = 'cubic-bezier(0.16, 1, 0.3, 1)';
const FADE_MS    = 480;

export default function DataGap() {
  const rootRef = useRef(null);
  const [active, setActive] = useState(false);
  const [phase, setPhase]   = useState(0);

  /* Slide-active detection — drives the bar animation. */
  useEffect(() => {
    const onSlideChange = (e) => {
      const mySection = rootRef.current?.closest('section');
      if (!mySection) return;
      const becameActive = e.detail.slide === mySection;
      const cameFromNext = e.detail.previousIndex === e.detail.index + 1;
      setActive(becameActive);
      if (becameActive) setPhase(cameFromNext ? MAX_PHASE : 0);
    };
    document.addEventListener('slidechange', onSlideChange);
    return () => document.removeEventListener('slidechange', onSlideChange);
  }, []);

  /* Phase navigation — only intercept while we're the active slide. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const section = rootRef.current?.closest('section');
      if (!section?.hasAttribute('data-deck-active')) return;
      const fwd  = e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Spacebar';
      const back = e.key === 'ArrowLeft'  || e.key === 'PageUp';
      if (fwd && phase < MAX_PHASE) {
        e.preventDefault(); e.stopPropagation();
        setPhase(p => p + 1);
      } else if (back && phase > 0) {
        e.preventDefault(); e.stopPropagation();
        setPhase(p => p - 1);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [phase]);

  return (
    <SlideFrame topLeft="14 · Model">
      <div ref={rootRef} style={{ marginTop: 40 }}>
        <div className="eyebrow">The real-world gap</div>
        <h1 className="title" style={{ marginBottom: 14, maxWidth: 1700 }}>
          GSC int8 doesn't transfer to a real microphone — until you fix it.
        </h1>
        <p className="subtitle" style={{ maxWidth: 1700, marginBottom: 18, fontSize: 22 }}>
          The deployed int8 model loses 28 pts when we move it from the GSC test set onto a real INMP441 — and recovers cleanly with two general-practice fixes.
        </p>
      </div>

      {/* Top row — Before / After panels with animated bars. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 22 }}>
        {/* Before */}
        <div style={{ border: '2px solid var(--ink)', padding: '20px 24px', background: 'var(--paper)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 17, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>
            Before · GSC-trained int8 model on real INMP441
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32, marginBottom: 16 }}>
            <BarColumn label="GSC int8"      pct={90} colorOk active={active} delay={0}   value="90 %" />
            <Arrow />
            <BarColumn label="INMP441 int8"  pct={62} colorBad active={active} delay={180} value="62 %" />
          </div>

          <div style={{ padding: '10px 14px', background: 'rgba(204,68,68,0.08)', border: '1px solid #c44' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: '#c44', fontWeight: 600 }}>−28 pts drop</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 17, color: 'var(--ink-mute)', marginTop: 2 }}>
              Distribution shift the int8 model never saw on GSC.
            </div>
          </div>
        </div>

        {/* After */}
        <div style={{ border: '2px solid var(--accent)', padding: '20px 24px', background: '#fff7f2' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 17, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>
            ★ After · int8 + peak-norm + fine-tune
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32, marginBottom: 16 }}>
            <BarColumn label="GSC int8"     pct={90} colorOk active={active} delay={120} value="90 %" />
            <Arrow />
            <BarColumn label="INMP441 int8" pct={90} colorAccent active={active} delay={300} value="90 %" />
          </div>

          <div style={{ padding: '10px 14px', background: 'var(--ink)', color: '#f4f1ea' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent)', fontWeight: 600 }}>0 pts degradation</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 17, color: 'rgba(244,241,234,0.7)', marginTop: 2 }}>
              90 % on both — same int8 weights, just calibrated to the new audio source.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row — phase-driven. P0 empty; P1 two fix cards; P2 one wide freq-response box. */}
      <div style={{ position: 'relative', minHeight: 200 }}>
        <PhaseLayer active={phase === 1}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <FixCard
              num="01"
              title="Peak normalization"
              body="Divide every waveform by its peak absolute value before training and on device. Removes microphone gain variation. Free — no extra params, no extra ops."
              code="x ← x / max(|x|)"
              codeAccent={false}
            />
            <FixCard
              num="02"
              title="Domain fine-tuning"
              body="Record ~50 utterances per class with the INMP441. Mix 10 % into the training set. Three fine-tune epochs on the blended corpus — int8 accuracy recovers to GSC baseline."
              code="GSC 90 % + INMP441 10 % → 90 % on both"
              codeAccent={true}
            />
          </div>
        </PhaseLayer>

        <PhaseLayer active={phase === 2}>
          <FrequencyResponseBox />
        </PhaseLayer>
      </div>
    </SlideFrame>
  );
}

/* ── A bar column: number label up top, growing bar, INMP441 / GSC label below. */
function BarColumn({ label, pct, value, active, delay, colorOk, colorBad, colorAccent }) {
  const fill =
    colorAccent ? 'var(--accent)' :
    colorBad    ? '#c44' :
                  'var(--ink)';
  const txt =
    colorAccent ? 'var(--accent)' :
    colorBad    ? '#c44' :
                  'var(--ink)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, maxWidth: 200 }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 30, fontWeight: 600, color: txt,
        opacity: active ? 1 : 0,
        transition: `opacity 500ms ease ${delay + BAR_DUR_MS - 200}ms`,
      }}>
        {value}
      </div>

      <div style={{ width: 80, height: 130, position: 'relative', background: 'rgba(26,26,26,0.06)' }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%',
          height: active ? `${pct}%` : '0%',
          background: fill,
          transition: `height ${BAR_DUR_MS}ms ${BAR_EASE} ${delay}ms`,
        }} />
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, color: 'var(--ink-mute)', marginBottom: 60 }}>→</div>
  );
}

/* ── Cross-fade wrapper for the two phase-1 / phase-2 bottom layers. */
function PhaseLayer({ active, children }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      opacity: active ? 1 : 0,
      transform: active ? 'translateY(0)' : 'translateY(8px)',
      transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ${BAR_EASE}`,
      pointerEvents: active ? 'auto' : 'none',
    }}>
      {children}
    </div>
  );
}

/* ── A fix specimen card (peak norm / fine-tune). */
function FixCard({ num, title, body, code, codeAccent }) {
  return (
    <div style={{ border: '1px solid var(--ink)', padding: '16px 22px', background: 'var(--paper)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>
        Fix {num} · {title}
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 21, color: 'var(--ink)', lineHeight: 1.45 }}>
        {body}
      </div>
      <div style={{
        marginTop: 10,
        fontFamily: 'var(--font-mono)',
        fontSize: 18,
        color: codeAccent ? 'var(--accent)' : 'var(--ink)',
        background: codeAccent ? 'rgba(217,119,87,0.08)' : 'rgba(26,26,26,0.05)',
        padding: '6px 10px',
      }}>
        {code}
      </div>
    </div>
  );
}

/* ── Phase-2 box: the single "freq response" replacement for the two fix cards. */
function FrequencyResponseBox() {
  return (
    <div style={{
      border: '2px solid var(--accent)',
      background: '#fff7f2',
      padding: '20px 28px',
      display: 'grid',
      gridTemplateColumns: '1fr 360px',
      gap: 32,
      alignItems: 'center',
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
          ★ Frequency response · INMP441
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 30, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>
          Our mic is flat across the 8 kHz band.
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 21, color: 'var(--ink)', lineHeight: 1.45 }}>
          We measured the INMP441's response — flat to ±1.5 dB from 100 Hz to 4 kHz. At an 8 kHz sample rate there is no spectral distortion to fix; the two cards above patch a level shift, not a frequency-dependent one.
        </div>
      </div>

      <FreqResponseChart />
    </div>
  );
}

/* ── Tiny inline frequency-response chart (ideal flat curve with measurement
   trace overlay). Conceptual, not data-true. */
function FreqResponseChart() {
  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--ink)', padding: '12px 14px' }}>
      <svg viewBox="0 0 320 120" style={{ width: '100%', height: 110 }}>
        {/* y grid */}
        <line x1="40"  y1="20"  x2="310" y2="20"  stroke="rgba(26,26,26,0.08)" strokeDasharray="2 4" />
        <line x1="40"  y1="60"  x2="310" y2="60"  stroke="rgba(26,26,26,0.18)" />
        <line x1="40"  y1="100" x2="310" y2="100" stroke="rgba(26,26,26,0.08)" strokeDasharray="2 4" />
        {/* y labels */}
        <text x="32" y="24"  textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--ink-mute)">+1.5</text>
        <text x="32" y="64"  textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--ink-mute)">  0</text>
        <text x="32" y="104" textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--ink-mute)">−1.5</text>
        {/* x labels */}
        <text x="46"  y="115" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--ink-mute)">100 Hz</text>
        <text x="175" y="115" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--ink-mute)">1 kHz</text>
        <text x="305" y="115" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--ink-mute)">4 kHz</text>
        {/* measured trace — small wiggles, stays inside ±1.5 dB */}
        <path
          d="M40,62 C70,58 100,64 130,60 C160,56 190,63 220,59 C250,55 280,62 310,60"
          fill="none" stroke="var(--accent)" strokeWidth="1.6"
        />
        {/* "flat" reference */}
        <line x1="40" y1="60" x2="310" y2="60" stroke="var(--ink)" strokeWidth="0.6" strokeDasharray="3 3" />
        <text x="305" y="56" textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--ink-mute)">flat ref</text>
      </svg>
    </div>
  );
}
