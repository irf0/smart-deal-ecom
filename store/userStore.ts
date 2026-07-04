import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserData {
    userId: string | null
    name: string | null
    city: string | null
    whatsappNumber: string | null
    isVerified: boolean


}

interface UserState extends UserData {
    setUser: (user: UserData) => void
    clearUser: () => void
}

const initialState: UserData = {
    userId: 'test-user-id',
    name: 'Test Reseller',
    city: 'Bangalore',
    whatsappNumber: '919876543210',
    isVerified: false
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            ...initialState,
            setUser: (user) => set(user),
            clearUser: () => set(initialState),
        }),
        { name: 'smart-deal-user' }
    )
)