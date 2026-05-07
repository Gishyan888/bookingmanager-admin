import clsx from 'clsx'

const tones = {
  violet: 'from-violet-500 to-indigo-600',
  emerald: 'from-emerald-500 to-teal-600',
  amber: 'from-amber-500 to-orange-600',
  sky: 'from-sky-500 to-blue-600',
  rose: 'from-rose-500 to-pink-600',
  slate: 'from-slate-500 to-slate-700',
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'violet',
  hint,
  className,
}) {
  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-slate-700',
        className,
      )}
    >
      <div
        className={clsx(
          'absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-15 blur-xl transition group-hover:opacity-25 dark:opacity-25 dark:group-hover:opacity-40',
          'bg-gradient-to-br',
          tones[tone],
        )}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </div>
          <div className="mt-2 truncate text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </div>
          {hint && (
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {hint}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={clsx(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm bg-gradient-to-br',
              tones[tone],
            )}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  )
}
