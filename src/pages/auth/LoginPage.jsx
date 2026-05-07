import { Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { homeForRole, useAuth } from '../../context/AuthContext'
import { AuthLayout } from './AuthLayout'

export function LoginPage() {
  const { login } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const u = await login(form.email, form.password)
      toast.success(t('auth.welcomeBack', { name: u.name.split(' ')[0] }))
      navigate(homeForRole(u.role), { replace: true })
    } catch {
      // toast handled by interceptor
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title={t('auth.loginTitle')}
      subtitle={t('auth.loginSubtitle')}
      footer={
        <span>
          {t('auth.noAccount')}{' '}
          <Link
            to="/register"
            className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          >
            {t('auth.createOne')}
          </Link>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        <Input
          label={t('auth.email')}
          type="email"
          required
          autoComplete="email"
          placeholder="you@hotel.com"
          leadingIcon={<Mail size={16} />}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label={t('auth.password')}
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          leadingIcon={<Lock size={16} />}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <Button type="submit" className="w-full" loading={busy}>
          {t('auth.signIn')}
        </Button>
      </form>
    </AuthLayout>
  )
}
