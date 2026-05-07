import SlideFrame from '../components/SlideFrame.jsx';
import Specimen from '../components/Specimen.jsx';
import { getSlide } from '../content.js';

const c = getSlide('data-gap').content;

export default function DataGap() {
  return (
    <SlideFrame>
      <div style={{ marginTop: 40 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ marginBottom: 40, maxWidth: 1700 }}>{c.title}</h1>
      </div>
      <div className="col-2" style={{ marginBottom: 40 }}>
        {c.sources.map((s) => (
          <Specimen key={s.head} head={s.head} lede={s.lede} body={s.body} />
        ))}
      </div>
      <p className="body" style={{ maxWidth: 1700, marginBottom: 30 }}
         dangerouslySetInnerHTML={{ __html: c.bodyHTML }} />
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
        gap: 30, padding: '28px 36px',
        background: 'var(--color-ink)', color: 'var(--color-cream)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 20, letterSpacing: 'var(--ls-caps-wide)',
            textTransform: 'uppercase', color: 'var(--on-dark-50)', marginBottom: 10,
          }}>{c.gscLabel}</div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 72, fontWeight: 'var(--fw-medium)',
            letterSpacing: '-0.03em', color: 'var(--on-dark-85)',
          }}>{c.gscValue}</div>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 18, letterSpacing: 'var(--ls-caps-wide)',
          textTransform: 'uppercase', color: 'var(--color-accent)',
        }}>{c.arrowLabel}</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 20, letterSpacing: 'var(--ls-caps-wide)',
            textTransform: 'uppercase', color: 'var(--on-dark-50)', marginBottom: 10,
          }}>{c.micLabel}</div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 72, fontWeight: 'var(--fw-medium)',
            letterSpacing: '-0.03em', color: 'var(--color-accent)',
          }}>{c.micValue}</div>
        </div>
      </div>
    </SlideFrame>
  );
}
