import { useEffect, useState } from 'react'
import { Globe, Monitor, Moon, Palette, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { users } from '../../api/endpoints'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PhoneInput, phoneForSubmit } from '../../components/ui/PhoneInput'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { SUPPORTED_LANGS } from '../../i18n'

export function ProfilePage() {
  const { t } = useTranslation()
  const { refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [busyProfile, setBusyProfile] = useState(false)
  const [busyLanguage, setBusyLanguage] = useState(false)
  const [busyTheme, setBusyTheme] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    preferredLanguage: 'hy',
    preferredTheme: 'light',
  })

  const themeItems = [
    { id: 'light', label: t('common.themeLight'), icon: Sun },
    { id: 'dark', label: t('common.themeDark'), icon: Moon },
    { id: 'system', label: t('common.themeSystem'), icon: Monitor },
  ]

  useEffect(() => {
    users
      .me()
      .then((u) =>
        setForm({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          password: '',
          preferredLanguage: u.preferredLanguage || 'hy',
          preferredTheme: u.preferredTheme || 'light',
        }),
      )
      .finally(() => setLoading(false))
  }, [])

  const submitProfile = async (e) => {
    e.preventDefault()
    setBusyProfile(true)
    try {
      const payload = {
        name: form.name,
        phone: phoneForSubmit(form.phone) || undefined,
      }
      if (form.password) payload.password = form.password
      await users.updateMe(payload)
      await refreshUser()
      setForm((f) => ({ ...f, password: '' }))
      toast.success(t('profile.updatedToast'))
    } finally {
      setBusyProfile(false)
    }
  }

  const saveLanguage = async () => {
    setBusyLanguage(true)
    try {
      await users.updateMyPreferences({
        preferredLanguage: form.preferredLanguage,
      })
      await refreshUser()
      toast.success(t('profile.updatedToast'))
    } finally {
      setBusyLanguage(false)
    }
  }

  const saveTheme = async () => {
    setBusyTheme(true)
    try {
      await users.updateMyPreferences({ preferredTheme: form.preferredTheme })
      await refreshUser()
      toast.success(t('profile.updatedToast'))
    } finally {
      setBusyTheme(false)
    }
  }

  return (
    <>
      <PageHeader
        title={t('profile.title')}
        description={t('profile.subtitle')}
      />

      <div className="grid max-w-6xl gap-4 lg:grid-cols-12">
        {loading ? (
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 lg:col-span-12">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 lg:col-span-8">
              <form className="space-y-4" onSubmit={submitProfile}>
                <Input
                  label={t('auth.fullName')}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <Input label={t('auth.email')} type="email" value={form.email} disabled />
                <PhoneInput
                  label={t('auth.phone')}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <Input
                  label={t('auth.newPassword')}
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={6}
                />
                <div className="flex justify-end">
                  <Button type="submit" loading={busyProfile}>
                    {t('common.saveChanges')}
                  </Button>
                </div>
              </form>
            </div>

            <div className="space-y-4 lg:col-span-4">
              <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm ring-1 ring-violet-100 dark:border-violet-900/60 dark:from-slate-900 dark:to-slate-900 dark:ring-violet-900/50">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <Globe size={16} className="text-violet-600 dark:text-violet-300" />
                    <span>{t('common.language')}</span>
                  </div>
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                    {form.preferredLanguage}
                  </span>
                </div>
                <div className="space-y-2">
                  {SUPPORTED_LANGS.map((l) => {
                    const active = form.preferredLanguage === l.code
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() =>
                          setForm({ ...form, preferredLanguage: l.code })
                        }
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                          active
                            ? 'bg-violet-100 text-violet-800 ring-1 ring-violet-200 dark:bg-violet-500/20 dark:text-violet-200 dark:ring-violet-500/30'
                            : 'bg-white/80 text-slate-700 ring-1 ring-slate-200 hover:bg-violet-50 dark:bg-slate-900/60 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base leading-none">{l.flag}</span>
                          <span>{l.native}</span>
                        </span>
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button type="button" loading={busyLanguage} onClick={saveLanguage}>
                    {t('common.saveChanges')}
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm ring-1 ring-indigo-100 dark:border-indigo-900/60 dark:from-slate-900 dark:to-slate-900 dark:ring-indigo-900/50">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <Palette size={16} className="text-indigo-600 dark:text-indigo-300" />
                    <span>{t('common.theme')}</span>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                    {form.preferredTheme}
                  </span>
                </div>
                <div className="space-y-2">
                  {themeItems.map((it) => {
                    const active = form.preferredTheme === it.id
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() =>
                          setForm({ ...form, preferredTheme: it.id })
                        }
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                          active
                            ? 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-200 dark:ring-indigo-500/30'
                            : 'bg-white/80 text-slate-700 ring-1 ring-slate-200 hover:bg-indigo-50 dark:bg-slate-900/60 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <it.icon size={14} />
                          <span>{it.label}</span>
                        </span>
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button type="button" loading={busyTheme} onClick={saveTheme}>
                    {t('common.saveChanges')}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
