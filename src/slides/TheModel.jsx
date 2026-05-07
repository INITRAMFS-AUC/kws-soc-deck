import SlideFrame from '../components/SlideFrame.jsx';
import Block from '../components/Block.jsx';
import Arrow from '../components/Arrow.jsx';
import Callout from '../components/Callout.jsx';
import { getSlide } from '../content.js';

const c = getSlide('the-model').content;

export default function TheModel() {
  return (
    <SlideFrame>
      <div style={{ marginTop: 30 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ marginBottom: 50 }}>{c.title}</h1>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 28px 1.4fr 28px 1.1fr 28px 0.9fr 28px 1fr',
        alignItems: 'stretch', gap: 0, marginBottom: 30,
      }}>
        {c.flow.map((b, i) => (
          <>
            {i > 0 && <Arrow key={`arr-${i}`} />}
            <Block key={`blk-${i}`} variant={b.variant}
                   sub={<span dangerouslySetInnerHTML={{ __html: b.sub }} />}
                   style={{ height: 130 }}>{b.label}</Block>
          </>
        ))}
      </div>
      <p className="body" style={{ maxWidth: 1700, marginBottom: 22 }}
         dangerouslySetInnerHTML={{ __html: c.bodyHTML }} />
      <Callout>{c.callout}</Callout>
    </SlideFrame>
  );
}
