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
    </>
  )
}
