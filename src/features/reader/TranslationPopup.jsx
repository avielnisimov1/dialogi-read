import { useState, useEffect } from 'react'
import { translateWord, translateSentence } from '../../services/translationService'
import './reader.css'

export default function TranslationPopup({ word, sentence, mode, onClose }) {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    setResult(null)

    async function fetch() {
      try {
        if (mode === 'word') {
          const data = await translateWord(word)
          if (!cancelled) {
            setResult(data)
            setLoading(false)
          }
        } else {
          const hebrew = await translateSentence(sentence)
          if (!cancelled) {
            setResult({ sentenceHebrew: hebrew })
            setLoading(false)
          }
        }
      } catch {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [word, sentence, mode])

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

        {!loading && !error && mode === 'word' && result && (
          <div className="popup-word-result">
            <div className="popup-english-word">{word}</div>
            {result.phonetic && (
              <div className="popup-phonetic">{result.phonetic}</div>
            )}
            <div className="popup-hebrew">{result.hebrew}</div>
            {result.partOfSpeech && (
              <div className="popup-pos">{result.partOfSpeech}</div>
            )}
            {result.definition && (
              <div className="popup-definition">{result.definition}</div>
            )}
            {result.example && (
              <div className="popup-example">"{result.example}"</div>
            )}
          </div>
        )}

        {!loading && !error && mode === 'sentence' && result && (
          <div className="popup-sentence-result">
            <div className="popup-sentence-en" dir="ltr">{sentence}</div>
            <div className="popup-sentence-divider" />
            <div className="popup-sentence-he">{result.sentenceHebrew}</div>
          </div>
        )}
      </div>
    </div>
  )
}
