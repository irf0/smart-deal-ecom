import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
    variant_id: string
    product_id: string
    brand: string
    model: string
    condition: string
    condition_label: string
    price: number
    image_url: string | null
    slug: string
    quantity: number
}

type CartStore = {
    items: CartItem[]
    addItem: (item: Omit<CartItem, 'quantity'>) => void
    updateQuantity: (variant_id: string, quantity: number) => void
    removeItem: (variant_id: string) => void
    clearCart: () => void
    totalItems: () => number
    totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const existing = get().items.find(i => i.variant_id === item.variant_id)
                if (existing) {
                    // already in cart — just increment quantity
                    set(state => ({
                        items: state.items.map(i =>
                            i.variant_id === item.variant_id
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        )
                    }))
                } else {
                    set(state => ({
                        items: [...state.items, { ...item, quantity: 1 }]
                    }))
                }
            },

            updateQuantity: (variant_id, quantity) => {
                if (quantity < 1) return
                set(state => ({
                    items: state.items.map(i =>
                        i.variant_id === variant_id ? { ...i, quantity } : i
                    )
                }))
            },

            removeItem: (variant_id) => {
                set(state => ({
                    items: state.items.filter(i => i.variant_id !== variant_id)
                }))
            },

            clearCart: () => set({ items: [] }),

            totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

            totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        }),
        {
            name: 'smart-deal-cart',
        }
    )
)