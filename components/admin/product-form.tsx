'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { v4 as uuidv4 } from 'uuid'
import type { Category, ProductImage } from '@/lib/types'
import { toast } from 'sonner'
import Loader from './loader'
import { GripVertical, X } from 'lucide-react'
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type ImageItem =
    | { kind: 'existing'; id: string; url: string }
    | { kind: 'new'; id: string; file: File; preview: string }

function SortableImage({
    item,
    onRemove,
}: {
    item: ImageItem
    onRemove: (id: string) => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    }

    const src = item.kind === 'existing' ? item.url : item.preview

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative w-24 h-24 rounded border overflow-hidden group bg-gray-100"
        >
            <img src={src} className="w-full h-full object-cover" />
            <div
                {...attributes}
                {...listeners}
                className="absolute top-0.5 left-0.5 p-0.5 rounded bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            >
                <GripVertical className="w-3 h-3" />
            </div>
            <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    )
}

type ProductFormProps = {
    categories: Category[]
    product?: {
        id: string
        category_id: string
        brand: string
        model: string
        condition: string
        price: number
        original_price: number | null
        description: string | null
        specs: string | null
        status: string
        stock_count: number
    }
    images?: ProductImage[]
}

export default function ProductForm({ categories, product, images = [] }: ProductFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const isEdit = !!product

    const [loading, setLoading] = useState(false)

    const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
    const [brand, setBrand] = useState(product?.brand ?? '')
    const [model, setModel] = useState(product?.model ?? '')
    const [condition, setCondition] = useState(product?.condition ?? '')
    const [price, setPrice] = useState(product?.price?.toString() ?? '')
    const [originalPrice, setOriginalPrice] = useState(product?.original_price?.toString() ?? '')
    const [description, setDescription] = useState(product?.description ?? '')
    const [specs, setSpecs] = useState(product?.specs ?? '')
    const [status, setStatus] = useState(product?.status ?? 'available')
    const [stockCount, setStockCount] = useState(product?.stock_count?.toString() ?? '1')

    const [imageItems, setImageItems] = useState<ImageItem[]>(
        images
            .slice()
            .sort((a, b) => a.position - b.position)
            .map(img => ({ kind: 'existing', id: img.id, url: img.url }))
    )

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over || active.id === over.id) return
        setImageItems(prev => {
            const oldIndex = prev.findIndex(i => i.id === active.id)
            const newIndex = prev.findIndex(i => i.id === over.id)
            return arrayMove(prev, oldIndex, newIndex)
        })
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? [])
        if (imageItems.length + files.length > 5) {
            toast.error('Maximum 5 images allowed')
            return
        }
        const newItems: ImageItem[] = files.map(file => ({
            kind: 'new',
            id: uuidv4(),
            file,
            preview: URL.createObjectURL(file),
        }))
        setImageItems(prev => [...prev, ...newItems])
        e.target.value = ''
    }

    async function removeImage(id: string) {
        const item = imageItems.find(i => i.id === id)
        if (!item) return
        if (item.kind === 'existing') {
            const path = item.url.split('/product-images/')[1]
            await supabase.storage.from('product-images').remove([path])
            await supabase.from('product_images').delete().eq('id', id)
        }
        setImageItems(prev => prev.filter(i => i.id !== id))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const slug = `${brand}-${model}-${uuidv4().slice(0, 6)}`
                .toLowerCase()
                .replace(/\s+/g, '-')

            const productData = {
                category_id: categoryId,
                brand,
                model,
                condition,
                price: parseFloat(price),
                original_price: originalPrice ? parseFloat(originalPrice) : null,
                description: description || null,
                specs: specs || null,
                status,
                stock_count: parseInt(stockCount),
                ...(!isEdit && { slug }),
            }

            let productId = product?.id

            if (isEdit) {
                const { error } = await supabase.from('products').update(productData).eq('id', productId)
                if (error) throw error
            } else {
                const { data, error } = await supabase.from('products').insert(productData).select().single()
                if (error) throw error
                productId = data.id
            }

            const existingInOrder = imageItems.filter(i => i.kind === 'existing')
            await Promise.all(
                existingInOrder.map((item, position) =>
                    supabase.from('product_images').update({ position }).eq('id', item.id)
                )
            )

            let position = existingInOrder.length
            for (const item of imageItems) {
                if (item.kind !== 'new') continue
                const ext = item.file.name.split('.').pop()
                const path = `${productId}/${uuidv4()}.${ext}`
                const { error: uploadError } = await supabase.storage.from('product-images').upload(path, item.file)
                if (uploadError) throw uploadError
                const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
                await supabase.from('product_images').insert({ product_id: productId, url: publicUrl, position })
                position++
            }

            toast.success(isEdit ? 'Product updated' : 'Product added')
            router.push('/admin/products')
            router.refresh()
        } catch (err: any) {
            toast.error(err.message ?? 'Something went wrong')
            setLoading(false)
        }
    }

    return (
        <>
            {loading && <Loader text={isEdit ? 'Updating product...' : 'Adding product...'} />}

            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Category</Label>
                        <Select value={categoryId} onValueChange={setCategoryId} required>
                            <SelectTrigger className="cursor-pointer">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Condition</Label>
                        <Select value={condition} onValueChange={setCondition} required>
                            <SelectTrigger className="cursor-pointer">
                                <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="like_new">Like New</SelectItem>
                                <SelectItem value="good">Good</SelectItem>
                                <SelectItem value="fair">Fair</SelectItem>
                                <SelectItem value="poor">Poor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Brand</Label>
                        <Input autoFocus={!isEdit} value={brand} onChange={e => setBrand(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Model</Label>
                        <Input value={model} onChange={e => setModel(e.target.value)} required />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Price (₹)</Label>
                        <Input type="number" value={price} onChange={e => setPrice(e.target.value)} required min={0} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Market Price / MRP <span className="text-gray-400 font-normal">(optional)</span></Label>
                        <Input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} min={0} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                </div>

                <div className="space-y-1.5">
                    <Label>Specs</Label>
                    <Textarea
                        value={specs}
                        onChange={e => setSpecs(e.target.value)}
                        rows={2}
                        placeholder="128GB · Midnight Black · 85% battery health"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="cursor-pointer">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="unavailable">Unavailable</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Stock Count</Label>
                        <Input type="number" value={stockCount} onChange={e => setStockCount(e.target.value)} min={0} />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Images <span className="text-gray-400 font-normal">(max 5)</span></Label>
                        {imageItems.length > 1 && (
                            <span className="text-xs text-gray-400">Drag to reorder · First image is the cover</span>
                        )}
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={imageItems.map(i => i.id)} strategy={rectSortingStrategy}>
                            <div className="flex flex-wrap gap-3">
                                {imageItems.map((item, index) => (
                                    <div key={item.id} className="relative">
                                        <SortableImage item={item} onRemove={removeImage} />
                                        {index === 0 && (
                                            <span className="absolute -bottom-0 left-0 right-0 text-center text-[10px] bg-black/50 text-white py-0.5 rounded-b pointer-events-none">
                                                Cover
                                            </span>
                                        )}
                                    </div>
                                ))}

                                {imageItems.length < 5 && (
                                    <label className="w-24 h-24 border-2 border-dashed rounded flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-500 hover:text-gray-500 transition-colors gap-1">
                                        <span className="text-2xl leading-none">+</span>
                                        <span className="text-[10px]">Add image</span>
                                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={loading} className="cursor-pointer">
                        {isEdit ? 'Save Changes' : 'Add Product'}
                    </Button>
                    <Button type="button" variant="outline" className="cursor-pointer" onClick={() => router.back()}>
                        Cancel
                    </Button>
                </div>
            </form>
        </>
    )
}