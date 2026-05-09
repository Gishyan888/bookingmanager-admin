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
  const [busy, setBusy] = useState(false)
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

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = {
        name: form.name,
        phone: phoneForSubmit(form.phone) || undefined,
        preferredLanguage: form.preferredLanguage,
        preferredTheme: form.preferredTheme,
      }
      if (form.password) payload.password = form.password
      await users.updateMe(payload)
      await refreshUser()
      setForm((f) => ({ ...f, password: '' }))
      toast.success(t('profile.updatedToast'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title={t('profile.title')}
        description={t('profile.subtitle')}
      />

      <div className="max-w-2xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</p>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
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
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <Globe size={14} />
                <span>{t('common.language')}</span>
              </div>
              <Select
                label={t('common.language')}
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
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <Palette size={14} />
                <span>{t('common.theme')}</span>
              </div>
              <Select
                label={t('common.theme')}
                value={form.preferredTheme}
                onChange={(e) =>
                  setForm({ ...form, preferredTheme: e.target.value })
                }
              >
                <option value="light">{t('common.themeLight')}</option>
                <option value="dark">{t('common.themeDark')}</option>
                <option value="system">{t('common.themeSystem')}</option>
              </Select>
            </div>
            <Input
              label={t('auth.newPassword')}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={6}
            />
            <div className="flex justify-end">
              <Button type="submit" loading={busy}>
                {t('common.saveChanges')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
