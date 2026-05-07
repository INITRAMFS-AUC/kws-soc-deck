import SlideFrame from '../components/SlideFrame.jsx';
import Callout from '../components/Callout.jsx';
import { getSlide } from '../content.js';

const c = getSlide('we-did').content;

export default function WeDid() {
  return (
    <SlideFrame>
      <div style={{ marginTop: 30 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ maxWidth: 1700, marginBottom: 50 }}>{c.title}</h1>
      </div>
      <div className="col-5" style={{ marginBottom: 40 }}>
        {c.pillars.map((p) => (
          <div key={p.head} className="specimen">
            <div className="head">{p.head}</div>
            <div className="lede" style={{ fontSize: 24 }}>{p.lede}</div>
            <p style={{ fontSize: 19 }}>{p.body}</p>
          </div>
        ))}
      </div>
      <Callout>{c.callout}</Callout>
    </SlideFrame>
  );
}
