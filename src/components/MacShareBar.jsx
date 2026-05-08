/**
 * Persistent "share of total MACs" bar.
 *
 * Lives at the bottom of slides 12, 13, 14 at the same screen position so that
 * the natural slide cross-fade reads as one continuous bar across the section.
 * The `focus` prop swaps which segment is foregrounded.
 *
 *   focus="balanced"  — both segments at full intensity (intro on slide 12)
 *   focus="frontend"  — conv1d_mel highlighted, body muted   (slide 13)
 *   focus="body"      — conv blocks highlighted, mel muted   (slide 14)
 */
export default function MacShareBar({ focus = 'balanced', label = 'Share of total MACs · 0.97 M', annotate }) {
  const muteFrontend = focus === 'body';
  const muteBody     = focus === 'frontend';
  const activeFrontend = focus === 'frontend';
  const activeBody     = focus === 'body';

  const segBase = {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: 18,
    color: '#fff',
    transition: 'opacity 360ms var(--anim-ease), filter 360ms var(--anim-ease), letter-spacing 360ms var(--anim-ease)',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div className="mac-share-bar" style={{ marginTop: 'auto', paddingTop: 14 }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 6,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          color: 'var(--ink-mute)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {label}
        </div>
        {annotate && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--ink-mute)',
          }}>
            {annotate}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        height: 44,
        border: '1px solid var(--ink)',
        position: 'relative',
      }}>
        {/* Left segment — conv1d_mel · 53% */}
        <div
          className={activeFrontend ? 'mac-seg mac-seg--pulse' : 'mac-seg'}
          style={{
            ...segBase,
            flex: '0 0 53%',
            background: 'var(--accent)',
            padding: '0 18px',
            opacity: muteFrontend ? 0.32 : 1,
            filter: activeFrontend ? 'saturate(1.15)' : 'saturate(1)',
            zIndex: activeFrontend ? 2 : 1,
          }}
        >
          <span style={{ fontWeight: activeFrontend ? 600 : 500 }}>
            conv1d_mel
          </span>
          <span style={{ marginLeft: 8, opacity: 0.85 }}>· 53%</span>
        </div>

        {/* Right segment — 3 conv blocks · 47% */}
        <div
          className={activeBody ? 'mac-seg mac-seg--pulse' : 'mac-seg'}
          style={{
            ...segBase,
            flex: '0 0 47%',
            background: 'var(--ink)',
            padding: '0 18px',
            opacity: muteBody ? 0.32 : 1,
            filter: activeBody ? 'saturate(1.1)' : 'saturate(1)',
            zIndex: activeBody ? 2 : 1,
          }}
        >
          <span style={{ fontWeight: activeBody ? 600 : 500 }}>
            3 conv blocks
          </span>
          <span style={{ marginLeft: 8, opacity: 0.85 }}>· 47%</span>
        </div>
      </div>
    </div>
  );
}
