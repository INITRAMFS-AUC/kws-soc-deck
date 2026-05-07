import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle } from './tweaks/index.js';

const STEPS = [
  { id: 1, sec: 15.6,    label: ['Strided', 'NNoM'],            display: '15.6 s' },
  { id: 2, sec: 6.3,     label: ['Mel', 'front-end'],            display: '6.3 s' },
  { id: 3, sec: 3.6,     label: ['+ DMA', '+ unroll'],           display: '3.6 s' },
  { id: 4, sec: 3.0,     label: ['+ compiler', 'opts'],          display: '3.0 s' },
  { id: 5, sec: 1.139,   label: ['+ XIP cache', 'opts'],         display: '1.14 s' },
  { id: 6, sec: 0.0694,  label: ['+ Conv1D', 'accel'],           display: '69 ms' },
  { id: 7, sec: 0.0383,  label: ['+ int8', 'weights'],           display: '38 ms' },
  { id: 8, sec: 0.0303,  label: ['+ double', 'buffering'],       display: '30 ms' },
];

const DEFAULT_TWEAKS = { scale: 'linear', showFill: true, showBaseline: true };

function Chart({ tw }) {
  const W = 1700, H = 380;
  const x0 = 80, x1 = 1660;
  const y0 = 30, y1 = 320;
  const plotH = y1 - y0;

  const xs = STEPS.map((_, i) => x0 + ((i + 0.5) * (x1 - x0)) / STEPS.length);

  const yFor = (sec) => {
    if (tw.scale === 'log') {
      const lmin = -2, lmax = 2;
      const t01 = (Math.log10(sec) - lmin) / (lmax - lmin);
      return y1 - t01 * plotH;
    }
    return y1 - (sec / 16) * plotH;
  };

  const grids = tw.scale === 'log'
    ? [{ v: 100, l: '100 s' }, { v: 10, l: '10 s' }, { v: 1, l: '1 s' }, { v: 0.1, l: '100 ms' }, { v: 0.01, l: '10 ms' }]
    : [{ v: 16, l: '16 s' }, { v: 12, l: '12 s' }, { v: 8, l: '8 s' }, { v: 4, l: '4 s' }, { v: 0, l: '0 s' }];

  const ys = STEPS.map((s) => yFor(s.sec));
  const linePoints = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
  const fillPath = `M ${xs[0]},${y1} L ${linePoints.split(' ').join(' L ')} L ${xs[xs.length - 1]},${y1} Z`;

  return (
    <div style={{ background: 'var(--paper)', border: '1px solid rgba(0,0,0,0.12)', padding: '28px 36px 20px', marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#6a6a66', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        <span>Inference time per step · {tw.scale === 'log' ? 'log scale' : 'linear scale'}</span>
        <span>seconds at 36 MHz</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 380, display: 'block' }}>
        {grids.map((g, i) => {
          const y = yFor(g.v);
          if (y < y0 - 1 || y > y1 + 1) return null;
          return (
            <g key={i}>
              <line x1={x0} y1={y} x2={x1} y2={y} stroke="rgba(0,0,0,0.08)" strokeDasharray="3 3" />
              <text x={x0 - 10} y={y + 4} textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="13" fill="#6a6a66">{g.l}</text>
            </g>
          );
        })}
        <line x1={x0} y1={y1} x2={x1} y2={y1} stroke="rgba(0,0,0,0.18)" />
        {tw.showFill && <path d={fillPath} fill="oklch(0.55 0.15 38)" fillOpacity="0.08" />}
        {tw.showBaseline && tw.scale === 'linear' && (
          <g>
            <line x1={x0} y1={ys[0]} x2={x1} y2={ys[0]} stroke="oklch(0.45 0.13 255)" strokeWidth="1" strokeDasharray="6 6" opacity="0.5" />
            <text x={x1 - 10} y={ys[0] - 8} textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="13" fill="oklch(0.45 0.13 255)">SW baseline · 15.6 s</text>
          </g>
        )}
        <polyline points={linePoints} fill="none" stroke="oklch(0.55 0.15 38)" strokeWidth="2.5" strokeOpacity="0.7" />
        {STEPS.map((s, i) => (
          <line key={`bar-${i}`} x1={xs[i]} y1={y1} x2={xs[i]} y2={ys[i]}
                stroke={i === STEPS.length - 1 ? 'oklch(0.55 0.15 38)' : '#1a1a1a'}
                strokeWidth={i === STEPS.length - 1 ? 3 : 2} />
        ))}
        {STEPS.map((s, i) => {
          const last = i === STEPS.length - 1;
          return (
            <circle key={`dot-${i}`} cx={xs[i]} cy={ys[i]} r={last ? 9 : 7}
                    fill={last ? 'oklch(0.55 0.15 38)' : '#1a1a1a'}
                    stroke={last ? '#1a1a1a' : 'none'} strokeWidth={last ? 2 : 0} />
          );
        })}
        {STEPS.map((s, i) => {
          const last = i === STEPS.length - 1;
          return (
            <text key={`val-${i}`} x={xs[i]} y={ys[i] - 12} textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize={last ? 20 : 16} fontWeight={last ? 600 : 500}
                  fill={last ? 'oklch(0.55 0.15 38)' : '#1a1a1a'}>
              {s.display}
            </text>
          );
        })}
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, marginTop: 4, paddingLeft: 64 }}>
        {STEPS.map((s, i) => {
          const last = i === STEPS.length - 1;
          return (
            <div key={`leg-${i}`} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#6a6a66', textAlign: 'center', lineHeight: 1.3 }}>
              <strong style={{ color: last ? 'var(--accent)' : '#1a1a1a', fontWeight: 600 }}>{String(s.id).padStart(2, '0')}</strong>
              <br />
              <span style={{ color: last ? 'var(--accent)' : 'inherit', fontWeight: last ? 600 : 400 }}>
                {s.label[0]}<br />{s.label[1]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OptChart() {
  const [tw, setTweak] = useTweaks(DEFAULT_TWEAKS);
  return (
    <>
      <Chart tw={tw} />
      <TweaksPanel title="Tweaks">
        <TweakSection label="Optimization chart">
          <TweakRadio label="Y-axis scale" value={tw.scale}
                      onChange={(v) => setTweak('scale', v)}
                      options={[{ value: 'linear', label: 'Linear' }, { value: 'log', label: 'Log' }]} />
          <TweakToggle label="Fill under line" value={tw.showFill}
                       onChange={(v) => setTweak('showFill', v)} />
          <TweakToggle label="Show SW baseline" value={tw.showBaseline}
                       onChange={(v) => setTweak('showBaseline', v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}
