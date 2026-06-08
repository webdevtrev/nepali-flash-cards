'use client'
import {FaXmark} from 'react-icons/fa6'

import React from 'react'
import styles from './Chip.module.css'

type Variant = 'new' | 'inProgress' | 'completed' | 'review' | 'default'

type ChipProps = React.HTMLAttributes<HTMLDivElement> & {
  children: string
  variant?: Variant
  removable?: boolean
  onRemove?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export default function Chip({
  children,
  variant = 'default',
  removable = false,
  onRemove,
  className = '',
  ...props
}: ChipProps) {
  const variantClass = variant ? (styles[variant] ?? '') : ''

  return (
    <div role="status" className={`${styles.chip} ${variantClass} ${className}`.trim()} {...props}>
      <span className={styles.label}>{children}</span>
      {removable && (
        <button type="button" aria-label="Remove" className={styles.remove} onClick={onRemove}>
          <FaXmark />
        </button>
      )}
    </div>
  )
}
