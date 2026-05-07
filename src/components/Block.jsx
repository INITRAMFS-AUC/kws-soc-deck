import { animProps, joinCx } from './anim.js';

export default function Block({
  variant, style, children, sub,
  animate = 'fade', delay = 0, className = '',
}) {
  const variantCls = variant === 'accent' ? 'blk accent'
                   : variant === 'muted'  ? 'blk muted'
                   : 'blk';
  const a = animProps(animate, delay);
  const merged = a.style ? { ...style, ...a.style } : style;
  return (
    <div className={joinCx(variantCls, a.className, className)} style={merged}>
      {children}
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}
