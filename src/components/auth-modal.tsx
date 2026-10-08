'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Egg, X, ChevronLeft, ShieldCheck, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useEggForm } from '@/lib/store'

type Step = 'register' | 'otp' | 'login'

export function AuthModal() {
  const open = useEggForm((s) => s.authOpen)
  const setOpen = useEggForm((s) => s.setAuthOpen)
  const register = useEggForm((s) => s.register)
  const login = useEggForm((s) => s.login)

  const [step, setStep] = React.useState<Step>('register')
  const [form, setForm] = React.useState({
    fullName: '',
    username: '',
    email: '',
    phone: '+92 ',
    country: 'PK',
    farmName: '',
    password: '',
    referral: '',
    agree: false,
  })
  const [otp, setOtp] = React.useState('')
  const [otpTimer, setOtpTimer] = React.useState(30)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (!open) {
      // Reset on close
      setTimeout(() => {
        setStep('register')
        setOtp('')
        setError('')
        setOtpTimer(30)
      }, 300)
    }
  }, [open])

  React.useEffect(() => {
    if (step !== 'otp') return
    const i = setInterval(() => {
      setOtpTimer((t) => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(i)
  }, [step])

  function handleRegister() {
    setError('')
    if (!form.fullName || !form.username || !form.email || !form.phone) {
      setError('Please fill all required fields.')
      return
    }
    if (!form.agree) {
      setError('You must accept the Terms to continue.')
      return
    }
    setStep('otp')
    setOtpTimer(30)
  }

  function handleOtpVerify() {
    if (otp.length < 6) {
      setError('Enter all 6 digits.')
      return
    }
    // Demo: accept any 6-digit code
    register({
      fullName: form.fullName,
      username: form.username,
      email: form.email,
      phone: form.phone,
      country: form.country,
      farmName: form.farmName || `${form.username}'s Farm`,
    })
  }

  function handleLogin() {
    setError('')
    if (!form.email) {
      setError('Enter your email or phone.')
      return
    }
    login(form.email)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md shadow-amber-500/30">
              <Egg className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="leading-tight">EggForm</DialogTitle>
              <DialogDescription className="text-xs leading-tight">Virtual Egg Ecosystem</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <div className="text-center mb-3">
                <h3 className="font-semibold text-lg">Create your account</h3>
                <p className="text-xs text-muted-foreground">Start your virtual egg farm in seconds.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="fullName" className="text-xs">Full name *</Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Asad Khan"
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="username" className="text-xs">Username *</Label>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="eggmaster"
                    className="h-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-xs">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.pk"
                  className="h-9"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="phone" className="text-xs">Phone *</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+92 3XX XXXXXXX"
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-xs">Country</Label>
                  <select
                    id="country"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="PK">🇵🇰 Pakistan</option>
                    <option value="AE">🇦🇪 UAE</option>
                    <option value="SA">🇸🇦 Saudi Arabia</option>
                    <option value="GB">🇬🇧 UK</option>
                    <option value="US">🇺🇸 USA</option>
                    <option value="OTHER">🌍 Other</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="farmName" className="text-xs">Farm name (optional)</Label>
                <Input
                  id="farmName"
                  value={form.farmName}
                  onChange={(e) => setForm({ ...form, farmName: e.target.value })}
                  placeholder="Sunrise Acres"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="referral" className="text-xs">Referral code (optional)</Label>
                <Input
                  id="referral"
                  value={form.referral}
                  onChange={(e) => setForm({ ...form, referral: e.target.value })}
                  placeholder="EGG-XXXX"
                  className="h-9"
                />
              </div>
              <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                  className="mt-0.5"
                />
                <span>
                  I accept the Terms of Service, Privacy Policy, and Wallet Policy.
                  I understand that the PKR wallet is a regulated payment layer and not a promise of returns.
                </span>
              </label>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleRegister}
              >
                Continue
              </Button>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-2 text-xs text-muted-foreground">OR</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => login('farmer@eggform.pk')}>
                Continue with Google
              </Button>
              <div className="text-center text-xs text-muted-foreground">
                Already have an account?{' '}
                <button onClick={() => setStep('login')} className="text-primary hover:underline">
                  Login
                </button>
              </div>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <button
                onClick={() => setStep('register')}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-3 w-3" /> Back
              </button>
              <div className="text-center">
                <div className="inline-flex w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 items-center justify-center mb-3">
                  <Phone className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                </div>
                <h3 className="font-semibold text-lg">Verify your phone</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the 6-digit code sent to <span className="font-medium text-foreground">{form.phone}</span>
                </p>
              </div>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(v) => setOtp(v)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && <p className="text-xs text-destructive text-center">{error}</p>}
              <div className="text-center text-xs text-muted-foreground">
                {otpTimer > 0 ? (
                  <>Resend code in 00:{String(otpTimer).padStart(2, '0')}</>
                ) : (
                  <button onClick={() => setOtpTimer(30)} className="text-primary hover:underline">
                    Resend code
                  </button>
                )}
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleOtpVerify}
              >
                <ShieldCheck className="h-4 w-4 mr-1" /> Verify
              </Button>
              <p className="text-center text-[10px] text-muted-foreground">
                Demo: enter any 6 digits to continue.
              </p>
            </motion.div>
          )}

          {step === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <button
                onClick={() => setStep('register')}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-3 w-3" /> Back
              </button>
              <div className="text-center mb-3">
                <h3 className="font-semibold text-lg">Welcome back</h3>
                <p className="text-xs text-muted-foreground">Login to your EggForm account.</p>
              </div>
              <div>
                <Label htmlFor="loginEmail" className="text-xs">Email or phone</Label>
                <Input
                  id="loginEmail"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="farmer@eggform.pk"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-xs">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="h-9"
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleLogin}
              >
                Login
              </Button>
              <Button variant="ghost" className="w-full text-xs" onClick={() => login('farmer@eggform.pk')}>
                Or try the demo account →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
