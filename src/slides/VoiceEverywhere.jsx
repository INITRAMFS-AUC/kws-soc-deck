import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import { getSlide } from '../content.js';

const c = getSlide('voice')?.content ?? {};
const { stats, chartTitle, series, sourceLabel, sourceUrl, sources = [] } = c.market ?? {};
const w = c.wrist ?? { backdropUrl: '', bodyHTML: '', eyebrow: '', quote: '', caption: '' };

const TITLE_PREFIX = 'Voice command interfaces ';
const SUFFIX_OFF = 'are everywhere.';
const SUFFIX_ON  = 'Market Cap';

// Steps:
//   0 — bedroom backdrop, "Alexa." (default)
//   1 — top-down track backdrop, smart-watch + "Start Timer."
//   2 — chart reveal (Market Cap)
const LAST_STEP = 2;

function MarketChart() {
  const W = 1700, H = 360;
  const padL = 90, padR = 30, padT = 30, padB = 50;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = 100000;
  const barW = (innerW / series.length) * 0.62;
  const slotW = innerW / series.length;
  const yFor = (v) => padT + innerH - (v / max) * innerH;
  const baseY = padT + innerH;
  const grids = [0, 20000, 40000, 60000, 80000, 100000];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', display: 'block' }}>
      {grids.map((g, i) => {
        const y = yFor(g);
        return (
          <g key={`g-${i}`}>
            <line x1={padL} x2={W - padR} y1={y} y2={y}
                  stroke="rgba(0,0,0,0.08)" strokeDasharray="3 3" />
            <text x={padL - 14} y={y + 5} textAnchor="end"
                  fontFamily="var(--font-mono)" fontSize={14}
                  fill="var(--color-ink-mute)">
              {g === 0 ? '0' : `${g / 1000}k`}
            </text>
          </g>
        );
      })}
      <line x1={padL} x2={W - padR} y1={baseY} y2={baseY}
            stroke="rgba(0,0,0,0.18)" />
      {series.map((d, i) => {
        const cx = padL + i * slotW + slotW / 2;
        const y = yFor(d.v);
        const isLast = i === series.length - 1;
        const isBaseYear = d.y === 2024;
        const fill = isLast ? 'var(--color-accent)'
                   : isBaseYear ? 'oklch(0.55 0.15 38 / 0.78)'
                   : 'var(--color-ink)';
        return (
          <g key={`b-${d.y}`}
             className="vx-bar"
             style={{ transitionDelay: `${260 + i * 38}ms`,
                      transformOrigin: `${cx}px ${baseY}px` }}>
            <rect x={cx - barW / 2} y={y} width={barW}
                  height={baseY - y} fill={fill} />
            <text x={cx} y={baseY + 22} textAnchor="middle"
                  fontFamily="var(--font-mono)" fontSize={14}
                  fill="var(--color-ink-mute)">{d.y}</text>
            {(isLast || isBaseYear) && (
              <text x={cx} y={y - 8} textAnchor="middle"
                    fontFamily="var(--font-mono)" fontSize={14}
                    fontWeight={600}
                    fill={isLast ? 'var(--color-accent)' : 'var(--color-ink)'}>
                {`${(d.v / 1000).toFixed(1)}k`}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function SmartWatch({ active }) {
  const [seconds, setSeconds] = useState(0);

  // Reset to 00:00 whenever the wrist pane goes inactive; first tick lands
  // ~600 ms after activation so the "Start Timer." beat reads first.
  useEffect(() => {
    if (!active) { setSeconds(0); return; }
    const id = setTimeout(() => setSeconds(1), 600);
    return () => clearTimeout(id);
  }, [active]);

  useEffect(() => {
    if (!active || seconds === 0) return;
    const id = setTimeout(() => setSeconds((s) => s + 1), 1000);
    return () => clearTimeout(id);
  }, [active, seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const r = 132;
  const C = 2 * Math.PI * r;
  const dashOffset = C * (1 - (seconds % 60) / 60);

  return (
    <div className={`watch ${active ? 'watch--running' : ''}`} aria-hidden>
      <div className="watch-strap watch-strap--top">
        <div className="watch-strap-stitch" />
        <div className="watch-strap-stitch" />
      </div>

      <div className="watch-body">
        <div className="watch-crown" />
        <div className="watch-button" />
        <div className="watch-face">
          <svg className="watch-ring" viewBox="0 0 320 320">
            <circle cx="160" cy="160" r={r}
                    stroke="rgba(255,255,255,0.10)" strokeWidth="6" fill="none" />
            <circle cx="160" cy="160" r={r}
                    stroke="var(--color-accent)" strokeWidth="6" fill="none"
                    strokeLinecap="round"
                    strokeDasharray={C} strokeDashoffset={dashOffset}
                    transform="rotate(-90 160 160)"
                    style={{ transition: seconds === 0 ? 'none' : 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div className="watch-time">{mm}:{ss}</div>
          <div className="watch-label">Timer</div>
          <div className={`watch-dot ${active && seconds > 0 ? 'watch-dot--pulse' : ''}`} />
        </div>
      </div>

      <div className="watch-strap watch-strap--bot">
        <div className="watch-strap-stitch" />
        <div className="watch-strap-stitch" />
      </div>
    </div>
  );
}

export default function VoiceEverywhere() {
  const [step, setStep] = useState(0);
  const [suffix, setSuffix] = useState(SUFFIX_OFF);
  const rootRef = useRef(null);

  const reveal = step === 2;
  const onDarkBackdrop = step < 2;

  // Reset when this slide loses focus.
  useEffect(() => {
    const onSlideChange = (e) => {
      const here = rootRef.current?.closest('section');
      if (!here) return;
      if (e.detail?.slide !== here) {
        setStep(0);
        setSuffix(SUFFIX_OFF);
      }
    };
    document.addEventListener('slidechange', onSlideChange);
    return () => document.removeEventListener('slidechange', onSlideChange);
  }, []);

  // Typewriter — only swaps when crossing the chart boundary (step 0/1 ↔ 2).
  useEffect(() => {
    const target = reveal ? SUFFIX_ON : SUFFIX_OFF;
    if (suffix === target) return;
    let common = 0;
    while (common < suffix.length && common < target.length &&
           suffix[common] === target[common]) common++;
    const erasing = suffix.length > common;
    const next = erasing
      ? suffix.slice(0, -1)
      : target.slice(0, suffix.length + 1);
    const id = setTimeout(() => setSuffix(next), erasing ? 30 : 55);
    return () => clearTimeout(id);
  }, [suffix, reveal]);

  // Right/left arrow steps through the panes; falls through to deck-stage
  // navigation only at the ends.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const section = rootRef.current?.closest('section');
      if (!section?.hasAttribute('data-deck-active')) return;
      const fwd  = e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Spacebar';
      const back = e.key === 'ArrowLeft'  || e.key === 'PageUp';
      if (fwd && step < LAST_STEP) {
        e.preventDefault(); e.stopPropagation();
        setStep(step + 1);
      } else if (back && step > 0) {
        e.preventDefault(); e.stopPropagation();
        setStep(step - 1);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [step]);

  const target = reveal ? SUFFIX_ON : SUFFIX_OFF;
  const typing = suffix !== target;

  const hint =
    step === 0 ? '→ on the wrist' :
    step === 1 ? '→ market data'  :
                 '← back   ·   → next slide';

  return (
    <SlideFrame>
      {/* Two full-bleed backdrops — siblings of vx-root, anchored to the
          stable section box. Cross-fade between them by step. */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        opacity: step === 0 ? 1 : 0,
        transition: 'opacity var(--anim-slide-dur) var(--anim-ease)',
        pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1920&q=80')",
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'saturate(0.85) contrast(1.1)',
          opacity: 0.65,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.6) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.78) 100%)',
        }} />
      </div>

      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        opacity: step === 1 ? 1 : 0,
        transition: 'opacity var(--anim-slide-dur) var(--anim-ease)',
        pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('${w.backdropUrl}')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'saturate(0.9) contrast(1.05) brightness(1.05)',
          opacity: 0.78,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0.55) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.6) 100%)',
        }} />
      </div>

      <div ref={rootRef} className={`vx-root vx-root--step-${step}`}>
        <div className="vx-head" style={{
          color: onDarkBackdrop ? '#f4f1ea' : 'var(--color-ink)',
          transition: 'color var(--anim-slide-dur) var(--anim-ease)',
        }}>
          <div className="eyebrow">{c.eyebrow}</div>
          <h1 className="title vx-title" style={{
            color: 'inherit',
            textShadow: onDarkBackdrop ? '0 4px 30px rgba(0,0,0,0.5)' : 'none',
            transition: 'text-shadow var(--anim-slide-dur) var(--anim-ease)',
          }}>
            {TITLE_PREFIX}<span className="vx-tw">{suffix}</span>
            <span className={`vx-caret ${typing ? 'vx-caret--blink' : ''}`} aria-hidden>|</span>
          </h1>
        </div>

        <div className="vx-panes">
          {/* Step 0 — bedroom + "Alexa." */}
          <div className="vx-body">
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 60, alignItems: 'center', height: '100%',
            }}>
              <p className="body" style={{
                maxWidth: 1000, fontSize: 32, lineHeight: 1.4,
                color: 'rgba(244,241,234,0.92)',
                textShadow: '0 2px 12px rgba(0,0,0,0.55)',
              }}
                 dangerouslySetInnerHTML={{ __html: c.bodyHTML }} />

              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 18,
                  letterSpacing: '0.18em', color: 'var(--color-accent)',
                  marginBottom: 16, textTransform: 'uppercase',
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                }}>◉ Always listening for one word</div>
                <div style={{
                  fontFamily: 'var(--font-sans)', fontSize: 110,
                  lineHeight: 1.0, fontWeight: 600, letterSpacing: '-0.03em',
                  color: '#f4f1ea',
                  textShadow: '0 4px 40px rgba(0,0,0,0.6)',
                }}>"Alexa."</div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 18,
                  letterSpacing: '0.12em', color: 'rgba(244,241,234,0.65)',
                  marginTop: 28, textTransform: 'uppercase',
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                }}>— overheard at 11:48&nbsp;PM</div>
              </div>
            </div>
          </div>

          {/* Step 1 — top-down track + smart-watch + "Start Timer." */}
          <div className="vx-wrist">
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 80, alignItems: 'center', height: '100%',
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontFamily: 'var(--font-sans)', fontSize: 110,
                  lineHeight: 1.0, fontWeight: 600, letterSpacing: '-0.03em',
                  color: '#f4f1ea',
                  textShadow: '0 4px 40px rgba(0,0,0,0.6)',
                }}>{w.quote}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <SmartWatch active={step === 1} />
              </div>
            </div>
          </div>

          {/* Step 2 — chart */}
          <div className="vx-market">
            <div className="vx-stats">
              {stats.map((s, i) => (
                <div key={s.label} className="vx-stat" style={{ transitionDelay: `${120 + i * 90}ms` }}>
                  <div className="vx-stat-label">{s.label}</div>
                  <div className="vx-stat-value">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="vx-chart" style={{ transitionDelay: '220ms' }}>
              <div className="vx-chart-title">{chartTitle}</div>
              <MarketChart />
            </div>
            <p className="small vx-source" style={{ transitionDelay: '320ms' }}>
              {sourceLabel}
              {sources.length > 0 ? (
                <>
                  {' · '}
                  {sources.map((source, i) => (
                    <span key={source.url}>
                      {i > 0 ? ' / ' : ''}
                      <a href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
                    </span>
                  ))}
                </>
              ) : sourceUrl ? (
                <>
                  {' · '}
                  <a href={sourceUrl} target="_blank" rel="noreferrer">{sourceUrl}</a>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="vx-hint" aria-hidden style={{
          zIndex: 1,
          right: 'var(--pad-x)',
          bottom: 80,
          color: onDarkBackdrop ? 'rgba(244,241,234,0.7)' : 'var(--color-ink-mute)',
          textShadow: onDarkBackdrop ? '0 2px 8px rgba(0,0,0,0.5)' : 'none',
          transition: 'color var(--anim-slide-dur) var(--anim-ease)',
        }}>
          {hint}
        </div>
      </div>
    </SlideFrame>
  );
}
