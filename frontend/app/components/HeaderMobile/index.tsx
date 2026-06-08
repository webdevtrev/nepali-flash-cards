'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import styles from './HeaderMobile.module.css'
import {
  FaBookOpen,
  FaRegUser,
  FaQuestionCircle,
  FaRegQuestionCircle,
  FaUser,
  FaFont,
} from 'react-icons/fa'
import {GoHome, GoHomeFill} from 'react-icons/go'

export default function HeaderMobile() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }

    return pathname.startsWith(href)
  }

  const links = [
    {href: '/', label: 'Home', icon: <GoHome />, activeIcon: <GoHomeFill />},
    {href: '/learn', label: 'Learn', icon: <FaBookOpen />, activeIcon: <FaBookOpen />},
    {href: '/quiz', label: 'Quiz', icon: <FaRegQuestionCircle />, activeIcon: <FaQuestionCircle />},
    {href: '/review', label: 'Review', icon: <FaFont />, activeIcon: <FaFont />},
    {href: '/profile', label: 'Profile', icon: <FaRegUser />, activeIcon: <FaUser />},
  ]

  return (
    <nav className={styles.nav}>
      {links.map(({href, label, icon, activeIcon}) => (
        <Link
          key={href}
          href={href}
          className={`${styles.title} ${isActive(href) ? styles.active : ''}`}
          aria-current={isActive(href) ? 'page' : undefined}
        >
          <span className={styles.icon}>{isActive(href) ? activeIcon : icon}</span>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  )
}
