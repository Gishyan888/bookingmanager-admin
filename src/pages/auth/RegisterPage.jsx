import { Lock, Mail, Phone, User } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { NumberInput } from '../../components/ui/NumberInput'
import { useAuth } from '../../context/AuthContext'
import { AuthLayout } from './AuthLayout'

export function RegisterPage() {
  const { register } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error(t('auth.passwordTooShort'))
      return
    }
    setBusy(true)
    try {
      await register(form)
      toast.success(t('auth.registeredPending'), { duration: 6000 })
      navigate('/login', { replace: true })
    } catch {
      // toast handled by interceptor
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title={t('auth.registerTitle')}
      subtitle={t('auth.registerSubtitle')}
      footer={
        <span>
          {t('auth.haveAccount')}{' '}
          <Link
            to="/login"
            className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          >
            {t('auth.signIn')}
          </Link>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        <Input
          label={t('auth.fullName')}
          required
          placeholder="Jane Smith"
          leadingIcon={<User size={16} />}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          label={t('auth.email')}
          type="email"
          required
          placeholder="you@hotel.com"
          leadingIcon={<Mail size={16} />}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <NumberInput
          label={t('auth.phoneOptional')}
          placeholder="37499000000"
          leadingIcon={<Phone size={16} />}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <Input
          label={t('auth.password')}
          type="password"
          required
          minLength={6}
          placeholder={t('auth.passwordHint')}
          leadingIcon={<Lock size={16} />}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <Button type="submit" className="w-full" loading={busy}>
          {t('auth.createAccount')}
        </Button>
      </form>
    </AuthLayout>
  )
}
