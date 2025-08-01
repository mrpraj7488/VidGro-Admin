import React from 'react'
import { cn } from '../../lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  "gaming-badge",
  {
    variants: {
      variant: {
        default: "!bg-gradient-to-r !from-gray-400 !to-gray-600 !text-white !shadow-[0_0_15px_rgba(156,163,175,0.4)]",
        success: "active",
        warning: "hold",
        danger: "danger",
        info: "completed",
        vip: "!bg-gradient-to-r !from-violet-500 !to-purple-600 !text-white !shadow-[0_0_15px_rgba(139,92,246,0.5)]"
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