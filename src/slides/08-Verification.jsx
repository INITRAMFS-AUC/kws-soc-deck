import SlideFrame from '../components/SlideFrame.jsx';
import { getSlide } from '../content.js';

const c = getSlide('08-verification').content;

export default function Verification() {
  return (
    <SlideFrame label="08 Verification" topLeft={c.topLeft} bottomRight={c.pgnum}>
      <div style={{ marginTop: 40 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ marginBottom: 60 }}>{c.title}</h1>
      </div>
      <div className="col-3">
        {c.rungs.map((r) => (
          <div key={r.head} className="specimen">
            <div className="head">{r.head}</div>
            <div className="lede">{r.lede}</div>
            <p dangerouslySetInnerHTML={{ __html: r.bodyHTML }} />
          </div>
        ))}
      </div>
      <p className="body" style={{ marginTop: 50, maxWidth: 1700 }}>{c.footer}</p>
    </SlideFrame>
  );
}
