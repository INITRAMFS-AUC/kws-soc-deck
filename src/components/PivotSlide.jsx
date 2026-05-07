export default function PivotSlide({ label, num, pgnum, children }) {
  return (
    <section data-label={label}>
      <div className="pivot">
        <div className="num">{num}</div>
        <blockquote>{children}</blockquote>
        <div className="pgnum">{pgnum}</div>
      </div>
    </section>
  );
}
