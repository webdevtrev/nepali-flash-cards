import styles from './ProgressBar.module.css'

type Size = 'small' | 'medium' | 'large'
type StyleVariant = 'determinate' | 'indeterminate' | 'segmented'
type SegmentStyle = 'rectangular' | 'circular'

export default function ProgressBar({
  progress,
  size = 'medium',
  style = 'determinate',
  segments = 5,
  segmentStyle = 'rectangular',
}: {
  progress: number
  size?: Size
  style?: StyleVariant
  /** Used only for `segmented` style: total number of segments */
  segments?: number
  /** Used only for `segmented` style: segment shape */
  segmentStyle?: SegmentStyle
}) {
  const sizeClass = styles[size] || styles.medium
  const isSegmented = style === 'segmented'

  // When segmented, `progress` represents number of completed segments (0..segments)
  if (isSegmented) {
    const total = Math.max(1, Math.floor(segments))
    const completed = Math.max(0, Math.min(total, Math.round(progress)))
    const shapeClass = segmentStyle === 'circular' ? styles.circular : ''

    return (
      <div
        className={[styles.container, styles.segmentedContainer, sizeClass, shapeClass].join(' ')}
      >
        {Array.from({length: total}).map((_, i) => (
          <div
            key={i}
            className={[styles.segment, i < completed ? styles.filled : '']
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </div>
    )
  }

  // Non-segmented variants: render a single bar with optional variant classes
  const variantClass = style !== 'determinate' ? styles[style] || '' : ''

  return (
    <div className={[styles.container, sizeClass, variantClass].filter(Boolean).join(' ')}>
      <div
        className={styles.fill}
        style={{['--width' as any]: `${progress}%`} as React.CSSProperties}
      />
    </div>
  )
}
