import PivotSlide from '../components/PivotSlide.jsx';
import { getSlide } from '../content.js';

const c = getSlide('10-pivot-model').content;

export default function PivotModel() {
  return (
    <PivotSlide label="10 Pivot · Model" num={c.num} pgnum={c.pgnum}>
      {c.bodyMain}<em>{c.bodyEm}</em>
    </PivotSlide>
  );
}
