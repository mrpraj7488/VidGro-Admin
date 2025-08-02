import React from 'react'

export function BugReportsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-48 gaming-skeleton rounded-lg mb-2" />
          <div className="h-4 w-72 gaming-skeleton rounded-lg" />
        </div>
        <div className="h-10 w-32 gaming-skeleton rounded-lg" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="gaming-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 w-20 gaming-skeleton rounded mb-2" />
                <div className="h-8 w-12 gaming-skeleton rounded" />
              </div>
              <div className="w-12 h-12 gaming-skeleton rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="gaming-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 gaming-skeleton rounded-lg" />
          ))}
        </div>
      </div>

      {/* Bug Reports List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="gaming-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-6 w-48 gaming-skeleton rounded" />
                  <div className="h-6 w-16 gaming-skeleton rounded-full" />
                  <div className="h-6 w-12 gaming-skeleton rounded-full" />
                  <div className="h-6 w-20 gaming-skeleton rounded-full" />
                </div>
                <div className="h-4 w-full gaming-skeleton rounded mb-2" />
                <div className="h-4 w-3/4 gaming-skeleton rounded mb-3" />
                
                <div className="flex items-center space-x-6">
                  <div className="h-4 w-32 gaming-skeleton rounded" />
                  <div className="h-4 w-24 gaming-skeleton rounded" />
                  <div className="h-4 w-28 gaming-skeleton rounded" />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="h-8 w-20 gaming-skeleton rounded" />
                <div className="h-8 w-24 gaming-skeleton rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}