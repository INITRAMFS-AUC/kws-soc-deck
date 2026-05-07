import SlideFrame from '../components/SlideFrame.jsx';
import Memmap from '../components/Memmap.jsx';
import { getSlide } from '../content.js';

const c = getSlide('18-register-map').content;

export default function RegisterMap() {
  return (
    <SlideFrame label="18 Register Map" topLeft={c.topLeft} bottomRight={c.pgnum}>
      <div style={{ marginTop: 40 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ marginBottom: 30 }}>{c.title}</h1>
        <p className="subtitle" style={{ maxWidth: 1700, fontSize: 30, marginBottom: 40 }}
           dangerouslySetInnerHTML={{ __html: c.subtitleHTML }} />
      </div>
      <Memmap headers={c.headers} rows={c.rows} />
    </SlideFrame>
  );
}
