import React from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white/95 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200/50 dark:bg-slate-800/95 dark:border-slate-700/50 dark:shadow-slate-900/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("p-6 pb-0 text-gray-900 dark:text-white", className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("p-6 text-gray-900 dark:text-white", className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold text-gray-900 dark:text-white", className)} {...props}>
      {children}
    </h3>
  )
}