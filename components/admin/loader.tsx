'use client'

import { useEffect, useState } from 'react'

export default function Loader({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl px-8 py-6 flex flex-col items-center gap-4 min-w-[200px]">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-gray-700">{text}</p>
            </div>
        </div>
    )
}