import { useEffect, useState } from 'react';
import { getSlide } from '../content.js';
import { useSlideMeta, pad2 } from '../slide-meta.js';

const c = getSlide('cover').content;

function NameCycler({ names, holdMs = 1500, typeMs = 70, eraseMs = 35 }) {
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

export default function Cover() {
  const { num, slide } = useSlideMeta();
  const dataLabel = `${pad2(num)} ${slide?.label ?? ''}`.trim();
  return (
    <section data-label={dataLabel}>
      <div className="cover">
        <div className="top">
          <div>
            <div className="brand"><span className="brand-mark" /><span>{c.brand}</span></div>
            <div className="cover-cycler">
              <NameCycler names={c.groupMembers} />
            </div>
          </div>
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
