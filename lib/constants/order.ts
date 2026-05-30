export type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'

export const ORDER_STATUS_LABELS: Record<string, string> = {
    new: 'New',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    completed: 'Completed',
    cancelled: 'Cancelled',
}

export const ORDER_STATUS_STYLES: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700 border-blue-200',
    confirmed: 'bg-amber-100 text-amber-700 border-amber-200',
    shipped: 'bg-purple-100 text-purple-700 border-purple-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
}


