import PivotSlide from '../components/PivotSlide.jsx';
import { getSlide } from '../content.js';

const c = getSlide('pivot-model').content;

export default function PivotModel() {
  return (
    <PivotSlide num={c.num}>
      {c.bodyMain}<em>{c.bodyEm}</em>
    </PivotSlide>
  );
}
