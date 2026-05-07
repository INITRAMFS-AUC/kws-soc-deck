/**
 * Wrap any slide content to fade/slide it in when its slide becomes active.
 *
 *   <Animated>{...}</Animated>                 — fade in (default)
 *   <Animated effect="ease">{...}</Animated>   — fade + 24px slide up
 *   <Animated delay={150}>{...}</Animated>     — stagger by 150ms
 *   <Animated as="span">...</Animated>         — render as <span>
 *
 * Animation triggers off the ancestor [data-deck-active] attribute set by
 * <deck-stage>, so no JS subscription is needed. To opt out, omit Animated.
 */
export default function Animated({
  children,
  effect = 'fade',
  delay = 0,
  as: Tag = 'div',
  className = '',
  style,
  ...rest
}) {
  const cls = ['anim', `anim-${effect}`, className].filter(Boolean).join(' ');
  const merged = delay ? { ...style, transitionDelay: `${delay}ms` } : style;
  return (
    <Tag className={cls} style={merged} {...rest}>
      {children}
    </Tag>
  );
}
