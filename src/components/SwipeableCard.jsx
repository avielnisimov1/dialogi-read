import { useRef, useState, useCallback } from 'react'
import './SwipeableCard.css'

export default function SwipeableCard({ children, onDelete }) {
  const startXRef = useRef(0)
  const currentXRef = useRef(0)
  const cardRef = useRef(null)
  const [swiped, setSwiped] = useState(false)

  const THRESHOLD = 80

  const handleTouchStart = useCallback((e) => {
    startXRef.current = e.touches[0].clientX
    currentXRef.current = 0
    if (cardRef.current) {
      cardRef.current.style.transition = 'none'
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    const diff = e.touches[0].clientX - startXRef.current
    // Only allow swipe right (positive direction in RTL = reveals delete)
    if (diff < 0) return
    currentXRef.current = diff
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${Math.min(diff, 120)}px)`
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease'
    }
    if (currentXRef.current > THRESHOLD) {
      setSwiped(true)
      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(100px)`
      }
    } else {
      setSwiped(false)
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0)'
      }
    }
  }, [])

  const handleClose = useCallback(() => {
    setSwiped(false)
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease'
      cardRef.current.style.transform = 'translateX(0)'
    }
  }, [])

  return (
    <div className="swipeable-wrapper">
      <div className="swipeable-actions">
        {swiped && (
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
      <div
        ref={cardRef}
        className="swipeable-content"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={swiped ? handleClose : undefined}
      >
        {children}
      </div>
    </div>
  )
}
