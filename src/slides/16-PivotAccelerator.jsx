import PivotSlide from '../components/PivotSlide.jsx';
import { getSlide } from '../content.js';

const c = getSlide('16-pivot-accelerator').content;

export default function PivotAccelerator() {
  return (
    <PivotSlide label="16 Pivot · Accelerator" num={c.num} pgnum={c.pgnum}>
      {c.bodyMain}<em>{c.bodyEm}</em>
    </PivotSlide>
  );
}
