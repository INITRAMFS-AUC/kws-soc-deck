import { useSlideMeta, pad2 } from '../slide-meta.js';

// Auto-derives `num` (top-left), `pgnum` (bottom-right), and data-label from
// manifest position. Override via props if needed.
export default function PivotSlide({ num, pgnum, label, labelText, kind, children }) {
  const { num: idx, total, slide } = useSlideMeta();
  const n = pad2(idx);
  const t = pad2(total);
  const k = kind ?? slide?.content?.kind ?? 'Pivot';
  const lt = labelText ?? slide?.label;
  const finalLabel = label ?? (lt ? `${n} ${lt}` : n);
  const finalNum = num ?? `${n} · ${k}`;
  const finalPgnum = pgnum ?? `${n} / ${t}`;
  return (
    <section data-label={finalLabel}>
      <div className="pivot">
        <div className="num">{finalNum}</div>
        <blockquote>{children}</blockquote>
        <div className="pgnum">{finalPgnum}</div>
      </div>
    </section>
  );
}
