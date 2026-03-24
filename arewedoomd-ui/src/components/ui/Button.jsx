const VARIANTS = {
  primary:   'bg-[var(--color-btn-primary)] text-white hover:bg-[var(--color-btn-primary-hover)]',
  secondary: 'bg-[var(--color-bg)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-surface)]',
  ghost:     'text-[var(--color-link)] hover:underline',
};

const SIZES = {
  sm: 'h-9 px-3 text-[13px]',
  md: 'h-[46px] px-4 text-[15px]',
  lg: 'h-[52px] px-5 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
}) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)]',
        'font-semibold tracking-[0.2px] whitespace-nowrap cursor-pointer',
        'transition-[background,opacity,border-color] duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading
        ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        : children}
    </button>
  );
}
