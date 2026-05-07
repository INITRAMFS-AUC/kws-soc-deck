import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import { getSlide } from '../content.js';

const c = getSlide('kws-nlp').content;

function SiriOrb({ active }) {
  return (
    <div className={`siri-orb ${active ? 'siri-orb--active' : ''}`} aria-hidden>
      <span className="siri-blob siri-blob--a" />
      <span className="siri-blob siri-blob--b" />
      <span className="siri-blob siri-blob--c" />
      <span className="siri-blob siri-blob--d" />
      <span className="siri-blob siri-blob--e" />
      <span className="siri-orb-rim" />
    </div>
  );
}

export default function KwsNlp() {
  const [active, setActive] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onSlideChange = (e) => {
      const here = rootRef.current?.closest('section');
      if (!here) return;
      if (e.detail?.slide !== here) setActive(false);
    };
    document.addEventListener('slidechange', onSlideChange);
    return () => document.removeEventListener('slidechange', onSlideChange);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const section = rootRef.current?.closest('section');
      if (!section?.hasAttribute('data-deck-active')) return;
      const fwd  = e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Spacebar';
      const back = e.key === 'ArrowLeft'  || e.key === 'PageUp';
      if (fwd && !active) {
        e.preventDefault(); e.stopPropagation();
        setActive(true);
      } else if (back && active) {
        e.preventDefault(); e.stopPropagation();
        setActive(false);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [active]);

  return (
    <SlideFrame>
      <div ref={rootRef} className="kws-root">
        <div style={{ marginTop: 40 }}>
          <div className="eyebrow">{c.eyebrow}</div>
          <h1 className="title" style={{ fontSize: 78, maxWidth: 1700, marginBottom: 50 }}>
            {c.title}
          </h1>
        </div>

        <div className="kws-grid">
          <p className="body kws-body">{c.body}</p>

          <div className="kws-siri">
            <SiriOrb active={active} />
            <div className={`siri-caption ${active ? 'siri-caption--show' : ''}`}>
              {c.wakePhrase}
            </div>
          </div>
        </div>

        <div className="vx-hint" aria-hidden>
          {active ? '← back   ·   → next slide' : '→ wake Siri'}
        </div>
      </div>
    </SlideFrame>
  );
}
