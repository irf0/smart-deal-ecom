import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DeleteProductButton from '@/components/admin/delete-product-button'
import ProductFilters from '@/components/admin/product-filters'
import ProductPagination from '@/components/admin/product-pagination'

const CONDITION_STYLES: Record<string, string> = {
    like_new: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    good: 'bg-blue-100 text-blue-700 border-blue-200',
    fair: 'bg-amber-100 text-amber-700 border-amber-200',
    poor: 'bg-red-100 text-red-700 border-red-200',
}

const CONDITION_LABELS: Record<string, string> = {
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
}

const PAGE_SIZE = 20

interface Props {
    searchParams: Promise<{
        category?: string
        condition?: string
        status?: string
        in_stock?: string
        q?: string
        page?: string
    }>
}

export default async function ProductsPage({ searchParams }: Props) {
    const filters = await searchParams
    const supabase = await createClient()

    const page = Math.max(1, parseInt(filters.page ?? '1'))
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const [{ data: products, count }, { data: categories }] = await Promise.all([
        (async () => {
            let query = supabase
                .from('products')
                .select(`
                    *,
                    categories(name),
                    product_images(url, position)
                `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to)

            if (filters.category) query = query.eq('category_id', filters.category)
            if (filters.condition) query = query.eq('condition', filters.condition)
            if (filters.status) query = query.eq('status', filters.status)
            if (filters.in_stock === '1') query = query.gt('stock_count', 0)
            if (filters.q) {
                const term = `%${filters.q}%`
                query = query.or(`brand.ilike.${term},model.ilike.${term}`)
            }

            return query
        })(),
        supabase.from('categories').select('*').order('name'),
    ])

    const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)
    const activeFilterCount = [
        filters.category,
        filters.condition,
        filters.status,
        filters.in_stock,
        filters.q,
    ].filter(Boolean).length

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">Products</h1>
                    {count !== null && (
                        <span className="text-xs font-medium bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                            {count} {activeFilterCount > 0 ? 'result' : 'total'}{count !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                <Button asChild className="cursor-pointer">
                    <Link href="/admin/products/new">Add Product</Link>
                </Button>
            </div>

            <ProductFilters categories={categories ?? []} current={filters} />

            <div className="bg-white rounded-lg border overflow-hidden mt-4">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left font-bold px-4 py-3 text-gray-600">Product</th>
                            <th className="text-left font-bold px-4 py-3 text-gray-600">Category</th>
                            <th className="text-left font-bold px-4 py-3 text-gray-600">Condition</th>
                            <th className="text-left font-bold px-4 py-3 text-gray-600">Price</th>
                            <th className="text-left font-bold px-4 py-3 text-gray-600">In Stock</th>
                            <th className="text-left font-bold px-4 py-3 text-gray-600">Status</th>
                            <th className="text-left font-bold px-4 py-3 text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {products?.map(product => {
                            const thumbnail = product.product_images
                                ?.sort((a: any, b: any) => a.position - b.position)[0]?.url
                            return (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {thumbnail ? (
                                                <img src={thumbnail} className="w-10 h-10 object-cover rounded border" />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center text-gray-400 text-xs">No img</div>
                                            )}
                                            <div>
                                                <p className="font-medium">{product.brand} {product.model}</p>
                                                <p className="text-gray-400 text-xs">{product.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{(product.categories as any)?.name}</td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant="outline"
                                            className={CONDITION_STYLES[product.condition] ?? ''}
                                        >
                                            {CONDITION_LABELS[product.condition] ?? product.condition}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium">₹{product.price.toLocaleString('en-IN')}</p>
                                        {product.original_price && (
                                            <p className="text-gray-400 text-xs line-through">₹{product.original_price.toLocaleString('en-IN')}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`font-medium ${product.stock_count === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                                            {product.stock_count}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={product.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                                            {product.status === 'available' ? 'Available' : 'Unavailable'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Button asChild variant="outline" size="sm" className="cursor-pointer">
                                                <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                                            </Button>
                                            <DeleteProductButton id={product.id} />
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        {!products?.length && (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                                    {activeFilterCount > 0 ? 'No products match your filters.' : 'No products yet.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="border-t px-4 py-3">
                        <ProductPagination
                            page={page}
                            totalPages={totalPages}
                            filters={filters}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}