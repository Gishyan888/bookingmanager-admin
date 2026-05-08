import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { auth as authApi } from '../../api/endpoints'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { OtpInput } from '../../components/ui/OtpInput'
import { AuthLayout } from './AuthLayout'

export function VerifyEmailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(false)
  const [resendBusy, setResendBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email || otp.length !== 6) return
    setBusy(true)
    try {
      await authApi.verifyEmailOtp({ email, otp })
      toast.success(t('auth.emailVerified'))
      navigate('/login', { replace: true })
    } catch {
      // toast handled by interceptor
    } finally {
      setBusy(false)
    }
  }

  const resend = async () => {
    if (!email) return
    setResendBusy(true)
    try {
      await authApi.resendEmailOtp({ email })
      toast.success(t('auth.otpResent'))
    } catch {
      // toast handled by interceptor
    } finally {
      setResendBusy(false)
    }
  }

  return (
    <AuthLayout
      title={t('auth.verifyTitle')}
      subtitle={t('auth.verifySubtitle')}
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
          label={t('auth.email')}
          type="email"
          required
          placeholder="you@hotel.com"
          leadingIcon={<MailCheck size={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
            {t('auth.otpLabel')}
          </span>
          <OtpInput value={otp} onChange={setOtp} disabled={busy} length={6} />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t('auth.otpHint')}
          </p>
        </div>

        <Button type="submit" className="w-full" loading={busy}>
          {t('auth.verifyEmail')}
        </Button>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          loading={resendBusy}
          onClick={resend}
        >
          {t('auth.resendOtp')}
        </Button>
      </form>
    </AuthLayout>
  )
}
