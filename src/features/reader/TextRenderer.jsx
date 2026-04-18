import { useMemo, useCallback } from 'react'
import WordToken from './WordToken'
import { splitToSentences, splitToWords } from '../../utils/textParser'
import './reader.css'

export default function TextRenderer({ text, highlightedSentence, style, onWordTap, onLongPress }) {
  const sentences = useMemo(() => splitToSentences(text), [text])

  const handleTap = useCallback((word, sentence, position) => {
    onWordTap(word, sentence, position)
  }, [onWordTap])

  const handleLong = useCallback((word, sentence) => {
    onLongPress(word, sentence)
  }, [onLongPress])

  return (
    <div className="text-renderer" dir="ltr" style={style}>
      {sentences.map((sentence, si) => {
        const words = splitToWords(sentence)
        const isHighlighted = highlightedSentence === sentence
        return (
          <span key={si}>
            {words.map((token, wi) => (
              <WordToken
                key={`${si}-${wi}`}
                display={token.display}
                word={token.word}
                isWord={token.isWord}
                highlighted={isHighlighted && token.isWord}
                onTap={(word, pos) => handleTap(word, sentence, pos)}
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
