import { animProps, joinCx } from './anim.js';

export default function Specimen({
  head, lede, body, headStyle, ledeStyle, bodyStyle,
  animate = 'fade', delay = 0, className = '',
}) {
  const a = animProps(animate, delay);
  return (
    <div className={joinCx('specimen', a.className, className)} style={a.style}>
      <div className="head" style={headStyle}>{head}</div>
      <div className="lede" style={ledeStyle}>{lede}</div>
      <p style={bodyStyle}>{body}</p>
    </div>
  );
}
