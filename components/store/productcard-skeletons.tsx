export function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col animate-pulse">
            <div className="aspect-[4/3] bg-gray-200" />
            <div className="p-3 flex flex-col gap-2.5">
                <div className="h-3.5 bg-gray-200 rounded-full w-4/5" />
                <div className="h-3 bg-gray-200 rounded-full w-2/5" />
                <div className="h-8 bg-gray-100 rounded-xl mt-1" />
            </div>
        </div>
    )
}

export function SkeletonGrid() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    )
}

export function SkeletonSidebar() {
    return (
        <div className="flex flex-col gap-4 px-4 py-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                    <div className="h-3 bg-gray-200 rounded-full w-2/3" />
                    <div className="flex flex-wrap gap-1.5">
                        {Array.from({ length: 3 }).map((_, j) => (
                            <div key={j} className="h-6 w-14 bg-gray-100 rounded-full" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}