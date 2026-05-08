import SlideFrame from '../components/SlideFrame.jsx';
import Callout from '../components/Callout.jsx';
import { getSlide } from '../content.js';

const c = getSlide('empowerment').content;

const ACCENT = 'var(--color-accent)';
const INK    = 'var(--color-ink)';
const MUTE   = 'var(--color-ink-mute)';
const PAPER  = 'var(--color-paper)';
const LINE   = 'var(--line-faint)';
const MONO   = 'var(--font-mono)';

function Pillar({ p }) {
  const accent = !!p.accent;
  return (
    <div style={{
      flex: 1, minWidth: 0,
      padding: '28px 30px',
      border: `2px solid ${accent ? ACCENT : LINE}`,
      background: accent
        ? `color-mix(in oklch, ${ACCENT} 8%, ${PAPER})`
        : PAPER,
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{
        fontFamily: MONO, fontSize: 14,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color: accent ? ACCENT : MUTE, fontWeight: 600,
      }}>{p.tag}</div>

      <div style={{
        fontSize: 30, fontWeight: 600, color: INK,
        letterSpacing: '-0.01em', lineHeight: 1.15,
      }}>{p.head}</div>

      <p style={{
        fontSize: 19, lineHeight: 1.5,
        color: 'var(--color-ink-soft)', margin: 0,
      }}>{p.body}</p>

      {p.stats && (
        <div style={{
          marginTop: 'auto', paddingTop: 18,
          borderTop: `1px solid ${ACCENT}`,
          display: 'flex', gap: 28,
        }}>
          {p.stats.map((s) => (
            <div key={s.label}>
              <div style={{
                fontFamily: MONO, fontSize: 28, fontWeight: 700,
                color: ACCENT, letterSpacing: '-0.02em',
              }}>{s.value}</div>
              <div style={{
                fontFamily: MONO, fontSize: 12,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: MUTE, marginTop: 4,
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Empowerment() {
  return (
    <SlideFrame>
      <div style={{ marginTop: 30 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ marginBottom: 44, maxWidth: 1700 }}>
          {c.title}
        </h1>
      </div>

      <div style={{
        display: 'flex', gap: 24,
        marginBottom: 32, alignItems: 'stretch',
      }}>
        {c.pillars.map((p) => <Pillar key={p.tag} p={p} />)}
      </div>

      <Callout>{c.callout}</Callout>
    </SlideFrame>
  );
}
