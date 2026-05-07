import { animProps, joinCx } from './anim.js';

export default function Stat({
  value, label, valueSize,
  animate = 'fade', delay = 0, className = '',
}) {
  const a = animProps(animate, delay);
  return (
    <div className={joinCx('stat', a.className, className)} style={a.style}>
      <div className="v" style={valueSize ? { fontSize: valueSize } : undefined}>{value}</div>
      <div className="l">{label}</div>
    </div>
  );
}
