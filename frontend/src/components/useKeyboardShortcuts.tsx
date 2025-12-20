// Custom hook for keyboard shortcuts
import { useEffect } from 'react'

interface UseKeyboardShortcutsProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  showSettings: boolean
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>
  setBionicEnabled: React.Dispatch<React.SetStateAction<boolean>>
  setFontSize: React.Dispatch<React.SetStateAction<number>>
}

export const useKeyboardShortcuts = ({
  scrollContainerRef,
  showSettings,
  setShowSettings,
  setBionicEnabled,
  setFontSize,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const container = scrollContainerRef.current
      if (!container) return

      const viewportHeight = container.clientHeight

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (e.shiftKey) {
            // Shift+Space: scroll up
            container.scrollBy({ top: -viewportHeight, behavior: 'smooth' })
          } else {
            // Space: scroll down
            container.scrollBy({ top: viewportHeight, behavior: 'smooth' })
          }
          break

        case 'ArrowDown':
          e.preventDefault()
          container.scrollBy({ top: 100, behavior: 'smooth' })
          break

        case 'ArrowUp':
          e.preventDefault()
          container.scrollBy({ top: -100, behavior: 'smooth' })
          break

        case 'Home':
          e.preventDefault()
          container.scrollTo({ top: 0, behavior: 'smooth' })
          break

        case 'End':
          e.preventDefault()
          container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
          break

        case 's':
        case 'S':
          e.preventDefault()
          setShowSettings(prev => !prev)
          break

        case 'b':
        case 'B':
          e.preventDefault()
          setBionicEnabled(prev => !prev)
          break

        case 'Escape':
          if (showSettings) {
            e.preventDefault()
            setShowSettings(false)
          }
          break

        case '+':
        case '=':
          e.preventDefault()
          setFontSize(prev => Math.min(prev + 2, 24))
          break

        case '-':
        case '_':
          e.preventDefault()
          setFontSize(prev => Math.max(prev - 2, 14))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSettings, scrollContainerRef, setShowSettings, setBionicEnabled, setFontSize])
}