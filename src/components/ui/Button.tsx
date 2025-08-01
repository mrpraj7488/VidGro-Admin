import React from 'react'
import { cn } from '../../lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  "gaming-button gaming-interactive inline-flex items-center justify-center text-sm font-medium disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        secondary: "!bg-gradient-to-r !from-gray-400 !to-gray-600 !shadow-[0_4px_15px_rgba(156,163,175,0.4)]",
        outline: "!bg-transparent !border-2 !border-violet-500/50 !text-violet-600 dark:!text-violet-400 !shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:!bg-violet-500/10",
        ghost: "!bg-transparent !shadow-none hover:!bg-violet-500/10 !text-gray-700 dark:!text-white",
        success: "!bg-gradient-to-r !from-emerald-500 !to-green-600 !shadow-[0_4px_15px_rgba(16,185,129,0.4)]",
        danger: "!bg-gradient-to-r !from-red-500 !to-red-600 !shadow-[0_4px_15px_rgba(239,68,68,0.4)]"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 py-1",
        lg: "h-12 px-6 py-3",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}