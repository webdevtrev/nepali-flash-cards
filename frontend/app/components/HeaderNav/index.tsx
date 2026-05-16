'use client'

import Link from 'next/link'
import {useState} from 'react'
import DarkModeToggle from '@/app/components/DarkModeToggle'
import styles from './HeaderNav.module.css'

const navLinks = [{href: '/flash-cards', label: 'Flash Cards'}]

export default function HeaderNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop nav */}
      <div className={styles.desktopNav}>
        {navLinks.map(({href, label}) => (
          <Link key={href} href={href} className={styles.desktopNavLink}>
            {label}
          </Link>
        ))}
        <DarkModeToggle />
      </div>

      {/* Hamburger button (mobile only) */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className={styles.hamburger}
      >
        <span className={`${styles.bar} ${styles.barTop} ${open ? styles.open : ''}`} />
        <span className={`${styles.bar} ${styles.barMid} ${open ? styles.open : ''}`} />
        <span className={`${styles.bar} ${styles.barBot} ${open ? styles.open : ''}`} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <nav className={styles.menu}>
            {navLinks.map(({href, label}) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={styles.navLink}
              >
                {label}
              </Link>
            ))}
            <div className={styles.menuDivider}>
              <DarkModeToggle />
            </div>
          </nav>
        </>
      )}
    </>
  )
}
