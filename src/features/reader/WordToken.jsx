import { useRef, useCallback } from 'react'

export default function WordToken({ display, word, isWord, highlighted, onTap, onLongPress }) {
  const timerRef = useRef(null)
  const pressedRef = useRef(false)
  const handledByTouchRef = useRef(false)

  const getPosition = (el) => {
    const rect = el.getBoundingClientRect()
    return {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left + rect.width / 2,
    }
  }

  const handleTouchStart = useCallback((e) => {
    if (!isWord) return
    handledByTouchRef.current = true
    pressedRef.current = false
    timerRef.current = setTimeout(() => {
      pressedRef.current = true
      navigator.vibrate?.(10)
      onLongPress(word)
      e.preventDefault()
    }, 500)
  }, [isWord, word, onLongPress])

  const handleTouchEnd = useCallback((e) => {
    if (!isWord) return
    clearTimeout(timerRef.current)
    if (!pressedRef.current) {
      navigator.vibrate?.(5)
      const pos = getPosition(e.target)
      onTap(word, pos)
    }
    e.preventDefault()
  }, [isWord, word, onTap])

  const handleTouchMove = useCallback(() => {
    clearTimeout(timerRef.current)
  }, [])

  const handleClick = useCallback((e) => {
    if (handledByTouchRef.current) {
      handledByTouchRef.current = false
      return
    }
    e.stopPropagation()
    const pos = getPosition(e.target)
    onTap(word, pos)
  }, [word, onTap])

  // Non-word tokens (punctuation) — still need word-token class for consistent spacing
  if (!isWord) {
    return <span className="word-token-punct">{display}</span>
  }

  return (
    <span
      className={`word-token ${highlighted ? 'highlighted' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
    >
      {display}
    </span>
  )
}
