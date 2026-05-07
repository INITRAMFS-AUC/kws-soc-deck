import SlideFrame from '../components/SlideFrame.jsx';
import Block from '../components/Block.jsx';
import Arrow from '../components/Arrow.jsx';
import Callout from '../components/Callout.jsx';
import { getSlide } from '../content.js';

const c = getSlide('live-inference').content;

export default function LiveInference() {
  return (
    <SlideFrame>
      <div style={{ marginTop: 30 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ marginBottom: 50 }}>{c.title}</h1>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '0.9fr 24px 1fr 24px 1.1fr 24px 1.4fr 24px 0.9fr',
        alignItems: 'stretch', gap: 0, marginBottom: 16,
      }}>
        {c.pipeStart.map((b, i) => (
          <>
            {i > 0 && <Arrow key={`a-${i}`} />}
            <Block key={`b-${i}`} sub={b.sub} style={{ height: 110 }}>{b.label}</Block>
          </>
        ))}
        <Arrow />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {c.buffers.map((buf) => (
            <Block key={buf.label}
                   variant={buf.variant === 'accent' ? 'accent' : undefined}
                   style={{
                     height: 51, padding: '6px 16px', fontSize: 20,
                     ...(buf.variant === 'dashed' ? { borderStyle: 'dashed' } : {}),
                   }}>{buf.label}</Block>
          ))}
        </div>
        <Arrow />
        <Block sub={c.pipeEnd.sub} style={{ height: 110 }}>
          <span dangerouslySetInnerHTML={{ __html: c.pipeEnd.labelHTML }} />
        </Block>
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 18,
        color: 'var(--color-accent)', textAlign: 'center', marginBottom: 30,
        letterSpacing: '0.06em',
      }}>{c.pingpong}</div>
      <p className="body" style={{ maxWidth: 1700, marginBottom: 20 }}
         dangerouslySetInnerHTML={{ __html: c.bodyHTML }} />
      <Callout>{c.callout}</Callout>
    </SlideFrame>
  );
}
