import styles from './HomePage.module.css'

export default function Page() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <h1 className={styles.heading}>Welcome</h1>
        <p className={styles.subtitle}>Nepali Flash Cards</p>
      </div>
    </div>
  )
}
