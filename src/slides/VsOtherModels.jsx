import React from 'react';
import SlideFrame from '../components/SlideFrame.jsx';

const models = [
  {
    name: "DS-CNN small · Zhang '18",
    acc: '94.4 %',
    accBar: 94,
    params: '~38 K',
    paramsBar: 27,
    paramsAccent: false,
    macs: '5.4 M',
    macsBar: 73,
    macsAccent: false,
    highlight: false,
  },
  {
    name: "TC-ResNet8 · Choi '19",
    acc: '96.6 %',
    accBar: 96.6,
    params: '~66 K',
    paramsBar: 47,
    paramsAccent: false,
    macs: '6.0 M',
    macsBar: 81,
    macsAccent: false,
    highlight: false,
  },
  {
    name: "MatchboxNet · Majumdar '20",
    acc: '97.5 %',
    accBar: 97.5,
    params: '~140 K',
    paramsBar: 100,
    paramsAccent: false,
    macs: '7.4 M',
    macsBar: 100,
    macsAccent: false,
    highlight: false,
  },
  {
    name: '★ This work · ours',
    acc: '90.0 %',
    accBar: 90,
    params: '~16 K',
    paramsBar: 11,
    paramsAccent: true,
    macs: '0.97 M',
    macsBar: 13,
    macsAccent: true,
    highlight: true,
  },
  {
    name: "TinyConv · Banbury '21",
    acc: '87.6 %',
    accBar: 87.6,
    params: '~11 K',
    paramsBar: 8,
    paramsAccent: false,
    macs: '0.5 M',
    macsBar: 7,
    macsAccent: false,
    highlight: false,
  },
];

function AccBar({ pct, accent, highlight }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 10, background: 'rgba(26,26,26,0.08)', position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${pct}%`,
          background: accent || highlight ? 'var(--accent)' : 'var(--ink)',
        }} />
      </div>
    </div>
  );
}

export default function VsOtherModels() {
  return (
    <SlideFrame topLeft="14 · Model">
      <div style={{ marginTop: 36 }}>
        <div className="eyebrow">Where we land · accuracy vs parameters</div>
        <h1 className="title" style={{ marginBottom: 12 }}>90 % accuracy at a fraction of the parameter count.</h1>
        <p className="subtitle" style={{ maxWidth: 1700, marginBottom: 28 }}>
          Google Speech Commands. We trade a few accuracy points for an order-of-magnitude reduction in parameters and compute.
        </p>
      </div>

      <div style={{ border: '1px solid var(--ink)', background: 'var(--paper)', padding: '22px 28px', marginBottom: 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 1fr 1fr', gap: '12px 24px', alignItems: 'center', fontFamily: 'var(--font-mono)' }}>
          {/* Header */}
          <div style={{ fontSize: 18, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Model · paper</div>
          <div style={{ fontSize: 18, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Top-1 accuracy</div>
          <div style={{ fontSize: 18, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Parameters</div>
          <div style={{ fontSize: 18, color: 'var(--ink-mute)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>MACs / inference</div>

          {/* Divider */}
          <div style={{ gridColumn: '1 / -1', height: 1, background: 'rgba(26,26,26,0.12)', margin: '4px 0' }} />

          {/* Data rows — each model renders 4 grid cells via React.Fragment */}
          {models.map((m) => (
            <React.Fragment key={m.name}>
              {/* Col 1: Model name */}
              <div style={{
                fontSize: 20,
                color: m.highlight ? 'var(--accent)' : 'var(--ink)',
                fontWeight: m.highlight ? 600 : 400,
                padding: m.highlight ? '6px 0' : '4px 0',
              }}>
                {m.name}
              </div>

              {/* Col 2: Accuracy bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 10, background: 'rgba(26,26,26,0.08)', position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 0, height: '100%',
                    width: `${m.accBar}%`,
                    background: m.highlight ? 'var(--accent)' : 'var(--ink)',
                  }} />
                </div>
                <span style={{ fontSize: 18, color: m.highlight ? 'var(--accent)' : 'var(--ink)', minWidth: 52, fontWeight: m.highlight ? 600 : 400 }}>
                  {m.acc}
                </span>
              </div>

              {/* Col 3: Params bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 10, background: 'rgba(26,26,26,0.08)', position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 0, height: '100%',
                    width: `${m.paramsBar}%`,
                    background: m.paramsAccent ? 'var(--accent)' : 'var(--ink)',
                  }} />
                </div>
                <span style={{ fontSize: 18, color: m.paramsAccent ? 'var(--accent)' : 'var(--ink)', minWidth: 52, fontWeight: m.paramsAccent ? 600 : 400 }}>
                  {m.params}
                </span>
              </div>

              {/* Col 4: MACs bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 10, background: 'rgba(26,26,26,0.08)', position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 0, height: '100%',
                    width: `${m.macsBar}%`,
                    background: m.macsAccent ? 'var(--accent)' : 'var(--ink)',
                  }} />
                </div>
                <span style={{ fontSize: 18, color: m.macsAccent ? 'var(--accent)' : 'var(--ink)', minWidth: 52, fontWeight: m.macsAccent ? 600 : 400 }}>
                  {m.macs}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Callout cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
        <div style={{ background: 'var(--ink)', color: '#f4f1ea', padding: '18px 24px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>vs MatchboxNet</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em' }}>8.8× fewer params</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 20, color: 'rgba(244,241,234,0.6)', marginTop: 4 }}>7.6× fewer MACs · 7.5 pts lower accuracy</div>
        </div>
        <div style={{ background: 'var(--ink)', color: '#f4f1ea', padding: '18px 24px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>vs TC-ResNet8</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em' }}>4.1× fewer params</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 20, color: 'rgba(244,241,234,0.6)', marginTop: 4 }}>6.2× fewer MACs · 6.6 pts lower accuracy</div>
        </div>
        <div style={{ background: 'var(--accent)', color: '#fff', padding: '18px 24px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Our footprint</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em' }}>~ 16 K params · 0.97 M MACs</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 20, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>runs on a 36 MHz RV32IMAC</div>
        </div>
      </div>
    </SlideFrame>
  );
}
