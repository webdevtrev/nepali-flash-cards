'use client'

import {useEffect, useState} from 'react'
import Toggle from '@/app/components/Toggle'

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }
    const stored = localStorage.getItem('theme')
    return stored ? stored === 'dark' : document.documentElement.classList.contains('dark')
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  function toggle() {
    setDark((previous) => !previous)
  }

  return <Toggle checked={dark} onChange={toggle} label="Dark" />
}
