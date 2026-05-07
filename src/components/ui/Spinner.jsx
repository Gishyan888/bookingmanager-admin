import clsx from 'clsx'

const sizeClass = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-[2.5px]',
  lg: 'h-10 w-10 border-[3px]',
}

export function Spinner({ size = 'md', className }) {
  return (
    <span
      className={clsx(
        'inline-block shrink-0 animate-spin rounded-full border-violet-200 border-t-violet-600 dark:border-slate-600 dark:border-t-violet-400',
        sizeClass[size],
        className,
      )}
      aria-hidden
    />
  )
}
