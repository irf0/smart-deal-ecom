import { useState, useEffect } from 'react'

export type CartItem = {
    id: string
    slug: string
    brand: string
    model: string
    price: number
    image: string | null
    quantity: number
}

const CART_KEY = 'smartdeal_cart'

function getCart(): CartItem[] {
    if (typeof window === 'undefined') return []
    try {
        return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
    } catch {
        return []
    }
}

function saveCart(items: CartItem[]) {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function useCart() {
    const [items, setItems] = useState<CartItem[]>([])

    useEffect(() => {
        setItems(getCart())
    }, [])

    function addItem(item: Omit<CartItem, 'quantity'>) {
        setItems(prev => {
            const existing = prev.find(i => i.id === item.id)
            const updated = existing
                ? prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev, { ...item, quantity: 1 }]
            saveCart(updated)
            return updated
        })
    }

    function removeItem(id: string) {
        setItems(prev => {
            const updated = prev.filter(i => i.id !== id)
            saveCart(updated)
            return updated
        })
    }

    function clearCart() {
        setItems([])
        localStorage.removeItem(CART_KEY)
    }

    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

    return { items, addItem, removeItem, clearCart, total }
}