import React from 'react'

type LinkProps = {
  children?: React.ReactNode
  href?: string | {pathname?: string}
  [key: string]: any
}

export default function Link({children, href, ...props}: LinkProps) {
  const resolved = typeof href === 'string' ? href : href?.pathname
  return (
    // Render a normal anchor so Storybook can handle navigation in the iframe
    <a href={resolved} {...props}>
      {children}
    </a>
  )
}
