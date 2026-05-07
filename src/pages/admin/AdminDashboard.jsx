import { Building2, CalendarCheck, Crown, BedDouble, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  HotelsBarChart,
  RoomStatusPie,
  TrendAreaChart,
} from '../../components/charts'
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
  const topHotels = (data.topHotels ?? []).map((h) => ({
    name: h.name,
    bookings: Number(h.bookings),
    revenue: Number(h.revenue ?? 0),
  }))
  const occupancyData = [
    { name: t('rooms.status_available'), value: totals.availableRooms },
    { name: t('rooms.status_occupied'), value: totals.occupiedRooms },
  ]

  return (
    <>
      <PageHeader
        title={t('dashboard.adminTitle')}
        description={t('dashboard.adminSubtitle')}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
        <StatCard
          label={t('dashboard.totalRooms')}
          value={totals.rooms}
          icon={BedDouble}
          tone="emerald"
          hint={`${t('dashboard.available', { n: totals.availableRooms })} · ${t(
            'dashboard.occupied',
            { n: totals.occupiedRooms },
          )}`}
        />
        <StatCard
          label={t('dashboard.totalBookings')}
          value={totals.bookings}
          icon={CalendarCheck}
          tone="amber"
          hint={t('dashboard.occupancyRate', { value: data.occupancyRate })}
        />
        <StatCard
          label={t('dashboard.totalCustomers')}
          value={totals.customers}
          icon={Users}
          tone="rose"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 xl:col-span-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">
              {t('dashboard.trendTitle')}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('dashboard.trendRange')}
            </span>
          </div>
          <TrendAreaChart data={data.monthlyTrend} />
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 xl:col-span-2">
          <h3 className="mb-2 text-base font-semibold text-slate-800 dark:text-white">
            {t('analytics.occupancySplit')}
          </h3>
          <RoomStatusPie data={occupancyData} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <h3 className="mb-2 text-base font-semibold text-slate-800 dark:text-white">
            {t('dashboard.topHotels')}
          </h3>
          {topHotels.length ? (
            <HotelsBarChart data={topHotels} />
          ) : (
            <div className="grid h-[280px] place-items-center text-sm text-slate-400 dark:text-slate-500">
              {t('dashboard.noBookings')}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <h3 className="mb-3 text-base font-semibold text-slate-800 dark:text-white">
            {t('dashboard.snapshot')}
          </h3>
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <Snapshot label={t('dashboard.totalOwners')} value={totals.owners} />
            <Snapshot label={t('dashboard.hotels')} value={totals.hotels} />
            <Snapshot label={t('dashboard.rooms')} value={totals.rooms} />
            <Snapshot
              label={t('dashboard.totalCustomers')}
              value={totals.customers}
            />
            <Snapshot
              label={t('dashboard.bookings')}
              value={totals.bookings}
            />
            <Snapshot
              label={t('dashboard.occupancy')}
              value={`${data.occupancyRate}%`}
            />
          </dl>
        </div>
      </div>
    </>
  )
}

function Snapshot({ label, value }) {
  return (
    <>
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-right font-semibold text-slate-800 dark:text-slate-100">
        {value}
      </dd>
    </>
  )
}
