import PivotSlide from '../components/PivotSlide.jsx';
import { getSlide } from '../content.js';

const c = getSlide('pivot-accelerator').content;

export default function PivotAccelerator() {
  return (
    <PivotSlide num={c.num}>
      {c.bodyMain}<em>{c.bodyEm}</em>
    </PivotSlide>
  );
}
