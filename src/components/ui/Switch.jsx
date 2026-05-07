import clsx from 'clsx'

/**
 * Compact iOS-style on/off toggle. Pure Tailwind, no extra dependencies.
 * `srLabel` keeps things accessible without rendering visible text.
 */
export function Switch({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  srLabel,
  className,
}) {
  const sizes = {
    sm: { track: 'h-5 w-9', thumb: 'h-4 w-4', translate: 'translate-x-4' },
    md: { track: 'h-6 w-11', thumb: 'h-5 w-5', translate: 'translate-x-5' },
  }
  const s = sizes[size] ?? sizes.md
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={clsx(
        'relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-50',
        s.track,
        checked
          ? 'bg-emerald-500 dark:bg-emerald-500'
          : 'bg-slate-300 dark:bg-slate-700',
        className,
      )}
    >
      {srLabel && <span className="sr-only">{srLabel}</span>}
      <span
        className={clsx(
          'inline-block transform rounded-full bg-white shadow ring-0 transition',
          s.thumb,
          checked ? s.translate : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
