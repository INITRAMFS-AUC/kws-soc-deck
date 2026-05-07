import SlideFrame from '../components/SlideFrame.jsx';
import Callout from '../components/Callout.jsx';
import { getSlide } from '../content.js';

const c = getSlide('pcb').content;

export default function Pcb() {
  return (
    <SlideFrame
                slideStyle={{ paddingRight: 60 }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60,
        height: '100%', alignItems: 'center', marginTop: 40,
      }}>
        <div>
          <div className="eyebrow">{c.eyebrow}</div>
          <h1 className="title" style={{ marginBottom: 30 }}>{c.title}</h1>
          <p className="body" style={{ marginBottom: 24 }}
             dangerouslySetInnerHTML={{ __html: c.bodyOneHTML }} />
          <p className="body" style={{ marginBottom: 30 }}>{c.bodyTwo}</p>
          <Callout style={{ fontSize: 22, padding: '18px 24px' }}>{c.callout}</Callout>
        </div>
        <div style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--line-hairline)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 760, overflow: 'hidden',
        }}>
          <img src={c.imageSrc} alt={c.imageAlt}
               style={{ width: '175%', height: '175%', objectFit: 'cover', objectPosition: 'center' }} />
        </div>
      </div>
    </SlideFrame>
  );
}
