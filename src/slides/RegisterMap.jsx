import SlideFrame from '../components/SlideFrame.jsx';
import Memmap from '../components/Memmap.jsx';
import { getSlide } from '../content.js';

const c = getSlide('register-map').content;

export default function RegisterMap() {
  return (
    <SlideFrame>
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
