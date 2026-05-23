import * as React from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-white placeholder:text-gray-500 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
