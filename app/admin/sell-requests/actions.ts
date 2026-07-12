'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { revalidatePath } from 'next/cache'

export async function updateSellRequestStatus(id: string, status: string) {
    await requireAdmin()

    const { error } = await supabaseAdmin
        .from('sell_requests')
        .update({ status })
        .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/sell-requests')
}

export async function deleteSellRequest(id: string) {
    await requireAdmin()

    const { error } = await supabaseAdmin
        .from('sell_requests')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/sell-requests')
}
