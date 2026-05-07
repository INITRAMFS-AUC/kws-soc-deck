import SlideFrame from '../components/SlideFrame.jsx';
import Memmap from '../components/Memmap.jsx';
import { getSlide } from '../content.js';

const c = getSlide('07-memory-map').content;

export default function MemoryMap() {
  return (
    <SlideFrame label="07 Memory Map" topLeft={c.topLeft} bottomRight={c.pgnum}>
      <div style={{ marginTop: 40 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ marginBottom: 40 }}>{c.title}</h1>
      </div>
      <Memmap headers={c.headers} rows={c.rows} />
    </SlideFrame>
  );
}
