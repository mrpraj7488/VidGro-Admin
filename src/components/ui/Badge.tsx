import React from 'react'
import { cn } from '../../lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        success: "bg-emerald-100 text-emerald-800",
        warning: "bg-orange-100 text-orange-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        vip: "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
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