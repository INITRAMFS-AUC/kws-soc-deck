import { animProps, joinCx } from './anim.js';

export default function Pull({
  children, style,
  animate = 'fade', delay = 0, className = '',
}) {
  const a = animProps(animate, delay);
  const merged = a.style ? { ...style, ...a.style } : style;
  return (
    <div className={joinCx('pull', a.className, className)} style={merged}>
      {children}
    </div>
  );
}
