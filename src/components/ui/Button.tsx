import React from 'react'
import { cn } from '../../lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  "gaming-shine inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 gaming-focus relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "gaming-button",
        secondary: "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl hover:scale-105 border border-gray-500/30",
        outline: "border-2 border-violet-500/50 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 hover:border-violet-500 hover:scale-105 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50",
        ghost: "text-gray-700 dark:text-gray-300 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 hover:scale-105",
        success: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-emerald-500/25 hover:scale-105 border border-emerald-400/30",
        danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 hover:scale-105 border border-red-400/30"
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