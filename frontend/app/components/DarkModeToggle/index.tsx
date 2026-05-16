'use client'

import {useEffect, useState} from 'react'
import Toggle from '@/app/components/Toggle'

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false)

  // Sync initial state from localStorage/html class
  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const isDark = stored ? stored === 'dark' : document.documentElement.classList.contains('dark')
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return <Toggle checked={dark} onChange={toggle} label="Dark" />
}
