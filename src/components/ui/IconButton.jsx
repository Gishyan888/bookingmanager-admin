import clsx from 'clsx'

const tones = {
  slate:
    'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
  violet:
    'text-violet-600 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-500/15',
  emerald:
    'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/15',
  amber:
    'text-amber-600 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-500/15',
  sky:
    'text-sky-600 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-500/15',
  rose:
    'text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/15',
}

/**
 * Standard table-row action icon button.
 * Larger hit area (h-8 w-8) than naked icons, consistent hover, ring on focus,
 * and a tooltip via native `title`.
 */
export function IconButton({
  icon: Icon,
  label,
  tone = 'slate',
  onClick,
  disabled,
  className,
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-40',
        tones[tone] ?? tones.slate,
        className,
      )}
    >
      <Icon size={16} strokeWidth={2.1} />
    </button>
  )
}
