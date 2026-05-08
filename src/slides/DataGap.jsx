import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';

/* ─────────────────────────────────────────────────────────────────────────────
 * Slide 14 — INMP441 transfer gap, three intra-slide phases.
 *
 *   P0 — Just the two top before/after panels, BIG. Bars grow from 0 % to
 *        target on slide entry, staggered (left bar then right bar).
 *   P1 — Top panels shrink to a compact size; two "fix" specimen cards fade
 *        up into the freed bottom row.
 *   P2 — Top panels stay compact; the two fix cards cross-fade out and one
 *        wide "frequency response" box takes their place — a real measured
 *        INMP441 frequency-response chart so the audience sees the mic IS
 *        flat across our 8 kHz band.
 *
 * All accuracies on this slide are int8 (the deployed model). Bar labels say
 * "GSC int8" / "INMP441 int8" so the audience never confuses these with the
 * float numbers on slide 12.
 * ───────────────────────────────────────────────────────────────────────── */

const MAX_PHASE = 2;
const BAR_DUR_MS = 900;
const BAR_EASE   = 'cubic-bezier(0.16, 1, 0.3, 1)';
const FADE_MS    = 480;
const SIZE_MS    = 600;

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

  const big = phase === 0;

  return (
    <SlideFrame topLeft="15 · Model">
      <div ref={rootRef} style={{ marginTop: 32 }}>
        <div className="eyebrow">The real-world gap</div>
        <h1 className="title" style={{ marginBottom: 12, maxWidth: 1700 }}>
          GSC int8 doesn't transfer to a real microphone — until you fix it.
        </h1>
        <p className="subtitle" style={{ maxWidth: 1700, marginBottom: 18, fontSize: 22 }}>
          The deployed int8 model loses 28 pts when we move it from the GSC test set onto a real INMP441 — and recovers cleanly with two general-practice fixes.
        </p>
      </div>

      {/* Top row — Before / After panels with animated bars. They grow large
         in P0 (whole stage to themselves) and shrink in P1+ to make room for
         the fix cards / frequency-response box below. */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
        marginBottom: 22,
        transition: `padding ${SIZE_MS}ms ${BAR_EASE}`,
      }}>
        {/* Before */}
        <div style={{
          border: '2px solid var(--ink)',
          padding: big ? '32px 36px 28px' : '18px 22px',
          background: 'var(--paper)',
          transition: `padding ${SIZE_MS}ms ${BAR_EASE}`,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: big ? 20 : 16,
            color: 'var(--ink-mute)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: big ? 22 : 12,
            transition: `font-size ${SIZE_MS}ms ${BAR_EASE}, margin-bottom ${SIZE_MS}ms ${BAR_EASE}`,
          }}>
            Before · GSC-trained int8 model on real INMP441
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: big ? 48 : 28, marginBottom: big ? 26 : 14, transition: `gap ${SIZE_MS}ms ${BAR_EASE}, margin-bottom ${SIZE_MS}ms ${BAR_EASE}` }}>
            <BarColumn label="GSC int8"      pct={90} colorOk      active={active} delay={0}   value="90 %" big={big} />
            <Arrow big={big} />
            <BarColumn label="INMP441 int8"  pct={62} colorBad     active={active} delay={180} value="62 %" big={big} />
          </div>

          <div style={{ padding: big ? '14px 18px' : '8px 12px', background: 'rgba(204,68,68,0.08)', border: '1px solid #c44', transition: `padding ${SIZE_MS}ms ${BAR_EASE}` }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: big ? 22 : 17, color: '#c44', fontWeight: 600, transition: `font-size ${SIZE_MS}ms ${BAR_EASE}` }}>−28 pts drop</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: big ? 19 : 16, color: 'var(--ink-mute)', marginTop: 2, transition: `font-size ${SIZE_MS}ms ${BAR_EASE}` }}>
              Distribution shift the int8 model never saw on GSC.
            </div>
          </div>
        </div>

        {/* After */}
        <div style={{
          border: '2px solid var(--accent)',
          padding: big ? '32px 36px 28px' : '18px 22px',
          background: '#fff7f2',
          transition: `padding ${SIZE_MS}ms ${BAR_EASE}`,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: big ? 20 : 16,
            color: 'var(--accent)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: big ? 22 : 12,
            transition: `font-size ${SIZE_MS}ms ${BAR_EASE}, margin-bottom ${SIZE_MS}ms ${BAR_EASE}`,
          }}>
            ★ After · int8 + peak-norm + fine-tune
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: big ? 48 : 28, marginBottom: big ? 26 : 14, transition: `gap ${SIZE_MS}ms ${BAR_EASE}, margin-bottom ${SIZE_MS}ms ${BAR_EASE}` }}>
            <BarColumn label="GSC int8"     pct={90} colorOk     active={active} delay={120} value="90 %" big={big} />
            <Arrow big={big} />
            <BarColumn label="INMP441 int8" pct={90} colorAccent active={active} delay={300} value="90 %" big={big} />
          </div>

          <div style={{ padding: big ? '14px 18px' : '8px 12px', background: 'var(--ink)', color: '#f4f1ea', transition: `padding ${SIZE_MS}ms ${BAR_EASE}` }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: big ? 22 : 17, color: 'var(--accent)', fontWeight: 600, transition: `font-size ${SIZE_MS}ms ${BAR_EASE}` }}>0 pts degradation</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: big ? 19 : 16, color: 'rgba(244,241,234,0.7)', marginTop: 2, transition: `font-size ${SIZE_MS}ms ${BAR_EASE}` }}>
              90 % on both — same int8 weights, just calibrated to the new audio source.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row — phase-driven. P0 empty; P1 two fix cards; P2 one wide
         freq-response box. Empty wrapper takes no space when both layers are
         inactive (P0); a min-height kicks in once we reveal something. */}
      <div style={{
        position: 'relative',
        minHeight: phase === 0 ? 0 : 230,
        transition: `min-height ${SIZE_MS}ms ${BAR_EASE}`,
      }}>
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

