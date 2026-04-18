import { useMemo, useCallback } from 'react'
import WordToken from './WordToken'
import { splitToSentences, splitToWords } from '../../utils/textParser'
import './reader.css'

export default function TextRenderer({ text, onWordTap, onLongPress }) {
  const sentences = useMemo(() => splitToSentences(text), [text])

  const handleTap = useCallback((word, sentence) => {
    onWordTap(word, sentence)
  }, [onWordTap])

  const handleLong = useCallback((word, sentence) => {
    onLongPress(word, sentence)
  }, [onLongPress])

  return (
    <div className="text-renderer" dir="ltr">
      {sentences.map((sentence, si) => {
        const words = splitToWords(sentence)
        return (
          <span key={si}>
            {words.map((token, wi) => (
              <WordToken
                key={`${si}-${wi}`}
                display={token.display}
                word={token.word}
                isWord={token.isWord}
                onTap={(word) => handleTap(word, sentence)}
                onLongPress={(word) => handleLong(word, sentence)}
              />
            ))}
            {si < sentences.length - 1 && ' '}
          </span>
        )
      })}
    </div>
  )
}
