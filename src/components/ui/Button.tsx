import React from 'react'
import { cn } from '../../lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-violet-600 text-white hover:bg-violet-700 shadow-sm hover:shadow-md dark:bg-violet-600 dark:hover:bg-violet-700",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 dark:border-slate-600",
        outline: "bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 dark:border-slate-600",
        ghost: "hover:bg-gray-100 text-gray-700 dark:hover:bg-slate-700 dark:text-white",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700",
        danger: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
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