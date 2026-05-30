'use client'

import { useState, useRef, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ProductIdentifier } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Hash, Trash2, Loader2, ScanLine } from 'lucide-react'

interface Props {
    productId: string
    identifiers: ProductIdentifier[]
}

const STATUS_STYLES: Record<string, string> = {
    available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    sold: 'bg-red-100 text-red-700 border-red-200',
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
}

export default function IMEISection({ productId, identifiers: initial }: Props) {
    const supabase = createClient()
    const inputRef = useRef<HTMLInputElement>(null)

    const [identifiers, setIdentifiers] = useState<ProductIdentifier[]>(initial)
    const [value, setValue] = useState('')
    const [isPending, startTransition] = useTransition()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmId, setConfirmId] = useState<string | null>(null)

    function validate(raw: string): string | null {
        const v = raw.trim()
        if (!v) return 'Enter an IMEI or serial number.'
        if (!/^\d{15}$/.test(v) && !/^[A-Za-z0-9]{6,20}$/.test(v))
            return 'Must be a 15-digit IMEI or 6–20 character serial number.'
        if (identifiers.some(i => i.identifier === v))
            return 'This identifier already exists.'
        return null
    }

    function handleAdd() {
        const err = validate(value)
        if (err) { toast.error(err); return }

        const trimmed = value.trim()
        startTransition(async () => {
            const { data, error } = await supabase
                .from('product_identifiers')
                .insert({ product_id: productId, identifier: trimmed, status: 'available' })
                .select()
                .single()

            if (error) { toast.error('Failed to add identifier.'); return }

            setIdentifiers(prev => [data as ProductIdentifier, ...prev])
            setValue('')
            toast.success('Identifier added.')
            // re-focus for rapid scanning
            setTimeout(() => inputRef.current?.focus(), 50)
        })
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') { e.preventDefault(); handleAdd() }
    }

    function handleDelete(id: string) {
        setDeletingId(id)
        startTransition(async () => {
            const { error } = await supabase.from('product_identifiers').delete().eq('id', id)
            setDeletingId(null)
            setConfirmId(null)
            if (error) { toast.error('Failed to delete.'); return }
            setIdentifiers(prev => prev.filter(i => i.id !== id))
            toast.success('Identifier removed.')
        })
    }

    const available = identifiers.filter(i => i.status === 'available').length
    const sold = identifiers.filter(i => i.status === 'sold').length

    return (
        <section className="space-y-4 pb-10">
            <Separator />

            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                        <h2 className="text-base font-semibold">Device Identifiers</h2>
                        <p className="text-xs text-muted-foreground">
                            IMEI numbers and serial numbers for individual units.
                        </p>
                    </div>
                </div>
                {identifiers.length > 0 && (
                    <div className="flex gap-3 text-xs text-muted-foreground">
                        <span><span className="font-medium text-emerald-600">{available}</span> available</span>
                        <span><span className="font-medium text-red-500">{sold}</span> sold</span>
                    </div>
                )}
            </div>

            {/* ── Input ── */}
            <div className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                    <ScanLine className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                        ref={inputRef}
                        autoFocus
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Scan or type IMEI / serial number"
                        className="pl-8 font-mono text-sm"
                        maxLength={20}
                        disabled={isPending}
                    />
                </div>
                <Button
                    type="button"
                    onClick={handleAdd}
                    disabled={isPending || !value.trim()}
                    className="cursor-pointer shrink-0"
                >
                    {isPending && !deletingId
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : 'Add'
                    }
                </Button>
            </div>
            <p className="text-xs text-muted-foreground -mt-1">
                Press <kbd className="px-1 py-0.5 rounded border text-[10px] font-mono bg-gray-50">Enter</kbd> to add quickly · Supports barcode / IMEI scanner
            </p>

            {/* ── Table ── */}
            {identifiers.length === 0 ? (
                <div className="rounded-lg border border-dashed py-10 text-center max-w-md">
                    <Hash className="w-7 h-7 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No identifiers yet.</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Add an IMEI or serial number above.</p>
                </div>
            ) : (
                <div className="rounded-lg border overflow-hidden max-w-2xl">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40">
                                <TableHead className="font-semibold">Identifier</TableHead>
                                <TableHead className="font-semibold w-28">Status</TableHead>
                                <TableHead className="font-semibold w-36">Date Added</TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {identifiers.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-mono text-sm">{item.identifier}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={STATUS_STYLES[item.status] ?? ''}
                                        >
                                            {item.status === 'available' ? 'Available' : 'Sold'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDate(item.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        <Dialog
                                            open={confirmId === item.id}
                                            onOpenChange={open => setConfirmId(open ? item.id : null)}
                                        >
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                                    disabled={item.status === 'sold'}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-sm">
                                                <DialogHeader>
                                                    <DialogTitle>Delete identifier?</DialogTitle>
                                                    <DialogDescription>
                                                        <span className="font-mono">{item.identifier}</span> will be permanently removed.
                                                        This cannot be undone.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setConfirmId(null)}
                                                        disabled={isPending}
                                                        className="cursor-pointer"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => handleDelete(item.id)}
                                                        disabled={isPending}
                                                        className="cursor-pointer"
                                                    >
                                                        {isPending && deletingId === item.id
                                                            ? <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                                            : null
                                                        }
                                                        Delete
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </section>
    )
}