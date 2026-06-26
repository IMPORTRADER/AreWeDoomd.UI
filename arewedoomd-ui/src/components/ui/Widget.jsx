// Central widget primitive. EVERY panel/sidebar card uses this.
// The look comes from `.widget*` (index.css); this component standardizes the header/body layout.
//
// Props:
//   title         — optional heading (header block is omitted when absent)
//   subtitle      — optional sub-text
//   subtitleColor — sub-text color (e.g. 'var(--color-ai-accent)')
//   headerRight   — slot to the right of the title
//   scroll        — scrollable body (sidebar-scroll + flex-1 + overflow)
//   fill          — root flex-1 to fill the rail height
//   hover         — hover lift
//   bare          — removes the body's default p-4 padding (cards that manage their own layout)
export default function Widget({
  title,
  subtitle,
  subtitleColor,
  headerRight,
  scroll = false,
  fill = false,
  hover = false,
  bare = false,
  className = '',
  bodyClassName = '',
  children,
}) {
  const root = [
    'widget',
    fill ? 'flex flex-col flex-1 min-h-0' : '',
    hover ? 'widget--hover' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const body = [
    scroll ? 'sidebar-scroll flex-1 min-h-0 overflow-y-auto' : '',
    bare ? '' : 'p-4',
    bodyClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={root}>
      {title && (
        <div className="shrink-0 px-4 pt-3.5 pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[15px] font-extrabold text-[var(--color-text-heading)] leading-tight truncate">
                {title}
              </h2>
              {subtitle && (
                <p
                  className="text-[11px] font-semibold mt-0.5 text-[var(--color-text-secondary)]"
                  style={subtitleColor ? { color: subtitleColor } : undefined}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {headerRight && <div className="shrink-0">{headerRight}</div>}
          </div>
        </div>
      )}
      <div className={body}>{children}</div>
    </div>
  );
}
