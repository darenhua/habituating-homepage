import { useState, useEffect } from 'react'

export function useViewMode() {
  const [viewMode, setViewMode] = useState<'weekly' | 'yearly'>('weekly')

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'weekly' ? 'yearly' : 'weekly')
  }

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'z') {
        toggleViewMode()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return { viewMode, toggleViewMode }
}