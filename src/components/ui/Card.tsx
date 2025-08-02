import React from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'gaming'
}

export function Card({ className, children, variant = 'gaming', ...props }: CardProps) {
  return (
    <div
      className={cn(
        variant === 'gaming' 
          ? "gaming-card" 
          : "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm",
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
    <div className={cn("p-6 pb-0 text-gray-900 dark:text-white gaming-text-shadow", className)} {...props}>
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
    <h3 className={cn("text-lg font-semibold text-gray-900 dark:text-white gaming-text-shadow", className)} {...props}>
      {children}
    </h3>
  )
}