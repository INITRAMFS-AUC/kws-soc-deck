import { getSlide } from '../content.js';

const c = getSlide('21-what-we-built').content;

export default function WhatWeBuilt() {
  return (
    <section data-label="21 What We Built">
      <div className="cover" style={{ justifyContent: 'space-between' }}>
        <div className="top">
          <div className="brand"><span className="brand-mark" /><span>{c.brand}</span></div>
          <div>{c.defenseTag}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 24, color: 'var(--color-accent)',
              letterSpacing: 'var(--ls-caps-extra)', textTransform: 'uppercase', marginBottom: 28,
            }}>{c.eyebrow}</div>
            <div style={{
              fontSize: 92, lineHeight: 1.0, fontWeight: 'var(--fw-semibold)',
              letterSpacing: '-0.03em', color: 'var(--color-cream)',
            }}>{c.titleLineOne}<br />{c.titleLineTwo}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {c.stack.map((s) => (
              <div key={s.num} style={{
                background: s.accent ? 'var(--color-accent)' : 'var(--on-dark-12)',
                color: s.accent ? '#fff' : 'var(--color-cream)',
                padding: '14px 22px',
                fontFamily: 'var(--font-mono)', fontSize: 22,
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span>{s.num}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 50, alignItems: 'end',
          paddingTop: 40, borderTop: '1px solid var(--on-dark-15)',
        }}>
          {c.stats.map((s) => (
            <div key={s.label}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 20,
                textTransform: 'uppercase', letterSpacing: 'var(--ls-caps-wide)',
                color: 'var(--on-dark-50)', marginBottom: 10,
              }}>{s.label}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 64, fontWeight: 'var(--fw-medium)',
                color: s.accent ? 'var(--color-accent)' : 'var(--color-cream)',
                letterSpacing: '-0.03em',
              }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
