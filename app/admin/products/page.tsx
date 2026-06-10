import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DeleteProductButton from '@/components/admin/delete-product-button'

export default async function ProductsPage() {
    const supabase = await createClient()

    const { data: products } = await supabase
        .from('products')
        .select(`
      *,
      categories(name),
      product_images(url, position),
      product_variants(id, condition, price, original_price, stock_count, status)
    `)
        .order('created_at', { ascending: false })

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Products</h1>
                <Button asChild className="cursor-pointer">
                    <Link href="/admin/products/new">Add Product</Link>
                </Button>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Variants</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Price From</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Total Stock</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {products?.map(product => {
                            const thumbnail = product.product_images
                                ?.sort((a: any, b: any) => a.position - b.position)[0]?.url
                            const variants = (product.product_variants as any[]) ?? []
                            const lowestPrice = variants.length > 0
                                ? Math.min(...variants.map((v: any) => v.price))
                                : null
                            const totalStock = variants.reduce((acc: number, v: any) => acc + v.stock_count, 0)
                            const hasAvailable = variants.some((v: any) => v.status === 'available')

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
                                        <div className="flex flex-wrap gap-1">
                                            {variants.map((v: any) => (
                                                <span key={v.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                                                    {v.condition.replace('_', ' ')}
                                                </span>
                                            ))}
                                            {variants.length === 0 && <span className="text-xs text-gray-400">No variants</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {lowestPrice !== null ? (
                                            <p className="font-medium">₹{lowestPrice.toLocaleString('en-IN')}</p>
                                        ) : (
                                            <span className="text-gray-400 text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`font-medium ${totalStock === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                                            {totalStock}
                                        </span>
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
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products yet</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}