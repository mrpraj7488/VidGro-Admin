import React from 'react'
import { cn } from '../../lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  "gaming-badge inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-300 hover:scale-105 border",
  {
    variants: {
      variant: {
        default: "bg-gray-100/80 text-gray-800 dark:bg-gray-800/80 dark:text-gray-200 border-gray-300/50 dark:border-gray-600/50",
        success: "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-300/50 dark:border-emerald-600/50",
        warning: "bg-orange-100/80 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-300/50 dark:border-orange-600/50",
        danger: "bg-red-500 text-white dark:bg-red-600 dark:text-white border-red-400 dark:border-red-500 shadow-lg",
        info: "bg-blue-100/80 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300/50 dark:border-blue-600/50",
        vip: "bg-gradient-to-r from-violet-500 to-purple-600 text-white border-violet-400/50 shadow-lg shadow-violet-500/25"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}