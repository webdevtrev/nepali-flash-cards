'use client'

import React from 'react'
import styles from './Button.module.css'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export default function Button({
  children,
  className = '',
  variant = 'primary',
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: styles.primary,
    secondary: styles.secondary,
    outline: styles.outline,
  }[variant]

  return (
    <button
      className={`${styles.button} ${variantClass} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
