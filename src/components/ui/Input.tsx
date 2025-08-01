import React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder:text-gray-400 dark:focus:ring-violet-400 dark:focus:border-violet-400",
        className
      )}
      {...props}
    />
  )
}