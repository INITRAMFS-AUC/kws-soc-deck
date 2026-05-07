import SlideFrame from '../components/SlideFrame.jsx';
import Specimen from '../components/Specimen.jsx';
import { getSlide } from '../content.js';

const c = getSlide('19-three-decisions').content;

export default function ThreeDecisions() {
  return (
    <SlideFrame label="19 Three Decisions" topLeft={c.topLeft} bottomRight={c.pgnum}>
      <div style={{ marginTop: 40 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ marginBottom: 50 }}>{c.title}</h1>
      </div>
      <div className="col-3">
        {c.decisions.map((d) => (
          <Specimen key={d.head} head={d.head} lede={d.lede} body={d.body} />
        ))}
      </div>
      <p className="body" style={{ marginTop: 50, maxWidth: 1700 }}>{c.footer}</p>
    </SlideFrame>
  );
}