/* ── A bar column. Sizes scale with `big`. */
function BarColumn({ label, pct, value, active, delay, colorOk, colorBad, colorAccent, big }) {
  const fill =
    colorAccent ? 'var(--accent)' :
    colorBad    ? '#c44' :
                  'var(--ink)';
  const txt =
    colorAccent ? 'var(--accent)' :
    colorBad    ? '#c44' :
                  'var(--ink)';

  const W = big ? 150 : 76;
  const H = big ? 320 : 130;
  const valueFont = big ? 56 : 28;
  const labelFont = big ? 19 : 14;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: big ? 10 : 6, flex: 1, maxWidth: 240 }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: valueFont, fontWeight: 600, color: txt,
        opacity: active ? 1 : 0,
        transition: `opacity 500ms ease ${delay + BAR_DUR_MS - 200}ms, font-size ${SIZE_MS}ms ${BAR_EASE}`,
      }}>
        {value}
      </div>

      <div style={{
        width: W,
        height: H,
        position: 'relative',
        background: 'rgba(26,26,26,0.06)',
        transition: `width ${SIZE_MS}ms ${BAR_EASE}, height ${SIZE_MS}ms ${BAR_EASE}`,
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%',
          height: active ? `${pct}%` : '0%',
          background: fill,
          transition: `height ${BAR_DUR_MS}ms ${BAR_EASE} ${delay}ms`,
        }} />
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: labelFont,
        color: 'var(--ink-mute)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        transition: `font-size ${SIZE_MS}ms ${BAR_EASE}`,
      }}>
        {label}
      </div>
    </div>
  );
}

function Arrow({ big }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: big ? 56 : 30,
      color: 'var(--ink-mute)',
      marginBottom: big ? 140 : 60,
      transition: `font-size ${SIZE_MS}ms ${BAR_EASE}, margin-bottom ${SIZE_MS}ms ${BAR_EASE}`,
    }}>→</div>
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
    <div style={{ border: '1px solid var(--ink)', padding: '14px 20px', background: 'var(--paper)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
        Fix {num} · {title}
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, color: 'var(--ink)', lineHeight: 1.4 }}>
        {body}
      </div>
      <div style={{
        marginTop: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 17,
        color: codeAccent ? 'var(--accent)' : 'var(--ink)',
        background: codeAccent ? 'rgba(217,119,87,0.08)' : 'rgba(26,26,26,0.05)',
        padding: '6px 10px',
      }}>
        {code}
      </div>
    </div>
  );
}

/* ── Phase-2 box: text on the left, a real measured INMP441 frequency-response
   chart on the right (image lives in public/assets). */
function FrequencyResponseBox() {
  return (
    <div style={{
      border: '2px solid var(--accent)',
      background: '#fff7f2',
      padding: '18px 24px',
      display: 'grid',
      gridTemplateColumns: '1fr 360px',
      gap: 32,
      alignItems: 'center',
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
          ★ Frequency response · INMP441
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
          Our mic is flat across the 8 kHz band.
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 19, color: 'var(--ink)', lineHeight: 1.4 }}>
          We checked the datasheet. Flat to ±2 dB from 100 Hz to ~10 kHz — well past our 4 kHz Nyquist. No spectral distortion at 8 kHz; the two fixes above patch a level shift, not a frequency-dependent one.
        </div>
      </div>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--ink)', padding: '8px 12px' }}>
        <img
          src={`${import.meta.env.BASE_URL}assets/inmp441-frequency-response.png`}
          alt="Measured INMP441 frequency response — flat to ±2 dB from 100 Hz to ~10 kHz"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>
    </div>
  );
}
