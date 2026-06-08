import styles from './CardButton.module.css'
import {hexToRgb} from './colorUtils'

export default function CardButton({
  title,
  icon,
  color = '#007bff',
  disabled = false,
  onClick,
}: {
  title?: string
  icon?: React.ReactNode
  color?: string
  disabled?: boolean
  onClick?: () => void
}) {
  const rgb = disabled ? '0,0,0' : hexToRgb(color)

  return (
    <button
      className={styles.button}
      title={title}
      style={
        {
          '--card-button-color': disabled ? 'gray' : color,
          '--card-button-color-rgb': rgb,
        } as React.CSSProperties
      }
      onClick={onClick}
    >
      <span className={styles.icon}>{icon}</span>
      <span>{title}</span>
    </button>
  )
}
