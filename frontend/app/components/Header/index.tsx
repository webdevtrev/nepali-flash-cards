import Link from 'next/link'
import Image from 'next/image'
import {settingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import HeaderNav from '@/app/components/HeaderNav'
import styles from './Header.module.css'

export default async function Header() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.title}>
          <Image
            src="/images/logo.png"
            alt="Learn Nepali"
            width={140}
            height={92}
            className={styles.logo}
            priority
          />
        </Link>
        <div className={styles.navWrap}>
          <HeaderNav />
        </div>
      </div>
    </header>
  )
}
