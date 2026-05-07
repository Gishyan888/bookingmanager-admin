import { BedDouble, CalendarCheck, LogIn, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../../components/ui/Badge'
import { PageHeader } from '../../components/ui/PageHeader'
import { PageLoader } from '../../components/ui/PageLoader'
import { StatCard } from '../../components/ui/StatCard'
import { useDashboard } from '../../hooks/useDashboard'
import { formatDateTime } from '../../utils/format'

export function ManagerDashboard() {
  const { data, loading } = useDashboard()
  const { t } = useTranslation()

  if (loading || !data) {
    return <PageLoader />
  }
  const ttl = data.totals
  const fmtDate = (s) => formatDateTime(s)

  return (
    <>
      <PageHeader
        title={t('dashboard.managerTitle')}
        description={t('dashboard.managerSubtitle')}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('dashboard.rooms')}
          value={ttl.rooms}
          icon={BedDouble}
          tone="violet"
          hint={`${t('dashboard.available', { n: ttl.availableRooms })} · ${t('dashboard.occupied', { n: ttl.occupiedRooms })}`}
        />
        <StatCard
          label={t('dashboard.occupancy')}
          value={t('dashboard.occupancyShort', { value: data.occupancyRate })}
          tone="emerald"
        />
        <StatCard
          label={t('dashboard.checkInsToday')}
          value={ttl.checkInsToday}
          icon={LogIn}
          tone="sky"
        />
        <StatCard
          label={t('dashboard.checkOutsToday')}
          value={ttl.checkOutsToday}
          icon={LogOut}
          tone="amber"
        />
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white">
            {t('dashboard.upcomingArrivals')}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t('dashboard.next24h')}
          </span>
        </div>
        {data.upcomingArrivals?.length ? (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.upcomingArrivals.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between px-5 py-3 text-sm"
              >
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-100">
                    {b.customer?.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t('bookings.room')} #{b.room?.roomNumber} ·{' '}
                    {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}
                  </div>
                </div>
                <Badge tone="blue">{t(`bookings.status.${b.status}`)}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <div className="grid place-items-center px-5 py-10 text-sm text-slate-400 dark:text-slate-500">
            <CalendarCheck size={28} className="mb-2" />
            {t('dashboard.noArrivals')}
          </div>
        )}
      </div>
    </>
  )
}
