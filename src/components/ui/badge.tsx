import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/20 text-purple-300 border border-primary/30',
        secondary: 'bg-card text-gray-300 border border-border',
        destructive: 'bg-danger/20 text-red-300 border border-danger/30',
        success: 'bg-success/20 text-emerald-300 border border-success/30',
        accent: 'bg-accent/20 text-cyan-300 border border-accent/30',
        warning: 'bg-warning/20 text-yellow-300 border border-warning/30',
        outline: 'text-white border border-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
