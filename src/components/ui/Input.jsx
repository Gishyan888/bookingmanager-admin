import clsx from 'clsx'
import { forwardRef } from 'react'

const fieldBase =
  'block w-full rounded-lg border-0 py-2 text-base shadow-sm ring-1 ring-inset transition focus:ring-2 focus:ring-inset bg-white text-slate-800 placeholder:text-slate-400 md:text-sm dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500'

const ringOk =
  'ring-slate-200 focus:ring-violet-500 dark:ring-slate-700 dark:focus:ring-violet-400'
const ringErr =
  'ring-rose-300 focus:ring-rose-500 dark:ring-rose-700 dark:focus:ring-rose-400'

export const Input = forwardRef(function Input(
  { label, error, className, hint, leadingIcon, ...rest },
  ref,
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </span>
      )}
      <span className="relative block">
        {leadingIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          className={clsx(
            fieldBase,
            leadingIcon ? 'pl-10 pr-3' : 'px-3',
            error ? ringErr : ringOk,
            className,
          )}
          {...rest}
        />
      </span>
      {hint && !error && (
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      )}
      {error && (
        <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400">
          {error}
        </span>
      )}
    </label>
  )
})

export const Select = forwardRef(function Select(
  { label, error, children, className, ...rest },
  ref,
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </span>
      )}
      <select
        ref={ref}
        className={clsx(fieldBase, 'px-3', error ? ringErr : ringOk, className)}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400">
          {error}
        </span>
      )}
    </label>
  )
})

export const Textarea = forwardRef(function Textarea(
  { label, error, className, ...rest },
  ref,
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </span>
      )}
      <textarea
        ref={ref}
        className={clsx(fieldBase, 'px-3', error ? ringErr : ringOk, className)}
        {...rest}
      />
      {error && (
        <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400">
          {error}
        </span>
      )}
    </label>
  )
})
