import { useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Tooltip — accessible hover/focus tooltip rendered through a portal.
//
// Rendering into document.body lets the tip escape ancestor `overflow: hidden`
// (the `.widget` card clips its own box), so it stays fully visible above the
// trigger. Visibility responds to both pointer hover and keyboard focus.
// Placement flips above→below when there isn't room at the top of the viewport.
//
// Props:
//   content   — tooltip body (string or node); when falsy the trigger renders bare
//   children  — the trigger element
//   className — extra classes for the inline trigger wrapper (e.g. animation delay)
//   style     — inline style for the wrapper (dynamic only)
const GAP = 8; // px between trigger and tip

export default function Tooltip({ content, children, className = '', style }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, placement: 'top' });
  const triggerRef = useRef(null);
  const tipRef = useRef(null);
  const id = useId();

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const tipH = tipRef.current?.offsetHeight ?? 0;
    // Prefer opening below the trigger; flip above only when there isn't room.
    const placement =
      r.bottom + GAP + tipH > window.innerHeight - 8 ? 'top' : 'bottom';
    setPos({
      top: placement === 'top' ? r.top - GAP : r.bottom + GAP,
      left: r.left + r.width / 2,
      placement,
    });
  }, [open]);

  if (!content) return children;

  const show = () => setOpen(true);
  const hide = () => setOpen(false);
  const onTop = pos.placement === 'top';

  return (
    <span
      ref={triggerRef}
      className={`relative inline-flex ${className}`}
      style={style}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open &&
        createPortal(
          <span
            ref={tipRef}
            id={id}
            role="tooltip"
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              transform: `translateX(-50%) translateY(${onTop ? '-100%' : '0'})`,
            }}
            className="pointer-events-none z-[100] w-max max-w-[220px]"
          >
            <span
              className="
                animate-tooltip-in relative block
                rounded-[var(--radius-md)] border
                border-[color-mix(in_srgb,var(--color-ai-accent)_24%,var(--color-border))]
                bg-[color-mix(in_srgb,var(--color-surface-2)_94%,transparent)]
                px-3 py-2 text-left shadow-[var(--shadow-card)] backdrop-blur-sm
              "
            >
              {content}
              <span
                aria-hidden="true"
                className={`
                  absolute left-1/2 h-2 w-2 -translate-x-1/2 rotate-45
                  border-[color-mix(in_srgb,var(--color-ai-accent)_24%,var(--color-border))]
                  bg-[color-mix(in_srgb,var(--color-surface-2)_94%,transparent)]
                  ${onTop ? 'top-full -mt-1 border-b border-r' : 'bottom-full -mb-1 border-l border-t'}
                `}
              />
            </span>
          </span>,
          document.body,
        )}
    </span>
  );
}
