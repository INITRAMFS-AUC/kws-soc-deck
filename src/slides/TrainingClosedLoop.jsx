import SlideFrame from '../components/SlideFrame.jsx';
import { getSlide } from '../content.js';

const c = getSlide('training').content;

export default function TrainingClosedLoop() {
  return (
    <SlideFrame>
      <div style={{ marginTop: 40 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ marginBottom: 60 }}>{c.title}</h1>
      </div>
      <div className="col-3">
        {c.pillars.map((p) => (
          <div key={p.head} className="specimen">
            <div className="head">{p.head}</div>
            <div className="lede">{p.lede}</div>
            <p dangerouslySetInnerHTML={{ __html: p.bodyHTML }} />
          </div>
        ))}
      </div>
      <p className="body" style={{ marginTop: 50, maxWidth: 1700 }}>{c.footer}</p>
    </SlideFrame>
  );
}
