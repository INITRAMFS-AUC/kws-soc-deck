import { animProps, joinCx } from './anim.js';

export default function Memmap({
  headers, rows,
  animate = 'fade', delay = 0, className = '',
}) {
  const a = animProps(animate, delay);
  return (
    <table className={joinCx('memmap', a.className, className)} style={a.style}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={h.width ? { width: h.width } : undefined}>{h.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className={cell.cls}
                  dangerouslySetInnerHTML={{ __html: cell.html }} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
