import styles from './Toggle.module.css'

interface ToggleProps {
  checked: boolean
  onChange: () => void
  label: string
}

export default function Toggle({checked, onChange, label}: ToggleProps) {
  return (
    <label className={styles.label}>
      <input type="checkbox" checked={checked} onChange={onChange} className={styles.tog} />
      <span>{label}</span>
    </label>
  )
}
