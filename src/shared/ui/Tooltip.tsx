'use client';
import React, { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface TooltipProps {
  content: React.ReactNode;
  side?: 'left' | 'top';
  children: React.ReactElement;
  className?: string;
}

/** Lightweight hover/focus tooltip. */
export function Tooltip({ content, side = 'top', children, className = '' }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const pos =
  side === 'left' ?
  'right-full top-1/2 mr-2.5 -translate-y-1/2' :
  'bottom-full left-1/2 mb-2 -translate-x-1/2';
  const offset = side === 'left' ? { x: 4 } : { y: 4 };

  return (
    <span
      className={`relative ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-describedby={open ? id : undefined}>
      
      {children}
      <AnimatePresence>
        {open &&
        <motion.span
          id={id}
          role="tooltip"
          initial={{ opacity: 0, ...offset }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, ...offset }}
          transition={{ duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
          className={`pointer-events-none absolute z-50 block w-60 rounded-lg bg-ink px-3 py-2.5 text-left text-xs leading-relaxed text-surface shadow-xl ${pos}`}>
          
            {content}
          </motion.span>
        }
      </AnimatePresence>
    </span>);

}
