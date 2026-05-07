import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import { getSlide } from '../content.js';

const c = getSlide('voice').content;
const { stats, chartTitle, series, sourceLabel, sourceUrl } = c.market;

const TITLE_PREFIX = 'Voice command interfaces ';
const SUFFIX_OFF = 'are everywhere.';
const SUFFIX_ON  = 'Market Cap';

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
        const is2023 = d.y === 2023;
        const fill = isLast ? 'var(--color-accent)'
                   : is2023 ? 'oklch(0.55 0.15 38 / 0.78)'
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
            {(isLast || is2023) && (
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

export default function VoiceEverywhere() {
  const [reveal, setReveal] = useState(false);
  const [suffix, setSuffix] = useState(SUFFIX_OFF);
  const rootRef = useRef(null);

  // Reset when this slide loses focus.
  useEffect(() => {
    const onSlideChange = (e) => {
      const here = rootRef.current?.closest('section');
      if (!here) return;
      if (e.detail?.slide !== here) {
        setReveal(false);
        setSuffix(SUFFIX_OFF);
      }
    };
    document.addEventListener('slidechange', onSlideChange);
    return () => document.removeEventListener('slidechange', onSlideChange);
  }, []);

  // Typewriter: erase divergent tail, then type the new tail toward `target`.
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

  // Right-arrow / Space first reveals the chart, then advances the deck.
  // Left-arrow collapses; once collapsed it falls through to deck-stage's back-nav.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const section = rootRef.current?.closest('section');
      if (!section?.hasAttribute('data-deck-active')) return;
      const fwd  = e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Spacebar';
      const back = e.key === 'ArrowLeft'  || e.key === 'PageUp';
      if (fwd && !reveal) {
        e.preventDefault(); e.stopPropagation();
        setReveal(true);
      } else if (back && reveal) {
        e.preventDefault(); e.stopPropagation();
        setReveal(false);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [reveal]);

  const target = reveal ? SUFFIX_ON : SUFFIX_OFF;
  const typing = suffix !== target;

  return (
    <SlideFrame>
      <div ref={rootRef} className={`vx-root ${reveal ? 'vx-root--chart' : ''}`}>
        <div style={{ marginTop: 60 }}>
          <div className="eyebrow">{c.eyebrow}</div>
          <h1 className="title vx-title">
            {TITLE_PREFIX}<span className="vx-tw">{suffix}</span>
            <span className={`vx-caret ${typing ? 'vx-caret--blink' : ''}`} aria-hidden>|</span>
          </h1>
        </div>

        <div className="vx-panes">
          <p className="body vx-body" style={{ maxWidth: 1500, fontSize: 36, lineHeight: 1.4 }}
             dangerouslySetInnerHTML={{ __html: c.bodyHTML }} />

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
              {sourceLabel} ·{' '}
              <a href={sourceUrl} target="_blank" rel="noreferrer">grandviewresearch.com</a>
            </p>
          </div>
        </div>

        <div className="vx-hint" aria-hidden>
          {reveal ? '← back   ·   → next slide' : '→ market data'}
        </div>
      </div>
    </SlideFrame>
  );
}
