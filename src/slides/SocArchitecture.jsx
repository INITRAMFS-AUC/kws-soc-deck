import { useEffect, useRef, useState } from 'react';
import SlideFrame from '../components/SlideFrame.jsx';
import Block from '../components/Block.jsx';
import { getSlide } from '../content.js';

const c = getSlide('soc').content;
const [conv1d, dma, apb] = c.rowTwo;

// Partial crossbar matrix — see slide 06 docstring in content.js for source.
//   masters: i-port, d-port, dmac, accel
//   slaves:  SRAM,   Bridge, DMACregs, XIP
const MASTERS = ['i-port', 'd-port', 'dmac', 'accel'];
const SLAVES  = ['SRAM',   'Bridge', 'DMACregs', 'XIP'];
const CONN = [
  [1, 0, 0, 1], // i-port
  [1, 1, 1, 1], // d-port
  [1, 1, 0, 0], // dmac
  [1, 0, 0, 1], // accel
];

function CrossbarMatrix() {
  const W = 1660, H = 340;
  const padL = 200, padR = 120, padT = 70, padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const colW = innerW / SLAVES.length;
  const rowH = innerH / MASTERS.length;
  const cx = (j) => padL + j * colW + colW / 2;
  const cy = (i) => padT + i * rowH + rowH / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`}
         style={{ width: '100%', height: '100%' }}>
      {SLAVES.map((s, j) => (
        <text key={`s-${j}`} x={cx(j)} y={padT - 24} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize={26}
              fill="var(--color-ink)">{s}</text>
      ))}
      {MASTERS.map((m, i) => (
        <text key={`m-${i}`} x={padL - 32} y={cy(i) + 9} textAnchor="end"
              fontFamily="var(--font-mono)" fontSize={26}
              fill="var(--color-ink)">{m}</text>
      ))}
      {MASTERS.map((_, i) => (
        <line key={`mh-${i}`} className="xbar-stroke"
              x1={padL} x2={W - padR} y1={cy(i)} y2={cy(i)}
              strokeWidth={2} />
      ))}
      {SLAVES.map((_, j) => (
        <line key={`sv-${j}`} className="xbar-stroke"
              x1={cx(j)} x2={cx(j)} y1={padT} y2={H - padB}
              strokeWidth={2} />
      ))}
      {MASTERS.flatMap((_, i) =>
        SLAVES.map((_, j) => CONN[i][j] ? (
          <circle key={`c-${i}-${j}`} className="xbar-dot"
                  cx={cx(j)} cy={cy(i)} r={15}
                  style={{ transitionDelay: `${120 + (i * SLAVES.length + j) * 35}ms` }} />
        ) : null)
      )}
    </svg>
  );
}

export default function SocArchitecture() {
  const [crossbar, setCrossbar] = useState(false);
  const rootRef = useRef(null);

  // Reset crossbar whenever this slide loses focus, so re-entering starts collapsed.
  useEffect(() => {
    const onSlideChange = (e) => {
      const here = rootRef.current?.closest('section');
      if (!here) return;
      if (e.detail?.slide !== here) setCrossbar(false);
    };
    document.addEventListener('slidechange', onSlideChange);
    return () => document.removeEventListener('slidechange', onSlideChange);
  }, []);

  // Right-arrow / Space first expands the crossbar, then advances the deck.
  // Left-arrow / PageUp collapses it before retreating.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const section = rootRef.current?.closest('section');
      if (!section?.hasAttribute('data-deck-active')) return;
      const fwd = e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Spacebar';
      const back = e.key === 'ArrowLeft' || e.key === 'PageUp';
      if (fwd && !crossbar) {
        e.preventDefault(); e.stopPropagation();
        setCrossbar(true);
      } else if (back && crossbar) {
        e.preventDefault(); e.stopPropagation();
        setCrossbar(false);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [crossbar]);

  return (
    <SlideFrame>
      <div ref={rootRef} style={{ marginTop: 30 }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="title" style={{ marginBottom: 40 }}>{c.title}</h1>
      </div>
      <div className={`soc-grid ${crossbar ? 'soc-grid--crossbar' : ''}`}
           style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, maxWidth: 1700, textAlign: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
          {c.rowOne.map((b, i) => (
            b.stack ? (
              // Stacked cell — wrap the two halves in their own container
              // sized to 100% so it tracks the grid row's height (driven by
              // the neighbouring full-height blocks). Each child overrides
              // .blk { height: var(--block-h) } via flex sizing so they
              // split the container exactly in half.
              <div key={`stack-${i}`} style={{
                height: '100%',
                display: 'flex', flexDirection: 'column',
                boxSizing: 'border-box',
              }}>
                {b.stack.map((s) => (
                  <Block key={s.label} variant={s.variant} sub={s.sub}
                         className="blk--stacked"
                         style={{
                           flex: '1 1 0',
                           height: 'auto', minHeight: 0,
                           boxSizing: 'border-box',
                         }}>
                    {s.label}
                  </Block>
                ))}
              </div>
            ) : (
              <Block key={b.label} variant={b.variant} sub={b.sub} style={b.style}>{b.label}</Block>
            )
          ))}
        </div>
        <div className="blk muted bus" onClick={() => setCrossbar((v) => !v)}>
          <div className="bus-content">
            <div className="bus-label">
              <span>{c.bus}</span>
              <span className="hint">{c.busHint}</span>
            </div>
            <div className="bus-crossbar"><CrossbarMatrix /></div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16 }}>
            <Block variant={conv1d.variant} sub={conv1d.sub}>{conv1d.label}</Block>
            <Block variant={dma.variant}    sub={dma.sub}>{dma.label}</Block>
          </div>
          <Block variant={apb.variant} sub={apb.sub}>{apb.label}</Block>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          <div />
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${c.peripherals.length}, 1fr)`,
            gap: 16, textAlign: 'center',
          }}>
            {c.peripherals.map((b) => (
              <Block key={b.label} variant={b.variant} sub={b.sub}>{b.label}</Block>
            ))}
          </div>
        </div>
      </div>
      <p className="body" style={{ marginTop: 36, maxWidth: 1700 }}>
        {crossbar ? c.crossbarFooter : c.footer}
      </p>
    </SlideFrame>
  );
}
