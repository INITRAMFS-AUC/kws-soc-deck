import { getSlide } from '../content.js';

const c = getSlide('01-cover').content;

export default function Cover() {
  return (
    <section data-label="01 Cover">
      <div className="cover">
        <div className="top">
          <div className="brand"><span className="brand-mark" /><span>{c.brand}</span></div>
          <div>{c.defenseTag}</div>
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 24,
            color: 'var(--color-accent)',
            letterSpacing: 'var(--ls-caps-extra)',
            textTransform: 'uppercase',
            marginBottom: 36,
          }}>{c.eyebrow}</div>
          <div className="display">{c.displayLeft}<em>{c.displayAccent}</em></div>
        </div>
        <div className="meta">
          {c.meta.map((m) => (
            <div key={m.label}>
              <div className="label">{m.label}</div>
              <div className={m.mono ? 'val mono' : 'val'}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
