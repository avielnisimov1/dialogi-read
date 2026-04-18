import { useRef, useState, useCallback } from 'react'
import './SwipeableCard.css'

export default function SwipeableCard({ children, onDelete, onPin, isPinned }) {
  const startXRef = useRef(0)
  const currentXRef = useRef(0)
  const directionRef = useRef(null)
  const cardRef = useRef(null)
  const [action, setAction] = useState(null) // 'delete' | 'pin'

  const THRESHOLD = 80

  const handleTouchStart = useCallback((e) => {
    startXRef.current = e.touches[0].clientX
    currentXRef.current = 0
    directionRef.current = null
    if (cardRef.current) {
      cardRef.current.style.transition = 'none'
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    const diff = e.touches[0].clientX - startXRef.current
    currentXRef.current = diff

    // Lock direction on first significant move
    if (!directionRef.current && Math.abs(diff) > 10) {
      directionRef.current = diff > 0 ? 'right' : 'left'
    }

    if (directionRef.current === 'right' && diff > 0) {
      // Swipe right → delete
      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(${Math.min(diff, 120)}px)`
      }
    } else if (directionRef.current === 'left' && diff < 0) {
      // Swipe left → pin
      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(${Math.max(diff, -120)}px)`
      }
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease'
    }

    if (directionRef.current === 'right' && currentXRef.current > THRESHOLD) {
      setAction('delete')
      if (cardRef.current) cardRef.current.style.transform = 'translateX(100px)'
    } else if (directionRef.current === 'left' && currentXRef.current < -THRESHOLD) {
      setAction('pin')
      if (cardRef.current) cardRef.current.style.transform = 'translateX(-100px)'
    } else {
      setAction(null)
      if (cardRef.current) cardRef.current.style.transform = 'translateX(0)'
    }
  }, [])

  const handleClose = useCallback(() => {
    setAction(null)
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease'
      cardRef.current.style.transform = 'translateX(0)'
    }
  }, [])

  return (
    <div className="swipeable-wrapper">
      {/* Delete action — revealed on right swipe */}
      <div className="swipeable-actions swipeable-actions-left">
        {action === 'delete' && (
          <button
            className="swipeable-delete-btn"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            מחק
          </button>
        )}
      </div>

      {/* Pin action — revealed on left swipe */}
      <div className="swipeable-actions swipeable-actions-right">
        {action === 'pin' && (
          <button
            className="swipeable-pin-btn"
            onClick={(e) => {
              e.stopPropagation()
              onPin()
              handleClose()
            }}
          >
            {isPinned ? 'בטל נעיצה' : 'נעץ'}
          </button>
        )}
      </div>

      <div
        ref={cardRef}
        className="swipeable-content"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={action ? handleClose : undefined}
      >
        {children}
      </div>
    </div>
  )
}
