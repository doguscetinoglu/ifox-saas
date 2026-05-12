'use client'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-8 h-8" />

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-8 h-8 rounded-full flex items-center justify-center transition-all glass-subtle hover:scale-110 active:scale-95"
      aria-label="Tema değiştir"
    >
      {theme === 'dark'
        ? <Sun size={15} className="text-amber-400" />
        : <Moon size={15} className="text-indigo-500" />
      }
    </button>
  )
}
