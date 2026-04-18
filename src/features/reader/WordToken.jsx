import { useRef, useCallback } from 'react'

export default function WordToken({ display, word, isWord, onTap, onLongPress }) {
  const timerRef = useRef(null)
  const pressedRef = useRef(false)

  const handleTouchStart = useCallback((e) => {
    if (!isWord) return
    pressedRef.current = false
    timerRef.current = setTimeout(() => {
      pressedRef.current = true
      onLongPress(word)
      // Prevent text selection
      e.preventDefault()
    }, 500)
  }, [isWord, word, onLongPress])

  const handleTouchEnd = useCallback((e) => {
    if (!isWord) return
    clearTimeout(timerRef.current)
    if (!pressedRef.current) {
      onTap(word)
    }
    e.preventDefault()
  }, [isWord, word, onTap])

  const handleTouchMove = useCallback(() => {
    clearTimeout(timerRef.current)
  }, [])

  if (!isWord) {
    return <span>{display}</span>
  }

  return (
    <span
      className="word-token"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onClick={(e) => {
        // Fallback for desktop
        e.stopPropagation()
        onTap(word)
      }}
    >
      {display}
    </span>
  )
}
