export default function SlideFrame({
  label,
  topLeft, topRight = 'KWS-SoC',
  bottomLeft = 'InitRamFS · 2026', bottomRight,
  slideStyle, children,
}) {
  return (
    <section data-label={label}>
      <div className="slide" style={slideStyle}>
        {(topLeft || topRight) && (
          <div className="chrome-top">
            <span>{topLeft}</span>
            <span>{topRight}</span>
          </div>
        )}
        {children}
        {(bottomLeft || bottomRight) && (
          <div className="chrome-bottom">
            <span>{bottomLeft}</span>
            <span>{bottomRight}</span>
          </div>
        )}
      </div>
    </section>
  );
}
