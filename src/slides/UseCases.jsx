import React, { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';

/* ─────────────────────────────────────────────────────────────────────────────
 * Slide 17 — Real-world use cases for the multi-command KWS system.
 *
 * Shows 4 deployment contexts (healthcare, smart home, robotics, accessibility)
 * with their command subsets and on-device accuracy measured on 30 held-out
 * INMP441 recordings per keyword — truly unseen during training.
 *
 * Same animated-bar pattern as VsOtherModels. Bars grow left-to-right when
 * the slide becomes active, staggered by row.
 * ───────────────────────────────────────────────────────────────────────── */

const CASES = [
  {
    industry: 'Healthcare',
    application: 'Hands-free patient confirmation',
    commands: 'yes · no',
    acc: 98.5,
    accLabel: '98.5 %',
  },
  {
    industry: 'Smart home',
    application: 'Device & appliance control',
    commands: 'on · off',
    acc: 97.7,
    accLabel: '97.7 %',
  },
  {
    industry: 'Robotics',
    application: 'Autonomous navigation',
    commands: 'go · left · right · stop',
    acc: 96.2,
    accLabel: '96.2 %',
  },
  {
    industry: 'Accessibility',
    application: 'Motorised wheelchair / lift',
    commands: 'up · down',
    acc: 99.2,
    accLabel: '99.2 %',
    highlight: true,
  },
];

const ROW_STAGGER_MS = 140;
const BAR_DUR_MS     = 900;
const BAR_EASE       = 'cubic-bezier(0.16, 1, 0.3, 1)';

export default function UseCases() {
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
    <SlideFrame>
      <div ref={rootRef} style={{ marginTop: 36 }}>
        <div className="eyebrow">Applications · Mel Compact</div>
        <h1 className="title" style={{ marginBottom: 12 }}>One model family. Any command set.</h1>
        <p className="subtitle" style={{ maxWidth: 1700, marginBottom: 28 }}>
          The 11-class backbone fine-tuned per use case. Accuracy on 30 held-out samples
          recorded through the deployed INMP441 — not seen during training.
        </p>
      </div>

      <div style={{ border: '1px solid var(--ink)', background: 'var(--paper)', padding: '22px 28px', marginBottom: 22 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '220px 280px 260px 1fr',
          gap: '14px 24px',
          alignItems: 'center',
          fontFamily: 'var(--font-mono)',
        }}>
          {/* Header row */}
          {['Industry', 'Application', 'Commands', 'On-device accuracy'].map((h) => (
            <div key={h} style={{ fontSize: 17, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {h}
            </div>
          ))}

          {/* Divider */}
          <div style={{ gridColumn: '1 / -1', height: 1, background: 'rgba(26,26,26,0.12)', margin: '4px 0' }} />

          {CASES.map((c, i) => {
            const delay = i * ROW_STAGGER_MS;
            return (
              <React.Fragment key={c.industry}>
                {/* Industry */}
                <Cell delay={delay} active={active}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--accent)' }}>
                    {c.industry}
                  </div>
                </Cell>

                {/* Application */}
                <Cell delay={delay} active={active}>
                  <div style={{ fontSize: 19, color: 'var(--ink-mute)' }}>
                    {c.application}
                  </div>
                </Cell>

                {/* Commands */}
                <Cell delay={delay + 40} active={active}>
                  <div style={{ fontSize: 19, color: 'var(--ink)', letterSpacing: '0.04em' }}>
                    {c.commands}
                  </div>
                </Cell>

                {/* Accuracy bar */}
                <Bar pct={c.acc} label={c.accLabel} active={active} delay={delay + 80} highlight={c.highlight} />
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        <CalloutCard
          eyebrow="Same backbone"
          big="One model, four deployments"
          sub="11-class Mel Compact fine-tuned per command set — no retraining from scratch"
        />
        <CalloutCard
          eyebrow="On-device accuracy"
          big="96 – 99 %"
          sub="Measured on 30 unseen INMP441 recordings per keyword"
        />
        <CalloutCard
          eyebrow="Real-time on chip"
          big="30 ms inference"
          sub="36 MHz RV32IMAC · Conv1D accelerator · NNoM int8"
          accent
        />
      </div>
    </SlideFrame>
  );
}

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
      color: '#f4f1ea',
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
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em' }}>{big}</div>
      <div style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 19,
        color: accent ? 'rgba(255,255,255,0.85)' : 'rgba(244,241,234,0.65)',
        marginTop: 4,
      }}>{sub}</div>
    </div>
  );
}
