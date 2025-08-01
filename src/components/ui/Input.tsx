import React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "gaming-input flex h-10 w-full disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}