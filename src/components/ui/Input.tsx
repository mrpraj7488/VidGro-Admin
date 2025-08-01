import React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg bg-white px-3 py-2 text-sm placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 dark:bg-slate-700 dark:text-white dark:placeholder:text-gray-400",
        className
      )}
      {...props}
    />
  )
}