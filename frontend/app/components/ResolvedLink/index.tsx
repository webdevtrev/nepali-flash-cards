import Link from 'next/link'

import {linkResolver} from '@/sanity/lib/utils'
import type {DereferencedLink} from '@/sanity/lib/types'
import type {Link as CMSLink} from '@/sanity.types'

interface ResolvedLinkProps {
  // Accept either a dereferenced link (from GROQ) or the raw Link shape from the CMS
  link: DereferencedLink | CMSLink
  children: React.ReactNode
  className?: string
}

export default function ResolvedLink({link, children, className}: ResolvedLinkProps) {
  // resolveLink() is used to determine the type of link and return the appropriate URL.
  const resolvedLink = linkResolver(link)

  if (typeof resolvedLink === 'string') {
    return (
      <Link
        href={resolvedLink}
        target={link?.openInNewTab ? '_blank' : undefined}
        rel={link?.openInNewTab ? 'noopener noreferrer' : undefined}
        className={className}
      >
        {children}
      </Link>
    )
  }
  return <>{children}</>
}
