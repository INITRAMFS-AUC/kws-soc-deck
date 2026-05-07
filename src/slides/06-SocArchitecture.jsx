import SlideFrame from '../components/SlideFrame.jsx';
import Block from '../components/Block.jsx';
import { getSlide } from '../content.js';

const c = getSlide('06-soc').content;

export default function SocArchitecture() {
  return (
    <SlideFrame label="06 SoC Architecture" topLeft={c.topLeft} bottomRight={c.pgnum}>
      <div style={{ marginTop: 30 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ marginBottom: 40 }}>{c.title}</h1>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr', gap: 16,
        maxWidth: 1700, textAlign: 'center',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
          {c.rowOne.map((b) => (
            <Block key={b.label} variant={b.variant} sub={b.sub}
                   style={{ height: 110, ...(b.style || {}) }}>{b.label}</Block>
          ))}
        </div>
        <Block variant="muted" style={{ height: 56 }}>{c.bus}</Block>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          {c.rowTwo.map((b) => (
            <Block key={b.label} variant={b.variant} sub={b.sub}
                   style={{ height: 110, ...(b.style || {}) }}>{b.label}</Block>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          <div />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, textAlign: 'center' }}>
            {c.peripherals.map((b) => (
              <Block key={b.label} sub={b.sub} style={{ height: 110 }}>{b.label}</Block>
            ))}
          </div>
        </div>
      </div>
      <p className="body" style={{ marginTop: 36, maxWidth: 1700 }}>{c.footer}</p>
    </SlideFrame>
  );
}
