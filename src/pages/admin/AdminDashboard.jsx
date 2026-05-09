import { Building2, Crown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../../components/ui/PageHeader'
import { PageLoader } from '../../components/ui/PageLoader'
import { StatCard } from '../../components/ui/StatCard'
import { useDashboard } from '../../hooks/useDashboard'

export function AdminDashboard() {
  const { data, loading } = useDashboard()
  const { t } = useTranslation()

  if (loading || !data) {
    return <PageLoader />
  }

  const totals = data.totals
  const totalMain = Math.max(1, Number(totals.owners) + Number(totals.hotels))
  const ownerPct = Math.round((Number(totals.owners) / totalMain) * 100)
  const hotelPct = 100 - ownerPct

  return (
    <>
      <PageHeader
        title={t('dashboard.adminTitle')}
        description={t('dashboard.adminSubtitle')}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        <StatCard
          label={t('dashboard.totalOwners')}
          value={totals.owners}
          icon={Crown}
          tone="violet"
        />
        <StatCard
          label={t('dashboard.totalHotels')}
          value={totals.hotels}
          icon={Building2}
          tone="sky"
        />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white">
            {t('dashboard.snapshot')}
          </h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {totalMain}
          </span>
        </div>

        <div className="space-y-3">
          <StatRow
            icon={Crown}
            label={t('dashboard.totalOwners')}
            value={totals.owners}
            percent={ownerPct}
            barClass="from-violet-500 to-indigo-600"
          />
          <StatRow
            icon={Building2}
            label={t('dashboard.totalHotels')}
            value={totals.hotels}
            percent={hotelPct}
            barClass="from-sky-500 to-blue-600"
          />
        </div>
      </div>
    </>
  )
}

function StatRow({ icon: Icon, label, value, percent, barClass }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-slate-800/40 dark:ring-slate-700">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
            <Icon size={15} />
          </span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {label}
          </span>
        </div>
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {value}
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barClass}`}
          style={{ width: `${Math.max(4, percent)}%` }}
        />
      </div>
    </div>
  )
}
