import { Mail, Lock } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { auth as authApi } from '../../api/endpoints'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { OtpInput } from '../../components/ui/OtpInput'
import { AuthLayout } from './AuthLayout'

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const [resendBusy, setResendBusy] = useState(false)

  const requestOtp = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await authApi.requestPasswordReset({ email })
      setStep(2)
      toast.success(t('auth.otpSent'))
    } catch {
      // toast handled by interceptor
    } finally {
      setBusy(false)
    }
  }

  const confirmReset = async (e) => {
    e.preventDefault()
    if (otp.length !== 6 || newPassword.length < 6) return
    setBusy(true)
    try {
      await authApi.confirmPasswordReset({ email, otp, newPassword })
      toast.success(t('auth.passwordResetSuccess'))
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
      await authApi.requestPasswordReset({ email })
      toast.success(t('auth.otpResent'))
    } catch {
      // toast handled by interceptor
    } finally {
      setResendBusy(false)
    }
  }

  return (
    <AuthLayout
      title={t('auth.forgotTitle')}
      subtitle={t('auth.forgotSubtitle')}
      footer={
        <span>
          <Link
            to="/login"
            className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          >
            {t('auth.backToSignIn')}
          </Link>
        </span>
      }
    >
      {step === 1 ? (
        <form className="space-y-4" onSubmit={requestOtp}>
          <Input
            label={t('auth.email')}
            type="email"
            required
            placeholder="you@hotel.com"
            leadingIcon={<Mail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" className="w-full" loading={busy}>
            {t('auth.sendOtp')}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={confirmReset}>
          <Input
            label={t('auth.email')}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leadingIcon={<Mail size={16} />}
          />
          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('auth.otpLabel')}
            </span>
            <OtpInput value={otp} onChange={setOtp} disabled={busy} length={6} />
          </div>
          <Input
            label={t('auth.newPassword')}
            type="password"
            required
            minLength={6}
            leadingIcon={<Lock size={16} />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button type="submit" className="w-full" loading={busy}>
            {t('auth.resetPassword')}
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
      )}
    </AuthLayout>
  )
}
