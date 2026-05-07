import { useSlideMeta, pad2 } from '../slide-meta.js';

// All chrome is auto-derived from manifest position via SlideMetaContext.
// `kind` (top-left descriptor like 'Context') comes from the slide's content.
// Override any of the chrome strings via props if a slide needs custom text.
export default function SlideFrame({
  topRight = 'KWS-SoC',
  bottomLeft = 'InitRamFS · 2026',
  topLeft, bottomRight, label, kind, labelText,
  slideStyle, children,
}) {
  const { num, total, slide } = useSlideMeta();
  const n = pad2(num);
  const t = pad2(total);
  const k = kind ?? slide?.content?.kind;
  const lt = labelText ?? slide?.label;
  const finalLabel = label ?? (lt ? `${n} ${lt}` : n);
  const finalTopLeft = topLeft ?? (k ? `${n} · ${k}` : null);
  const finalBottomRight = bottomRight ?? `${n} / ${t}`;
  return (
    <section data-label={finalLabel}>
      <div className="slide" style={slideStyle}>
        {(finalTopLeft || topRight) && (
          <div className="chrome-top">
            <span>{finalTopLeft}</span>
            <span>{topRight}</span>
          </div>
        )}
        {children}
        {(bottomLeft || finalBottomRight) && (
          <div className="chrome-bottom">
            <span>{bottomLeft}</span>
            <span>{finalBottomRight}</span>
          </div>
        )}
      </div>
    </section>
  );
}
