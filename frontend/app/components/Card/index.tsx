import React from 'react'
import Link from 'next/link'

import styles from './Card.module.css'

export type CardProps = {
  title?: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
  href?: string
  onClick?: () => void
}
const Card = React.forwardRef<HTMLElement, CardProps>(function Card(
  {title, subtitle, children, className, href, onClick},
  ref,
) {
  const isClickable = Boolean(href || onClick)
  const classNames = [styles.card, isClickable ? styles.clickable : '', className]
    .filter(Boolean)
    .join(' ')

  const body = (
    <>
      {(title || subtitle) && (
        <div className={styles.header}>
          {title && <div className={styles.title}>{title}</div>}
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
      )}

      <div className={styles.content}>{children}</div>
    </>
  )

  // If href is provided, use Next Link (renders an anchor)
  if (href) {
    return (
      <Link
        href={href}
        className={[styles.link, classNames].filter(Boolean).join(' ')}
        onClick={onClick}
        ref={ref as any}
      >
        {body}
      </Link>
    )
  }

  // If onClick without href, render a semantic button
  console.log(onClick)
  if (onClick) {
    return (
      <button
        ref={ref as any}
        type="button"
        className={[styles.button, classNames].filter(Boolean).join(' ')}
        onClick={onClick}
      >
        {body}
      </button>
    )
  }

  // Non-interactive card
  return <div className={classNames}>{body}</div>
})

export default Card
