import { useState, useEffect, useRef } from 'react'
import { translateWord, translateSentence } from '../../services/translationService'
import './reader.css'

// Light bubble — just the Hebrew translation
export function BubblePopup({ word, sentence, position, onClose }) {
  const [hebrew, setHebrew] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const bubbleRef = useRef(null)

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

  const style = {}
  if (position) {
    const bubbleHeight = 50
    const showBelow = position.top < bubbleHeight + 10
    style.left = Math.min(Math.max(position.left, 60), window.innerWidth - 60)
    style.transform = 'translateX(-50%)'

    if (showBelow) {
      style.top = position.bottom + 8
    } else {
      style.top = position.top - bubbleHeight - 8
    }
  }

  const showBelow = position && position.top < 60

  return (
    <>
      <div className="bubble-backdrop" onClick={onClose} />
      <div
        ref={bubbleRef}
        className={`bubble-popup ${showBelow ? 'bubble-below' : ''}`}
        style={style}
      >
        {loading && <span className="bubble-loading">...</span>}
        {error && <span className="bubble-error">?</span>}
        {!loading && !error && <span className="bubble-hebrew">{hebrew}</span>}
      </div>
    </>
  )
}

// Full popup — word + explanation + sentence translation
export function FullPopup({ word, sentence, onClose }) {
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
            <p>מתרגם...</p>
          </div>
        )}

        {error && (
          <div className="popup-error">
            <p>לא הצלחתי לתרגם, נסה שוב</p>
          </div>
        )}

        {!loading && !error && wordResult && (
          <div className="popup-word-result">
            <div className="popup-english-word">{word}</div>
            <div className="popup-hebrew">{wordResult.hebrew}</div>
            {wordResult.explanation && (
              <div className="popup-explanation">{wordResult.explanation}</div>
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

export default function TranslationPopup({ word, sentence, mode, position, onClose }) {
  if (mode === 'word') {
    return <BubblePopup word={word} sentence={sentence} position={position} onClose={onClose} />
  }
  return <FullPopup word={word} sentence={sentence} onClose={onClose} />
}
