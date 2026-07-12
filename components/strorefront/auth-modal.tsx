'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/userStore'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { upsertUser } from '@/lib/userActions'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

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


    // useEffect(() => {
    //     if (!isVerified) {
    //         const timer = setTimeout(() => setOpen(true), 3000)
    //         return () => clearTimeout(timer)
    //     }
    // }, [isVerified])


    useEffect(() => {
        if (cooldown === 0) return

        const interval = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [cooldown])



    function getFormattedPhone(rawInput: string) {
        let clean = rawInput.replace(/\D/g, '')

        if (clean.startsWith('91') && clean.length === 12) {
            return `+${clean}`
        }

        if (clean.length === 11 && clean.startsWith('0')) {
            clean = clean.substring(1)
        }

        return `+91${clean}`
    }









    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent
                className="p-0 overflow-hidden border-0 rounded-2xl w-[92%] sm:w-full max-w-md bg-white shadow-2xl mx-auto"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <div className="bg-[#2563EB] px-6 pt-5 pb-8">
                    <div className="inline-flex items-center gap-1.5 bg-[#1D4ED8] rounded-full px-3 py-1 mb-5">
                        <ShieldCheck className="w-3.5 h-3.5 text-white/80" />
                        <span className="text-white/90 text-xs font-medium">
                            Secure verification
                        </span>
                    </div>

                    <h1 className="text-white text-2xl font-bold leading-tight">
                        Welcome to Smart Deal
                    </h1>
                    <p className="text-white/70 text-sm mt-1">
                        Best second hand gadgets in India
                    </p>
                </div>

                <div className="bg-white px-6 pb-6 pt-5">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-2 rounded-full bg-[#2563EB]" />
                        <div
                            className={`w-2 h-2 rounded-full transition-colors ${step === 'otp' ? 'bg-[#2563EB]' : 'bg-gray-200'
                                }`}
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    {step === 'form' ? (
                        <div className="flex flex-col gap-4">
                            <Input
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />

                            <Input
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />

                            <div className="flex rounded-xl border h-12 overflow-hidden">
                                <div className="flex items-center px-3 bg-gray-50 border-r">
                                    +91
                                </div>

                                <Input
                                    placeholder="98765 43210"
                                    type="tel"
                                    maxLength={10}
                                    value={whatsappNumber}
                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                    className="border-0"
                                />
                            </div>

                            <Button disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Verification Code'
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <Input
                                placeholder="000000"
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="tracking-[0.5em] text-center text-lg font-bold"
                            />

                            <Button disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify & Proceed'
                                )}
                            </Button>

                            <button

                                disabled={cooldown > 0 || loading}
                                className={`font-semibold transition-colors ${cooldown > 0
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-[#2563EB] hover:text-[#1D4ED8]'
                                    }`}
                            >
                                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}