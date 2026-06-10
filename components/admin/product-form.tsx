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
import type { Category, ProductImage, ProductVariant } from '@/lib/types'
import Loader from '@/components/admin/loader'
import { toast } from 'sonner'

type VariantRow = {
    id?: string
    condition: 'grade_a' | 'grade_b_plus' | 'grade_b' | 'grade_c_plus' | 'grade_c'
    price: string
    original_price: string
    stock_count: string
    battery_health: string
    status: 'available' | 'unavailable'
}

type ProductFormProps = {
    categories: Category[]
    product?: {
        id: string
        slug: string
        category_id: string
        brand: string
        model: string
        description: string | null
        specs: string | null
        ram_gb: number | null
        storage_gb: number | null
        network_type: '4G' | '5G' | null
        os: 'iOS' | 'Android' | 'Windows' | 'macOS' | null
        color: string | null
    }
    images?: ProductImage[]
    variants?: ProductVariant[]
}

const conditionLabels: Record<VariantRow['condition'], string> = {
    grade_a: 'Grade A — Like New',
    grade_b_plus: 'Grade B+ — Excellent',
    grade_b: 'Grade B — Good',
    grade_c_plus: 'Grade C+ — Fair',
    grade_c: 'Grade C — Acceptable',
}

const allConditions = ['grade_a', 'grade_b_plus', 'grade_b', 'grade_c_plus', 'grade_c'] as const

const RAM_OPTIONS = [2, 3, 4, 6, 8, 12, 16, 32]
const STORAGE_OPTIONS = [32, 64, 128, 256, 512, 1024]

