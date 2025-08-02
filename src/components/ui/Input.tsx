import React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "gaming-input flex h-10 w-full text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 gaming-focus",
        className
      )}
      {...props}
    />
  )
}