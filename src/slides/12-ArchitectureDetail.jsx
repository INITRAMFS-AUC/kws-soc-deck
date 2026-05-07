import SlideFrame from '../components/SlideFrame.jsx';
import Memmap from '../components/Memmap.jsx';
import Stat from '../components/Stat.jsx';
import { getSlide } from '../content.js';

const c = getSlide('12-architecture-detail').content;

export default function ArchitectureDetail() {
  return (
    <SlideFrame label="12 Architecture Detail" topLeft={c.topLeft} bottomRight={c.pgnum}>
      <div style={{ marginTop: 40 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ marginBottom: 40 }}>{c.title}</h1>
      </div>
      <Memmap headers={c.headers} rows={c.rows} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 30, marginTop: 36 }}>
        {c.stats.map((s) => (
          <Stat key={s.label} value={s.value} label={s.label} valueSize={s.size} />
        ))}
      </div>
    </SlideFrame>
  );
}
