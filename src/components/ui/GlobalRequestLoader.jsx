import { useApiLoading } from '../../context/ApiLoadingContext'
import { Spinner } from './Spinner'

export function GlobalRequestLoader() {
  const { isLoading } = useApiLoading()
  if (!isLoading) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-9999">
      <div className="absolute inset-0 bg-slate-950/15 backdrop-blur-[1px] dark:bg-slate-950/30" />
      <div className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full bg-white/95 px-3 py-2 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900/95 dark:ring-slate-700">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
          <Spinner size="sm" />
          <span>Loading...</span>
        </div>
      </div>
    </div>
  )
}
