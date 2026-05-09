import { useEffect, useState } from 'react'
import { Globe, Palette } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { users } from '../../api/endpoints'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
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
              <div className="rounded-2xl border border-violet-100 bg-linear-to-br from-violet-50 to-white p-5 shadow-sm ring-1 ring-violet-100 dark:border-violet-900/60 dark:from-slate-900 dark:to-slate-900 dark:ring-violet-900/50">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <Globe size={16} className="text-violet-600 dark:text-violet-300" />
                  <span>{t('common.language')}</span>
                </div>
                <Select
                  value={form.preferredLanguage}
                  onChange={(e) =>
                    setForm({ ...form, preferredLanguage: e.target.value })
                  }
                >
                  {SUPPORTED_LANGS.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.native}
                    </option>
                  ))}
                </Select>
                <div className="mt-3 flex justify-end">
                  <Button type="button" loading={busyLanguage} onClick={saveLanguage}>
                    {t('common.saveChanges')}
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50 to-white p-5 shadow-sm ring-1 ring-indigo-100 dark:border-indigo-900/60 dark:from-slate-900 dark:to-slate-900 dark:ring-indigo-900/50">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <Palette size={16} className="text-indigo-600 dark:text-indigo-300" />
                  <span>{t('common.theme')}</span>
                </div>
                <Select
                  value={form.preferredTheme}
                  onChange={(e) =>
                    setForm({ ...form, preferredTheme: e.target.value })
                  }
                >
                  <option value="light">{t('common.themeLight')}</option>
                  <option value="dark">{t('common.themeDark')}</option>
                  <option value="system">{t('common.themeSystem')}</option>
                </Select>
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
