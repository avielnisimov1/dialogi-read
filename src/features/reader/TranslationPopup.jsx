import { useState, useEffect, useRef, useCallback } from 'react'
import { translateWord, translateSentence, getWordDetail } from '../../services/translationService'
import './reader.css'

// Light bubble — only Hebrew translation, click to expand
export function BubblePopup({ word, sentence, position, onClose, onExpand }) {
  const [hebrew, setHebrew] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const bubbleRef = useRef(null)
  const initialScrollRef = useRef(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    translateWord(word, sentence).then(result => {
      if (cancelled) return
      setHebrew(result?.hebrew || '')
      setLoading(false)
    }).catch(() => {
      if (cancelled) return
      setError(true)
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [word, sentence])

  // Dismiss on scroll
  useEffect(() => {
    initialScrollRef.current = window.scrollY
    const handleScroll = () => {
      if (Math.abs(window.scrollY - initialScrollRef.current) > 50) {
        onClose()
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [onClose])

  const bubbleHeight = 46
  const showBelow = position ? position.top < bubbleHeight + 10 : false

  const style = {}
  if (position) {
    style.left = Math.min(Math.max(position.left, 60), window.innerWidth - 60)
    style.transform = 'translateX(-50%)'
    if (showBelow) {
      style.top = position.bottom + 8
    } else {
      style.top = position.top - bubbleHeight - 8
    }
  }

  const handleBubbleClick = (e) => {
    e.stopPropagation()
    if (!loading && !error && hebrew) {
      onExpand()
    }
  }

  return (
    <>
      <div className="bubble-backdrop" onClick={onClose} />
      <div
        ref={bubbleRef}
        className={`bubble-popup ${showBelow ? 'bubble-below' : ''}`}
        style={style}
        onClick={handleBubbleClick}
      >
        {loading && <span className="bubble-loading">...</span>}
        {error && <span className="bubble-error">?</span>}
        {!loading && !error && <span className="bubble-hebrew">{hebrew}</span>}
      </div>
    </>
  )
}

// Detail popup — full word info
export function DetailPopup({ word, sentence, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    getWordDetail(word, sentence).then(result => {
      if (cancelled) return
      setDetail(result)
      setLoading(false)
    }).catch(() => {
      if (cancelled) return
      setError(true)
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [word, sentence])

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="popup-handle" />

        {loading && (
          <div className="popup-loading">
            <div className="spinner" />
            <p>טוען פרטים...</p>
          </div>
        )}

        {error && (
          <div className="popup-error">
            <p>לא הצלחתי לטעון, נסה שוב</p>
          </div>
        )}

        {!loading && !error && detail && (
          <div className="popup-word-result">
            <div className="popup-english-word">{word}</div>
            {detail.pronunciation && (
              <div className="popup-pronunciation">{detail.pronunciation}</div>
            )}
            <div className="popup-hebrew">{detail.hebrew}</div>

            {detail.explanation && (
              <div className="popup-explanation">{detail.explanation}</div>
            )}

            {detail.example && (
              <div className="popup-examples-section">
                <div className="popup-section-label">דוגמה</div>
                <div className="popup-example-pair">
                  <div className="popup-example-en" dir="ltr">{detail.example.en}</div>
                  <div className="popup-example-he">{detail.example.he}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Full popup for long press — sentence translation
export function SentencePopup({ word, sentence, onClose }) {
  const [wordResult, setWordResult] = useState(null)
  const [sentenceHebrew, setSentenceHebrew] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    Promise.allSettled([
      translateWord(word, sentence),
      translateSentence(sentence),
    ]).then(([wordRes, sentenceRes]) => {
      if (cancelled) return
      if (wordRes.status === 'fulfilled') setWordResult(wordRes.value)
      if (sentenceRes.status === 'fulfilled') setSentenceHebrew(sentenceRes.value)
      if (wordRes.status === 'rejected' && sentenceRes.status === 'rejected') {
        setError(true)
      }
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [word, sentence])

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="popup-handle" />

        {loading && (
          <div className="popup-loading">
            <div className="spinner" />
            <p>מתרגם...</p>
          </div>
        )}

        {error && (
          <div className="popup-error">
            <p>לא הצלחתי לתרגם, נסה שוב</p>
          </div>
        )}

        {!loading && !error && (
          <div className="popup-word-result">
            {wordResult && (
              <>
                <div className="popup-english-word">{word}</div>
                <div className="popup-hebrew">{wordResult.hebrew}</div>
              </>
            )}

            {sentenceHebrew && (
              <div className="popup-sentence-section">
                <div className="popup-sentence-label">תרגום המשפט</div>
                <div className="popup-sentence-en" dir="ltr">{sentence}</div>
                <div className="popup-sentence-he">{sentenceHebrew}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TranslationPopup({ word, sentence, mode, position, onClose, onExpandBubble }) {
  if (mode === 'word') {
    return <BubblePopup word={word} sentence={sentence} position={position} onClose={onClose} onExpand={onExpandBubble} />
  }
  if (mode === 'detail') {
    return <DetailPopup word={word} sentence={sentence} onClose={onClose} />
  }
  return <SentencePopup word={word} sentence={sentence} onClose={onClose} />
}
