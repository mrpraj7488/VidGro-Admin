import React from 'react'

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-64 gaming-skeleton rounded-lg mb-2" />
          <div className="h-4 w-96 gaming-skeleton rounded-lg" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-48 gaming-skeleton rounded-lg" />
          <div className="h-10 w-24 gaming-skeleton rounded-lg" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="gaming-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 w-24 gaming-skeleton rounded mb-2" />
                <div className="h-8 w-16 gaming-skeleton rounded mb-2" />
                <div className="h-3 w-20 gaming-skeleton rounded" />
              </div>
              <div className="w-12 h-12 gaming-skeleton rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="gaming-card">
            <div className="p-6 pb-0">
              <div className="h-6 w-40 gaming-skeleton rounded mb-4" />
            </div>
            <div className="p-6">
              <div className="h-80 gaming-skeleton rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Tables Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="gaming-card">
            <div className="p-6 pb-0">
              <div className="h-6 w-32 gaming-skeleton rounded mb-4" />
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex items-center space-x-4 p-3">
                    <div className="w-8 h-8 gaming-skeleton rounded-lg" />
                    <div className="w-16 h-12 gaming-skeleton rounded" />
                    <div className="flex-1">
                      <div className="h-4 w-32 gaming-skeleton rounded mb-1" />
                      <div className="h-3 w-24 gaming-skeleton rounded" />
                    </div>
                    <div className="text-right">
                      <div className="h-4 w-12 gaming-skeleton rounded mb-1" />
                      <div className="h-3 w-8 gaming-skeleton rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}