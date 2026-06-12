'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/userStore'
import { ShieldCheck } from 'lucide-react'

export default function AuthModal() {
    const { isVerified, setUser } = useUserStore()
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<'form' | 'otp'>('form')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [cooldown, setCooldown] = useState(0)

    const [name, setName] = useState('')
    const [city, setCity] = useState('')
    const [whatsappNumber, setWhatsappNumber] = useState('')
    const [otp, setOtp] = useState('')

    useEffect(() => {
        if (!isVerified) {
            const timer = setTimeout(() => setOpen(true), 3000000)
            return () => clearTimeout(timer)
        }
    }, [isVerified])

    useEffect(() => {
        if (cooldown === 0) return
        const interval = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) { clearInterval(interval); return 0 }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [cooldown])

    async function handleSubmit() {
        setError('')
        setLoading(true)
        try {
            const { upsertUser } = await import('@/lib/actions/userActions')
            const userId = await upsertUser({ name, city, whatsappNumber })
            const res = await fetch('/api/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whatsappNumber }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error); return }
            setUser({ userId, name, city, whatsappNumber, isVerified: false })
            setCooldown(60)
            setStep('otp')
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    async function handleVerify() {
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whatsappNumber, otp }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error); return }
            setUser({ userId: useUserStore.getState().userId!, name, city, whatsappNumber, isVerified: true })
            setOpen(false)
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    async function handleResend() {
        if (cooldown > 0) return
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whatsappNumber }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error); return }
            setCooldown(60)
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent
                className="p-0 overflow-hidden border-0 rounded-2xl w-full max-w-md bg-white"
                onInteractOutside={(e) => e.preventDefault()}
            >
                {/* Blue Header */}
                <div className="bg-[#2563EB] px-6 pt-5 pb-8">
                    {/* Secure verification badge */}
                    <div className="inline-flex items-center gap-1.5 bg-[#1D4ED8] rounded-full px-3 py-1 mb-5">
                        <ShieldCheck className="w-3.5 h-3.5 text-white/80" />
                        <span className="text-white/90 text-xs font-medium">Secure verification</span>
                    </div>

                    <h1 className="text-white text-2xl font-bold leading-tight">
                        Welcome to Smart Deal
                    </h1>
                    <p className="text-white/70 text-sm mt-1">
                        Best second hand gadgets in India
                    </p>
                </div>

                {/* Dark Body */}
                <div className="bg-white px-6 pb-6 pt-5">
                    {/* Step indicators */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-2 rounded-full bg-[#2563EB]" />
                        <div className={`w-2 h-2 rounded-full transition-colors ${step === 'otp' ? 'bg-[#2563EB]' : 'bg-gray-200'}`} />
                    </div>

                    {step === 'form' ? (
                        <div className="flex flex-col gap-4">
                            {/* Name */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-gray-500 text-xs font-semibold tracking-widest uppercase">
                                    Your Name
                                </label>
                                <Input
                                    placeholder="e.g. Rahul Verma"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-[#2563EB] focus-visible:ring-1 focus-visible:border-[#2563EB]"
                                />
                            </div>

                            {/* City */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-gray-500 text-xs font-semibold tracking-widest uppercase">
                                    City
                                </label>
                                <Input
                                    placeholder="e.g. Guwahati"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-[#2563EB] focus-visible:ring-1 focus-visible:border-[#2563EB]"
                                />
                            </div>

                            {/* WhatsApp Number */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-gray-500 text-xs font-semibold tracking-widest uppercase">
                                    WhatsApp Number
                                </label>
                                <div className="flex rounded-xl overflow-hidden border border-gray-300 bg-white focus-within:border-[#2563EB]">
                                    <div className="flex items-center justify-center bg-gray-100 px-3 border-r border-gray-300">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                            alt="WhatsApp"
                                            className="w-6 h-6"
                                        />
                                    </div>
                                    <Input
                                        placeholder="98765 43210"
                                        value={whatsappNumber}
                                        onChange={(e) => setWhatsappNumber(e.target.value)}
                                        className="bg-transparent border-0 text-gray-900 placeholder:text-gray-400 h-12 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                                        type="tel"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-sm text-red-400">{error}</p>}

                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-[#2563EB] hover:bg-[#2563EB] text-gray-900 border border-gray-300 rounded-xl h-14 text-base font-medium mt-1 cursor-pointer text-white hover:text-white font-bold"
                            >
                                {loading ? 'Sending…' : (
                                    <span className="flex items-center gap-2 ">
                                        Get OTP
                                    </span>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <p className="text-gray-500 text-sm">
                                OTP sent to <span className="text-gray-900">+91 {whatsappNumber}</span>
                            </p>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-gray-500 text-xs font-semibold tracking-widest uppercase">
                                    Enter OTP
                                </label>
                                <Input
                                    placeholder="6-digit code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-[#2563EB] focus-visible:ring-1 focus-visible:border-[#2563EB] tracking-widest text-center text-lg"
                                    maxLength={6}
                                    type="number"
                                />
                            </div>

                            {error && <p className="text-sm text-red-400">{error}</p>}

                            <Button
                                onClick={handleVerify}
                                disabled={loading}
                                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl h-14 text-base font-medium transition-colors"
                            >
                                {loading ? 'Verifying…' : 'Verify OTP'}
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={handleResend}
                                disabled={cooldown > 0 || loading}
                                className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl h-11"
                            >
                                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}