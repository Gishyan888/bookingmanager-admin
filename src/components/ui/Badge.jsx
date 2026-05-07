import clsx from 'clsx'

const tones = {
  slate:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  green:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  red:
    'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  amber:
    'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  blue:
    'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  violet:
    'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
}

export function Badge({ children, tone = 'slate', className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone] ?? tones.slate,
        className,
      )}
    >
      {children}
    </span>
  )
}

export const STATUS_TONE = {
  available: 'green',
  occupied: 'amber',
  maintenance: 'slate',
  pending: 'amber',
  confirmed: 'blue',
  checked_in: 'violet',
  checked_out: 'slate',
  cancelled: 'red',
  active: 'green',
  inactive: 'slate',
}
