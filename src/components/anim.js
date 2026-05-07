/**
 * Shared helper for layout components that accept `animate` and `delay` props.
 * Returns { className, style } you can spread/merge into the wrapper element.
 *
 *   animate: 'fade' | 'ease' | true | false   (default 'fade' upstream)
 *   delay:   number (ms)
 */
export function animProps(animate, delay) {
  if (animate === false || animate == null) {
    return { className: '', style: undefined };
  }
  const effect = animate === true ? 'fade' : animate;
  return {
    className: `anim anim-${effect}`,
    style: delay ? { transitionDelay: `${delay}ms` } : undefined,
  };
}

export function joinCx(...parts) {
  return parts.filter(Boolean).join(' ');
}
