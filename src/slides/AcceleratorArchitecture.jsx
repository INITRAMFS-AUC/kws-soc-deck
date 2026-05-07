import SlideFrame from '../components/SlideFrame.jsx';
import Block from '../components/Block.jsx';
import { getSlide } from '../content.js';

const c = getSlide('accelerator-architecture').content;

export default function AcceleratorArchitecture() {
  return (
    <SlideFrame>
      <div style={{ marginTop: 30 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ marginBottom: 50, maxWidth: 1700 }}>{c.title}</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 30, alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
          <div className="tag" style={{ textAlign: 'right' }}>{c.apbTag}</div>
          <Block sub={c.apbSub} style={{ height: 'auto', padding: 18 }}>{c.apbLabel}</Block>
          <div style={{
            textAlign: 'right', color: 'var(--color-accent)',
            fontFamily: 'var(--font-mono)', fontSize: 20,
          }}>{c.apbArrow}</div>
        </div>
        <Block variant="accent" style={{
          padding: '36px 28px', height: 'auto',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18,
        }}>
          <div style={{ fontSize: 26, fontWeight: 'var(--fw-semibold)', letterSpacing: 'var(--ls-normal)' }}>
            {c.coreTitle}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 18 }}>
            {c.coreSteps.map((s) => (
              <div key={s} style={{ background: 'rgba(255,255,255,0.18)', padding: '10px 14px' }}>{s}</div>
            ))}
          </div>
        </Block>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
          <div className="tag">{c.ahbTag}</div>
          {c.ahbPaths.map((p) => (
            <Block key={p.label} sub={p.sub} style={{ height: 'auto', padding: '14px 18px', fontSize: 20 }}>
              {p.label}
            </Block>
          ))}
        </div>
      </div>
      <p className="body" style={{ marginTop: 36, maxWidth: 1700, textAlign: 'center' }}>
        {c.footer}
      </p>
    </SlideFrame>
  );
}
