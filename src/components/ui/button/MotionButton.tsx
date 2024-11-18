'use client'

import type { ForwardRefComponent, HTMLMotionProps } from 'framer-motion'
import { m } from 'framer-motion'
import { forwardRef, memo } from 'react'

export const MotionButtonBase: ForwardRefComponent<
  HTMLButtonElement,
  HTMLMotionProps<'button'>
> = memo(
  forwardRef(({ children, ...rest }, ref) => {
    return (
      <m.button
        initial={true}
        whileFocus={{ scale: 1.02 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        {...rest}
        ref={ref}
      >
        {children}
      </m.button>
    )
  }),
)
