import SlideFrame from '../components/SlideFrame.jsx';
import Stat from '../components/Stat.jsx';
import OptChart from '../components/OptChart.jsx';
import { getSlide } from '../content.js';

const c = getSlide('20-optimization-journey').content;

export default function OptimizationJourney() {
  return (
    <SlideFrame label="20 Optimization Journey" topLeft={c.topLeft} bottomRight={c.pgnum}>
      <div style={{ marginTop: 30 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ marginBottom: 30 }}>{c.title}</h1>
      </div>
      <OptChart />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
        {c.stats.map((s) => (
          <Stat key={s.label} value={s.value} label={s.label} valueSize={s.size} />
        ))}
      </div>
    </SlideFrame>
  );
}
