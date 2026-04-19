import { useMemo, useCallback } from 'react'
import WordToken from './WordToken'
import { splitToParagraphs, splitToSentences, splitToWords } from '../../utils/textParser'
import './reader.css'

export default function TextRenderer({ text, highlightedSentence, style, onWordTap, onLongPress }) {
  const paragraphs = useMemo(() => {
    const paras = splitToParagraphs(text)
    // If no paragraph breaks found, treat as single paragraph
    if (paras.length <= 1) {
      return [{ sentences: splitToSentences(text) }]
    }
    return paras.map(p => ({ sentences: splitToSentences(p) }))
  }, [text])

  const handleTap = useCallback((word, sentence, position) => {
    onWordTap(word, sentence, position)
  }, [onWordTap])

  const handleLong = useCallback((word, sentence) => {
    onLongPress(word, sentence)
  }, [onLongPress])

  return (
    <div className="text-renderer" dir="ltr" style={style}>
      {paragraphs.map((para, pi) => (
        <p key={pi} className="reader-paragraph">
          {para.sentences.map((sentence, si) => {
            const words = splitToWords(sentence)
            const isHighlighted = highlightedSentence === sentence
            return (
              <span key={si}>
                {words.map((token, wi) => (
                  <span key={`${pi}-${si}-${wi}`}>
                    {wi > 0 && ' '}
                    <WordToken
                      display={token.display}
                      word={token.word}
                      isWord={token.isWord}
                      highlighted={isHighlighted && token.isWord}
                      onTap={(word, pos) => handleTap(word, sentence, pos)}
                      onLongPress={(word) => handleLong(word, sentence)}
                    />
                  </span>
                ))}
                {si < para.sentences.length - 1 && ' '}
              </span>
            )
          })}
        </p>
      ))}
    </div>
  )
}
