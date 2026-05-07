import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import Pull from '../components/Pull.jsx';
import { getSlide } from '../content.js';

const c = getSlide('commercial-reality').content;

const EASE = 'cubic-bezier(.4,0,.2,1)';
const DUR = 480;

function ComparisonView({ comparison }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 36,
      minHeight: 0, alignItems: 'start', height: '100%',
    }}>
      <div style={{ minWidth: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 12, fontSize: 15 }}>
          {comparison.tableTitle}
        </div>
        <table style={{
          width: '100%', borderCollapse: 'collapse',
          fontSize: 22, color: 'var(--color-ink)', tableLayout: 'fixed',
        }}>
          <thead>
            <tr>
              {comparison.headers.map((h) => (
                <th key={h} style={{
                  textAlign: 'left', padding: '12px 14px',
                  borderBottom: '2px solid var(--color-accent)',
                  fontFamily: 'var(--font-mono)', fontSize: 15,
                  letterSpacing: 'var(--ls-caps-wide)', textTransform: 'uppercase',
                  color: 'var(--color-ink-mute)', fontWeight: 'var(--fw-medium)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{
                    padding: '14px',
                    borderBottom: '1px solid var(--line-soft)',
                    fontFamily: j === 0 ? 'var(--font-sans)' : 'var(--font-mono)',
                    fontWeight: j === 0 ? 'var(--fw-medium)' : 'var(--fw-regular)',
                  }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 12, fontSize: 15 }}>
          {comparison.featuresTitle}
        </div>
        <ul style={{
          listStyle: 'none', padding: 0, margin: 0,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 22px',
          fontSize: 19, color: 'var(--color-ink)',
        }}>
          {comparison.features.map((f) => (
            <li key={f} style={{ paddingLeft: 22, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--color-accent)' }}>—</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DefaultView({ tier, pull }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: tier.imageSrc ? 'auto 1fr' : '1fr',
      gap: 28, alignItems: 'stretch', height: '100%',
    }}>
      {tier.imageSrc && (
        <div style={{
          border: '1px solid var(--line-hairline)',
          background: 'var(--color-paper)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', minHeight: 0, width: 'auto',
        }}>
          <img src={`${import.meta.env.BASE_URL}${tier.imageSrc}`} alt={tier.imageAlt}
               style={{ width: 'auto', height: '100%', objectFit: 'contain', objectPosition: 'center' }} />
        </div>
      )}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 14,
        alignSelf: 'center', minHeight: 0, minWidth: 0,
      }}>
        <ul className="body" style={{
          fontSize: 'var(--type-body)', color: 'var(--color-ink)',
          margin: 0, maxWidth: 720,
          paddingLeft: 0, listStyle: 'none',
        }}>
          {tier.bullets?.map((b) => (
            <li key={b} style={{ marginBottom: 8, paddingLeft: 24, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--color-accent)' }}>—</span>
              {b}
            </li>
          ))}
        </ul>
        {pull && <Pull style={{ fontSize: 20, maxWidth: 720, padding: '18px 24px' }}>{pull}</Pull>}
      </div>
    </div>
  );
}

function Sources({ sources }) {
  if (!sources?.length) return null;
  return (
    <div style={{
      paddingTop: 12, marginTop: 14,
      borderTop: '1px solid var(--line-soft)',
      fontFamily: 'var(--font-mono)', fontSize: 13,
      color: 'var(--color-ink-mute)',
      letterSpacing: 'var(--ls-caps)', textTransform: 'uppercase',
    }}>
      <span style={{ marginRight: 10 }}>Sources ·</span>
      {sources.map((s, i) => (
        <span key={i}>
          {s.url ? (
            <a href={s.url} target="_blank" rel="noreferrer"
               style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
              {s.label}
            </a>
          ) : (
            <span>{s.label}</span>
          )}
          {i < sources.length - 1 && <span style={{ margin: '0 10px' }}>·</span>}
        </span>
      ))}
    </div>
  );
}

function TierBox({ tier, expanded, pull, view = 'default' }) {
  const showCompare = view === 'compare' && tier.comparison;
  const targetHeight = expanded ? (showCompare ? 460 : 380) : 0;

  return (
    <div
      className="cr-tier"
      data-expanded={expanded ? 'true' : 'false'}
      style={{
        border: '1px solid var(--line-hairline)',
        background: 'var(--color-paper)',
        padding: expanded ? '20px 24px' : '12px 24px',
        display: 'flex',
        flexDirection: 'column',
        flex: expanded ? `0 1 ${targetHeight}px` : '0 0 auto',
        minHeight: 0,
        overflow: 'hidden',
        transition: `flex ${DUR}ms ${EASE}, padding ${DUR}ms ${EASE}`,
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap',
        paddingBottom: expanded ? 12 : 0,
        marginBottom: expanded ? 14 : 0,
        borderBottom: expanded ? '2px solid var(--color-accent)' : '2px solid transparent',
        transition: `padding-bottom ${DUR}ms ${EASE}, margin-bottom ${DUR}ms ${EASE}, border-color ${DUR}ms ${EASE}`,
        flex: '0 0 auto',
      }}>
        <div className="head" style={{ fontSize: 28, letterSpacing: '0.04em' }}>{tier.head}</div>
        <div className="lede" style={{ fontSize: 24, color: 'var(--color-ink)' }}>{tier.lede}</div>
      </div>

      {/* Body — only takes space when expanded; cross-fade between default & compare. */}
      <div style={{
        flex: expanded ? '1 1 auto' : '0 0 0px',
        minHeight: 0,
        opacity: expanded ? 1 : 0,
        transition: `opacity ${DUR}ms ${EASE}`,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
          <div style={{
            position: 'absolute', inset: 0,
            opacity: showCompare ? 0 : 1,
            transform: showCompare ? 'translateY(-6px)' : 'none',
            transition: `opacity 320ms ${EASE}, transform 360ms ${EASE}`,
            pointerEvents: showCompare ? 'none' : 'auto',
          }}>
            <DefaultView tier={tier} pull={pull} />
          </div>
          {tier.comparison && (
            <div style={{
              position: 'absolute', inset: 0,
              opacity: showCompare ? 1 : 0,
              transform: showCompare ? 'none' : 'translateY(8px)',
              transition: `opacity 360ms ${EASE} 120ms, transform 380ms ${EASE} 120ms`,
              pointerEvents: showCompare ? 'auto' : 'none',
            }}>
              <ComparisonView comparison={tier.comparison} />
            </div>
          )}
        </div>
        {showCompare && tier.comparison?.sources && (
          <Sources sources={tier.comparison.sources} />
        )}
      </div>
    </div>
  );
}

export default function CommercialReality() {
  // 0 = Tier 01 expanded, 1 = Tier 02 expanded (bullets+pull), 2 = Tier 02 expanded (comparison table)
  const [step, setStep] = useState(0);
  const rootRef = useRef(null);

  useEffect(() => {
    const onSlideChange = (e) => {
      const here = rootRef.current?.closest('section');
      if (!here) return;
      if (e.detail?.slide !== here) setStep(0);
    };
    document.addEventListener('slidechange', onSlideChange);
    return () => document.removeEventListener('slidechange', onSlideChange);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const section = rootRef.current?.closest('section');
      if (!section?.hasAttribute('data-deck-active')) return;
      const fwd = e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Spacebar';
      const back = e.key === 'ArrowLeft' || e.key === 'PageUp';
      if (fwd && step < 2) {
        e.preventDefault(); e.stopPropagation();
        setStep(step + 1);
      } else if (back && step > 0) {
        e.preventDefault(); e.stopPropagation();
        setStep(step - 1);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [step]);

  const tier1Expanded = step === 0;
  const tier2Expanded = step >= 1;
  const tier2View = step === 2 ? 'compare' : 'default';

  return (
    <SlideFrame>
      <div ref={rootRef} style={{
        display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0,
      }}>
        <div style={{ marginTop: 30 }}>
          <div className="eyebrow">{c.eyebrow}</div>
          <h1 className="title" style={{ marginBottom: 28 }}>{c.title}</h1>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 16,
          minHeight: 0, marginBottom: 24,
        }}>
          <TierBox tier={c.tiers[0]} expanded={tier1Expanded} />
          <TierBox tier={c.tiers[1]} expanded={tier2Expanded} pull={c.pull} view={tier2View} />
        </div>
        <p className="body" style={{
          maxWidth: 1600, fontWeight: 'var(--fw-medium)',
          color: 'var(--color-ink)', fontSize: 'var(--type-body)',
        }}>{c.thesis}</p>
      </div>
    </SlideFrame>
  );
}
