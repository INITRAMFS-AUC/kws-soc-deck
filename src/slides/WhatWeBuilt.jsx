import { getSlide } from '../content.js';
import { useSlideMeta, pad2 } from '../slide-meta.js';

const c = getSlide('what-we-built').content;

export default function WhatWeBuilt() {
  const { num, total, slide } = useSlideMeta();
  const n = pad2(num);
  const t = pad2(total);
  const dataLabel = `${n} ${slide?.label ?? ''}`.trim();
  const defenseTag = `${n} / ${t} ${c.defenseTagSuffix}`.trim();
  return (
    <section data-label={dataLabel}>
      <div className="cover" style={{ justifyContent: 'space-between' }}>
        <div className="top">
          <div className="brand"><span className="brand-mark" /><span>{c.brand}</span></div>
          <div>{defenseTag}</div>
        </div>
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