export default function ProductForm({ categories, product, images = [], variants = [] }: ProductFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const isEdit = !!product

    const [loading, setLoading] = useState(false)

    // Basic info
    const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
    const [brand, setBrand] = useState(product?.brand ?? '')
    const [model, setModel] = useState(product?.model ?? '')
    const [description, setDescription] = useState(product?.description ?? '')
    const [specs, setSpecs] = useState(product?.specs ?? '')

    // Spec fields
    const [ramGb, setRamGb] = useState<string>(product?.ram_gb?.toString() ?? '')
    const [storageGb, setStorageGb] = useState<string>(product?.storage_gb?.toString() ?? '')
    const [networkType, setNetworkType] = useState<string>(product?.network_type ?? '')
    const [os, setOs] = useState<string>(product?.os ?? '')
    const [color, setColor] = useState(product?.color ?? '')

    // Images
    const [existingImages, setExistingImages] = useState(images)
    const [newFiles, setNewFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])

    // Variants
    const [variantRows, setVariantRows] = useState<VariantRow[]>(
        variants.length > 0
            ? variants.map(v => ({
                id: v.id,
                condition: v.condition,
                price: v.price.toString(),
                original_price: v.original_price?.toString() ?? '',
                stock_count: v.stock_count.toString(),
                battery_health: v.battery_health?.toString() ?? '',
                status: v.status,
            }))
            : [{ condition: 'grade_a', price: '', original_price: '', stock_count: '1', battery_health: '', status: 'available' }]
    )

    function addVariantRow() {
        const usedConditions = variantRows.map(v => v.condition)
        const next = allConditions.find(c => !usedConditions.includes(c))
        if (!next) return
        setVariantRows(prev => [...prev, {
            condition: next,
            price: '',
            original_price: '',
            stock_count: '1',
            battery_health: '',
            status: 'available',
        }])
    }

    function removeVariantRow(index: number) {
        if (variantRows.length === 1) return
        setVariantRows(prev => prev.filter((_, i) => i !== index))
    }

    function updateVariantRow(index: number, field: keyof VariantRow, value: string) {
        setVariantRows(prev => prev.map((row, i) =>
            i === index ? { ...row, [field]: value } : row
        ))
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? [])
        const total = existingImages.length + newFiles.length + files.length
        if (total > 5) {
            toast.error('Maximum 5 images allowed')
            return
        }
        setNewFiles(prev => [...prev, ...files])
        setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
    }

    async function removeExistingImage(id: string, url: string) {
        const path = url.split('/product-images/')[1]
        await supabase.storage.from('product-images').remove([path])
        await supabase.from('product_images').delete().eq('id', id)
        setExistingImages(prev => prev.filter(img => img.id !== id))
    }

    function removeNewFile(index: number) {
        setNewFiles(prev => prev.filter((_, i) => i !== index))
        setPreviews(prev => prev.filter((_, i) => i !== index))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const slug = isEdit
                ? product.slug
                : `${brand}-${model}-${uuidv4().slice(0, 6)}`.toLowerCase().replace(/\s+/g, '-')

            const productData = {
                category_id: categoryId,
                brand,
                model,
                description: description || null,
                specs: specs || null,
                ram_gb: ramGb ? parseInt(ramGb) : null,
                storage_gb: storageGb ? parseInt(storageGb) : null,
                network_type: networkType || null,
                os: os || null,
                color: color || null,
                ...(!isEdit && { slug }),
            }

            let productId = product?.id

            if (isEdit) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', productId)
                if (error) throw error
            } else {
                const { data, error } = await supabase
                    .from('products')
                    .insert(productData)
                    .select()
                    .single()
                if (error) throw error
                productId = data.id
            }

            await Promise.all(
                variantRows.map(async (row) => {
                    const variantData = {
                        product_id: productId,
                        condition: row.condition,
                        price: parseFloat(row.price),
                        original_price: row.original_price ? parseFloat(row.original_price) : null,
                        stock_count: parseInt(row.stock_count),
                        battery_health: row.battery_health ? parseInt(row.battery_health) : null,
                        status: row.status,
                    }
                    if (row.id) {
                        await supabase.from('product_variants').update(variantData).eq('id', row.id)
                    } else {
                        await supabase.from('product_variants').insert(variantData)
                    }
                })
            )

            await Promise.all(
                newFiles.map(async (file, i) => {
                    const ext = file.name.split('.').pop()
                    const path = `${productId}/${uuidv4()}.${ext}`
                    const { error: uploadError } = await supabase.storage
                        .from('product-images')
                        .upload(path, file)
                    if (uploadError) throw uploadError
                    const { data: { publicUrl } } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(path)
                    await supabase.from('product_images').insert({
                        product_id: productId,
                        url: publicUrl,
                        position: existingImages.length + i,
                    })
                })
            )

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
            <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">

                {/* Basic Info */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-gray-700 border-b pb-2">Basic Info</h2>

                    <div className="space-y-1">
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Brand</Label>
                            <Input value={brand} onChange={e => setBrand(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label>Model</Label>
                            <Input value={model} onChange={e => setModel(e.target.value)} required />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Description</Label>
                        <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                    </div>

                    <div className="space-y-1">
                        <Label>Specs <span className="text-xs text-gray-400">(free-text summary, e.g. "Midnight Black, Face ID")</span></Label>
                        <Textarea
                            value={specs}
                            onChange={e => setSpecs(e.target.value)}
                            rows={2}
                            placeholder="Midnight Black, Face ID, USB-C"
                        />
                    </div>
                </div>

                {/* Device Specs */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-gray-700 border-b pb-2">Device Specs</h2>
                    <p className="text-xs text-gray-400">Used for filtering on the storefront. Leave blank if not applicable.</p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>RAM</Label>
                            <Select value={ramGb} onValueChange={setRamGb}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="Select RAM" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RAM_OPTIONS.map(r => (
                                        <SelectItem key={r} value={r.toString()}>{r} GB</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label>Storage</Label>
                            <Select value={storageGb} onValueChange={setStorageGb}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="Select storage" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STORAGE_OPTIONS.map(s => (
                                        <SelectItem key={s} value={s.toString()}>
                                            {s >= 1024 ? `${s / 1024} TB` : `${s} GB`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label>Network</Label>
                            <Select value={networkType} onValueChange={setNetworkType}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="Select network" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="4G">4G</SelectItem>
                                    <SelectItem value="5G">5G</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label>OS</Label>
                            <Select value={os} onValueChange={setOs}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="Select OS" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="iOS">iOS</SelectItem>
                                    <SelectItem value="Android">Android</SelectItem>
                                    <SelectItem value="Windows">Windows</SelectItem>
                                    <SelectItem value="macOS">macOS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Color</Label>
                        <Input
                            value={color}
                            onChange={e => setColor(e.target.value)}
                            placeholder="e.g. Midnight Black, Starlight, Graphite"
                        />
                    </div>
                </div>

                {/* Variants */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-gray-700 border-b pb-2">Condition & Pricing</h2>
                    <p className="text-xs text-gray-400">Add a row for each grade variant you have in stock.</p>

                    <div className="space-y-3">
                        {variantRows.map((row, index) => (
                            <div key={index} className="space-y-2 bg-gray-50 p-3 rounded-lg">
                                {/* Row 1: Condition + Status + Remove */}
                                <div className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-6 space-y-1">
                                        <Label className="text-xs">Grade / Condition</Label>
                                        <Select
                                            value={row.condition}
                                            onValueChange={val => updateVariantRow(index, 'condition', val)}
                                        >
                                            <SelectTrigger className="cursor-pointer h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allConditions.map(c => (
                                                    <SelectItem key={c} value={c}>{conditionLabels[c]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="col-span-4 space-y-1">
                                        <Label className="text-xs">Status</Label>
                                        <Select
                                            value={row.status}
                                            onValueChange={val => updateVariantRow(index, 'status', val as 'available' | 'unavailable')}
                                        >
                                            <SelectTrigger className="cursor-pointer h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="available">Available</SelectItem>
                                                <SelectItem value="unavailable">Unavailable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="col-span-2 flex items-end justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeVariantRow(index)}
                                            disabled={variantRows.length === 1}
                                            className="h-8 w-8 flex items-center justify-center text-red-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                {/* Row 2: Price + MRP + Stock + Battery */}
                                <div className="grid grid-cols-4 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Price (₹)</Label>
                                        <Input
                                            type="number"
                                            value={row.price}
                                            onChange={e => updateVariantRow(index, 'price', e.target.value)}
                                            className="h-8 text-xs"
                                            required
                                            min={0}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs">MRP (₹)</Label>
                                        <Input
                                            type="number"
                                            value={row.original_price}
                                            onChange={e => updateVariantRow(index, 'original_price', e.target.value)}
                                            className="h-8 text-xs"
                                            min={0}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs">Stock</Label>
                                        <Input
                                            type="number"
                                            value={row.stock_count}
                                            onChange={e => updateVariantRow(index, 'stock_count', e.target.value)}
                                            className="h-8 text-xs"
                                            min={0}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs">
                                            Battery Health
                                            {row.battery_health && (
                                                <span className="ml-1 text-gray-500">{row.battery_health}%</span>
                                            )}
                                        </Label>
                                        <Input
                                            type="number"
                                            value={row.battery_health}
                                            onChange={e => updateVariantRow(index, 'battery_health', e.target.value)}
                                            className="h-8 text-xs"
                                            min={0}
                                            max={100}
                                            placeholder="e.g. 87"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {variantRows.length < 5 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addVariantRow}
                            className="cursor-pointer"
                        >
                            + Add Grade Variant
                        </Button>
                    )}
                </div>

                {/* Images */}
                <div className="space-y-3">
                    <h2 className="font-semibold text-gray-700 border-b pb-2">Images <span className="text-xs font-normal text-gray-400">(max 5)</span></h2>
                    <div className="flex flex-wrap gap-3">
                        {existingImages.map(img => (
                            <div key={img.id} className="relative w-24 h-24">
                                <img src={img.url} className="w-24 h-24 object-cover rounded border" alt="" />
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(img.id, img.url)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center cursor-pointer"
                                >✕</button>
                            </div>
                        ))}
                        {previews.map((src, i) => (
                            <div key={i} className="relative w-24 h-24">
                                <img src={src} className="w-24 h-24 object-cover rounded border" alt="" />
                                <button
                                    type="button"
                                    onClick={() => removeNewFile(i)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center cursor-pointer"
                                >✕</button>
                            </div>
                        ))}
                        {existingImages.length + newFiles.length < 5 && (
                            <label className="w-24 h-24 border-2 border-dashed rounded flex items-center justify-center text-gray-400 cursor-pointer hover:border-gray-600 transition-colors">
                                <span className="text-2xl">+</span>
                                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>
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