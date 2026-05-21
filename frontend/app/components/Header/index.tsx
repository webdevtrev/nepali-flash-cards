'use client'

import Image from 'next/image'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import styles from './Header.module.css'
import {FaBookOpen, FaCog, FaHome, FaQuestionCircle, FaUser, FaFont} from 'react-icons/fa'

export default function Header() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }

    return pathname.startsWith(href)
  }

  const links = [
    {href: '/', label: 'Home', icon: <FaHome />},
    {href: '/learn', label: 'Learn', icon: <FaBookOpen />},
    {href: '/quiz', label: 'Quiz', icon: <FaQuestionCircle />},
    {href: '/words', label: 'Words', icon: <FaFont />},
    {href: '/profile', label: 'Profile', icon: <FaUser />},
    {href: '/settings', label: 'Settings', icon: <FaCog />},
  ]

  return (
    <header className={styles.header}>
      <Image
        src="/images/logo.png"
        alt="Learn Nepali"
        width={140}
        height={92}
        className={styles.logo}
        priority
      />
      <nav className={styles.nav}>
        {links.map(({href, label, icon}) => (
          <Link
            key={href}
            href={href}
            className={`${styles.title} ${isActive(href) ? styles.active : ''}`}
            aria-current={isActive(href) ? 'page' : undefined}
          >
            <span className={styles.icon}>{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </header>
  )
}
