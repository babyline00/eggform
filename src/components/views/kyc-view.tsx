'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Check, User, IdCard, Camera,
  ShieldCheck, Upload, Lock, AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SectionHeader } from '@/components/cards'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Identity Document', icon: IdCard },
  { id: 3, title: 'Selfie', icon: Camera },
  { id: 4, title: 'Review & Submit', icon: ShieldCheck },
]

export function KycView() {
  const [step, setStep] = React.useState(1)
  const [form, setForm] = React.useState({
    fullName: '',
    dob: '',
    country: 'PK',
    address: '',
    city: '',
    cnic: '',
    cnicFront: null as File | null,
    cnicBack: null as File | null,
    selfie: null as File | null,
  })
  const [submitted, setSubmitted] = React.useState(false)
  const { toast } = useToast()

  const progress = ((step - 1) / STEPS.length) * 100

  function handleSubmit() {
    setSubmitted(true)
    toast({
      title: 'KYC Submitted',
      description: 'Your documents are under review. You will be notified within 24 hours.',
    })
  }

  if (submitted) {
    return (
      <div className="space-y-5">
        <SectionHeader title="KYC Verification" />
        <Card>
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 mb-4 animate-pulse-green"
            >
              <ShieldCheck className="h-10 w-10 text-emerald-600" />
            </motion.div>
            <h2 className="text-2xl font-bold">Verification Submitted</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Your KYC application has been submitted successfully. Our team will review your documents
              and notify you within 24 hours.
            </p>
            <div className="mt-6 max-w-sm mx-auto p-4 rounded-xl bg-secondary/50 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-400/40">
                  Under Review
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono">KYC-{Date.now().toString(36).toUpperCase().slice(-8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated time</span>
                <span className="font-medium">2-24 hours</span>
              </div>
            </div>
            <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground btn-press" onClick={() => { setSubmitted(false); setStep(1) }}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="KYC Verification"
        description="Required for PKR withdrawals above Rs 500. Your data is encrypted and never shared."
      />

      {/* Stepper */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition',
                      step > s.id
                        ? 'bg-emerald-500 text-white'
                        : step === s.id
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : 'bg-secondary text-muted-foreground',
                    )}
                  >
                    {step > s.id ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                  </div>
                  <div className="text-[10px] text-center">
                    <div className={cn('font-medium', step >= s.id ? 'text-foreground' : 'text-muted-foreground')}>
                      Step {s.id}
                    </div>
                    <div className={cn('hidden sm:block', step >= s.id ? 'text-foreground' : 'text-muted-foreground')}>
                      {s.title}
                    </div>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 bg-secondary relative -mt-6">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-emerald-500"
                      animate={{ width: step > s.id ? '100%' : '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <Progress value={progress} className="h-1" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {(() => {
              const StepIcon = STEPS[step - 1].icon
              return StepIcon ? <StepIcon className="h-5 w-5 text-primary" /> : null
            })()}
            {STEPS[step - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="fullName" className="text-xs">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Asad Khan"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dob" className="text-xs">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={form.dob}
                      onChange={(e) => setForm({ ...form, dob: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="country" className="text-xs">Country *</Label>
                    <select
                      id="country"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                    >
                      <option value="PK">🇵🇰 Pakistan</option>
                      <option value="AE">🇦🇪 UAE</option>
                      <option value="SA">🇸🇦 Saudi Arabia</option>
                      <option value="GB">🇬🇧 UK</option>
                      <option value="US">🇺🇸 USA</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-xs">City *</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Karachi"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className="text-xs">Address *</Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="House #, Street, Area"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400/30">
                  <Lock className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-emerald-800 dark:text-emerald-200">
                    Your personal information is encrypted in transit and at rest. Only authorized compliance
                    officers can access it for verification purposes.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Identity Document */}
            {step === 2 && (
              <motion.div
                key="document"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="cnic" className="text-xs">CNIC / ID Card Number *</Label>
                  <Input
                    id="cnic"
                    value={form.cnic}
                    onChange={(e) => setForm({ ...form, cnic: e.target.value })}
                    placeholder="XXXXX-XXXXXXX-X"
                    className="mt-1 font-mono"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <FileUpload
                    label="CNIC Front"
                    description="Upload front side of your ID"
                    file={form.cnicFront}
                    onChange={(f) => setForm({ ...form, cnicFront: f })}
                  />
                  <FileUpload
                    label="CNIC Back"
                    description="Upload back side of your ID"
                    file={form.cnicBack}
                    onChange={(f) => setForm({ ...form, cnicBack: f })}
                  />
                </div>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-400/30">
                  <p className="text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    Accepted formats: JPG, PNG, WebP. Max size: 5 MB. Files are scanned for malware before storage.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Selfie */}
            {step === 3 && (
              <motion.div
                key="selfie"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Take a clear selfie in good lighting. Your face should be visible without glasses or hats.
                  </p>
                  <FileUpload
                    label="Selfie"
                    description="Upload your selfie"
                    file={form.selfie}
                    onChange={(f) => setForm({ ...form, selfie: f })}
                    large
                  />
                </div>
                <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-400/30">
                  <p className="text-xs text-sky-800 dark:text-sky-200 flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
                    Your selfie is used only for identity verification. It will be compared to your CNIC photo
                    by our compliance team and stored encrypted.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Review */}
            {step === 4 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Personal Information</h4>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    <SummaryRow label="Name" value={form.fullName || '—'} />
                    <SummaryRow label="Date of Birth" value={form.dob || '—'} />
                    <SummaryRow label="Country" value={form.country} />
                    <SummaryRow label="City" value={form.city || '—'} />
                    <SummaryRow label="CNIC" value={form.cnic || '—'} />
                    <SummaryRow label="Address" value={form.address || '—'} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Documents Uploaded</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Check className={cn('h-3 w-3', form.cnicFront ? 'text-emerald-500' : 'text-muted-foreground/40')} />
                      CNIC Front: {form.cnicFront?.name || 'Not uploaded'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className={cn('h-3 w-3', form.cnicBack ? 'text-emerald-500' : 'text-muted-foreground/40')} />
                      CNIC Back: {form.cnicBack?.name || 'Not uploaded'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className={cn('h-3 w-3', form.selfie ? 'text-emerald-500' : 'text-muted-foreground/40')} />
                      Selfie: {form.selfie?.name || 'Not uploaded'}
                    </div>
                  </div>
                </div>
                <label className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50 text-xs cursor-pointer">
                  <input type="checkbox" defaultChecked={false} className="mt-0.5" />
                  <span>
                    I confirm that the information provided is true and accurate. I authorize EggForm to verify
                    my identity with the relevant authorities. I understand that providing false information
                    will result in account suspension.
                  </span>
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="btn-press"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {step < 4 ? (
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground btn-press"
                onClick={() => setStep(Math.min(STEPS.length, step + 1))}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                className="bg-emerald-500 hover:bg-emerald-600 text-white btn-press"
                onClick={handleSubmit}
              >
                <ShieldCheck className="h-4 w-4 mr-1" /> Submit for Review
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function FileUpload({
  label,
  description,
  file,
  onChange,
  large = false,
}: {
  label: string
  description: string
  file: File | null
  onChange: (f: File | null) => void
  large?: boolean
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [preview, setPreview] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreview(null)
  }, [file])

  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className={cn(
          'mt-1 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition hover:border-primary/60 hover:bg-accent/40',
          large ? 'aspect-video' : 'aspect-[4/3]',
          file ? 'border-emerald-400/60 bg-emerald-50/30 dark:bg-emerald-950/20' : 'border-border',
        )}
      >
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-contain p-2" />
        ) : (
          <>
            <Upload className="h-6 w-6 text-muted-foreground" />
            <div className="text-xs font-medium">{description}</div>
            <div className="text-[10px] text-muted-foreground">Click to upload</div>
          </>
        )}
      </button>
      {file && (
        <div className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-1 flex items-center gap-1">
          <Check className="h-3 w-3" />
          {file.name} ({(file.size / 1024).toFixed(0)}KB)
        </div>
      )}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between p-2 rounded bg-secondary/40">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium truncate ml-2 max-w-[60%]">{value}</span>
    </div>
  )
}
