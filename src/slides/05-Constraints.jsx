import SlideFrame from '../components/SlideFrame.jsx';
import Specimen from '../components/Specimen.jsx';
import { getSlide } from '../content.js';

const c = getSlide('05-constraints').content;

export default function Constraints() {
  return (
    <SlideFrame label="05 Constraints" topLeft={c.topLeft} bottomRight={c.pgnum}>
      <div style={{ marginTop: 40 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ maxWidth: 1500, marginBottom: 30 }}>{c.title}</h1>
        <p className="subtitle" style={{ maxWidth: 1500, marginBottom: 80 }}>{c.subtitle}</p>
      </div>
      <div className="col-3">
        {c.constraints.map((s) => (
          <Specimen key={s.head} head={s.head} lede={s.lede} body={s.body} />
        ))}
      </div>
    </SlideFrame>
  );
}
