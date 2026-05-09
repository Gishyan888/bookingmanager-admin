import {
  BedDouble,
  CalendarCheck,
  DollarSign,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { RoomStatusPie, TrendAreaChart } from '../../components/charts'
import { PageHeader } from '../../components/ui/PageHeader'
import { PageLoader } from '../../components/ui/PageLoader'
import { StatCard } from '../../components/ui/StatCard'
import { useDashboard } from '../../hooks/useDashboard'
import { formatAMD } from '../../utils/format'

export function OwnerDashboard() {
  const { data, loading } = useDashboard()
  const { t } = useTranslation()

  if (loading || !data) {
    return <PageLoader />
  }
  const ttl = data.totals

  const pieData = [
    {
      name: t('rooms.status_available'),
      value: data.roomStatus?.available ?? 0,
    },
    {
      name: t('rooms.status_occupied'),
      value: data.roomStatus?.occupied ?? 0,
    },
    {
      name: t('rooms.status_maintenance'),
      value: data.roomStatus?.maintenance ?? 0,
    },
  ]

  return (
    <>
      <PageHeader
        title={t('dashboard.ownerTitle')}
        description={t('dashboard.ownerSubtitle')}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label={t('dashboard.rooms')}
          value={ttl.rooms}
          icon={BedDouble}
          tone="emerald"
          hint={`${t('dashboard.available', { n: ttl.availableRooms })} · ${t('dashboard.occupied', { n: ttl.occupiedRooms })}`}
        />
        <StatCard
          label={t('dashboard.bookings')}
          value={ttl.bookings}
          icon={CalendarCheck}
          tone="amber"
          hint={t('dashboard.occupancyRate', { value: data.occupancyRate })}
        />
        <StatCard
          label={t('dashboard.totalCustomers')}
          value={ttl.customers}
          icon={Users}
          tone="sky"
        />
        <StatCard
          label={t('dashboard.revenue')}
          value={formatAMD(ttl.revenue)}
          icon={DollarSign}
          tone="rose"
          hint={t('dashboard.lifetime')}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 xl:col-span-3">
          <h3 className="mb-2 text-base font-semibold text-slate-800 dark:text-white">
            {t('dashboard.trendTitle')}
          </h3>
          <TrendAreaChart data={data.monthlyTrend} />
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 xl:col-span-2">
          <h3 className="mb-2 text-base font-semibold text-slate-800 dark:text-white">
            {t('dashboard.roomsBreakdown')}
          </h3>
          <RoomStatusPie data={pieData} />
        </div>
      </div>
    </>
  )
}
