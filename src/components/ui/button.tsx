import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#00f5ff]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        // Primary neon button with gradient
        default:
          'relative bg-gradient-to-r from-[#00f5ff] to-[#a855f7] text-[#0a0a0f] font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] hover:scale-[1.02] active:scale-[0.98]',
        // Destructive with red neon
        destructive:
          'bg-[#ff4757] text-white shadow-lg hover:bg-[#ff4757]/90 hover:shadow-[0_0_20px_rgba(255,71,87,0.4)]',
        // Outline with neon border
        outline:
          'border border-[rgba(0,245,255,0.3)] bg-transparent hover:bg-[#00f5ff]/5 hover:border-[#00f5ff]/50 hover:text-[#00f5ff] hover:shadow-[0_0_15px_rgba(0,245,255,0.2)]',
        // Secondary with glass effect
        secondary:
          'glass-card border-[rgba(255,255,255,0.1)] text-foreground hover:border-[#a855f7]/30 hover:bg-[#a855f7]/5',
        // Ghost button
        ghost:
          'hover:bg-[#00f5ff]/5 hover:text-[#00f5ff] hover:border-[#00f5ff]/20',
        // Link style
        link: 'text-[#00f5ff] underline-offset-4 hover:underline hover:text-[#a855f7]',
        // Neon glow button (special variant)
        neon:
          'relative overflow-hidden bg-transparent border border-[#00f5ff] text-[#00f5ff] before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#00f5ff]/20 before:to-[#a855f7]/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity hover:shadow-[0_0_20px_rgba(0,245,255,0.3),inset_0_0_20px_rgba(0,245,255,0.1)]',
        // Holographic button
        holo:
          'relative overflow-hidden bg-[#12121a] border border-[rgba(255,255,255,0.1)] text-foreground before:absolute before:inset-0 before:bg-[var(--holo-gradient)] before:opacity-0 hover:before:opacity-20 before:transition-opacity hover:border-[#00f5ff]/30 hover:shadow-[0_0_30px_rgba(0,245,255,0.2)]',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-lg gap-1.5 px-3.5 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-2xl px-10 text-lg',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
