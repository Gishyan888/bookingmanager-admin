import {
  BedDouble,
  Building2,
  CalendarCheck,
  Crown,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  UserSquare2,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../../context/AuthContext'

const ROLE_META = {
  admin: {
    icon: ShieldCheck,
    accent: 'from-violet-500 to-indigo-600',
    titleKey: 'help.admin.title',
    introKey: 'help.admin.intro',
    stepsKey: 'help.admin.steps',
    quickKey: 'help.admin.quick',
  },
  owner: {
    icon: Crown,
    accent: 'from-emerald-500 to-teal-600',
    titleKey: 'help.owner.title',
    introKey: 'help.owner.intro',
    stepsKey: 'help.owner.steps',
    quickKey: 'help.owner.quick',
  },
  manager: {
    icon: UserSquare2,
    accent: 'from-sky-500 to-blue-600',
    titleKey: 'help.manager.title',
    introKey: 'help.manager.intro',
    stepsKey: 'help.manager.steps',
    quickKey: 'help.manager.quick',
  },
}

function RoleGuideCard({ role, meta }) {
  const { t } = useTranslation()
  const Icon = meta.icon
  const steps = t(meta.stepsKey, { returnObjects: true }) ?? []
  const quick = t(meta.quickKey, { returnObjects: true }) ?? []
  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div className={`bg-linear-to-br ${meta.accent} px-5 py-4 text-white`}>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Icon size={20} />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-80">
              {t('help.forRole', { role: t(`roles.${role}`) })}
            </div>
            <h2 className="text-lg font-bold leading-snug">{t(meta.titleKey)}</h2>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {t(meta.introKey)}
        </p>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('help.stepsHeading')}
          </h3>
          <ol className="space-y-2">
            {Array.isArray(steps) &&
              steps.map((step, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-slate-700 dark:text-slate-200"
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
          </ol>
        </div>

        {Array.isArray(quick) && quick.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('help.tips')}
            </h3>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
              {quick.map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export function HelpPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const role = user?.role

  if (!role || !ROLE_META[role]) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t('help.unavailable')}
      </p>
    )
  }

  const meta = ROLE_META[role]

  return (
    <>
      <PageHeader title={t('help.title')} description={t('help.subtitle')} />

      <p className="text-sm text-slate-600 dark:text-slate-400">
        {t('help.onlyYourRole')}
      </p>

      <RoleGuideCard role={role} meta={meta} />

      <div className="rounded-2xl border border-violet-200/70 bg-linear-to-r from-violet-50 to-indigo-50 p-4 dark:border-violet-500/20 dark:from-violet-500/10 dark:to-indigo-500/10">
        <p className="mb-2 text-sm font-semibold text-violet-800 dark:text-violet-200">
          Support contact
        </p>
        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
          <a
            href="tel:+37491511122"
            className="flex items-center gap-2 rounded-md px-1 py-0.5 hover:bg-white/60 dark:hover:bg-slate-900/30"
          >
            <Phone size={15} className="text-violet-600 dark:text-violet-300" />
            <span className="font-medium">+37491511122</span>
            <span className="text-slate-500 dark:text-slate-400">
              (Viber / WhatsApp / Telegram)
            </span>
          </a>
          <a
            href="mailto:info@bookingmanager.online"
            className="flex items-center gap-2 rounded-md px-1 py-0.5 hover:bg-white/60 dark:hover:bg-slate-900/30"
          >
            <Mail size={15} className="text-violet-600 dark:text-violet-300" />
            <span className="font-medium">info@bookingmanager.online</span>
          </a>
          <div className="flex items-center gap-2 px-1 text-xs text-slate-500 dark:text-slate-400">
            <MessageCircle size={14} />
            <span>Fastest support: Telegram / WhatsApp / Viber</span>
          </div>
        </div>
      </div>

      {/* Shared glossary — terms used in forms; same for every role */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t('help.glossaryHeading')}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: Building2, key: 'hotel' },
            { icon: BedDouble, key: 'room' },
            { icon: Users, key: 'customer' },
            { icon: CalendarCheck, key: 'booking' },
          ].map(({ icon: Icon, key: gkey }) => (
            <div
              key={gkey}
              className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
            >
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Icon size={16} className="text-violet-500" />
                <span className="text-sm font-semibold">
                  {t(`help.glossary.${gkey}.term`)}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                {t(`help.glossary.${gkey}.def`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
