import SlideFrame from '../components/SlideFrame.jsx';
import Specimen from '../components/Specimen.jsx';
import Pull from '../components/Pull.jsx';
import { getSlide } from '../content.js';

const c = getSlide('03-commercial-reality').content;

export default function CommercialReality() {
  return (
    <SlideFrame label="03 Commercial Reality" topLeft={c.topLeft} bottomRight={c.pgnum}>
      <div style={{ marginTop: 30 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ marginBottom: 50 }}>{c.title}</h1>
      </div>
      <div className="col-2" style={{ marginBottom: 40 }}>
        {c.tiers.map((t) => (
          <Specimen key={t.head} head={t.head} lede={t.lede} body={t.body} />
        ))}
      </div>
      <Pull style={{ marginBottom: 30 }}>{c.pull}</Pull>
      <p className="body" style={{
        maxWidth: 1600, fontWeight: 'var(--fw-medium)',
        color: 'var(--color-ink)', fontSize: 'var(--type-body)',
      }}>{c.thesis}</p>
    </SlideFrame>
  );
}
