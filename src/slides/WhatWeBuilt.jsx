import { useEffect, useState } from 'react';
import { getSlide } from '../content.js';
import { useSlideMeta, pad2 } from '../slide-meta.js';

const c = getSlide('what-we-built').content;
const groupMembers = getSlide('cover').content.groupMembers;

function NameCycler({ names, holdMs = 1500, typeMs = 25, eraseMs = 15 }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    const target = names[i];
    if (!erasing) {
      if (text === target) {
        const id = setTimeout(() => setErasing(true), holdMs);
        return () => clearTimeout(id);
      }
      const id = setTimeout(() => setText(target.slice(0, text.length + 1)), typeMs);
      return () => clearTimeout(id);
    }
    if (text === '') {
      setErasing(false);
      setI((i + 1) % names.length);
      return;
    }
    const id = setTimeout(() => setText(text.slice(0, -1)), eraseMs);
    return () => clearTimeout(id);
  }, [text, erasing, i, names, holdMs, typeMs, eraseMs]);

  return (
    <>
      <span>{text}</span>
      <span className="vx-caret vx-caret--blink" aria-hidden>|</span>
    </>
  );
}

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
          <div>
            <div className="brand"><span className="brand-mark" /><span>{c.brand}</span></div>
            <div className="cover-cycler">
              <NameCycler names={groupMembers} />
            </div>
          </div>
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
