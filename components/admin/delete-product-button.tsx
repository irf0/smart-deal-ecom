'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import Loader from '@/components/admin/loader'
import { toast } from 'sonner'

export default function DeleteProductButton({ id }: { id: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    async function handleDelete() {
        setLoading(true)
        try {
            await supabase.from('product_images').delete().eq('product_id', id)
            await supabase.from('product_identifiers').delete().eq('product_id', id)
            const { error } = await supabase.from('products').delete().eq('id', id)
            if (error) throw error
            toast.success('Product deleted successfully')
            setOpen(false)
            router.refresh()
        } catch (err) {
            toast.error('Failed to delete product')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {loading && <Loader text="Deleting product..." />}

            <Button
                variant="destructive"
                size="sm"
                className="cursor-pointer"
                onClick={() => setOpen(true)}
            >
                Delete
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                        Are you sure? This will permanently delete the product and all its images and identifiers.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" className="cursor-pointer" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" className="cursor-pointer" disabled={loading} onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}