import React, { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';

/* ─────────────────────────────────────────────────────────────────────────────
 * Slide 13 — accuracy / params / MACs against the published KWS leaderboard.
 *
 * Bars grow from 0 to their target width when the slide becomes active,
 * staggered by row so the eye reads the comparison top-down. Listed in
 * descending accuracy order so we land directly under DS-CNN, our closest
 * accuracy neighbour (94.4 → 90.0).
 * ───────────────────────────────────────────────────────────────────────── */

const MAX_PARAMS = 140;   // K params used as 100 % bar reference (was MatchboxNet)
const MAX_MACS   = 7.4;   // M MACs used as 100 % bar reference

const models = [
  {
    name: "MatchboxNet · Majumdar '20",
    acc: 97.5, accLabel: '97.5 %',
    paramsK: 140, paramsLabel: '~140 K',
    macsM: 7.4,  macsLabel: '7.4 M',
  },
  {
    name: "TC-ResNet8 · Choi '19",
    acc: 96.6, accLabel: '96.6 %',
    paramsK: 66, paramsLabel: '~66 K',
    macsM: 6.0, macsLabel: '6.0 M',
  },
  {
    name: "DS-CNN small · Zhang '18",
    acc: 94.4, accLabel: '94.4 %',
    paramsK: 38, paramsLabel: '~38 K',
    macsM: 5.4, macsLabel: '5.4 M',
  },
  {
    name: '★ Mel Compact · ours',
    acc: 90.0, accLabel: '90.0 %',
    paramsK: 16, paramsLabel: '~16 K',
    macsM: 0.97, macsLabel: '0.97 M',
    highlight: true,
  },
];

const ROW_STAGGER_MS = 140;
const BAR_DUR_MS     = 900;
const BAR_EASE       = 'cubic-bezier(0.16, 1, 0.3, 1)';

export default function VsOtherModels() {
  const rootRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onSlideChange = (e) => {
      const mySection = rootRef.current?.closest('section');
      if (!mySection) return;
      setActive(e.detail.slide === mySection);
    };
    document.addEventListener('slidechange', onSlideChange);
    return () => document.removeEventListener('slidechange', onSlideChange);
  }, []);

  return (
    <SlideFrame topLeft="12 · Model">
      <div ref={rootRef} style={{ marginTop: 36 }}>
        <div className="eyebrow">Where we land · accuracy vs parameters</div>
        <h1 className="title" style={{ marginBottom: 12 }}>90 % accuracy at a fraction of the parameter count.</h1>
        <p className="subtitle" style={{ maxWidth: 1700, marginBottom: 28 }}>
          Google Speech Commands. We trade ~4.4 accuracy points against DS-CNN — our closest neighbour — for 2.4× fewer parameters and 5.6× fewer MACs.
        </p>
      </div>

      <div style={{ border: '1px solid var(--ink)', background: 'var(--paper)', padding: '22px 28px', marginBottom: 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 1fr 1fr', gap: '14px 24px', alignItems: 'center', fontFamily: 'var(--font-mono)' }}>
          <div style={{ fontSize: 18, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Model · paper</div>
          <div style={{ fontSize: 18, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Top-1 accuracy</div>
          <div style={{ fontSize: 18, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Parameters</div>
          <div style={{ fontSize: 18, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>MACs / inference</div>

          <div style={{ gridColumn: '1 / -1', height: 1, background: 'rgba(26,26,26,0.12)', margin: '4px 0' }} />

          {models.map((m, i) => {
            const delay = i * ROW_STAGGER_MS;
            const isLast = i === models.length - 1;
            return (
              <React.Fragment key={m.name}>
                <Cell delay={delay} active={active}>
                  <div style={{
                    fontSize: 20,
                    color: m.highlight ? 'var(--accent)' : 'var(--ink)',
                    fontWeight: m.highlight ? 600 : 400,
                  }}>
                    {m.name}
                  </div>
                </Cell>

                <Bar pct={m.acc}                     label={m.accLabel}    active={active} delay={delay} highlight={m.highlight} />
                <Bar pct={(m.paramsK / MAX_PARAMS) * 100} label={m.paramsLabel} active={active} delay={delay + 60} highlight={m.highlight} />
                <Bar pct={(m.macsM   / MAX_MACS)   * 100} label={m.macsLabel}  active={active} delay={delay + 120} highlight={m.highlight} />

                {/* Divider between DS-CNN and ours so the "closest neighbour" framing reads. */}
                {!isLast && i === models.length - 2 && (
                  <div style={{ gridColumn: '1 / -1', height: 1, background: 'var(--accent)', opacity: 0.3, margin: '2px 0' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        <CalloutCard
          eyebrow="vs MatchboxNet"
          big="8.8× fewer params"
          sub="7.6× fewer MACs · 7.5 pts lower accuracy"
        />
        <CalloutCard
          eyebrow="vs DS-CNN small"
          big="2.4× fewer params"
          sub="5.6× fewer MACs · 4.4 pts lower accuracy"
        />
        <CalloutCard
          eyebrow="Our footprint"
          big="~16 K params · 0.97 M MACs"
          sub="runs on a 36 MHz RV32IMAC"
          accent
        />
      </div>
    </SlideFrame>
  );
}

/* Row cell that fades + slides up on slide entry. */
function Cell({ active, delay, children }) {
  return (
    <div style={{
      opacity: active ? 1 : 0,
      transform: active ? 'translateY(0)' : 'translateY(8px)',
      transition: `opacity 600ms ease ${delay}ms, transform 600ms ${BAR_EASE} ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* Animated bar — track + fill that grows from 0 % to target on slide entry. */
function Bar({ pct, label, active, delay, highlight }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 12, background: 'rgba(26,26,26,0.08)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: active ? `${Math.min(100, pct)}%` : '0%',
          background: highlight ? 'var(--accent)' : 'var(--ink)',
          transition: `width ${BAR_DUR_MS}ms ${BAR_EASE} ${delay}ms`,
        }} />
      </div>
      <span style={{
        fontSize: 18,
        color: highlight ? 'var(--accent)' : 'var(--ink)',
        minWidth: 64,
        fontWeight: highlight ? 600 : 400,
        opacity: active ? 1 : 0,
        transition: `opacity 500ms ease ${delay + BAR_DUR_MS - 200}ms`,
      }}>
        {label}
      </span>
    </div>
  );
}

function CalloutCard({ eyebrow, big, sub, accent }) {
  return (
    <div style={{
      background: accent ? 'var(--accent)' : 'var(--ink)',
      color: accent ? '#fff' : '#f4f1ea',
      padding: '18px 24px',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 18,
        color: accent ? 'rgba(255,255,255,0.85)' : 'var(--accent)',
        textTransform: 'uppercase',
        fontWeight: 600,
        marginBottom: 6,
      }}>{eyebrow}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em' }}>{big}</div>
      <div style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 19,
        color: accent ? 'rgba(255,255,255,0.85)' : 'rgba(244,241,234,0.65)',
        marginTop: 4,
      }}>{sub}</div>
    </div>
  );
}
