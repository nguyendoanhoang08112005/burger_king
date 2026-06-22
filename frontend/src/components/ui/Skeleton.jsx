import React from 'react'

// Base skeleton
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
)

// Product card skeleton
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-glass border border-[#E8E8E8]">
    <Skeleton className="w-full h-52 rounded-t-2xl" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  </div>
)

// Homepage skeleton — hiện ngay khi load
export const HomePageSkeleton = () => (
  <div className="bg-[#FFFAF5] min-h-screen pb-16">
    {/* Hero */}
    <Skeleton className="w-full h-[640px] rounded-none bg-gray-300" />
    
    {/* Categories */}
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <Skeleton className="h-8 w-48 mx-auto mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 bg-white rounded-2xl border border-[#E8E8E8]">
            <Skeleton className="w-full h-24 rounded-xl mb-3" />
            <Skeleton className="h-5 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>

    {/* Products grid */}
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <Skeleton className="h-8 w-56 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
)

// Menu page skeleton
export const MenuPageSkeleton = () => (
  <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row gap-6 bg-[#FFFAF5]">
    {/* Sidebar */}
    <div className="w-full md:w-56 flex-shrink-0 space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
    {/* Grid */}
    <div className="flex-1">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
)

// Admin table skeleton
export const TableSkeleton = ({ rows = 5, cols = 6 }) => (
  <div className="space-y-4 p-6 bg-white rounded-2xl shadow-glass border border-[#E8E8E8]">
    <div className="flex gap-4 pb-2 border-b border-gray-100">
      {Array.from({ length: cols }).map((_, j) => (
        <Skeleton key={j} className="h-6 flex-1 bg-gray-300" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 items-center">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className="h-9 flex-1" />
        ))}
      </div>
    ))}
  </div>
)
